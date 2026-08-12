// Game State
let deposit = 100;
let tears = 0;
let busCount = 1;
let busCost = 50;
let maxBuses = 5; // 용적률 상한
let stability = 100;
let happiness = 100;
let isHeatingOff = false;
let rentMultiplier = 1;
let busOffsets = [(Math.random() - 0.5) * 15];

// Tenant System
let tenants = 0;
let rentPerTenant = 3;
let attractiveness = 50;
let jeonseRatio = 0; // 0 to 100%
let currentJeonseTenants = 0; // 역전세난 계산을 위해 실제 전세 세입자 수 트래킹
const JEONSE_DEPOSIT = 50; // 전세 1명당 들어오는 목돈

// Macro Economy & Bank
let loan = 0;
let interestRate = 5.0; // 5%

// Upgrades
let hasElevator = false;
let remodelLevel = 0;
let remodelCost = 150;
let hasCafe = false;

// DOM Elements
const elDeposit = document.getElementById('depositDisplay');
const elTotalRent = document.getElementById('totalRentDisplay');
const elLoan = document.getElementById('loanDisplay');
const elInterestRate = document.getElementById('interestRateDisplay');
const elInterestCost = document.getElementById('interestCostDisplay');
const elBusCount = document.getElementById('busCountDisplay');
const elMaxBuses = document.getElementById('maxBusesDisplay');
const elTenant = document.getElementById('tenantDisplay');
const elRentPerTenant = document.getElementById('rentPerTenantDisplay');
const elAttract = document.getElementById('attractDisplay');
const elWolseRatio = document.getElementById('wolseRatioDisplay');
const elJeonseRatio = document.getElementById('jeonseRatioDisplay');
const elTears = document.getElementById('tearsDisplay');
const elStability = document.getElementById('stabilityDisplay');
const elHappiness = document.getElementById('happinessDisplay');
const elBusCost = document.getElementById('busCostDisplay');
const elRemodelCost = document.getElementById('remodelCostDisplay');
const sliderJeonse = document.getElementById('jeonseSlider');

const towerContainer = document.getElementById('towerContainer');
const alertBox = document.getElementById('eventAlert');
const msgBox = document.getElementById('eventMessage');

// Tabs
const tabs = {
    'tabBasic': document.getElementById('panelBasic'),
    'tabUpgrade': document.getElementById('panelUpgrade'),
    'tabBank': document.getElementById('panelBank')
};

Object.keys(tabs).forEach(tabId => {
    document.getElementById(tabId).onclick = (e) => {
        Object.keys(tabs).forEach(tId => {
            document.getElementById(tId).classList.remove('active');
            tabs[tId].classList.add('hidden');
        });
        e.target.classList.add('active');
        tabs[tabId].classList.remove('hidden');
    };
});

sliderJeonse.oninput = (e) => {
    jeonseRatio = parseInt(e.target.value);
    elWolseRatio.innerText = 100 - jeonseRatio;
    elJeonseRatio.innerText = jeonseRatio;
    updateUI();
};

const calcAttractiveness = () => {
    let score = 60 - (rentPerTenant * 5);
    if (hasElevator) score += 20;
    score += (remodelLevel * 15);
    if (hasCafe) score += 30;
    if (happiness < 40) score -= 20;
    return Math.max(0, Math.min(100, score));
};

const updateUI = () => {
    const maxCapacity = (busCount * 10) - (hasCafe ? 10 : 0);
    attractiveness = calcAttractiveness();

    const wolseTenants = Math.floor(tenants * (100 - jeonseRatio) / 100);
    const expectedIncome = (rentPerTenant * wolseTenants) * rentMultiplier;

    elDeposit.innerText = Math.floor(deposit);
    elTotalRent.innerText = expectedIncome;
    elLoan.innerText = Math.floor(loan);
    elInterestRate.innerText = interestRate.toFixed(1);
    elInterestCost.innerText = Math.floor(loan * (interestRate / 100) / 2); // 초당 이자 (현실성을 위해 스케일링)
    
    elBusCount.innerText = busCount;
    elMaxBuses.innerText = maxBuses;
    
    elTenant.innerText = `${Math.floor(tenants)}/${maxCapacity}`;
    elRentPerTenant.innerText = rentPerTenant;
    elAttract.innerText = Math.floor(attractiveness);
    
    elTears.innerText = Math.floor(tears);
    elStability.innerText = Math.floor(stability);
    elHappiness.innerText = Math.floor(happiness);
    elBusCost.innerText = busCost;
    elRemodelCost.innerText = remodelCost;

    elDeposit.className = deposit < 0 ? 'danger-text' : 'dark-stat';
    elStability.className = stability < 40 ? 'warning-text' : 'dark-stat';
    elHappiness.className = happiness < 30 ? 'warning-text' : 'dark-stat';
    elAttract.className = attractiveness < 30 ? 'warning-text' : 'dark-stat';

    if (stability < 40 && busCount > 0) towerContainer.classList.add('shaking');
    else towerContainer.classList.remove('shaking');
};

