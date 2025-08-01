import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🏸 동배즐 앱</Text>
      <Text style={styles.subtext}>배드민턴 클럽 관리 앱</Text>
      <Text style={styles.status}>✅ 앱이 정상적으로 실행되었습니다!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1976D2',
    padding: 20,
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 18,
    color: 'white',
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    color: '#FFE082',
    textAlign: 'center',
    marginTop: 20,
  },
});