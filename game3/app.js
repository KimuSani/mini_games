const QUESTIONS = [
    { id: 1, emoji: "📱", title: "디지털 충돌", desc: "모바일 게임 광고에서 쥐꼬리만한 'X' 버튼 누르려다 앱스토어로 납치당함." },
    { id: 2, emoji: "🚇", title: "대중교통 닌자", desc: "지하철 빈자리 나서 스쿼트 자세로 앉으려는데, 옆사람이 쏘옥 미끄러져 들어와서 뺏음." },
    { id: 3, emoji: "💬", title: "카톡 단답형", desc: "장문으로 구구절절 물어봤는데, 3시간 뒤에 'ㅇㅇ' 두 글자 답장 옴." },
    { id: 4, emoji: "🚿", title: "소매 적시기", desc: "세수하는데 물이 팔꿈치를 타고 소매 안으로 주르륵 흘러내림." },
    { id: 5, emoji: "🚶", title: "길막 빌런", desc: "출근길 바빠 죽겠는데, 앞에서 3명이 횡대로 서서 엄청 느리게 걸어가며 길 다 막음." }
];

const container = document.getElementById('swiperContainer');
let scores = [];

const renderCards = () => {
    QUESTIONS.slice().reverse().forEach((q, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.transform = `scale(${1 - index * 0.05}) translateY(${index * -15}px)`;
        card.style.zIndex = QUESTIONS.length - index;
        
        card.innerHTML = `
            <div class="overlay-label label-left">참는다😇</div>
            <div class="overlay-label label-right">급발진🤬</div>
            <div class="card-emoji">${q.emoji}</div>
            <div class="card-title">${q.title}</div>
            <div class="card-desc">${q.desc}</div>
        `;
        
        setupDragEvents(card);
        container.appendChild(card);
    });
};

const setupDragEvents = (card) => {
    let isDragging = false;
    let startX = 0;
    let currentX = 0;

    const onStart = (e) => {
        // Only allow dragging the top card
        if(parseInt(card.style.zIndex) !== QUESTIONS.length - scores.length) return;
        isDragging = true;
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        card.classList.add('dragging');
    };

    const onMove = (e) => {
        if (!isDragging) return;
        currentX = (e.type.includes('mouse') ? e.clientX : e.touches[0].clientX) - startX;
        const rotate = currentX * 0.1;
        card.style.transform = `translateX(${currentX}px) rotate(${rotate}deg)`;
        
        const leftLabel = card.querySelector('.label-left');
        const rightLabel = card.querySelector('.label-right');
        if (currentX > 0) {
            rightLabel.style.opacity = Math.min(currentX / 100, 1);
            leftLabel.style.opacity = 0;
        } else {
            leftLabel.style.opacity = Math.min(Math.abs(currentX) / 100, 1);
            rightLabel.style.opacity = 0;
        }
    };

    const onEnd = (e) => {
        if (!isDragging) return;
        isDragging = false;
        card.classList.remove('dragging');

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
        if (scores.length === QUESTIONS.length) {
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
    document.getElementById('swiperContainer').classList.add('hidden');
    document.getElementById('resultScreen').classList.remove('hidden');
    
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

renderCards();