const renderBuses = (isNew = false) => {
    while (busOffsets.length < busCount) busOffsets.push((Math.random() - 0.5) * 15);
    if (busOffsets.length > busCount) busOffsets.length = busCount;

    towerContainer.innerHTML = '';
    for (let i = 0; i < busCount; i++) {
        const wrap = document.createElement('div');
        wrap.className = 'bus-container';
        wrap.style.transform = `translateX(${busOffsets[i]}px)`;
        if (isNew && i === busCount - 1) wrap.style.animation = 'dropIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
        else wrap.style.animation = 'none';

        const bus = document.createElement('img');
        bus.className = 'bus';
        bus.src = 'assets/long_bus.jpg';
        if (i === 0 && hasCafe) bus.classList.add('bus-cafe');
        
        wrap.appendChild(bus);
        towerContainer.appendChild(wrap);
    }
};

// --- 돌발 매크로 경제 이벤트 ---
const EVENTS = [
    { type: 'bad', msg: "🚨 [거시경제] 한국은행 기준금리 빅스텝 인상! 대출 이자가 폭등합니다.", action: () => { interestRate = Math.min(15, interestRate + 3); } },
    { type: 'good', msg: "📉 [거시경제] 금리 인하 사이클 진입! 대출 이자가 낮아집니다.", action: () => { interestRate = Math.max(1, interestRate - 2); } },
    { type: 'bad', msg: "⚖️ [규제] 임대차 3법 시행! 기존 세입자들이 나가지 않아 골치가 아픕니다. (행복도 하락)", action: () => { happiness = Math.max(0, happiness - 20); } },
    { type: 'good', msg: "🎉 [호재] 주변 대규모 재개발로 이주 수요 폭발! 선호도와 상관없이 세입자가 몰립니다.", action: () => { tenants += 5; } },
    { type: 'bad', msg: "💥 [악재] 부실시공 적발! 타워 내구도가 크게 손상되었습니다. 서둘러 보수하세요!", action: () => { stability = Math.max(0, stability - 30); } }
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
    setTimeout(() => {
        if(busCount > 0) showEvent(EVENTS[Math.floor(Math.random() * EVENTS.length)]);
        scheduleNextEvent();
    }, Math.random() * 10000 + 20000); // 20~30초 주기
};

// --- 종합부동산세 과세 (30초마다) ---
setInterval(() => {
    if (busCount > 1) {
        const tax = Math.floor(Math.pow(busCount, 1.8) * 5); // 누진세
        deposit -= tax;
        showEvent({ type: 'bad', msg: `🧾 [종합부동산세 과세] 다주택자(다버스자) 중과세로 ${tax}💰이 징수되었습니다.`, action: () => {} });
    }
}, 30000);

// --- 게임 메인 루프 (1초마다) ---
setInterval(() => {
    const maxCapacity = (busCount * 10) - (hasCafe ? 10 : 0);
    attractiveness = calcAttractiveness();

    // 수요-공급에 따른 세입자 입주/퇴거
    if (attractiveness >= 60) tenants += Math.random() * 2 + 1;
    else if (attractiveness < 40 && attractiveness > 15) tenants -= Math.random() * 1.5;
    else if (attractiveness <= 15) tenants -= 3;
    
    tenants = Math.max(0, Math.min(maxCapacity, tenants));

    // 전세/월세 정산 및 역전세난 처리 로직
    const targetJeonseTenants = tenants * (jeonseRatio / 100);
    const diffJeonse = targetJeonseTenants - currentJeonseTenants;
    
    if (diffJeonse > 0) {
        // 전세 세입자가 늘어남 -> 목돈 들어옴
        deposit += (diffJeonse * JEONSE_DEPOSIT);
    } else if (diffJeonse < 0) {
        // 전세 세입자가 줄어듦(방 뺌 or 월세 전환) -> 보증금 반환 (역전세)
        deposit += (diffJeonse * JEONSE_DEPOSIT); // diff가 음수이므로 차감됨
    }
    currentJeonseTenants = targetJeonseTenants;

    const wolseTenants = Math.floor(tenants - currentJeonseTenants);
    const income = (rentPerTenant * wolseTenants) * rentMultiplier;
    
    // 이자 차감
    const interest = loan * (interestRate / 100) / 2;
    
    deposit += income - interest;
    
    // 행복도 및 내구도 처리
    if (tenants > 0) {
        if (isHeatingOff) { tears += (tenants * 0.5); happiness = Math.max(0, happiness - 2); }
        else { happiness = hasCafe ? Math.min(100, happiness + 0.5) : Math.max(0, happiness - 0.5); }
    }
    if (busCount > 3) stability = Math.max(0, stability - (busCount * 0.1));
    
    // 파산 체크 (마이너스 1000)
    if (deposit < -1000) {
        alert("💸 [파산 선언] 대출 이자와 세금, 전세금 반환(역전세난)을 감당하지 못하고 파산했습니다... 게임 오버!");
        location.reload();
    }
    
    updateUI();
}, 1000);

