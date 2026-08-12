// Initial Setup
let deposit = 20;
let rent = 2; // Starts with 1 bus worth
let tears = 0;
let busCount = 1; // Start with 1 bus as requested
let busCost = 50;
let stability = 100;
let happiness = 100;
let isHeatingOff = false;
let rentMultiplier = 1;

let busOffsets = [(Math.random() - 0.5) * 15]; // Store random offsets so they don't reshuffle

// DOM Elements
const elDeposit = document.getElementById('depositDisplay');
const elRent = document.getElementById('rentDisplay');
const elTears = document.getElementById('tearsDisplay');
const elStability = document.getElementById('stabilityDisplay');
const elHappiness = document.getElementById('happinessDisplay');
const elBusCost = document.getElementById('busCostDisplay');
const towerContainer = document.getElementById('towerContainer');
const alertBox = document.getElementById('eventAlert');
const msgBox = document.getElementById('eventMessage');

const updateUI = () => {
    elDeposit.innerText = Math.floor(deposit);
    elRent.innerText = rent * rentMultiplier;
    elTears.innerText = Math.floor(tears);
    elStability.innerText = Math.floor(stability);
    elHappiness.innerText = Math.floor(happiness);
    elBusCost.innerText = busCost;

    elStability.className = stability < 40 ? 'warning-text' : 'dark-stat';
    elHappiness.className = happiness < 30 ? 'warning-text' : 'dark-stat';

    if (stability < 40 && busCount > 0) {
        towerContainer.classList.add('shaking');
    } else {
        towerContainer.classList.remove('shaking');
    }
};

const renderBuses = (isNew = false) => {
    // Sync offsets array with busCount
    while (busOffsets.length < busCount) {
        busOffsets.push((Math.random() - 0.5) * 15);
    }
    if (busOffsets.length > busCount) {
        busOffsets.length = busCount;
    }

    towerContainer.innerHTML = '';
    for (let i = 0; i < busCount; i++) {
        const wrap = document.createElement('div');
        wrap.className = 'bus-container';
        
        wrap.style.transform = `translateX(${busOffsets[i]}px)`;

        // Only animate the newly added bus (the topmost one)
        if (isNew && i === busCount - 1) {
            wrap.style.animation = 'dropIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
        } else {
            wrap.style.animation = 'none';
        }

        const bus = document.createElement('img');
        bus.className = 'bus';
        bus.src = 'assets/long_bus.jpg'; // Use the new 16:9 long bus
        
        wrap.appendChild(bus);
        towerContainer.appendChild(wrap);
    }
};

// --- Dynamic Event System ---
const EVENTS = [
    {
        type: 'good',
        msg: "🎉 [호재] 재개발 소문이 돕니다! 10초간 월세 수입이 2배로 폭등합니다!",
        action: () => {
            rentMultiplier = 2;
            setTimeout(() => { rentMultiplier = 1; updateUI(); }, 10000);
        }
    },
    {
        type: 'bad',
        msg: "🚨 [악재] 구청 불시 단속! 불법 개조(버스 타워)가 적발되어 보증금 일부를 벌금으로 냅니다.",
        action: () => {
            deposit = Math.max(0, deposit - (busCount * 15));
        }
    },
    {
        type: 'good',
        msg: "👼 [호재] 마음씨 좋은 세입자가 피자를 돌렸습니다! 행복도가 최대치로 회복됩니다.",
        action: () => {
            happiness = 100;
        }
    },
    {
        type: 'bad',
        msg: "🤬 [악재] 윗집에서 물이 샙니다! 눈물은 생산되지만 세입자들의 분노(행복도 감소)가 극에 달합니다.",
        action: () => {
            tears += (busCount * 20);
            happiness = Math.max(0, happiness - 40);
        }
    },
    {
        type: 'bad',
        msg: "💥 [악재] 지반 침하 발생! 타워 내구도가 크게 손상되었습니다. 서둘러 보수하세요!",
        action: () => {
            stability = Math.max(0, stability - 30);
        }
    }
];

const showEvent = (eventObj) => {
    if(eventObj.type === 'good') {
        alertBox.style.background = 'rgba(39, 174, 96, 0.95)';
    } else {
        alertBox.style.background = 'rgba(192, 57, 43, 0.95)';
    }
    
    msgBox.innerText = eventObj.msg;
    alertBox.classList.remove('hidden');
    
    eventObj.action();
    updateUI();

    setTimeout(() => {
        alertBox.classList.add('hidden');
    }, 5000);
};

const scheduleNextEvent = () => {
    const nextTime = Math.random() * 5000 + 15000;
    setTimeout(() => {
        if(busCount > 0) {
            const randomEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
            showEvent(randomEvent);
        }
        scheduleNextEvent();
    }, nextTime);
};
// ----------------------------


// Game Loop (1 second)
setInterval(() => {
    deposit += (rent * rentMultiplier);
    
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

// Event Loop (3 seconds check)
setInterval(() => {
    if (happiness < 20 && busCount > 0) {
        alert("🚨 [뱅크런 발생!] 세입자들이 분노하여 대거 이탈했습니다! 보증금이 차감됩니다.");
        deposit = Math.max(0, deposit - (busCount * 30));
        happiness = 50;
    }
    
    if (stability <= 0 && busCount > 0) {
        alert("💥 [건물 붕괴!] 내구도가 0이 되어 버스 타워가 무너졌습니다...");
        busCount = Math.max(1, busCount - 3); // 최소 1대는 남김
        rent = busCount * 2;
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
        
        // 전체 타워에 '콰직' 타격감 효과
        towerContainer.classList.remove('thud');
        void towerContainer.offsetWidth; // trigger reflow
        towerContainer.classList.add('thud');

        renderBuses(true); // 새 버스 애니메이션
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
        alert("😈 [악법 통과] 최소 주거면적 제한이 폐지되어 초당 월세가 영구 증가합니다!");
        updateUI();
    } else {
        alert("눈물이 부족합니다.");
    }
};

// Init
renderBuses(false);
updateUI();
scheduleNextEvent();
