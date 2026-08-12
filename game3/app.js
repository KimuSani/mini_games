let currentQuestions = [];
let scores = [];
const QUESTIONS_PER_GAME = 10; // 25개 중 10개만 뽑아서 진행

// DOM Elements
const screenTheme = document.getElementById('themeScreen');
const screenGame = document.getElementById('gameScreen');
const screenResult = document.getElementById('resultScreen');
const themeList = document.getElementById('themeList');
const container = document.getElementById('swiperContainer');
const inGameTitle = document.getElementById('inGameTitle');
const leftIndicator = document.getElementById('leftIndicator');
const rightIndicator = document.getElementById('rightIndicator');

// Initialize Theme Screen
const initThemes = () => {
    themeList.innerHTML = '';
    THEMES.forEach(theme => {
        const btn = document.createElement('div');
        btn.className = 'theme-btn';
        btn.onclick = () => startGame(theme);
        btn.innerHTML = `
            <div class="theme-emoji">${theme.emoji}</div>
            <div class="theme-info">
                <h3 class="theme-title">${theme.title}</h3>
                <p class="theme-desc">${theme.desc}</p>
            </div>
        `;
        themeList.appendChild(btn);
    });
};

const startGame = (theme) => {
    // 1. Data Prep
    scores = [];
    inGameTitle.innerText = `[${theme.title}]`;
    
    // Shuffle and pick 10
    const fullList = [...QUESTION_BANK[theme.id]];
    fullList.sort(() => Math.random() - 0.5);
    currentQuestions = fullList.slice(0, QUESTIONS_PER_GAME);
    
    // 2. Render Cards
    container.innerHTML = '';
    currentQuestions.slice().reverse().forEach((q, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.transform = `scale(${1 - index * 0.05}) translateY(${index * -15}px)`;
        card.style.zIndex = currentQuestions.length - index;
        
        card.innerHTML = `
            <div class="overlay-label label-left">${q.actionLeft || '참는다😇'}</div>
            <div class="overlay-label label-right">${q.actionRight || '급발진🤬'}</div>
            <div class="card-emoji">${q.emoji}</div>
            <div class="card-title">${q.title}</div>
            <div class="card-desc">${q.desc}</div>
        `;
        
        setupDragEvents(card);
        container.appendChild(card);
    });

    // 3. Switch Screen
    screenTheme.classList.replace('active', 'hidden');
    screenResult.classList.replace('active', 'hidden');
    screenGame.classList.replace('hidden', 'active');
};

const setupDragEvents = (card) => {
    let isDragging = false;
    let startX = 0;
    let currentX = 0;

    const onStart = (e) => {
        if(parseInt(card.style.zIndex) !== currentQuestions.length - scores.length) return;
        isDragging = true;
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        card.classList.add('dragging');
    };

    const onMove = (e) => {
        if (!isDragging) return;
        currentX = (e.type.includes('mouse') ? e.clientX : e.touches[0].clientX) - startX;
        const rotate = currentX * 0.15;
        card.style.transform = `translateX(${currentX}px) rotate(${rotate}deg)`;
        
        const leftLabel = card.querySelector('.label-left');
        const rightLabel = card.querySelector('.label-right');
        const intensity = Math.min(Math.abs(currentX) / 100, 1);

        if (currentX > 0) {
            rightLabel.style.opacity = intensity;
            leftLabel.style.opacity = 0;
            rightIndicator.style.opacity = intensity;
            leftIndicator.style.opacity = 0;
        } else {
            leftLabel.style.opacity = intensity;
            rightLabel.style.opacity = 0;
            leftIndicator.style.opacity = intensity;
            rightIndicator.style.opacity = 0;
        }
    };

    const onEnd = (e) => {
        if (!isDragging) return;
        isDragging = false;
        card.classList.remove('dragging');
        leftIndicator.style.opacity = 0;
        rightIndicator.style.opacity = 0;

        const threshold = 100;
        if (currentX > threshold) {
            swipeOut(card, 1, 100);
        } else if (currentX < -threshold) {
            swipeOut(card, -1, 0);
        } else {
            card.style.transform = `scale(1) translateY(0px)`;
            card.querySelector('.label-left').style.opacity = 0;
            card.querySelector('.label-right').style.opacity = 0;
        }
        currentX = 0;
    };

    card.addEventListener('mousedown', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    card.addEventListener('touchstart', onStart, {passive: true});
    document.addEventListener('touchmove', onMove, {passive: true});
    document.addEventListener('touchend', onEnd);
};

const swipeOut = (card, direction, score) => {
    card.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
    card.style.transform = `translateX(${direction * 800}px) rotate(${direction * 45}deg)`;
    card.style.opacity = 0;
    scores.push(score);
    
    setTimeout(() => {
        card.remove();
        if (scores.length === currentQuestions.length) {
            showResult();
        } else {
            const remaining = document.querySelectorAll('.card');
            remaining.forEach((c, idx) => {
                const depth = remaining.length - 1 - idx;
                c.style.transition = 'transform 0.3s ease';
                c.style.transform = `scale(${1 - depth * 0.05}) translateY(${depth * -15}px)`;
            });
        }
    }, 400);
};

const showResult = () => {
    screenGame.classList.replace('active', 'hidden');
    screenResult.classList.replace('hidden', 'active');
    
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = scores.length > 0 ? Math.round(sum / scores.length) : 0;
    
    let title, emoji, desc;
    if (avg >= 85) { emoji = "💣"; title = "걸어다니는 시한폭탄"; desc = "상위 1%! 숨만 쉬어도 화가 납니다."; }
    else if (avg >= 60) { emoji = "🧐"; title = "프로불편러 유망주"; desc = "상위 30%! 제법 깐깐하시군요."; }
    else if (avg >= 30) { emoji = "😐"; title = "평범한 현대인"; desc = "대한민국 평균입니다."; }
    else { emoji = "🧘‍♂️"; title = "득도한 생불"; desc = "하위 5%! 해탈하셨습니다."; }
    
    document.getElementById('resultEmoji').innerText = emoji;
    document.getElementById('resultTitle').innerText = title;
    document.getElementById('resultDesc').innerText = desc;
    document.getElementById('resultScore').innerText = `${avg}점`;
};

const goToThemeScreen = () => {
    screenResult.classList.replace('active', 'hidden');
    screenTheme.classList.replace('hidden', 'active');
};

// Start
initThemes();
