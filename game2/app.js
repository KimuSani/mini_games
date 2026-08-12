let deposit = 0;
let rentPerSec = 0;
let tears = 0;
let busCount = 0;
let busCost = 10; // 초기 버스 구매 비용 (보증금)

// DOM Elements
const elDeposit = document.getElementById('deposit');
const elRent = document.getElementById('rent-per-sec');
const elTears = document.getElementById('tears');
const elBusCost = document.getElementById('bus-cost');
const busTower = document.getElementById('bus-tower');
const btnCollect = document.getElementById('btn-collect-rent');
const btnBuyBus = document.getElementById('btn-buy-bus');
const btnExtractTears = document.getElementById('btn-extract-tears');

// Update UI
function updateUI() {
    elDeposit.textContent = deposit.toLocaleString();
    elRent.textContent = rentPerSec.toLocaleString();
    elTears.textContent = tears.toLocaleString();
    elBusCost.textContent = busCost.toLocaleString();
}

// Add a bus to the tower
function addBusToTower() {
    const bus = document.createElement('div');
    bus.className = 'bus';
    bus.textContent = `마을버스 ${busCount}호`;
    
    // 약간 삐뚤빼뚤하게 쌓이도록 (젠가 느낌)
    const offset = (Math.random() - 0.5) * 20; 
    bus.style.transform = `translateX(${offset}px)`;
    
    busTower.appendChild(bus);
}

// Click to collect deposit (수동 클릭)
btnCollect.addEventListener('click', () => {
    deposit += 1 + busCount; // 버스가 많을수록 클릭 효율 증가
    updateUI();
    
    // 버튼 흔들림 효과
    btnCollect.style.transform = 'translateY(2px)';
    setTimeout(() => btnCollect.style.transform = 'none', 100);
});

// Buy a new bus
btnBuyBus.addEventListener('click', () => {
    if (deposit >= busCost) {
        deposit -= busCost;
        busCount++;
        rentPerSec += 2; // 초당 월세 증가
        busCost = Math.floor(busCost * 1.5); // 다음 구매 비용 증가
        addBusToTower();
        updateUI();
    } else {
        alert("보증금이 부족합니다! 빡세게 모으세요.");
    }
});

// Extract Tears (Evil Action)
btnExtractTears.addEventListener('click', () => {
    if (busCount > 0) {
        tears += busCount * 5;
        // 난방을 꺼서 월세 수익이 일시적으로 깎이는 패널티를 줄 수도 있음
        updateUI();
        
        // 시각 효과
        busTower.style.backgroundColor = '#300';
        setTimeout(() => busTower.style.backgroundColor = '#111', 200);
    } else {
        alert("아직 쥐어짤 세입자(버스)가 없습니다.");
    }
});

// Idle game loop
setInterval(() => {
    deposit += rentPerSec; // 초당 월세가 보증금에 더해짐 (게임적 허용)
    updateUI();
}, 1000);

// Initialize
updateUI();
