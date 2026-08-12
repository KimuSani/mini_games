const questions = [
    {
        emoji: "📱",
        title: "디지털 충돌",
        desc: "모바일 게임 광고에서 쥐꼬리만한 'X' 버튼 누르려다 앱스토어로 납치당함."
    },
    {
        emoji: "🚇",
        title: "대중교통 닌자",
        desc: "지하철 빈자리 나서 스쿼트 자세로 앉으려는데, 옆사람이 쏘옥 미끄러져 들어와서 뺏음."
    },
    {
        emoji: "💬",
        title: "카톡 단답형",
        desc: "장문으로 구구절절 물어봤는데, 3시간 뒤에 'ㅇㅇ' 두 글자 답장 옴."
    },
    {
        emoji: "🚿",
        title: "소매 적시기",
        desc: "세수하는데 물이 팔꿈치를 타고 소매 안으로 주르륵 흘러내림."
    },
    {
        emoji: "🚶",
        title: "길막 빌런",
        desc: "출근길 바빠 죽겠는데, 앞에서 3명이 횡대로 서서 엄청 느리게 걸어가며 길 다 막음."
    }
];

let currentIndex = 0;
let scores = [];

// DOM Elements
const screenStart = document.getElementById('start-screen');
const screenQuiz = document.getElementById('quiz-screen');
const screenResult = document.getElementById('result-screen');

const btnStart = document.getElementById('btn-start');
const btnNext = document.getElementById('btn-next');

const qEmoji = document.getElementById('q-emoji');
const qTitle = document.getElementById('q-title');
const qDesc = document.getElementById('q-desc');
const qCounter = document.getElementById('question-counter');
const progressBar = document.getElementById('progress-bar');
const angerSlider = document.getElementById('anger-slider');
const sliderValue = document.getElementById('slider-value');

// Event Listeners
btnStart.addEventListener('click', () => {
    screenStart.classList.remove('active');
    screenQuiz.classList.add('active');
    loadQuestion();
});

angerSlider.addEventListener('input', (e) => {
    sliderValue.textContent = e.target.value;
});

btnNext.addEventListener('click', () => {
    scores.push(parseInt(angerSlider.value));
    
    // Animate out
    const card = document.querySelector('.tinder-card');
    card.style.transform = 'translateX(-100%)';
    card.style.opacity = '0';
    
    setTimeout(() => {
        currentIndex++;
        if (currentIndex < questions.length) {
            loadQuestion();
            card.style.transform = 'translateX(100%)';
            setTimeout(() => {
                card.style.transform = 'translateX(0)';
                card.style.opacity = '1';
            }, 50);
        } else {
            showResult();
        }
    }, 300);
});

function loadQuestion() {
    const q = questions[currentIndex];
    qEmoji.textContent = q.emoji;
    qTitle.textContent = q.title;
    qDesc.textContent = q.desc;
    
    qCounter.textContent = `${currentIndex + 1} / ${questions.length}`;
    progressBar.style.width = `${((currentIndex) / questions.length) * 100}%`;
    
    angerSlider.value = 50;
    sliderValue.textContent = "50";
}

function showResult() {
    screenQuiz.classList.remove('active');
    screenResult.classList.add('active');
    
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / scores.length);
    
    document.getElementById('my-avg').textContent = avg;
    
    const titleEl = document.getElementById('result-title');
    const descEl = document.getElementById('result-desc');
    const emojiEl = document.getElementById('result-emoji');
    
    if (avg >= 85) {
        emojiEl.textContent = "💣";
        titleEl.textContent = "걸어다니는 시한폭탄";
        descEl.textContent = "당신의 예민도는 상위 1%입니다! 오늘 하루는 명상을 추천합니다.";
    } else if (avg >= 60) {
        emojiEl.textContent = "🧐";
        titleEl.textContent = "프로불편러 유망주";
        descEl.textContent = "당신의 예민도는 상위 30%입니다. 제법 깐깐하시군요!";
    } else if (avg >= 30) {
        emojiEl.textContent = "😐";
        titleEl.textContent = "평범한 현대인";
        descEl.textContent = "당신의 예민도는 대한민국 평균입니다. 무난하게 빡치며 살아가고 있습니다.";
    } else {
        emojiEl.textContent = "🧘‍♂️";
        titleEl.textContent = "득도한 생불";
        descEl.textContent = "당신의 예민도는 하위 5%입니다. 뇌에 주름이 없거나 해탈하셨습니다.";
    }
}
