import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const SimpleApp = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏸 동배즐</Text>
        <Text style={styles.subtitle}>배드민턴 매칭 앱</Text>
      </View>
      
      <View style={styles.content}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>로그인</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>회원가입</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.bandButton]}>
          <Text style={styles.buttonText}>🎵 Band로 로그인</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>배드민턴을 사랑하는 사람들의 모임</Text>
        <Text style={styles.version}>v1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'space-between',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 80,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  button: {
    backgroundColor: '#2E7D32',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginVertical: 10,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2E7D32',
  },
  bandButton: {
    backgroundColor: '#1976D2',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#2E7D32',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 5,
  },
  version: {
    fontSize: 12,
    color: '#ccc',
  },
});

export default SimpleApp;
