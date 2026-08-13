// Game State

const formatNum = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + "M";
    if (num >= 1000) return (num / 1000).toFixed(2) + "K";
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
};

let deposit = 100;
let tears = 0;
let busCount = 1;
let busCost = 50;
let maxBuses = 5; // 용적률 상한
let stability = 100;
let happiness = 100;
let isHeatingOff = false;
let gameOver = false;
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
let hasSlide = false;
let hasSubway = false;
let hasHelipad = false;
let buildingTier = 1; // 1~4
let infra = { fire: 0, conv: 0, water: 0, elec: 0 };
const INFRA_CONFIG = {
    fire: [
        { name: "층별 소화기", cost: 1000, pts: 2, desc: "화재 피해 30% 감소" },
        { name: "화재 경보기", cost: 3000, pts: 5, desc: "화재 피해 60% 감소" },
        { name: "스프링클러", cost: 10000, pts: 15, desc: "화재 무효화" }
    ],
    conv: [
        { name: "무인 택배함", cost: 1000, pts: 2, desc: "선호도 +5" },
        { name: "코인 세탁소", cost: 3000, pts: 5, desc: "선호도 +10" },
        { name: "대형 편의점", cost: 10000, pts: 15, desc: "선호도 +30" }
    ],
    water: [
        { name: "공용 펌프", cost: 1000, pts: 2, desc: "단수 피해 감소" },
        { name: "온수 보일러", cost: 3000, pts: 5, desc: "세입자 행복도 +5" },
        { name: "스마트 정수", cost: 10000, pts: 15, desc: "행복도 +15" }
    ],
    elec: [
        { name: "공용 콘센트", cost: 1000, pts: 2, desc: "전기료 10% 절감" },
        { name: "기가 인터넷", cost: 3000, pts: 5, desc: "이탈률 10% 감소" },
        { name: "태양광 발전", cost: 10000, pts: 15, desc: "월세 마진 극대화" }
    ]
};

// Relics Master List
const RELICS_MASTER = [
    { id: 'toad', emoji: '🐸', name: '황금 두꺼비', desc: '수동 징수로 얻는 자금이 3배가 됩니다.', cost: 1000 },
    { id: 'broker', emoji: '🕴️', name: '악질 브로커', desc: '월세 수익이 1.5배 증가합니다.', cost: 2000 },
    { id: 'tv', emoji: '📺', name: '초대형 벽걸이 TV', desc: '세입자 입주 선호도가 영구적으로 크게 오릅니다.', cost: 5000 },
    { id: 'coating', emoji: '🧪', name: '불법 방수 코팅제', desc: '내구도 하락 속도가 느려지고 붕괴 시 피해가 반감됩니다.', cost: 10000 },
    { id: 'license', emoji: '📜', name: '가짜 건축 허가증', desc: '토지 용도 변경(로비) 비용이 반값으로 줄어듭니다.', cost: 15000 },
    { id: 'thug', emoji: '🦍', name: '용역 반장', desc: '뱅크런 발생 시, 세입자의 절반이 도망가지 못하고 남습니다.', cost: 30000 },
    { id: 'cartel', emoji: '🎩', name: '부동산 카르텔', desc: '버스 층수 1층당 월세 수익이 5%씩 복리로 폭증합니다.', cost: 50000 },
    { id: 'nobel', emoji: '📉', name: '노벨 경제학상', desc: '모든 인프라 개선 비용이 영구적으로 30% 할인됩니다.', cost: 80000 },
    { id: 'midas', emoji: '🖐️', name: '마이다스의 손', desc: '현재 건물 등급(Tier) 1단계마다 대출 한도가 2배씩 폭등합니다.', cost: 120000 },
    { id: 'superconductor', emoji: '🧲', name: '초전도 철근', desc: '건물이 무너지는 페널티(버스 삭제)를 완벽하게 무효화합니다.', cost: 250000 },
    { id: 'devil_contract', emoji: '😈', name: '악마의 계약서', desc: '[저주] 월세 수익이 3배가 되지만, 매초 내구도가 1씩 깎입니다.', cost: 10000 },
    { id: 'blood_pact', emoji: '🩸', name: '피의 서약', desc: '[저주] 대출 이자율이 영구적으로 0%가 되지만, 행복도가 2배 빠르게 감소합니다.', cost: 15000 },
    { id: 'arena', emoji: '🗑️', name: '지하 투기장', 상시세입자: true, desc: '[저주] 세입자가 항상 꽉 차지만, 3초마다 부상 치료비(1000💰)가 빠져나갑니다.', cost: 20000 }
];
let ownedRelics = [];
let currentShopItems = [];
let shopTimer = 30; // 30초마다 로테이션

// Meta-progression (Legacy Tears)
let legacyTears = parseInt(localStorage.getItem('legacyPoints') || '0');
let legacyRelics = JSON.parse(localStorage.getItem('legacyRelics') || '[]');
const LEGACY_SHOP = [
    { id: 'legacy_golden_bus', name: '황금 버스 미니어처', desc: '영구 버프: 시작 시 버스 2대 소유 (버티기 수월함)', cost: 1000 },
    { id: 'legacy_trust_fund', name: '비밀 신탁 기금', desc: '영구 버프: 시작 시 자본금 +5000💰 (초반 스노우볼)', cost: 2000 }
];

