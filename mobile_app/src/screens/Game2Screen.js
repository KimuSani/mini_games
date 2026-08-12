import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Animated } from 'react-native';

export default function Game2Screen({ goBack }) {
    // Economy State
    const [deposit, setDeposit] = useState(0);
    const [rent, setRent] = useState(0);
    const [tears, setTears] = useState(0);
    
    // Tower State
    const [busCount, setBusCount] = useState(0);
    const [busCost, setBusCost] = useState(50);
    
    // Complex Mechanics State
    const [stability, setStability] = useState(100);
    const [happiness, setHappiness] = useState(100);
    const [heatingOff, setHeatingOff] = useState(false);
    
    const towerShake = useRef(new Animated.Value(0)).current;

    // Game Loop (runs every second)
    useEffect(() => {
        const interval = setInterval(() => {
            // 1. Rent Collection
            setDeposit(prev => prev + rent);
            
            // 2. Tear Generation & Happiness decay
            if (busCount > 0) {
                if (heatingOff) {
                    setTears(prev => prev + (busCount * 5));
                    setHappiness(prev => Math.max(0, prev - 2)); // Happiness drops faster
                } else {
                    setHappiness(prev => Math.max(0, prev - 0.5)); // Natural decay
                }
            }

            // 3. Stability decay based on height
            if (busCount > 3) {
                setStability(prev => Math.max(0, prev - (busCount * 0.1)));
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [rent, busCount, heatingOff]);

    // Random Event Loop & Bankrun Check (runs every 3 seconds)
    useEffect(() => {
        const checkInterval = setInterval(() => {
            // Bankrun trigger
            if (happiness < 20 && busCount > 0) {
                alert("🚨 [뱅크런 발생!] 세입자들이 분노하여 대거 이탈했습니다! 보증금이 차감됩니다.");
                setDeposit(prev => Math.max(0, prev - (busCount * 30)));
                setHappiness(50); // Reset a bit after riot
            }
            // Collapse trigger
            if (stability <= 0 && busCount > 0) {
                alert("💥 [건물 붕괴!] 내구도가 0이 되어 버스 타워가 무너졌습니다...");
                setBusCount(Math.max(0, busCount - 3));
                setRent(Math.max(0, rent - 6));
                setStability(100);
            }
            // Shake effect if stability is low
            if (stability < 40 && busCount > 0) {
                Animated.sequence([
                    Animated.timing(towerShake, { toValue: 5, duration: 50, useNativeDriver: true }),
                    Animated.timing(towerShake, { toValue: -5, duration: 50, useNativeDriver: true }),
                    Animated.timing(towerShake, { toValue: 0, duration: 50, useNativeDriver: true })
                ]).start();
            }
        }, 3000);
        return () => clearInterval(checkInterval);
    }, [happiness, stability, busCount, rent]);

    // Actions
    const handleBuyBus = () => {
        if (deposit >= busCost) {
            setDeposit(prev => prev - busCost);
            setBusCount(prev => prev + 1);
            setRent(prev => prev + 2);
            setBusCost(Math.floor(busCost * 1.5));
            setStability(prev => Math.max(0, prev - 10)); // Adding a bus drops stability instantly
        } else {
            alert("보증금이 부족합니다!");
        }
    };

    const handleRepair = () => {
        const cost = 20;
        if (deposit >= cost) {
            setDeposit(prev => prev - cost);
            setStability(Math.min(100, stability + 30));
        }
    };

    const handlePizzaParty = () => {
        const cost = 30;
        if (deposit >= cost) {
            setDeposit(prev => prev - cost);
            setHappiness(Math.min(100, happiness + 40));
        }
    };

    const toggleHeating = () => {
        setHeatingOff(!heatingOff);
    };

    const handleLobby = () => {
        const cost = 100;
        if (tears >= cost) {
            setTears(prev => prev - cost);
            setRent(prev => prev + 5); // Evil law passed, rent increases
            alert("😈 [악법 통과] 최소 주거면적 제한이 폐지되어 초당 월세가 증가합니다!");
        } else {
            alert("로비에 필요한 눈물이 부족합니다.");
        }
    };

    // Render Tower
    const renderBuses = () => {
        let buses = [];
        for (let i = 0; i < busCount; i++) {
            buses.push(
                <View key={i} style={[styles.bus, { transform: [{ translateX: (Math.random() - 0.5) * 10 }] }]}>
                    <Text style={styles.busText}>마을버스 {i+1}호</Text>
                </View>
            );
        }
        return buses;
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>반포터 자이 키우기</Text>
                <View style={styles.statsRow}>
                    <Text style={styles.stat}>💰 보증금: {Math.floor(deposit)}</Text>
                    <Text style={styles.stat}>💸 초당 월세: {rent}</Text>
                    <Text style={styles.statDark}>💧 눈물: {Math.floor(tears)}</Text>
                </View>
                <View style={styles.meters}>
                    <Text style={[styles.meterText, {color: stability < 30 ? 'red' : '#2ecc71'}]}>
                        건물 내구도: {Math.floor(stability)}%
                    </Text>
                    <Text style={[styles.meterText, {color: happiness < 30 ? 'red' : '#3498db'}]}>
                        세입자 행복도: {Math.floor(happiness)}%
                    </Text>
                </View>
            </View>

            <View style={styles.gameArea}>
                <Animated.View style={[styles.towerContainer, { transform: [{ translateX: towerShake }] }]}>
                    {renderBuses().reverse()}
                    <View style={styles.ground} />
                </Animated.View>
            </View>

            <View style={styles.controls}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollControls}>
                    <TouchableOpacity style={styles.btnAction} onPress={() => setDeposit(d => d + 1 + busCount)}>
                        <Text style={styles.btnActionText}>👉 수동 수금</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.btnPrimary} onPress={handleBuyBus}>
                        <Text style={styles.btnPrimaryText}>🚌 버스 매입 (비용: {busCost})</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.btnWarning} onPress={handleRepair}>
                        <Text style={styles.btnActionText}>🛠️ 철근 보수 (비용: 20)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.btnInfo} onPress={handlePizzaParty}>
                        <Text style={styles.btnActionText}>🍕 피자 회유 (비용: 30)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.btnEvil, heatingOff && styles.btnEvilActive]} onPress={toggleHeating}>
                        <Text style={styles.btnEvilText}>🥶 난방 {heatingOff ? '켜기' : '끄기'} (눈물 파밍)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.btnDark} onPress={handleLobby}>
                        <Text style={styles.btnDarkText}>😈 불법 로비 (눈물: 100)</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <TouchableOpacity style={styles.backBtn} onPress={goBack}>
                <Text style={styles.backBtnText}>그만하기</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111' },
    header: { padding: 15, backgroundColor: '#222', borderBottomWidth: 2, borderBottomColor: '#444' },
    title: { color: 'yellow', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    stat: { color: 'white', fontSize: 12 },
    statDark: { color: '#00ff00', fontSize: 12, fontWeight: 'bold' },
    meters: { flexDirection: 'row', justifyContent: 'space-between' },
    meterText: { fontSize: 12, fontWeight: 'bold' },
    
    gameArea: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', overflow: 'hidden' },
    towerContainer: { width: '100%', alignItems: 'center' },
    ground: { width: '100%', height: 20, backgroundColor: 'green', borderTopWidth: 2, borderTopColor: 'white' },
    bus: { width: 150, height: 40, backgroundColor: '#ffd700', borderWidth: 2, borderColor: 'white', marginBottom: -2, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    busText: { fontWeight: 'bold', fontSize: 12 },
    
    controls: { padding: 10, backgroundColor: '#222', borderTopWidth: 2, borderTopColor: '#444' },
    scrollControls: { gap: 10 },
    
    btnAction: { backgroundColor: '#555', padding: 12, borderRadius: 8, justifyContent: 'center' },
    btnPrimary: { backgroundColor: '#00aa00', padding: 12, borderRadius: 8, justifyContent: 'center' },
    btnWarning: { backgroundColor: '#e67e22', padding: 12, borderRadius: 8, justifyContent: 'center' },
    btnInfo: { backgroundColor: '#3498db', padding: 12, borderRadius: 8, justifyContent: 'center' },
    btnEvil: { backgroundColor: '#7f8c8d', padding: 12, borderRadius: 8, justifyContent: 'center' },
    btnEvilActive: { backgroundColor: '#c0392b' },
    btnDark: { backgroundColor: '#8e44ad', padding: 12, borderRadius: 8, justifyContent: 'center' },
    
    btnActionText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    btnPrimaryText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    btnEvilText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    btnDarkText: { color: '#00ff00', fontWeight: 'bold', fontSize: 12 },

    backBtn: { position: 'absolute', top: 15, left: 10 },
    backBtnText: { color: '#aaa', fontSize: 12 }
});
