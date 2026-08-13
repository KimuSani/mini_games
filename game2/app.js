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
const EVENTS = [
    { type: 'bad', msg: "🚨 [거시경제] 한국은행 기준금리 빅스텝 인상! 대출 이자가 폭등합니다.", action: () => { interestRate = Math.min(25, interestRate + 5); } },
    { type: 'good', msg: "📉 [거시경제] 금리 인하 사이클 진입! 대출 이자가 낮아집니다.", action: () => { interestRate = Math.max(1, interestRate - 3); } },
    { type: 'bad', msg: "👽 [기상천외] 심야에 UFO가 나타나 세입자 몇 명을 납치해갔습니다! (세입자 감소, 행복도 하락)", action: () => { tenants = Math.max(0, tenants - 3); happiness = Math.max(0, happiness - 15); } },
    { type: 'bad', msg: "🐀 [위생 불량] 건물에 쥐떼가 출몰하여 긴급 방역을 실시합니다! (방역비 1000💰 지출)", action: () => { deposit -= 1000; } },
    { type: 'good', msg: "💎 [유물 발굴] 배관 공사 중 땅 밑에서 조선시대 백자가 나왔습니다! (자본금 +3000💰)", action: () => { deposit += 3000; } },
    { type: 'bad', msg: "🧑‍🎤 [층간 소음] 어느 층에서 데스메탈 밴드가 밤새 연습을 합니다! 입주민들이 고통받습니다.", action: () => { happiness = Math.max(0, happiness - 30); tenants = Math.max(0, tenants - 5); } },
    { type: 'bad', msg: "🔥 [화재 발생] 노후된 전선에서 스파크가 튀어 불이 났습니다!", action: () => { 
        if (infra.fire === 3) alert("💦 하지만 첨단 스프링클러가 작동하여 피해를 완벽히 막았습니다!");
        else if (infra.fire === 2) { stability = Math.max(0, stability - 16); alert("🧯 화재 경보기가 작동해 초기 진압에 성공했습니다. (피해 대폭 감소)"); }
        else if (infra.fire === 1) { stability = Math.max(0, stability - 28); alert("🧯 층별 소화기로 어떻게든 껐습니다. (피해 소폭 감소)"); }
        else { stability = Math.max(0, stability - 40); alert("💥 화재 인프라가 없어 치명적인 피해를 입었습니다!"); }
    } },
    { type: 'good', msg: "📺 [방송 출연] '구해줘 버스홈즈' TV 프로그램에 소개되어 전국적인 핫플이 되었습니다!", action: () => { tenants += 10; deposit += 2000; } },
    { type: 'bad', msg: "💩 [비둘기 습격] 옥상에 비둘기 떼가 둥지를 틀었습니다. 청소 업체를 부릅니다. (청소비 500💰 지출)", action: () => { deposit -= 500; } },
    { type: 'good', msg: "👼 [독지가의 은혜] 익명의 자산가가 가엾은 건물주의 빚을 일부 갚아주고 떠납니다.", action: () => { loan = Math.max(0, loan - 2000); } },
    { type: 'good', msg: "💸 [벼락부자] 세입자 중 한 명이 밈 코인으로 대박이 나서 월세를 두둑하게 내고 퇴거했습니다!", action: () => { deposit += 5000; tenants = Math.max(0, tenants - 1); } },
    { type: 'good', msg: "🍕 [배달 사고] 잘못 배달된 피자 100판을 입주민들이 다 같이 나눠 먹고 축제를 벌였습니다!", action: () => { happiness = Math.min(100, happiness + 40); } },
    { type: 'bad', msg: "⚖️ [규제 강화] 국토교통부에서 임대료 상한제를 실시합니다. 강제 징수당합니다.", action: () => { deposit -= 2000; } },
    { type: 'good', msg: "🏆 [우수 건축물] 지자체에서 올해의 기괴한 건축물로 선정되어 포상금을 받았습니다!", action: () => { deposit += 4000; stability = Math.min(100, stability + 20); } },
    { type: 'bad', msg: "🌪️ [자연재해] 갑작스러운 소형 태풍이 불어 버스 창문이 박살났습니다! (내구도 -15)", action: () => { stability -= 15; } },
    { type: 'bad', msg: "🌧️ [자연재해] 강력한 산성비가 내려 외벽 부식이 가속됩니다. (내구도 -20)", action: () => { stability -= 20; } },
    { type: 'good', msg: "🛢️ [횡재] 마당을 파다가 석유가 터졌습니다!! (자본금 +10000💰)", action: () => { deposit += 10000; } },
    { type: 'bad', msg: "🛞 [범죄] 밤사이 누군가 버스 바퀴를 몽땅 훔쳐갔습니다. (자본금 -2000💰)", action: () => { deposit -= 2000; } },
    { type: 'bad', msg: "👻 [기행] 밤마다 엘리베이터(계단)에서 처녀귀신이 나온다는 소문이 퍼집니다. (행복도 -20)", action: () => { happiness -= 20; } },
    { type: 'good', msg: "🤵 [로또] 재벌 3세가 서민 체험을 하겠다며 웃돈을 주고 방을 렌트했습니다! (자본금 +8000💰)", action: () => { deposit += 8000; } },
    { type: 'bad', msg: "📢 [민폐] 사이비 종교 단체가 버스 앞에서 포교 활동을 벌입니다. (행복도 -10, 세입자 이탈)", action: () => { happiness -= 10; tenants -= 2; } },
    { type: 'good', msg: "👔 [로또] 입주민 중 한 명이 국회의원에 당선되어 건물의 위상이 크게 올랐습니다! (선호도 상승)", action: () => { rentMultiplier += 0.2; } },
    { type: 'bad', msg: "🎸 [소음] 인디 밴드가 주차장에서 게릴라 콘서트를 열어 민원이 폭주합니다. (행복도 -15)", action: () => { happiness -= 15; } },
    { type: 'good', msg: "🐱 [훈훈] 떠돌이 고양이가 건물 마스코트가 되어 주민들이 기뻐합니다. (행복도 +30)", action: () => { happiness += 30; } },
    { type: 'bad', msg: "💦 [누수] 위층 화장실 배관이 터져 아래층이 물바다가 되었습니다. (수리비 -1500💰)", action: () => { deposit -= 1500; } },
    { type: 'good', msg: "🎬 [촬영] 영화 '올드버스' 촬영지로 섭외되어 대관료를 받았습니다. (자본금 +5000💰)", action: () => { deposit += 5000; } },
    { type: 'bad', msg: "🍔 [식중독] 근처 햄버거집 단체 식중독 사태로 입주민 다수가 병원에 실려갑니다.", action: () => { tenants -= 4; } },
    { type: 'good', msg: "💸 [지원금] 소상공인(건물주) 위로 지원금이 입금되었습니다. (자본금 +2000💰)", action: () => { deposit += 2000; } },
    { type: 'bad', msg: "🚧 [공사] 앞 도로 굴착 공사 소음으로 세입자들의 스트레스가 극에 달합니다. (행복도 -25)", action: () => { happiness -= 25; } },
    { type: 'good', msg: "🌈 [길조] 건물 쌍무지개가 떠서 입주민들이 좋아합니다. (행복도 +10)", action: () => { happiness += 10; } },
    { type: 'bad', msg: "💨 [악취] 근처 하수도 역류로 끔찍한 냄새가 진동합니다. (세입자 대거 이탈)", action: () => { tenants = Math.max(0, tenants - 8); } },
    { type: 'good', msg: "🎉 [파티] 입주민 반상회에서 바베큐 파티가 열려 모두가 즐거워합니다. (행복도 +25)", action: () => { happiness += 25; } },
    { type: 'bad', msg: "🦇 [기행] 배트맨을 자처하는 세입자가 밤마다 옥상에서 뛰어내려 헬기를 부술 뻔합니다.", action: () => { stability -= 5; } },
    { type: 'good', msg: "🎨 [예술] 길거리 아티스트가 버스 외벽에 환상적인 그래피티를 남겼습니다. (선호도 상승)", action: () => { rentMultiplier += 0.1; } },
    { type: 'bad', msg: "💣 [테러] 불만 품은 전 세입자가 폭죽을 테러하고 도망갔습니다. (내구도 -10)", action: () => { stability -= 10; } },
    { type: 'good', msg: "🏅 [표창] 모범 납세 건물로 선정되어 표창과 상금을 받습니다. (자본금 +3500💰)", action: () => { deposit += 3500; } },
    { type: 'bad', msg: "🐜 [위생] 불개미 군단이 1층부터 옥상까지 행진을 시작합니다. (방역비 -800💰)", action: () => { deposit -= 800; } },
    { type: 'good', msg: "🦸 [영웅] 스파이더맨이 버스 외벽을 청소해주고 갔습니다! (내구도 +20)", action: () => { stability += 20; } },
    { type: 'bad', msg: "❄️ [동파] 기습 한파로 수도관이 얼어터졌습니다! (수리비 -3000💰)", action: () => { deposit -= 3000; } },
    { type: 'good', msg: "📈 [코인] 건물주가 장난삼아 산 잡코인이 떡상했습니다! (자본금 +6000💰)", action: () => { deposit += 6000; } },
    { type: 'bad', msg: "🔥 [방화] 누군가 분리수거장에 불을 질렀습니다.", action: () => {
        if (infra.fire === 3) alert("💦 하지만 첨단 스프링클러가 작동하여 피해를 완벽히 막았습니다!");
        else { stability -= 15; alert("방화로 인해 내구도가 감소했습니다."); }
    } },
    { type: 'good', msg: "🎁 [택배] 잘못 배송된 최고급 와인 세트를 입주민들이 나눠 마십니다. (행복도 +15)", action: () => { happiness += 15; } },
    { type: 'bad', msg: "🕷️ [위생] 천장에서 독거미가 떨어져 세입자가 기절했습니다.", action: () => { happiness -= 10; tenants -= 1; } },
    { type: 'good', msg: "☀️ [풍수지리] 유명한 도사가 명당이라며 극찬하고 갑니다. (선호도 폭발)", action: () => { rentMultiplier += 0.3; } },
    { type: 'bad', msg: "🌪️ [회오리] 마이크로 토네이도가 하필 타워만 치고 지나갑니다. (내구도 -30)", action: () => { stability -= 30; } },
    { type: 'good', msg: "💰 [비자금] 벽지를 뜯다 이전 건물주의 숨겨진 비자금 뭉치를 발견합니다! (자본금 +15000💰)", action: () => { deposit += 15000; } },
    { type: 'bad', msg: "🔨 [부실공사] 갑자기 바닥이 푹 꺼집니다. 땜빵 수리가 필요합니다. (비용 -4000💰)", action: () => { deposit -= 4000; } },
    { type: 'good', msg: "🎧 [ASMR] 타워의 삐걱거리는 소리가 힐링 ASMR로 유명해져 입주 대기열이 생깁니다.", action: () => { tenants += 5; } },
    { type: 'bad', msg: "🧟 [좀비?] 좀비 분장을 한 취객이 돌아다녀 사람들이 기겁합니다. (행복도 -20)", action: () => { happiness -= 20; } },
    { type: 'good', msg: "🚁 [구호물자] 옥상 헬기장에 뜬금없이 구호물자가 떨어졌습니다. (자본금 +2500💰)", action: () => { deposit += 2500; } }
];


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