// Achievements System
let unlockedAchievements = JSON.parse(localStorage.getItem('unlockedAchievements') || '[]');
const ACHIEVEMENTS = [
    { id: 'ach_tears', name: '피도 눈물도 없는 자', desc: '세입자의 눈물 1,000 돌파 (보상: 1000 💧)', check: () => tears >= 1000, reward: 1000 },
    { id: 'ach_loan', name: '영끌족의 최후', desc: '대출금 100,000💰 돌파 (보상: 5000 💧)', check: () => loan >= 100000, reward: 5000 },
    { id: 'ach_danger', name: '안전불감증', desc: '타워 내구도 10 이하로 하락 (보상: 500 💧)', check: () => stability <= 10, reward: 500 },
    { id: 'ach_cartel', name: '악질 카르텔', desc: '최고 등급(Tier 4) 하이엔드 랜드마크 달성 (보상: 2000 💧)', check: () => buildingTier >= 4, reward: 2000 }
];

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

const elTears = document.getElementById('tearsDisplay');
const elStability = document.getElementById('stabilityDisplay');
const elHappiness = document.getElementById('happinessDisplay');
const elBusCost = document.getElementById('busCostDisplay');



const towerContainer = document.getElementById('towerContainer');
const alertBox = document.getElementById('eventAlert');
const msgBox = document.getElementById('eventMessage');

// Tabs
const tabs = {
    'tabBasic': document.getElementById('panelBasic'),
    'tabUpgrade': document.getElementById('panelUpgrade'),
    'tabBank': document.getElementById('panelBank'),
    'tabManager': document.getElementById('panelManager'),
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
    let score = 50; 
    
    
    const tierScore = buildingTier === 1 ? 0 : (buildingTier === 2 ? 20 : (buildingTier === 3 ? 50 : 100));
    score += tierScore;
    
    // 편의 인프라 보너스
    if (infra.conv === 1) score += 5;
    else if (infra.conv === 2) score += 15;
    else if (infra.conv === 3) score += 45;
    
    if (hasSlide) score += 50;
    if (hasSubway) score += 100;
    
    if (ownedRelics.includes('tv')) score += 20; // Relic effect
    if (happiness < 40) score -= 20;
    return Math.max(0, Math.min(100, score));
};

const updateUI = () => {
    try {
        const maxCapacityBase = (busCount * 10) - 0;
        const maxCapacity = Math.max(0, hasHelipad ? maxCapacityBase * 2 : maxCapacityBase);

    attractiveness = calcAttractiveness();

    const brokerMult = ownedRelics.includes('broker') ? 1.5 : 1;
    const expectedIncome = (rentPerTenant * tenants) * rentMultiplier * brokerMult;

    elDeposit.innerText = formatNum(deposit);
    elTotalRent.innerText = expectedIncome.toFixed(2);
    elLoan.innerText = formatNum(loan);
    elInterestRate.innerText = interestRate.toFixed(2);
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
    const trendEl = document.getElementById('tenantTrendDisplay');
    if(window.tenantTrend === '++') { trendEl.innerText = '(⬆️⬆️)'; trendEl.style.color = '#10b981'; }
    else if(window.tenantTrend === '+') { trendEl.innerText = '(⬆️)'; trendEl.style.color = '#10b981'; }
    else if(window.tenantTrend === '--') { trendEl.innerText = '(⬇️⬇️)'; trendEl.style.color = '#ef4444'; }
    else if(window.tenantTrend === '-') { trendEl.innerText = '(⬇️)'; trendEl.style.color = '#ef4444'; }
    else { trendEl.innerText = '(-)'; trendEl.style.color = '#94a3b8'; }

    elRentPerTenant.innerText = rentPerTenant;
    
    elTears.innerText = formatNum(tears);
    elStability.innerText = Math.floor(stability);
    elHappiness.innerText = Math.floor(happiness);
    elBusCost.innerText = busCost;
    

    elDeposit.className = deposit < 0 ? 'danger-text' : 'dark-stat';
    elStability.className = stability < 40 ? 'warning-text' : 'dark-stat';
    elHappiness.className = happiness < 30 ? 'warning-text' : 'dark-stat';

    if (stability < 40 && busCount > 0) towerContainer.classList.add('shaking');
    else towerContainer.classList.remove('shaking');
    } catch(e) { console.error("updateUI ERROR:", e); }
};

let busColors = []; // Store colors for consistency


