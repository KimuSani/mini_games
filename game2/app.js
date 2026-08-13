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

// Macro Economy & Bank
let loan = 0;
let interestRate = 15.0; // 15% 징수

// Upgrades & Relics
let hasElevator = false;
let hasCafe = false;
let hasSlide = false;
let hasSubway = false;
let hasHelipad = false;
let busRemodels = []; // 층별 리모델링 레벨 추적

// Relics Master List
const RELICS_MASTER = [
    { id: 'toad', emoji: '🐸', name: '황금 두꺼비', desc: '수동 징수로 얻는 자금이 3배가 됩니다.', cost: 300 },
    { id: 'broker', emoji: '🕴️', name: '악질 브로커', desc: '월세 수익이 1.5배 증가합니다.', cost: 500 },
    { id: 'tv', emoji: '📺', name: '초대형 벽걸이 TV', desc: '세입자 입주 선호도가 영구적으로 크게 오릅니다.', cost: 800 },
    { id: 'coating', emoji: '🧪', name: '불법 방수 코팅제', desc: '내구도 하락 속도가 느려지고 붕괴 시 피해가 반감됩니다.', cost: 1000 },
    { id: 'license', emoji: '📜', name: '가짜 건축 허가증', desc: '토지 용도 변경(로비) 비용이 반값으로 줄어듭니다.', cost: 1200 },
    { id: 'thug', emoji: '🦍', name: '용역 반장', desc: '뱅크런 발생 시, 세입자의 절반이 도망가지 못하고 남습니다.', cost: 2000 },
    { id: 'cartel', emoji: '🎩', name: '부동산 카르텔', desc: '버스 층수 1층당 월세 수익이 5%씩 복리로 폭증합니다.', cost: 5000 },
    { id: 'nobel', emoji: '📉', name: '노벨 경제학상', desc: '모든 층의 리모델링 비용이 영구적으로 150💰으로 고정됩니다.', cost: 8000 },
    { id: 'midas', emoji: '🖐️', name: '마이다스의 손', desc: '3레벨 이상 황금 버스 1대당 은행 대출 한도가 1.5배씩 폭등합니다.', cost: 12000 },
    { id: 'superconductor', emoji: '🧲', name: '초전도 철근', desc: '건물이 무너지는 페널티(버스 삭제)를 완벽하게 무효화합니다.', cost: 15000 }
];
let ownedRelics = [];
let currentShopItems = [];
let shopTimer = 30; // 30초마다 로테이션

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
    'tabBank': document.getElementById('panelBank'),
    'tabShop': document.getElementById('panelShop')
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

const calcAttractiveness = () => {
    let score = 60 - (rentPerTenant * 5);
    if (hasElevator) score += 20;
    
    // 각 층별 리모델링 합산
    const totalRemodelLevels = busRemodels.reduce((sum, lvl) => sum + lvl, 0);
    score += (totalRemodelLevels * 15);
    
    if (hasCafe) score += 30;
    if (hasSlide) score += 50;
    if (hasSubway) score += 100;
    
    if (ownedRelics.includes('tv')) score += 20; // Relic effect
    if (happiness < 40) score -= 20;
    return Math.max(0, Math.min(100, score));
};

