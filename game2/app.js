// Game State
let deposit = 200; // 초기 자금 넉넉히
let tears = 0;
let busCount = 1;
let busCost = 50;
let stability = 100;
let happiness = 100;
let isHeatingOff = false;
let rentMultiplier = 1;
let busOffsets = [(Math.random() - 0.5) * 15];

// NEW: Tenant System
let tenants = 0;
let rentPerTenant = 3;
let attractiveness = 50;

// NEW: Upgrades
let hasElevator = false;
let remodelLevel = 0;
let remodelCost = 150;
let hasCafe = false;

// DOM Elements
const elDeposit = document.getElementById('depositDisplay');
const elTotalRent = document.getElementById('totalRentDisplay');
const elTenant = document.getElementById('tenantDisplay');
const elRentPerTenant = document.getElementById('rentPerTenantDisplay');
const elAttract = document.getElementById('attractDisplay');
const elTears = document.getElementById('tearsDisplay');
const elStability = document.getElementById('stabilityDisplay');
const elHappiness = document.getElementById('happinessDisplay');
const elBusCost = document.getElementById('busCostDisplay');
const elRemodelCost = document.getElementById('remodelCostDisplay');

const towerContainer = document.getElementById('towerContainer');
const alertBox = document.getElementById('eventAlert');
const msgBox = document.getElementById('eventMessage');

// Tabs
const tabBasic = document.getElementById('tabBasic');
const tabUpgrade = document.getElementById('tabUpgrade');
const panelBasic = document.getElementById('panelBasic');
const panelUpgrade = document.getElementById('panelUpgrade');

tabBasic.onclick = () => {
    tabBasic.classList.add('active');
    tabUpgrade.classList.remove('active');
    panelBasic.classList.remove('hidden');
    panelUpgrade.classList.add('hidden');
};
tabUpgrade.onclick = () => {
    tabUpgrade.classList.add('active');
    tabBasic.classList.remove('active');
    panelUpgrade.classList.remove('hidden');
    panelBasic.classList.add('hidden');
};

const calcAttractiveness = () => {
    // 기본 선호도 60 - (월세 * 5)
    // 월세가 3이면 45. 월세 10이면 10.
    let score = 60 - (rentPerTenant * 5);
    
    // 업그레이드 보너스
    if (hasElevator) score += 20;
    score += (remodelLevel * 15);
    if (hasCafe) score += 30;
    
    // 행복도 패널티
    if (happiness < 40) score -= 20;

    return Math.max(0, Math.min(100, score));
};

const updateUI = () => {
    const maxCapacity = (busCount * 10) - (hasCafe ? 10 : 0);
    attractiveness = calcAttractiveness();

    elDeposit.innerText = Math.floor(deposit);
    elTotalRent.innerText = (rentPerTenant * tenants * rentMultiplier);
    elTenant.innerText = `${Math.floor(tenants)}/${maxCapacity}`;
    elRentPerTenant.innerText = rentPerTenant;
    elAttract.innerText = Math.floor(attractiveness);
    elTears.innerText = Math.floor(tears);
    elStability.innerText = Math.floor(stability);
    elHappiness.innerText = Math.floor(happiness);
    elBusCost.innerText = busCost;
    elRemodelCost.innerText = remodelCost;

    elStability.className = stability < 40 ? 'warning-text' : 'dark-stat';
    elHappiness.className = happiness < 30 ? 'warning-text' : 'dark-stat';
    elAttract.className = attractiveness < 30 ? 'warning-text' : 'dark-stat';

    if (stability < 40 && busCount > 0) {
        towerContainer.classList.add('shaking');
    } else {
        towerContainer.classList.remove('shaking');
    }
};

const renderBuses = (isNew = false) => {
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

        if (isNew && i === busCount - 1) {
            wrap.style.animation = 'dropIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
        } else {
            wrap.style.animation = 'none';
        }

        const bus = document.createElement('img');
        bus.className = 'bus';
        bus.src = 'assets/long_bus.jpg';
        
        // 1층(i=0)이고 카페 개조 완료 시 색상 변경 필터
        if (i === 0 && hasCafe) {
            bus.classList.add('bus-cafe');
        }
        
        wrap.appendChild(bus);
        towerContainer.appendChild(wrap);
    }
};

