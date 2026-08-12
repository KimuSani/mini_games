import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import Swiper from 'react-native-deck-swiper';

const { height } = Dimensions.get('window');

const QUESTIONS = [
    { id: 1, emoji: "📱", title: "디지털 충돌", desc: "모바일 게임 광고에서 쥐꼬리만한 'X' 버튼 누르려다 앱스토어로 납치당함." },
    { id: 2, emoji: "🚇", title: "대중교통 닌자", desc: "지하철 빈자리 나서 스쿼트 자세로 앉으려는데, 옆사람이 쏘옥 미끄러져 들어와서 뺏음." },
    { id: 3, emoji: "💬", title: "카톡 단답형", desc: "장문으로 구구절절 물어봤는데, 3시간 뒤에 'ㅇㅇ' 두 글자 답장 옴." },
    { id: 4, emoji: "🚿", title: "소매 적시기", desc: "세수하는데 물이 팔꿈치를 타고 소매 안으로 주르륵 흘러내림." },
    { id: 5, emoji: "🚶", title: "길막 빌런", desc: "출근길 바빠 죽겠는데, 앞에서 3명이 횡대로 서서 엄청 느리게 걸어가며 길 다 막음." }
];

export default function Game3Screen({ goBack }) {
    const [scores, setScores] = useState([]);
    const [isFinished, setIsFinished] = useState(false);

    const handleSwipeLeft = () => {
        // 참는다 (0점)
        setScores(prev => [...prev, 0]);
    };

    const handleSwipeRight = () => {
        // 급발진 (100점)
        setScores(prev => [...prev, 100]);
    };

    const handleSwipedAll = () => {
        setIsFinished(true);
    };

    const getResult = () => {
        const sum = scores.reduce((a, b) => a + b, 0);
        const avg = scores.length > 0 ? Math.round(sum / scores.length) : 0;
        
        let title, emoji, desc;
        if (avg >= 85) { emoji = "💣"; title = "걸어다니는 시한폭탄"; desc = "상위 1%! 숨만 쉬어도 화가 납니다."; }
        else if (avg >= 60) { emoji = "🧐"; title = "프로불편러 유망주"; desc = "상위 30%! 제법 깐깐하시군요."; }
        else if (avg >= 30) { emoji = "😐"; title = "평범한 현대인"; desc = "대한민국 평균입니다."; }
        else { emoji = "🧘‍♂️"; title = "득도한 생불"; desc = "하위 5%! 뇌에 주름이 없거나 해탈하셨습니다."; }
        
        return { avg, emoji, title, desc };
    };

    if (isFinished) {
        const res = getResult();
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.resultCard}>
                    <Text style={styles.emojiHero}>{res.emoji}</Text>
                    <Text style={styles.resultTitle}>{res.title}</Text>
                    <Text style={styles.resultDesc}>{res.desc}</Text>
                    <View style={styles.statsBox}>
                        <Text style={styles.statsText}>내 평균 빡침 지수: <Text style={{fontWeight: 'bold', color: '#ff4757'}}>{res.avg}점</Text></Text>
                        <Text style={styles.statsText}>전국 평균: 68점</Text>
                    </View>
                </View>
                <TouchableOpacity style={[styles.btn, styles.secondaryBtn]} onPress={() => { setScores([]); setIsFinished(false); }}>
                    <Text style={styles.btnTextDark}>다시 하기</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.secondaryBtn, {marginTop: 10}]} onPress={goBack}>
                    <Text style={styles.btnTextDark}>메인으로 돌아가기</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>분노 테스터</Text>
                <Text style={styles.subHeaderText}>⬅️ 참는다 (0점)       급발진 (100점) ➡️</Text>
            </View>
            <View style={styles.swiperContainer}>
                <Swiper
                    cards={QUESTIONS}
                    renderCard={(card) => {
                        return (
                            <View style={styles.card}>
                                <Text style={styles.cardEmoji}>{card.emoji}</Text>
                                <Text style={styles.cardTitle}>{card.title}</Text>
                                <Text style={styles.cardDesc}>{card.desc}</Text>
                            </View>
                        )
                    }}
                    onSwipedLeft={handleSwipeLeft}
                    onSwipedRight={handleSwipeRight}
                    onSwipedAll={handleSwipedAll}
                    cardIndex={scores.length}
                    backgroundColor={'transparent'}
                    stackSize={3}
                    cardVerticalMargin={20}
                    cardHorizontalMargin={20}
                    animateOverlayLabelsOpacity
                    overlayLabels={{
                        left: {
                            title: '참는다 😇',
                            style: { label: { backgroundColor: '#4bcffa', color: 'white', fontSize: 24, borderRadius: 10 }, wrapper: { flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-start', marginTop: 30, marginLeft: -30 } }
                        },
                        right: {
                            title: '급발진 🤬',
                            style: { label: { backgroundColor: '#ff4757', color: 'white', fontSize: 24, borderRadius: 10 }, wrapper: { flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', marginTop: 30, marginLeft: 30 } }
                        }
                    }}
                />
            </View>
            <TouchableOpacity style={styles.backBtn} onPress={goBack}>
                <Text style={styles.backBtnText}>그만하기</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f7f9fc' },
    header: { padding: 20, alignItems: 'center', zIndex: 10 },
    headerText: { fontSize: 22, fontWeight: 'bold', color: '#2f3542' },
    subHeaderText: { fontSize: 14, color: '#747d8c', marginTop: 10 },
    swiperContainer: { flex: 1, marginTop: -40, zIndex: 1 },
    card: { flex: 0.7, borderRadius: 20, borderWidth: 2, borderColor: '#E8E8E8', justifyContent: 'center', backgroundColor: 'white', padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
    cardEmoji: { fontSize: 80, marginBottom: 20 },
    cardTitle: { fontSize: 24, fontWeight: 'bold', color: '#2f3542', marginBottom: 10 },
    cardDesc: { fontSize: 16, color: '#747d8c', textAlign: 'center', lineHeight: 24 },
    backBtn: { position: 'absolute', bottom: 40, alignSelf: 'center', padding: 15, zIndex: 10 },
    backBtnText: { color: '#747d8c', fontSize: 16 },
    
    resultCard: { backgroundColor: 'white', margin: 20, borderRadius: 20, padding: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, elevation: 5 },
    emojiHero: { fontSize: 80, marginBottom: 20 },
    resultTitle: { fontSize: 24, fontWeight: 'bold', color: '#2f3542', marginBottom: 10 },
    resultDesc: { fontSize: 16, color: '#747d8c', textAlign: 'center', marginBottom: 20 },
    statsBox: { backgroundColor: '#f1f2f6', padding: 20, borderRadius: 12, width: '100%' },
    statsText: { fontSize: 16, marginVertical: 5, color: '#2f3542' },
    btn: { width: '90%', alignSelf: 'center', padding: 16, borderRadius: 12, alignItems: 'center' },
    secondaryBtn: { backgroundColor: '#eccc68' },
    btnTextDark: { fontSize: 16, fontWeight: 'bold', color: '#2f3542' }
});