const updateUI = () => {
    const maxCapacity = (busCount * 10) - (hasCafe ? 10 : 0);
    attractiveness = calcAttractiveness();

    const brokerMult = ownedRelics.includes('broker') ? 1.5 : 1;
    const expectedIncome = (rentPerTenant * tenants) * rentMultiplier * brokerMult;

    elDeposit.innerText = Math.floor(deposit);
    elTotalRent.innerText = expectedIncome.toFixed(1);
    elLoan.innerText = Math.floor(loan);
    elInterestRate.innerText = interestRate.toFixed(1);
    elInterestCost.innerText = Math.floor(loan * (interestRate / 100)); // 초당 이자
    
    // 대출 버튼 텍스트 동적 업데이트
    const currentLoanAmount = getLoanAmount();
    document.getElementById('btnLoan').innerHTML = `💸 영끌 한도 대출<br>(대출 +${currentLoanAmount})`;
    
    const repayAmount = Math.min(currentLoanAmount, loan, deposit);
    document.getElementById('btnRepay').innerHTML = `💵 일부 상환<br>(최대 ${Math.floor(repayAmount)} 단위)`;
    document.getElementById('btnRepayAll').innerHTML = `💸 영혼의 전액 상환<br>(현재 가능: ${Math.floor(Math.min(loan, deposit))})`;

    // 카페 상태 등 기타 UI 업데이트
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

let busColors = []; // Store colors for consistency

const renderBuses = (isNew = false) => {
    while (busOffsets.length < busCount) {
        busOffsets.push((Math.random() - 0.5) * 15);
        busColors.push(Math.floor(Math.random() * 360)); // Random Hue
        busRemodels.push(0); // 새 층은 레벨 0
    }
    if (busOffsets.length > busCount) {
        busOffsets.length = busCount;
        busColors.length = busCount;
        busRemodels.length = busCount;
    }

    towerContainer.innerHTML = '';
    
    // Auto zoom-out logic (fits max 5 buses comfortably without scaling)
    let scale = 1;
    if (busCount > 5) {
        scale = 5 / busCount;
    }
    towerContainer.style.transform = `scale(${scale})`;

    for (let i = 0; i < busCount; i++) {
        const wrap = document.createElement('div');
        wrap.className = 'bus-container';
        wrap.style.transform = `translateX(${busOffsets[i]}px)`;
        if (isNew && i === busCount - 1) wrap.style.animation = 'dropIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
        else wrap.style.animation = 'none';

        const bus = document.createElement('img');
        bus.className = 'bus';
        bus.src = 'assets/long_bus.jpg';
        
        let filterStr = `contrast(1.2) saturate(1.2) hue-rotate(${busColors[i]}deg)`;
        
        // 층별 시각 효과 (Visual FX)
        const lvl = busRemodels[i];
        if (lvl === 1) filterStr = `brightness(1.2) contrast(1.3) saturate(1.4) hue-rotate(${busColors[i]}deg)`;
        else if (lvl === 2) filterStr = `brightness(1.4) contrast(1.5) saturate(1.8) drop-shadow(0 0 10px rgba(255,255,255,0.5)) hue-rotate(${busColors[i]}deg)`;
        else if (lvl >= 3) filterStr = `brightness(1.5) contrast(1.6) saturate(2.0) sepia(0.5) hue-rotate(20deg) drop-shadow(0 0 15px rgba(241, 196, 15, 0.8))`;

        if (i === 0 && hasCafe) filterStr = `contrast(1.5) saturate(1.5) sepia(0.5) hue-rotate(-30deg)`;
        bus.style.filter = filterStr;
        
        wrap.appendChild(bus);
        
        // 리모델링 버튼 (뱃지) 추가
        const cost = ownedRelics.includes('nobel') ? 150 : 150 * Math.pow(2, lvl);
        const badge = document.createElement('button');
        badge.className = 'remodel-badge';
        badge.innerHTML = `Lv.${lvl}<br>🛠️ ${cost}💰`;
        badge.onclick = () => upgradeBusFloor(i, cost);
        wrap.appendChild(badge);
        
        towerContainer.appendChild(wrap);
    }
};

const upgradeBusFloor = (floorIndex, cost) => {
    if (deposit >= cost) {
        deposit -= cost;
        busRemodels[floorIndex]++;
        alert(`✨ [${floorIndex + 1}층 리모델링 완료] 선호도와 자산 가치가 대폭 상승했습니다!`);
        renderBuses(); // re-render to update badges and FX
        updateUI();
    } else {
        alert(`자본금이 부족합니다! (${cost}💰 필요)`);
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
    const maxCapacityBase = (busCount * 10) - (hasCafe ? 10 : 0);
    const maxCapacity = Math.max(0, hasHelipad ? maxCapacityBase * 2 : maxCapacityBase);
    
    attractiveness = calcAttractiveness();

    // 수요-공급에 따른 세입자 입주/퇴거
    if (attractiveness >= 80) tenants += Math.random() * 3 + 2; // 매우 빠름
    else if (attractiveness >= 60) tenants += Math.random() * 2 + 1; // 빠름
    else if (attractiveness >= 40) tenants += Math.random() * 1 + 0.5; // 보통 (기본 50)
    else if (attractiveness > 15) tenants -= Math.random() * 1.5; // 이탈
    else tenants -= 3; // 대거 이탈
    
    // 지하철역 특수 효과 (추가 인구 유입)
    if (hasSubway && attractiveness > 50) tenants += Math.random() * 2;
    
    tenants = Math.max(0, Math.min(maxCapacity, tenants));

    const brokerMult = ownedRelics.includes('broker') ? 1.5 : 1;
    let income = (rentPerTenant * tenants) * rentMultiplier * brokerMult;
    if (ownedRelics.includes('cartel')) {
        income *= Math.pow(1.05, busCount); // 카르텔: 층당 5% 복리 증가
    }
    
    // 이자 차감 (1초마다 무자비한 이자)
    const interest = loan * (interestRate / 100);
    deposit += income;
    if (loan > 0) deposit -= interest;
    
    // 행복도 및 내구도 처리
    if (tenants > 0) {
        if (isHeatingOff) { tears += (tenants * 0.5); happiness = Math.max(0, happiness - 2); }
        else { happiness = hasCafe ? Math.min(100, happiness + 0.5) : Math.max(0, happiness - 0.5); }
    }
    
    let stabilityDmg = busCount * 0.1;
    if (ownedRelics.includes('coating')) stabilityDmg /= 2; // Relic effect
    
    if (busCount > 3) stability = Math.max(0, stability - stabilityDmg);
    
    // 파산 체크 (자산 비례 마이너스 한도)
    const fixedAssets = (busCount * 50) + (hasCafe ? 500 : 0) + (hasElevator ? 300 : 0) + (remodelLevel * 150);
    const bankruptcyLimit = -(Math.max(1000, fixedAssets * 2.0)); // 최소 -1000 또는 자산의 2배 마이너스까지 허용
    
    if (deposit < bankruptcyLimit) {
        alert(`💸 [파산 선언] 대출 이자를 감당하지 못했습니다... (한도: ${bankruptcyLimit} 초과)\n게임 오버!`);
        location.reload();
    }
    
    // 30층(목표) 달성 체크
    if (busCount >= 30 && !window.hasWon) {
        window.hasWon = true;
        alert("🎉🎉🎉 [경축] 30층 달성! 🎉🎉🎉\n\n대한민국 최고의 랜드마크 '반포터 자이' 30층을 완성했습니다!\n온갖 악재와 세금을 이겨낸 당신은 진정한 부동산 마스터입니다!\n(게임은 계속 진행할 수 있습니다)");
    }
    
    updateUI();
}, 1000);

// 이벤트 루프 (3초마다 치명적 상태 체크)
setInterval(() => {
    if (happiness < 15 && tenants > 0) {
        alert("🚨 [뱅크런 발생!] 참다못한 세입자들이 단체 이탈했습니다!");
        
        const retainMult = (ownedRelics.includes('thug') ? 0.5 : 0) + (hasSlide ? 0.2 : 0); 
        tenants = Math.floor(tenants * Math.min(1.0, retainMult));
        
        happiness = 50;
    }
    
    const collapseThreshold = ownedRelics.includes('coating') ? -20 : 0; // Relic effect
    
    if (stability <= collapseThreshold && busCount > 0) {
        const damage = ownedRelics.includes('superconductor') ? 0 : (ownedRelics.includes('coating') ? 1 : 3);
        if (damage > 0) {
            alert("💥 [건물 붕괴!] 타워가 붕괴되었습니다... 세입자들이 이탈합니다.");
            busCount = Math.max(1, busCount - damage);
            const maxCapacityBase = (busCount * 10) - (hasCafe ? 10 : 0);
            const maxCapacity = Math.max(0, hasHelipad ? maxCapacityBase * 2 : maxCapacityBase);
            tenants = Math.min(tenants, maxCapacity); 
            stability = 100;
            busColors.length = busCount; // Trim colors
            busRemodels.length = busCount; // Trim remodels
            renderBuses();
        } else {
            alert("🛡️ [초전도 철근 발동!] 타워가 붕괴될 뻔 했으나, 초전도 철근이 완벽하게 버텨냈습니다!");
            stability = 100;
        }
    }
    updateUI();
}, 3000);


// --- 월세 컨트롤러 ---
document.getElementById('btnRentDown').onclick = () => { if (rentPerTenant > 1) { rentPerTenant--; updateUI(); } };
document.getElementById('btnRentUp').onclick = () => { 
    const maxRent = hasSubway ? 150 : 50;
    if (rentPerTenant < maxRent) { rentPerTenant++; updateUI(); } 
};

// --- 기본 관리 ---
document.getElementById('btnManual').onclick = () => { 
    const manualIncome = (1 + Math.floor(tenants * 0.5)) * (ownedRelics.includes('toad') ? 3 : 1);
    deposit += manualIncome; 
    updateUI(); 
};
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
document.getElementById('btnCafe').onclick = () => {
    if (hasCafe) return;
    if (busCount < 2) { alert("버스가 최소 2대 필요합니다!"); return; }
    if (deposit >= 500) {
        deposit -= 500; hasCafe = true;
        const maxCapacityBase = (busCount * 10) - 10;
        const maxCapacity = hasHelipad ? maxCapacityBase * 2 : maxCapacityBase;
        if (tenants > maxCapacity) { tenants = Math.max(0, maxCapacity); }
        document.getElementById('btnCafe').disabled = true; document.getElementById('btnCafe').innerText = "✅ 카페 영업 중";
        renderBuses(false); updateUI();
    }
};
document.getElementById('btnSlide').onclick = () => {
    if (hasSlide) return;
    if (deposit >= 1500) { deposit -= 1500; hasSlide = true; document.getElementById('btnSlide').disabled = true; document.getElementById('btnSlide').innerText = "✅ 미끄럼틀 완공"; updateUI(); }
};
document.getElementById('btnSubway').onclick = () => {
    if (hasSubway) return;
    if (deposit >= 5000) { deposit -= 5000; hasSubway = true; document.getElementById('btnSubway').disabled = true; document.getElementById('btnSubway').innerText = "✅ 초역세권 개통"; updateUI(); }
};
document.getElementById('btnHelipad').onclick = () => {
    if (hasHelipad) return;
    if (deposit >= 15000) { deposit -= 15000; hasHelipad = true; document.getElementById('btnHelipad').disabled = true; document.getElementById('btnHelipad').innerText = "✅ 옥상 헬기장 개장"; updateUI(); }
};

const getLoanAmount = () => {
    // 부동산 고정 자산 가치 산정
    const totalRemodelLevels = busRemodels.reduce((sum, lvl) => sum + lvl, 0);
    const fixedAssets = (busCount * 50) + (hasCafe ? 500 : 0) + (hasElevator ? 300 : 0) + (hasSlide ? 1500 : 0) + (hasSubway ? 5000 : 0) + (hasHelipad ? 15000 : 0) + (totalRemodelLevels * 150);
    let baseLoan = Math.max(1000, Math.floor(fixedAssets * 3.0)); 
    
    if (ownedRelics.includes('midas')) {
        const goldenBuses = busRemodels.filter(l => l >= 3).length;
        baseLoan = Math.floor(baseLoan * Math.pow(1.5, goldenBuses));
    }
    return baseLoan;
};

// --- 은행/로비 ---
document.getElementById('btnLoan').onclick = () => { 
    const amt = getLoanAmount();
    deposit += amt; 
    loan += amt; 
    alert(`💳 [대출 승인] 은행에서 ${amt}💰를 영끌 대출받았습니다! (현재 이율: ${interestRate}%)`);
    updateUI(); 
};
document.getElementById('btnRepay').onclick = () => { 
    const amt = getLoanAmount();
    if (loan <= 0) return alert("상환할 대출금이 없습니다.");
    
    const repayAmount = Math.min(amt, loan, Math.max(0, deposit));
    if (repayAmount > 0) {
        deposit -= repayAmount;
        loan -= repayAmount;
        updateUI();
    } else alert("자본금이 부족합니다.");
};
document.getElementById('btnRepayAll').onclick = () => {
    if (loan <= 0) return alert("상환할 대출금이 없습니다.");
    if (deposit <= 0) return alert("자본금이 바닥나서 상환할 수 없습니다.");
    
    const repayAmount = Math.min(loan, deposit);
    deposit -= repayAmount;
    loan -= repayAmount;
    alert(`💸 영혼을 끌어모아 ${Math.floor(repayAmount)}💰를 전액 상환했습니다!`);
    updateUI();
};
document.getElementById('btnZoning').onclick = () => {
    const zoningCost = ownedRelics.includes('license') ? 500 : 1000;
    if (deposit >= zoningCost) {
        deposit -= zoningCost;
        maxBuses += 5;
        alert(`🎉 [용도 변경 완료] 뇌물을... 아니 로비를 성공적으로 마쳐 건축 가능 대수가 5대 늘어났습니다! (비용: ${zoningCost})`);
        updateUI();
    } else alert(`로비 자금(${zoningCost}💰)이 부족합니다.`);
};

// --- 상점 (유물) 로테이션 로직 ---
const refreshShop = () => {
    // 3 random unowned relics
    const unowned = RELICS_MASTER.filter(r => !ownedRelics.includes(r.id));
    if(unowned.length === 0) {
        document.getElementById('shopItems').innerHTML = '<div style="color:#bdc3c7; text-align:center;">품절: 모든 유물을 구매했습니다!</div>';
        return;
    }
    
    currentShopItems = unowned.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    const container = document.getElementById('shopItems');
    container.innerHTML = '';
    
    currentShopItems.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.style.textAlign = 'left';
        btn.innerHTML = `${item.emoji} <b>${item.name}</b><br><span style="font-size:0.75rem; font-weight:normal;">${item.desc}</span><br><span style="color:yellow;">비용: ${item.cost}💰</span>`;
        btn.onclick = () => buyRelic(item);
        container.appendChild(btn);
    });
};