// --- 돌발 이벤트 시스템 ---
const EVENTS = [
    {
        type: 'good',
        msg: "🎉 [호재] 재개발 소문! 10초간 모든 세입자가 월세를 2배로 냅니다!",
        action: () => { rentMultiplier = 2; setTimeout(() => { rentMultiplier = 1; updateUI(); }, 10000); }
    },
    {
        type: 'bad',
        msg: "🚨 [악재] 구청 불시 단속! 불법 개조(버스 타워) 적발로 벌금을 냅니다.",
        action: () => { deposit = Math.max(0, deposit - (busCount * 20)); }
    },
    {
        type: 'good',
        msg: "👼 [호재] 건물주 칭찬글이 커뮤니티에 올라와 행복도가 100%로 찹니다!",
        action: () => { happiness = 100; }
    },
    {
        type: 'bad',
        msg: "🤬 [악재] 윗집 누수 발생! 눈물은 폭증하지만 입주민의 분노가 극에 달합니다.",
        action: () => { tears += (tenants * 5); happiness = Math.max(0, happiness - 30); }
    },
    {
        type: 'bad',
        msg: "💥 [악재] 지반 침하 발생! 타워 내구도가 크게 손상되었습니다. 서둘러 보수하세요!",
        action: () => { stability = Math.max(0, stability - 30); }
    }
];

const showEvent = (eventObj) => {
    alertBox.style.background = eventObj.type === 'good' ? 'rgba(39, 174, 96, 0.95)' : 'rgba(192, 57, 43, 0.95)';
    msgBox.innerText = eventObj.msg;
    alertBox.classList.remove('hidden');
    eventObj.action();
    updateUI();
    setTimeout(() => { alertBox.classList.add('hidden'); }, 5000);
};

const scheduleNextEvent = () => {
    const nextTime = Math.random() * 5000 + 15000;
    setTimeout(() => {
        if(busCount > 0) showEvent(EVENTS[Math.floor(Math.random() * EVENTS.length)]);
        scheduleNextEvent();
    }, nextTime);
};

// --- 게임 메인 루프 (1초마다) ---
setInterval(() => {
    const maxCapacity = (busCount * 10) - (hasCafe ? 10 : 0);
    attractiveness = calcAttractiveness();

    // 수요-공급에 따른 세입자 입주/퇴거
    if (attractiveness >= 60) {
        tenants += Math.random() * 2 + 1; // 1~3명 입주
    } else if (attractiveness < 40 && attractiveness > 15) {
        tenants -= Math.random() * 1.5; // 서서히 방 뺌
    } else if (attractiveness <= 15) {
        tenants -= 3; // 짐 싸서 대거 이탈
    }
    tenants = Math.max(0, Math.min(maxCapacity, tenants));

    // 수익 창출
    const income = (rentPerTenant * Math.floor(tenants)) * rentMultiplier;
    deposit += income;
    
    // 행복도 및 내구도 처리
    if (tenants > 0) {
        if (isHeatingOff) {
            tears += (tenants * 0.5);
            happiness = Math.max(0, happiness - 2);
        } else {
            if (hasCafe) {
                // 카페가 있으면 행복도가 자연 감소하지 않고 오히려 조금씩 오름
                happiness = Math.min(100, happiness + 0.5);
            } else {
                happiness = Math.max(0, happiness - 0.5);
            }
        }
    }

    if (busCount > 3) {
        stability = Math.max(0, stability - (busCount * 0.1));
    }
    
    updateUI();
}, 1000);