// 이벤트 루프 (3초마다 치명적 상태 체크)
setInterval(() => {
    if (happiness < 15 && tenants > 0) {
        alert("🚨 [뱅크런 발생!] 참다못한 세입자들이 단체 이탈했습니다!");
        // 나간 사람만큼 전세금 무조건 반환
        const leaving = tenants;
        tenants = 0;
        const leaveJeonse = leaving * (jeonseRatio / 100);
        deposit -= (leaveJeonse * JEONSE_DEPOSIT);
        currentJeonseTenants = 0;
        happiness = 50;
    }
    
    if (stability <= 0 && busCount > 0) {
        alert("💥 [건물 붕괴!] 타워가 붕괴되었습니다... 전세금은 날아갑니다.");
        busCount = Math.max(1, busCount - 3);
        const maxCapacity = (busCount * 10) - (hasCafe ? 10 : 0);
        tenants = Math.min(tenants, maxCapacity); 
        currentJeonseTenants = tenants * (jeonseRatio / 100);
        stability = 100;
        renderBuses();
    }
    updateUI();
}, 3000);


// --- 월세 컨트롤러 ---
document.getElementById('btnRentDown').onclick = () => { if (rentPerTenant > 1) { rentPerTenant--; updateUI(); } };
document.getElementById('btnRentUp').onclick = () => { if (rentPerTenant < 50) { rentPerTenant++; updateUI(); } };

// --- 기본 관리 ---
document.getElementById('btnManual').onclick = () => { deposit += (1 + Math.floor(tenants * 0.5)); updateUI(); };
document.getElementById('btnBuyBus').onclick = () => {
    if (busCount >= maxBuses) { alert("🚨 용적률 상한 초과! 토지 용도 변경을 먼저 진행하세요."); return; }
    if (deposit >= busCost) {
        deposit -= busCost;
        busCount++;
        busCost = Math.floor(busCost * 1.5);
        stability = Math.max(0, stability - 10);
        towerContainer.classList.remove('thud'); void towerContainer.offsetWidth; towerContainer.classList.add('thud');
        renderBuses(true); updateUI();
    } else alert("자본금이 부족합니다!");
};
document.getElementById('btnRepair').onclick = () => { if (deposit >= 20) { deposit -= 20; stability = Math.min(100, stability + 30); updateUI(); } else alert("자본금이 부족합니다."); };
document.getElementById('btnPizza').onclick = () => { if (deposit >= 30) { deposit -= 30; happiness = Math.min(100, happiness + 40); updateUI(); } else alert("자본금이 부족합니다."); };

// --- 시설 투자 ---
document.getElementById('btnElevator').onclick = () => {
    if (hasElevator) return;
    if (deposit >= 300) { deposit -= 300; hasElevator = true; document.getElementById('btnElevator').disabled = true; document.getElementById('btnElevator').innerText = "✅ 승강기 완료"; updateUI(); }
};
document.getElementById('btnRemodel').onclick = () => {
    if (deposit >= remodelCost) { deposit -= remodelCost; remodelLevel++; remodelCost = Math.floor(remodelCost * 2); updateUI(); }
};
document.getElementById('btnCafe').onclick = () => {
    if (hasCafe) return;
    if (busCount < 2) { alert("버스가 최소 2대 필요합니다!"); return; }
    if (deposit >= 500) {
        deposit -= 500; hasCafe = true;
        const maxCapacity = (busCount * 10) - 10;
        if (tenants > maxCapacity) { tenants = maxCapacity; currentJeonseTenants = tenants * (jeonseRatio / 100); }
        document.getElementById('btnCafe').disabled = true; document.getElementById('btnCafe').innerText = "✅ 카페 영업 중";
        renderBuses(false); updateUI();
    }
};

// --- 은행 및 규제 ---
document.getElementById('btnLoan').onclick = () => {
    loan += 500;
    deposit += 500;
    updateUI();
};
document.getElementById('btnRepay').onclick = () => {
    if (loan < 500) { alert("대출 잔액이 500 미만입니다."); return; }
    if (deposit >= 500) {
        loan -= 500;
        deposit -= 500;
        updateUI();
    } else alert("자본금이 부족합니다.");
};
document.getElementById('btnZoning').onclick = () => {
    if (deposit >= 1000) {
        deposit -= 1000;
        maxBuses += 5;
        alert("🎉 [용도 변경 완료] 뇌물을... 아니 로비를 성공적으로 마쳐 건축 가능 대수가 5대 늘어났습니다!");
        updateUI();
    } else alert("로비 자금(1000💰)이 부족합니다.");
};

// Init
renderBuses(false);
updateUI();
scheduleNextEvent();
