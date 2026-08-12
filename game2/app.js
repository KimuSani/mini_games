let deposit = 0;
let rent = 0;
let tears = 0;
let busCount = 0;
let busCost = 50;
let stability = 100;
let happiness = 100;
let isHeatingOff = false;

// DOM Elements
const elDeposit = document.getElementById('depositDisplay');
const elRent = document.getElementById('rentDisplay');
const elTears = document.getElementById('tearsDisplay');
const elStability = document.getElementById('stabilityDisplay');
const elHappiness = document.getElementById('happinessDisplay');
const elBusCost = document.getElementById('busCostDisplay');
const towerContainer = document.getElementById('towerContainer');

const updateUI = () => {
    elDeposit.innerText = Math.floor(deposit);
    elRent.innerText = rent;
    elTears.innerText = Math.floor(tears);
    elStability.innerText = Math.floor(stability);
    elHappiness.innerText = Math.floor(happiness);
    elBusCost.innerText = busCost;

    elStability.className = stability < 40 ? 'warning-text' : '';
    elHappiness.className = happiness < 30 ? 'warning-text' : '';

    if (stability < 40 && busCount > 0) {
        towerContainer.classList.add('shaking');
    } else {
        towerContainer.classList.remove('shaking');
    }
};

const renderBuses = () => {
    towerContainer.innerHTML = '';
    for (let i = 0; i < busCount; i++) {
        const bus = document.createElement('div');
        bus.className = 'bus';
        bus.innerText = `마을버스 ${i+1}호`;
        // Random offset for jenga feel
        const offset = (Math.random() - 0.5) * 15;
        bus.style.transform = `translateX(${offset}px)`;
        towerContainer.appendChild(bus);
    }
};

// Game Loop (1 second)
setInterval(() => {
    deposit += rent;
    
    if (busCount > 0) {
        if (isHeatingOff) {
            tears += (busCount * 5);
            happiness = Math.max(0, happiness - 2);
        } else {
            happiness = Math.max(0, happiness - 0.5);
        }
    }

    if (busCount > 3) {
        stability = Math.max(0, stability - (busCount * 0.1));
    }
    
    updateUI();
}, 1000);

// Event Loop (3 seconds)
setInterval(() => {
    if (happiness < 20 && busCount > 0) {
        alert("🚨 [뱅크런 발생!] 세입자들이 분노하여 대거 이탈했습니다! 보증금이 차감됩니다.");
        deposit = Math.max(0, deposit - (busCount * 30));
        happiness = 50;
    }
    
    if (stability <= 0 && busCount > 0) {
        alert("💥 [건물 붕괴!] 내구도가 0이 되어 버스 타워가 무너졌습니다...");
        busCount = Math.max(0, busCount - 3);
        rent = Math.max(0, rent - 6);
        stability = 100;
        renderBuses();
    }
    updateUI();
}, 3000);

// Buttons
document.getElementById('btnManual').onclick = () => {
    deposit += (1 + busCount);
    updateUI();
};

document.getElementById('btnBuyBus').onclick = () => {
    if (deposit >= busCost) {
        deposit -= busCost;
        busCount++;
        rent += 2;
        busCost = Math.floor(busCost * 1.5);
        stability = Math.max(0, stability - 10);
        renderBuses();
        updateUI();
    } else {
        alert("보증금이 부족합니다!");
    }
};

document.getElementById('btnRepair').onclick = () => {
    if (deposit >= 20) {
        deposit -= 20;
        stability = Math.min(100, stability + 30);
        updateUI();
    } else {
        alert("보증금이 부족합니다.");
    }
};

document.getElementById('btnPizza').onclick = () => {
    if (deposit >= 30) {
        deposit -= 30;
        happiness = Math.min(100, happiness + 40);
        updateUI();
    } else {
        alert("보증금이 부족합니다.");
    }
};

const btnHeat = document.getElementById('btnHeat');
btnHeat.onclick = () => {
    isHeatingOff = !isHeatingOff;
    if (isHeatingOff) {
        btnHeat.classList.add('active');
        btnHeat.innerText = "🥶 난방 켜기";
    } else {
        btnHeat.classList.remove('active');
        btnHeat.innerText = "🥶 난방 끄기 (눈물)";
    }
};

document.getElementById('btnLobby').onclick = () => {
    if (tears >= 100) {
        tears -= 100;
        rent += 5;
        alert("😈 [악법 통과] 최소 주거면적 제한이 폐지되어 초당 월세가 증가합니다!");
        updateUI();
    } else {
        alert("눈물이 부족합니다.");
    }
};

updateUI();