const CHOICE_EVENTS = [];

let evtTriggered = { riot: false, youtuber: false, loanShark: false };

const scheduleNextEvent = () => {
    setTimeout(() => {
        if(busCount > 0) {
            // 30% 확률로 선택형 이벤트 발생
            if (Math.random() < 0.3 && CHOICE_EVENTS.length > 0) {
                showChoiceEvent(CHOICE_EVENTS[Math.floor(Math.random() * CHOICE_EVENTS.length)]);
            } else {
                let ev = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    if (managers.pr && ev.type === 'bad' && Math.random() < 0.5) {
        // 언론 통제관이 나쁜 이벤트 50% 확률로 차단
        console.log("PR Manager blocked a bad event.");
    } else {
        showEvent(ev);
    }
            }
        }
        scheduleNextEvent();
    }, Math.random() * 30000 + 60000); // 60~90초 주기로 연장 (빈도 대폭 하향)
};

// --- 종합부동산세 과세 (30초마다) ---
let lastTick = Date.now();
setInterval(() => {
    const now = Date.now();
    const deltaSeconds = Math.floor((now - lastTick) / 1000);
    lastTick = now;
    
    // 방치형(브라우저 스로틀링/오프라인) 보상 처리
    if (deltaSeconds > 10) {
        const income = (rentPerTenant * tenants) * rentMultiplier * (ownedRelics.includes('broker') ? 1.5 : 1) * (ownedRelics.includes('cartel') ? Math.pow(1.05, busCount) : 1);
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

document.getElementById('btnMgrThug').onclick = () => {
    if (deposit >= 5000) { deposit -= 5000; managers.thug = true; document.getElementById('btnMgrThug').disabled = true; document.getElementById('btnMgrThug').innerHTML = '✅ 행동대장 (고용됨)'; updateUI(); }
    else { alert("자본금이 부족합니다! (5,000💰 필요)"); }
};
document.getElementById('btnMgrAcc').onclick = () => {
    if (deposit >= 25000) { deposit -= 25000; managers.acc = true; interestRate *= 0.7; document.getElementById('btnMgrAcc').disabled = true; document.getElementById('btnMgrAcc').innerHTML = '✅ 수석 회계사 (고용됨)'; updateUI(); }
    else { alert("자본금이 부족합니다! (25,000💰 필요)"); }
};
document.getElementById('btnMgrPr').onclick = () => {
    if (deposit >= 50000) { deposit -= 50000; managers.pr = true; document.getElementById('btnMgrPr').disabled = true; document.getElementById('btnMgrPr').innerHTML = '✅ 언론 통제관 (고용됨)'; updateUI(); }
    else { alert("자본금이 부족합니다! (50,000💰 필요)"); }
};


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