const renderBuses = (animateLast = false) => {
    towerContainer.innerHTML = '';
    for (let i = 0; i < busCount; i++) {
        const wrap = document.createElement('div');
        wrap.className = 'bus-wrapper';
        if (animateLast && i === busCount - 1) wrap.classList.add('drop-anim');
        
        wrap.style.transform = `translateX(${busOffsets[i]}px)`;
        wrap.style.zIndex = busCount - i;
        
        const img = document.createElement('img');
        img.src = 'bus.jpg';
        img.className = 'bus-img';
        
        // 건물 등급에 따른 필터 효과
        if (buildingTier === 2) img.style.filter = `hue-rotate(${busColors[i]}deg) saturate(1.5) contrast(1.2)`;
        else if (buildingTier === 3) img.style.filter = `hue-rotate(${busColors[i]}deg) saturate(2) brightness(1.2) contrast(1.5)`;
        else if (buildingTier >= 4) img.style.filter = `hue-rotate(${busColors[i]}deg) sepia(1) hue-rotate(-50deg) saturate(3) brightness(1.3) drop-shadow(0 0 10px gold)`;
        else img.style.filter = `hue-rotate(${busColors[i]}deg)`;
        
        wrap.appendChild(img);
        towerContainer.appendChild(wrap);
    }
    document.getElementById('tierDisplay').innerText = `Tier ${buildingTier}`;
    if(buildingTier === 1) document.getElementById('tierDisplay').innerText += ' (판자촌)';
    else if(buildingTier === 2) document.getElementById('tierDisplay').innerText += ' (임대주택)';
    else if(buildingTier === 3) document.getElementById('tierDisplay').innerText += ' (분양아파트)';
    else if(buildingTier === 4) document.getElementById('tierDisplay').innerText += ' (랜드마크)';
};



// --- 돌발 이벤트 컬렉션 ---
const showEvent = (eventObj) => {
    alertBox.style.background = eventObj.type === 'good' ? 'rgba(39, 174, 96, 0.95)' : 'rgba(192, 57, 43, 0.95)';
    msgBox.innerText = eventObj.msg;
    alertBox.classList.remove('hidden');
    eventObj.action();
    updateUI();
    setTimeout(() => { alertBox.classList.add('hidden'); }, 7000); // 읽을 시간을 위해 7초로 연장
};

const showChoiceEvent = (eventObj) => {
    document.getElementById('choiceTitle').innerText = eventObj.title;
    document.getElementById('choiceDesc').innerText = eventObj.desc;
    
    const btnContainer = document.getElementById('choiceButtons');
    btnContainer.innerHTML = '';
    
    eventObj.choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-warning';
        btn.innerText = choice.text;
        btn.onclick = () => {
            document.getElementById('choiceModal').classList.add('hidden');
            choice.action();
            updateUI();
        };
        btnContainer.appendChild(btn);
    });
    
    document.getElementById('choiceModal').classList.remove('hidden');
};



let evtTriggered = { riot: false, youtuber: false, loanShark: false };

const CHOICE_EVENTS = [
    {
        title: "🎥 유명 유튜버의 흉가 체험",
        desc: "대형 유튜버가 찾아와 우리 건물을 '흉가 체험' 컨셉으로 촬영하고 싶다고 합니다. 허가해 줄까요?",
        choices: [
            { text: "허가한다 (자극적인 홍보)", action: () => {
                const isGood = Math.random() < (managers.pr ? 0.8 : 0.5);
                if (isGood) {
                    showEvent({ type: 'good', msg: "👍 [대성공] 밈(Meme)으로 화제가 되어 핫플레이스로 등극! (세입자 폭증, 선호도 상승)", action: () => { tenants += 20; rentMultiplier += 0.3; } });
                } else {
                    showEvent({ type: 'bad', msg: "👎 [대실패] 9시 뉴스에 '안전 불감증 폐건물'로 보도되었습니다... (행복도/선호도 나락)", action: () => { happiness -= 30; rentMultiplier = Math.max(0.5, rentMultiplier - 0.4); tenants -= 10; } });
                }
            }},
            { text: "돈을 요구한다 (10,000💰)", action: () => {
                deposit += 10000;
                showEvent({ type: 'bad', msg: "💸 [악마의 편집] 돈은 받았지만, 악의적인 편집으로 건물 이미지가 안 좋아집니다. (행복도 감소)", action: () => { happiness -= 15; } });
            }},
            { text: "단호히 거절한다", action: () => {
                showEvent({ type: 'good', msg: "🛑 쫓아냈습니다. 아무 일도 일어나지 않았습니다.", action: () => {} });
            }}
        ]
    },
    {
        title: "📢 사이비 종교 포교 활동",
        desc: "건물 앞에서 사이비 종교 단체가 시끄럽게 확성기를 틀고 포교를 하고 있습니다.",
        choices: [
            { text: "물대포로 쫓아낸다", action: () => {
                const isSafe = Math.random() < (managers.pr ? 0.9 : 0.6);
                if (isSafe) {
                    showEvent({ type: 'good', msg: "💦 시원하게 쫓아냈습니다! 세입자들이 환호합니다. (행복도 대폭 상승)", action: () => { happiness = Math.min(100, happiness + 30); } });
                } else {
                    showEvent({ type: 'bad', msg: "💥 실수로 창문 몇 장을 박살냈습니다. (내구도 감소, 행복도 상승)", action: () => { stability -= 10; happiness = Math.min(100, happiness + 20); } });
                }
            }},
            { text: "경찰에 신고한다 (비용 5,000💰)", action: () => {
                if (deposit >= 5000) {
                    deposit -= 5000;
                    showEvent({ type: 'good', msg: "🚓 평화롭고 합법적으로 해결되었습니다. (행복도 소폭 상승)", action: () => { happiness = Math.min(100, happiness + 10); } });
                } else {
                    showEvent({ type: 'bad', msg: "자금이 부족해 경찰을 부를 수 없었습니다. (세입자 이탈)", action: () => { tenants -= 3; happiness -= 10; } });
                }
            }},
            { text: "방관한다", action: () => {
                showEvent({ type: 'bad', msg: "📢 소음에 지친 세입자들이 짐을 싸서 떠납니다. (행복도 하락, 세입자 이탈)", action: () => { happiness -= 20; tenants -= 5; } });
            }}
        ]
    },
    {
        title: "🍔 근처 식당 단체 식중독",
        desc: "근처 패스트푸드점에서 단체 식중독 사태가 터져 세입자 다수가 배를 움켜쥐고 있습니다.",
        choices: [
            { text: "구호품 지원 (비용 15,000💰)", action: () => {
                if (deposit >= 15000) {
                    deposit -= 15000;
                    showEvent({ type: 'good', msg: "💊 구급약과 죽을 돌렸습니다! 건물주 칭송 기사가 납니다. (선호도 폭발, 인구 증가)", action: () => { rentMultiplier += 0.5; tenants += 10; happiness = 100; } });
                } else {
                    showEvent({ type: 'bad', msg: "자금이 부족해 구호품을 사지 못했습니다...", action: () => { tenants -= 5; } });
                }
            }},
            { text: "내 알 바 아니다", action: () => {
                showEvent({ type: 'bad', msg: "🚑 세입자 다수가 병원에 입원하여 월세 수입이 깎입니다.", action: () => { tenants -= 8; happiness -= 10; } });
            }}
        ]
    },
    {
        title: "💰 숨겨진 비자금 발견",
        desc: "외벽 수리를 하던 중 전 건물주가 숨겨둔 엄청난 현금 뭉치를 발견했습니다!",
        choices: [
            { text: "경찰에 유실물 신고", action: () => {
                showEvent({ type: 'good', msg: "🏅 정직한 시민상 포상금을 받았습니다! (자본금 +2000💰, 행복도 상승)", action: () => { deposit += 2000; happiness += 15; } });
            }},
            { text: "전부 꿀꺽한다 (위험)", action: () => {
                const caught = Math.random() < (managers.pr ? 0.1 : 0.4);
                if (caught) {
                    showEvent({ type: 'bad', msg: "🚨 국세청에 적발되었습니다!! 무거운 징벌적 세금을 냈습니다. (자본금 -30,000💰)", action: () => { deposit -= 30000; } });
                } else {
                    showEvent({ type: 'good', msg: "🤫 완벽 범죄! 아무도 모르게 50,000💰를 얻었습니다!", action: () => { deposit += 50000; } });
                }
            }}
        ]
    }
];

