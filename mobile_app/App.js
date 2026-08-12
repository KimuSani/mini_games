import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import Game3Screen from './src/screens/Game3Screen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('hub');

  if (currentScreen === 'game3') {
    return <Game3Screen goBack={() => setCurrentScreen('hub')} />;
  }

  // Phase 2 will add game2 screen here

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>🎮 킹받는 미니게임 포털 (Mobile)</Text>
        <Text style={styles.subtitle}>심심할 때 즐기는 모바일 게임 모음집</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => alert('버스 타이쿤은 Phase 2에서 구현됩니다!')}>
          <Text style={styles.cardEmoji}>🚌</Text>
          <Text style={styles.cardTitle}>반포터 자이 키우기</Text>
          <Text style={styles.cardDesc}>방치형 부동산 젠가 타이쿤</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => setCurrentScreen('game3')}>
          <Text style={styles.cardEmoji}>😡</Text>
          <Text style={styles.cardTitle}>킹받네 시뮬레이터</Text>
          <Text style={styles.cardDesc}>당신의 분노 역치를 테스트하세요</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f9', padding: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center' },
  grid: { gap: 20 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  cardEmoji: { fontSize: 50, marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  cardDesc: { fontSize: 14, color: '#666' }
});