const buyRelic = (relic) => {
    if (deposit >= relic.cost) {
        deposit -= relic.cost;
        ownedRelics.push(relic.id);
        alert(`🎁 [유물 획득] ${relic.name} 효과가 영구적으로 적용됩니다!`);
        refreshShop();
        renderOwnedRelics();
        updateUI();
    } else {
        alert("자본금이 부족합니다!");
    }
};

const renderOwnedRelics = () => {
    const container = document.getElementById('relicsDisplay');
    if (ownedRelics.length === 0) {
        container.innerHTML = '<span style="color: #7f8c8d; font-size: 0.8rem;">보유 유물 없음</span>';
        return;
    }
    container.innerHTML = '';
    ownedRelics.forEach(id => {
        const relicInfo = RELICS_MASTER.find(r => r.id === id);
        const span = document.createElement('span');
        span.className = 'relic-icon';
        span.innerText = relicInfo.emoji;
        span.title = relicInfo.name;
        container.appendChild(span);
    });
};

setInterval(() => {
    if(ownedRelics.length < RELICS_MASTER.length) {
        shopTimer--;
        if (shopTimer <= 0) {
            shopTimer = 30;
            refreshShop();
        }
        document.getElementById('shopTimer').innerText = shopTimer;
    } else {
        document.getElementById('shopTimer').innerText = "-";
    }
}, 1000);

// Init
refreshShop();
renderOwnedRelics();
renderBuses(false);
updateUI();
scheduleNextEvent();