const scheduleNextEvent = () => {
    setTimeout(() => {
        if(busCount > 0 && !window.gameOver && !isFeverTime && CHOICE_EVENTS.length > 0) {
            const ev = CHOICE_EVENTS[Math.floor(Math.random() * CHOICE_EVENTS.length)];
            showChoiceEvent(ev);
        }
        scheduleNextEvent(); // 무한 반복
    }, 45000 + Math.random() * 15000); // 45~60초 주기
};

// --- 종합부동산세 과세 (30초마다) ---
let lastTick = Date.now();
setInterval(() => {
    const now = Date.now();
    const deltaSeconds = Math.floor((now - lastTick) / 1000);
    lastTick = now;
    
    // 방치형(브라우저 스로틀링/오프라인) 보상 처리
    if (deltaSeconds > 10) {
        let income = (rentPerTenant * tenants) * rentMultiplier * (ownedRelics.includes('broker') ? 1.5 : 1) * (ownedRelics.includes('cartel') ? Math.pow(1.05, busCount) : 1) * (1 + skillRentLevel * 0.05);
    if (isFeverTime) income *= 3;
        const offlineEarnings = Math.floor(income * deltaSeconds * 0.5); // 50% 효율
        deposit += offlineEarnings;
        // showEvent({ type: 'good', msg: `💤 [방치형 보상] 자리를 비운 ${deltaSeconds}초 동안 관리인들이 수금하여 +${formatNum(offlineEarnings)}💰를 벌었습니다! (오프라인 이자 면제)`, action: () => {} });
        updateUI();
        return; // 이번 틱은 이자 차감 건너뜀
    }

    if (busCount > 1) {
        const tax = Math.floor(Math.pow(busCount, 1.8) * 5); // 누진세
        deposit -= tax;
        showEvent({ type: 'bad', msg: `🧾 [종합부동산세 과세] 다주택자(다버스자) 중과세로 ${tax}💰이 징수되었습니다.`, action: () => {} });
    }
}, 30000);