// 이벤트 루프 (3초마다 치명적 상태 체크)
setInterval(() => {
    if (happiness < 15 && tenants > 0) {
        alert("🚨 [뱅크런 발생!] 참다못한 세입자들이 보증금을 빼서 대거 단체 이탈했습니다!");
        deposit = Math.max(0, deposit - (Math.floor(tenants) * 10));
        tenants = 0;
        happiness = 50;
    }
    
    if (stability <= 0 && busCount > 0) {
        alert("💥 [건물 붕괴!] 내구도가 0이 되어 타워 상층부가 붕괴되었습니다...");
        busCount = Math.max(1, busCount - 3);
        const maxCapacity = (busCount * 10) - (hasCafe ? 10 : 0);
        tenants = Math.min(tenants, maxCapacity); // 무너진 층 사람들 즉사(?) 처리
        stability = 100;
        renderBuses();
    }
    updateUI();
}, 3000);


// --- 월세 컨트롤러 ---
document.getElementById('btnRentDown').onclick = () => {
    if (rentPerTenant > 1) { rentPerTenant--; updateUI(); }
};
document.getElementById('btnRentUp').onclick = () => {
    if (rentPerTenant < 50) { rentPerTenant++; updateUI(); }
};


// --- 버튼 이벤트 (기본 관리) ---
document.getElementById('btnManual').onclick = () => {
    deposit += (1 + Math.floor(tenants * 0.5));
    updateUI();
};
document.getElementById('btnBuyBus').onclick = () => {
    if (deposit >= busCost) {
        deposit -= busCost;
        busCount++;
        busCost = Math.floor(busCost * 1.5);
        stability = Math.max(0, stability - 10);
        
        towerContainer.classList.remove('thud');
        void towerContainer.offsetWidth; 
        towerContainer.classList.add('thud');
        
        renderBuses(true);
        updateUI();
    } else alert("보증금이 부족합니다!");
};
document.getElementById('btnRepair').onclick = () => {
    if (deposit >= 20) { deposit -= 20; stability = Math.min(100, stability + 30); updateUI(); }
    else alert("보증금이 부족합니다.");
};
document.getElementById('btnPizza').onclick = () => {
    if (deposit >= 30) { deposit -= 30; happiness = Math.min(100, happiness + 40); updateUI(); }
    else alert("보증금이 부족합니다.");
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
        rentMultiplier += 0.5;
        alert("😈 [악법 통과] 최저주거기준 완화 로비에 성공하여 전체 수익이 영구적으로 50% 증가합니다!");
        updateUI();
    } else alert("눈물이 부족합니다.");
};

// --- 버튼 이벤트 (시설 투자) ---
document.getElementById('btnElevator').onclick = () => {
    if (hasElevator) { alert("이미 엘리베이터가 설치되어 있습니다!"); return; }
    if (deposit >= 300) {
        deposit -= 300;
        hasElevator = true;
        document.getElementById('btnElevator').disabled = true;
        document.getElementById('btnElevator').innerText = "✅ 엘리베이터 설치 완료";
        updateUI();
    } else alert("보증금이 부족합니다.");
};
document.getElementById('btnRemodel').onclick = () => {
    if (deposit >= remodelCost) {
        deposit -= remodelCost;
        remodelLevel++;
        remodelCost = Math.floor(remodelCost * 2);
        updateUI();
    } else alert("보증금이 부족합니다.");
};
document.getElementById('btnCafe').onclick = () => {
    if (hasCafe) { alert("이미 1층에 힙스터 카페가 있습니다!"); return; }
    if (busCount < 2) { alert("버스가 최소 2대는 있어야 1층을 카페로 바꿀 수 있습니다!"); return; }
    if (deposit >= 500) {
        deposit -= 500;
        hasCafe = true;
        
        // 카페 개조 시 수용량 감소로 인해 초과 입주자 쫓아내기
        const maxCapacity = (busCount * 10) - 10;
        if (tenants > maxCapacity) {
            tenants = maxCapacity;
            alert("1층 세입자들을 강제로 내쫓고 힙스터 카페를 차렸습니다!");
        }

        document.getElementById('btnCafe').disabled = true;
        document.getElementById('btnCafe').innerText = "✅ 1층 힙스터 카페 영업 중";
        renderBuses(false); // 카페 렌더링 업데이트
        updateUI();
    } else alert("보증금이 부족합니다.");
};


// Init
renderBuses(false);
updateUI();
scheduleNextEvent();