// --- 게임 메인 루프 (1초마다) ---
setInterval(() => {
    if (gameOver) return;
    const maxCapacityBase = (busCount * 10) - 0;
    const maxCapacity = Math.max(0, hasHelipad ? maxCapacityBase * 2 : maxCapacityBase);
    
    attractiveness = calcAttractiveness();

    const oldTenants = tenants;
    // 수요-공급에 따른 세입자 입주/퇴거
    if (attractiveness >= 80) tenants += Math.random() * 3 + 2; // 매우 빠름
    else if (attractiveness >= 60) tenants += Math.random() * 2 + 1; // 빠름
    else if (attractiveness >= 40) tenants += Math.random() * 1 + 0.5; // 보통 (기본 50)
    else if (attractiveness > 15) tenants -= Math.random() * 1.5; // 이탈
    else tenants -= 3; // 대거 이탈
    
    // 지하철역 특수 효과 (추가 인구 유입)
    if (hasSubway && attractiveness > 50) tenants += Math.random() * 2;
    
    if (ownedRelics.includes('arena')) tenants = maxCapacity; // 투기장 효과
    else tenants = Math.max(0, Math.min(maxCapacity, tenants));
    
    const delta = tenants - oldTenants;
    if (delta >= 1.5) window.tenantTrend = "++";
    else if (delta > 0.1) window.tenantTrend = "+";
    else if (delta <= -1.5) window.tenantTrend = "--";
    else if (delta < -0.1) window.tenantTrend = "-";
    else window.tenantTrend = "=";

    const brokerMult = ownedRelics.includes('broker') ? 1.5 : 1;
    let income = (rentPerTenant * tenants) * rentMultiplier * brokerMult;
    if (ownedRelics.includes('cartel')) income *= Math.pow(1.05, busCount);
    if (ownedRelics.includes('devil_contract')) income *= 3; // 악마의 계약서
    
    
    if (buildingTier >= 4) {
        // Tier 4: 세입자 절대 이탈 안함, 행복도 자동 회복
        tenants = maxCapacity;
        happiness = Math.min(100, happiness + 2);
    }
    
    // 이자 차감 (1초마다 무자비한 이자)

    const effectiveInterest = ownedRelics.includes('blood_pact') ? 0 : interestRate; // 피의 서약
    const interest = loan * (effectiveInterest / 100);
    deposit += income;
    if (loan > 0) deposit -= interest;
    
    // 자동 유지보수비 및 내구도 처리
    const maintenanceCost = Math.floor(busCount * 5); // 층당 5골드 유지비
    if (deposit >= maintenanceCost) {
        deposit -= maintenanceCost;
        // 유지보수 성공 시 내구도 자연 회복 (안정화)
        if (!ownedRelics.includes('devil_contract')) {
            stability = Math.min(100, stability + 1);
        }
    } else {
        // 돈이 없어서 유지보수 실패 시 치명적인 내구도 타격
        let stabilityDmg = busCount * 0.5;
        if (ownedRelics.includes('coating')) stabilityDmg /= 2;
        stability = Math.max(0, stability - stabilityDmg);
    }
    
    if (ownedRelics.includes('devil_contract')) stability = Math.max(0, stability - 1.0); // 악마의 계약서는 별도 추가 데미지

    // 행복도 자연 처리
    if (tenants > 0) {
        let hapDec = ownedRelics.includes('blood_pact') ? 1.0 : 0.5;
        if (isHeatingOff) { 
            tears += (tenants * 0.5); 
            happiness = Math.max(0, happiness - 2); 
        } else { 
            // 쾌적한 인프라가 있으면 행복도가 더 잘 오름
            const bonusHap = (infra.conv + infra.water) * 0.2;
            happiness = (bonusHap > 0) ? Math.min(100, happiness + 0.5 + bonusHap) : Math.max(0, happiness - hapDec); 
        }
    }
    
    // 조건부 이벤트 체크
    if (happiness <= 0 && tenants > 5 && !evtTriggered.riot) {
        if(managers.pr && Math.random() < 0.5) return; evtTriggered.riot = true;
        showChoiceEvent({
            title: "🔥 입주민 폭동 발생!",
            desc: "행복도가 바닥을 쳐서 입주민들이 시위를 시작했습니다! 언론에 보도될 위기입니다.",
            choices: [
                { text: "💰 돈으로 무마한다 (10,000💰 지출)", action: () => { deposit -= 10000; alert("자본주의로 시위를 진압했습니다."); } },
                { text: "🤷 무시한다 (선호도 반토막, 입주민 대거 이탈)", action: () => { rentMultiplier *= 0.5; tenants = Math.floor(tenants / 2); alert("이미지가 나락으로 떨어졌습니다."); } }
            ]
        });
    }
    const emptyRooms = maxCapacity - tenants;
    if (emptyRooms > 50 && !evtTriggered.youtuber) {
        evtTriggered.youtuber = true;
        showEvent({ type: 'good', msg: "👻 [흉가 체험] 유튜버들이 무단 침입해 영상을 올렸습니다. 오히려 젊은 층에 핫플이 되어 세입자가 폭발합니다!", action: () => { tenants += 30; } });
    }


        // 파산 체크 (자산 비례 마이너스 한도)
    const tierBonus = buildingTier === 1 ? 0 : (buildingTier === 2 ? 5000 : (buildingTier === 3 ? 30000 : 150000));
    const fixedAssets = (busCount * 50) + (hasElevator ? 300 : 0) + tierBonus;
    const bankruptcyLimit = -(Math.max(1000, fixedAssets * 2.0)); // 최소 -1000 또는 자산의 2배 마이너스까지 허용
    
    checkAchievements();
    
    if (deposit < bankruptcyLimit) {
        gameOver = true;
        alert(`💸 [파산 선언] 대출 이자를 감당하지 못했습니다... (한도: ${bankruptcyLimit} 초과)\n회사 매각 및 상속 절차에 들어갑니다.`);
        showRebirthScreen();
        return;
    }
    
    // 30층(목표) 달성 체크
    if (busCount >= 30 && !window.hasWon) {
        window.hasWon = true;
        gameOver = true;
        alert("🎉🎉🎉 [경축] 30층 달성! 🎉🎉🎉\n최고급 타워 건설에 성공했습니다! 회사를 매각하고 유산을 남길 수 있습니다.");
        showRebirthScreen();
        return;
    }
    
    updateUI();
    updateInfraUI();
    if (typeof updateSkillUI === "function") updateSkillUI();
}, 1000);

// 이벤트 루프 (3초마다 치명적 상태 체크)
setInterval(() => {
    if (gameOver) return;
    if (happiness < 15 && tenants > 0) {
        alert("🚨 [뱅크런 발생!] 참다못한 세입자들이 단체 이탈했습니다!");
        
        const retainMult = (ownedRelics.includes('thug') ? 0.5 : 0) + (hasSlide ? 0.2 : 0); 
        tenants = Math.floor(tenants * Math.min(1.0, retainMult));
        
        happiness = 50;
    }
    
    if (ownedRelics.includes('arena')) {
        deposit -= 1000; // 투기장 유지비
        showEvent({ type: 'bad', msg: "🩸 [투기장] 세입자들이 패싸움을 벌여 치료비(1000💰)가 지출됩니다.", action: () => {} });
    }
    
    const collapseThreshold = ownedRelics.includes('coating') ? -20 : 0; // Relic effect
    
    if (stability <= collapseThreshold && busCount > 0) {
        const damage = ownedRelics.includes('superconductor') ? 0 : (ownedRelics.includes('coating') ? 1 : 3);
        if (damage > 0) {
            alert("💥 [건물 붕괴!] 타워가 붕괴되었습니다... 세입자들이 이탈합니다.");
            busCount = Math.max(1, busCount - damage);
            const maxCapacityBase = (busCount * 10) - 0;
            const maxCapacity = Math.max(0, hasHelipad ? maxCapacityBase * 2 : maxCapacityBase);
            tenants = Math.min(tenants, maxCapacity); 
            stability = 100;
            busColors.length = busCount; // Trim colors
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
    let maxRent = 50;
    if (buildingTier >= 2) maxRent = 100;
    if (buildingTier >= 3) maxRent = 300;
    if (buildingTier >= 4) maxRent = 999;
    if (hasSubway) maxRent += 100;
    if (rentPerTenant < maxRent) { rentPerTenant++; updateUI(); } 
};

// --- 기본 관리 ---



const updateInfraUI = () => {
    let totalScore = 0;
    const types = ['fire', 'conv', 'water', 'elec'];
    
    types.forEach(type => {
        const lvl = infra[type];
        const btn = document.getElementById('btnInfra' + type.charAt(0).toUpperCase() + type.slice(1));
        const txt = document.getElementById('txtInfra' + type.charAt(0).toUpperCase() + type.slice(1));
        
        // Sum points
        for(let i=0; i<lvl; i++) totalScore += INFRA_CONFIG[type][i].pts;
        
        if (lvl < 3) {
            const next = INFRA_CONFIG[type][lvl];
            const costMult = ownedRelics.includes('nobel') ? 0.7 : 1.0;
            const cost = Math.floor(next.cost * costMult);
            btn.disabled = false;
            txt.innerHTML = `(Lv.${lvl}->${lvl+1}) ${next.name}<br>비용: ${cost}💰 | 점수 +${next.pts}`;
        } else {
            btn.disabled = true;
            txt.innerHTML = `(Lv.MAX) 업그레이드 완료!`;
        }
    });
    
    document.getElementById('infraScoreDisplay').innerText = totalScore;
    
    // Evaluate Tier based on total score
    let newTier = 1;
    if (totalScore >= 61) newTier = 4;
    else if (totalScore >= 31) newTier = 3;
    else if (totalScore >= 11) newTier = 2;
    
    if (newTier > buildingTier) {
        buildingTier = newTier;
        if (buildingTier === 2) { rentMultiplier *= 1.5; alert("✨ [건물 승급]\n종합 인프라 점수가 높아져 '임대 주택'으로 승격되었습니다! 월세 상한선과 배율이 대폭 증가합니다."); }
        if (buildingTier === 3) { rentMultiplier *= 1.5; alert("✨ [건물 승급]\n종합 인프라 점수가 대폭 상승하여 '민간 아파트'로 승격되었습니다! 부동산 가치가 폭발합니다."); }
        if (buildingTier === 4) { rentMultiplier *= 2.0; alert("👑 [최고 등급 달성]\n모든 인프라가 완벽합니다! 최고의 랜드마크가 되어 세입자가 이탈하지 않습니다!"); }
        renderBuses(false);
    }
};

const upgradeInfra = (type) => {
    if (infra[type] >= 3) return;
    const next = INFRA_CONFIG[type][infra[type]];
    const costMult = ownedRelics.includes('nobel') ? 0.7 : 1.0;
    const cost = Math.floor(next.cost * costMult);
    
    if (deposit >= cost) {
        deposit -= cost;
        infra[type]++;
        updateInfraUI();
        updateUI();
    } else {
        alert(`자본금이 부족합니다! (${cost}💰 필요)`);
    }
};

document.getElementById('btnInfraFire').onclick = () => upgradeInfra('fire');
document.getElementById('btnInfraConv').onclick = () => upgradeInfra('conv');
document.getElementById('btnInfraWater').onclick = () => upgradeInfra('water');
document.getElementById('btnInfraElec').onclick = () => upgradeInfra('elec');


let managers = { thug: false, acc: false, pr: false };

const bindMgrBtn = (id, onClick) => {
    const btn = document.getElementById(id);
    if (btn) btn.onclick = onClick;
};

bindMgrBtn('btnMgrThug', () => {
    if (deposit >= 5000) { deposit -= 5000; managers.thug = true; document.getElementById('btnMgrThug').disabled = true; document.getElementById('btnMgrThug').innerHTML = '✅ 행동대장 (고용됨)'; updateUI(); }
    else { alert("자본금이 부족합니다! (5,000💰 필요)"); }
});
bindMgrBtn('btnMgrAcc', () => {
    if (deposit >= 25000) { deposit -= 25000; managers.acc = true; interestRate *= 0.7; document.getElementById('btnMgrAcc').disabled = true; document.getElementById('btnMgrAcc').innerHTML = '✅ 수석 회계사 (고용됨)'; updateUI(); }
    else { alert("자본금이 부족합니다! (25,000💰 필요)"); }
});
bindMgrBtn('btnMgrPr', () => {
    if (deposit >= 50000) { deposit -= 50000; managers.pr = true; document.getElementById('btnMgrPr').disabled = true; document.getElementById('btnMgrPr').innerHTML = '✅ 언론 통제관 (고용됨)'; updateUI(); }
    else { alert("자본금이 부족합니다! (50,000💰 필요)"); }
});


document.getElementById('btnHeat').onclick = () => {
    isHeatingOff = !isHeatingOff;
    const btn = document.getElementById('btnHeat');
    if (isHeatingOff) {
        btn.innerHTML = '🔥 난방 켜기<br><span style="font-size:0.75rem;">(행복도 회복)</span>';
        btn.className = 'btn btn-primary';
    } else {
        btn.innerHTML = '🥶 난방 끄기<br><span style="font-size:0.75rem;">(눈물 생산기)</span>';
        btn.className = 'btn btn-evil';
    }
    updateUI();
};
document.getElementById('towerContainer').addEventListener('click', (e) => {
    if (window.gameOver) return;
    let earned = 10 + (skillClickLevel * 5);
    if (ownedRelics.includes('toad')) earned *= 3;
    if (isFeverTime) earned *= 3;
    deposit += earned;
    
    const text = document.createElement('div');
    text.className = 'floating-text';
    text.innerText = '+' + earned;
    
    const container = document.getElementById('floatingTextContainer');
    if (container) {
        const rect = container.getBoundingClientRect();
        // Fallback to center if clientX is missing (e.g., triggered via script)
        const x = (e.clientX !== undefined) ? e.clientX - rect.left : rect.width / 2;
        const y = (e.clientY !== undefined) ? e.clientY - rect.top : rect.height / 2;
        
        text.style.left = (x - 20) + 'px';
        text.style.top = (y - 20) + 'px';
        container.appendChild(text);
        
        setTimeout(() => {
            if(text.parentNode) text.parentNode.removeChild(text);
        }, 1000);
    }
    
    updateUI();
});
document.getElementById('btnBuyBus').onclick = () => {
    if (busCount >= maxBuses) { alert("🚨 용적률 상한 초과! 토지 용도 변경을 먼저 진행하세요."); return; }
    if (deposit >= busCost) {
        deposit -= busCost;
        busCount++;
        busCost = Math.floor(busCost * 1.3);
        stability = Math.max(0, stability - 10);
        towerContainer.classList.remove('thud'); void towerContainer.offsetWidth; towerContainer.classList.add('thud');
        renderBuses(true); updateUI();
    } else alert("자본금이 부족합니다!");
};



// --- 시설 투자 ---
document.getElementById('btnElevator').onclick = () => {
    if (hasElevator) return;
    if (deposit >= 300) { deposit -= 300; hasElevator = true; document.getElementById('btnElevator').disabled = true; document.getElementById('btnElevator').innerText = "✅ 승강기 완료"; updateUI(); }
};
document.getElementById('btnSlide').onclick = () => {
    if (hasSlide) return;
    if (deposit >= 3000) { deposit -= 3000; hasSlide = true; document.getElementById('btnSlide').disabled = true; document.getElementById('btnSlide').innerText = "✅ 미끄럼틀 완공"; updateUI(); }
};
document.getElementById('btnSubway').onclick = () => {
    if (hasSubway) return;
    if (deposit >= 20000) { deposit -= 20000; hasSubway = true; document.getElementById('btnSubway').disabled = true; document.getElementById('btnSubway').innerText = "✅ 초역세권 개통"; updateUI(); }
};
document.getElementById('btnHelipad').onclick = () => {
    if (hasHelipad) return;
    if (deposit >= 100000) { deposit -= 100000; hasHelipad = true; document.getElementById('btnHelipad').disabled = true; document.getElementById('btnHelipad').innerText = "✅ 옥상 헬기장 개장"; updateUI(); }
};

const getLoanAmount = () => {
    // 부동산 고정 자산 가치 산정
    const tierBonus = buildingTier === 1 ? 0 : (buildingTier === 2 ? 5000 : (buildingTier === 3 ? 30000 : 150000));
    const fixedAssets = (busCount * 50) + (hasElevator ? 300 : 0) + (hasSlide ? 1500 : 0) + (hasSubway ? 5000 : 0) + (hasHelipad ? 15000 : 0) + tierBonus;
    let baseLoan = Math.max(1000, Math.floor(fixedAssets * 3.0)); 
    
    if (ownedRelics.includes('midas')) {
        // 건물 등급 1단계마다 대출 한도 2배 폭등
        baseLoan = Math.floor(baseLoan * Math.pow(2.0, buildingTier));
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
        span.title = relicInfo.name + (relicInfo.desc.includes('[저주]') ? ' ⚠️' : '');
        if (relicInfo.desc.includes('[저주]')) span.style.color = '#e74c3c';
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

// --- Meta-progression Rebirth Functions ---
const showRebirthScreen = () => {
    document.getElementById('rebirthModal').classList.remove('hidden');
    document.getElementById('rebirthStats').innerText = `최고 층수: ${busCount}층\n수집한 세입자의 눈물: ${formatNum(tears)} 💧`;
    
    // 지급 유산: 흘린 눈물 전체가 그대로 다음 회차 포인트가 됨
    const earned = Math.floor(tears);
    legacyTears += earned;
    localStorage.setItem('legacyPoints', legacyTears);
    document.getElementById('rebirthStats').innerText += `\n\n상속된 눈물: +${formatNum(Math.floor(tears))} 💧`;
    document.getElementById('legacyPointsDisplay').innerText = legacyTears;
    
    renderLegacyShop();
};

const renderLegacyShop = () => {
    const shop = document.getElementById('legacyShop');
    shop.innerHTML = '';
    LEGACY_SHOP.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-action';
        btn.style.textAlign = 'left';
        if(legacyRelics.includes(item.id)) {
            btn.innerHTML = `✅ <b>${item.name}</b> (보유중)<br><span style="font-size:0.75rem;">${item.desc}</span>`;
            btn.disabled = true;
        } else {
            btn.innerHTML = `🛒 <b>${item.name}</b><br><span style="font-size:0.75rem;">${item.desc}</span><br><span style="color:yellow;">비용: ${item.cost} 💧</span>`;
            btn.onclick = () => buyLegacy(item);
        }
        shop.appendChild(btn);
    });
};

const buyLegacy = (item) => {
    if (legacyTears >= item.cost) {
        legacyTears -= item.cost;
        legacyRelics.push(item.id);
        localStorage.setItem('legacyPoints', legacyTears);
        localStorage.setItem('legacyRelics', JSON.stringify(legacyRelics));
        renderLegacyShop();
        document.getElementById('legacyPointsDisplay').innerText = legacyTears;
    } else {
        alert("상속 눈물이 부족합니다.");
    }
};

document.getElementById('btnRestartRebirth').onclick = () => {
    location.reload();
};

// 업적 UI 표시 로직
document.getElementById('btnAchievements').onclick = () => {
    const list = document.getElementById('achievementList');
    list.innerHTML = '';
    ACHIEVEMENTS.forEach(ach => {
        const div = document.createElement('div');
        div.style.padding = '10px';
        div.style.border = '1px solid #3498db';
        div.style.background = unlockedAchievements.includes(ach.id) ? 'rgba(52, 152, 219, 0.2)' : 'rgba(0,0,0,0.5)';
        div.style.color = unlockedAchievements.includes(ach.id) ? 'white' : '#7f8c8d';
        div.innerHTML = `<b>${unlockedAchievements.includes(ach.id) ? '✅' : '🔒'} ${ach.name}</b><br><span style="font-size:0.8rem;">${ach.desc}</span>`;
        list.appendChild(div);
    });
    document.getElementById('achievementModal').classList.remove('hidden');
};

function checkAchievements() {
    ACHIEVEMENTS.forEach(ach => {
        if (!unlockedAchievements.includes(ach.id) && ach.check()) {
            unlockedAchievements.push(ach.id);
            localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedAchievements));
            legacyTears += ach.reward;
            localStorage.setItem('legacyPoints', legacyTears); // Save updated tears
            showEvent({ type: 'good', msg: `🏆 [업적 달성!] ${ach.name}\n${ach.desc}\n영구 상속 눈물 +${ach.reward}💧 획득!`, action: () => {} });
        }
    });
}

// Init
if (legacyRelics.includes('legacy_golden_bus')) {
    busCount = 2;
    busOffsets.push((Math.random() - 0.5) * 15);
    busColors.push(Math.floor(Math.random() * 360));
    }
if (legacyRelics.includes('legacy_trust_fund')) {
    deposit += 5000;
}

refreshShop();
renderOwnedRelics();
renderBuses(false);
updateUI();
scheduleNextEvent();
