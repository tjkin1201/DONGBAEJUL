import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/SimpleAuthContext';

const SimpleMainNavigator = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('Home');

  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return (
          <View style={styles.content} testID="home-screen">
            <Text style={styles.welcomeText}>안녕하세요, {user?.name || '사용자'}님! 👋</Text>
            <Text style={styles.subtitle}>동백배드민턴클럽에 오신 것을 환영합니다</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>이번 달 경기</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statLabel}>참가한 경기</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>25</Text>
                <Text style={styles.statLabel}>클럽 멤버</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>오늘의 경기 확인</Text>
            </TouchableOpacity>
          </View>
        );
      
      case 'Games':
        return (
          <View style={styles.content}>
            <Text style={styles.title}>🎯 경기 관리</Text>
            <Text style={styles.subtitle}>예정된 경기와 결과를 확인하세요</Text>
            
            <View style={styles.gameCard}>
              <Text style={styles.gameTitle}>다음 경기</Text>
              <Text style={styles.gameDate}>2025년 8월 5일 (화)</Text>
              <Text style={styles.gameTime}>오후 7:00 - 9:00</Text>
              <Text style={styles.gameLocation}>📍 시민체육관 배드민턴장</Text>
            </View>
            
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>경기 참가 신청</Text>
            </TouchableOpacity>
          </View>
        );
      
      case 'Members':
        return (
          <View style={styles.content}>
            <Text style={styles.title}>👥 멤버</Text>
            <Text style={styles.subtitle}>동호회 멤버들을 확인하세요</Text>
            
            <View style={styles.memberList}>
              <View style={styles.memberCard}>
                <Text style={styles.memberName}>김철수</Text>
                <Text style={styles.memberLevel}>레벨: 중급</Text>
                <Text style={styles.memberStatus}>🟢 온라인</Text>
              </View>
              
              <View style={styles.memberCard}>
                <Text style={styles.memberName}>이영희</Text>
                <Text style={styles.memberLevel}>레벨: 고급</Text>
                <Text style={styles.memberStatus}>🟡 자리비움</Text>
              </View>
              
              <View style={styles.memberCard}>
                <Text style={styles.memberName}>박민수</Text>
                <Text style={styles.memberLevel}>레벨: 초급</Text>
                <Text style={styles.memberStatus}>🔴 오프라인</Text>
              </View>
            </View>
          </View>
        );
      
      case 'Profile':
        return (
          <View style={styles.content} testID="profile-screen">
            <Text style={styles.title}>👤 프로필</Text>
            
            <View style={styles.profileCard}>
              <Text style={styles.profileName}>{user?.name || '사용자'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
              <Text style={styles.profileLevel}>레벨: 중급</Text>
              <Text style={styles.profileGames}>참가한 경기: 15회</Text>
            </View>
            
            <TouchableOpacity style={styles.logoutButton} onPress={logout} testID="logout-button">
              <Text style={styles.logoutButtonText}>로그아웃</Text>
            </TouchableOpacity>
          </View>
        );
      
      default: // Home
        return (
          <View style={styles.content}>
            <Text style={styles.title}>🏸 동배즐 홈</Text>
            <Text style={styles.welcome}>안녕하세요, {user?.name || '사용자'}님!</Text>
            <Text style={styles.subtitle}>배드민턴 동호회 관리 시스템</Text>
            
            <View style={styles.featureContainer}>
              <View style={styles.featureCard}>
                <Text style={styles.featureIcon}>🏃‍♂️</Text>
                <Text style={styles.featureTitle}>경기 관리</Text>
                <Text style={styles.featureDesc}>경기 일정과 결과를 관리하세요</Text>
              </View>
              
              <View style={styles.featureCard}>
                <Text style={styles.featureIcon}>👥</Text>
                <Text style={styles.featureTitle}>멤버 관리</Text>
                <Text style={styles.featureDesc}>동호회 멤버를 관리하세요</Text>
              </View>
            </View>
          </View>
        );
    }
  };

  return (
    <View style={styles.container} testID="main-navigator">
      {renderContent()}
      
      {/* 하단 탭 바 */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Home' && styles.activeTab]}
          onPress={() => setActiveTab('Home')}
          testID="tab-home"
        >
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={[styles.tabText, activeTab === 'Home' && styles.activeTabText]}>홈</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Games' && styles.activeTab]}
          onPress={() => setActiveTab('Games')}
          testID="tab-games"
        >
          <Text style={styles.tabIcon}>🎯</Text>
          <Text style={[styles.tabText, activeTab === 'Games' && styles.activeTabText]}>경기</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Members' && styles.activeTab]}
          onPress={() => setActiveTab('Members')}
          testID="tab-members"
        >
          <Text style={styles.tabIcon}>👥</Text>
          <Text style={[styles.tabText, activeTab === 'Members' && styles.activeTabText]}>멤버</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Profile' && styles.activeTab]}
          onPress={() => setActiveTab('Profile')}
          testID="tab-profile"
        >
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={[styles.tabText, activeTab === 'Profile' && styles.activeTabText]}>프로필</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcome: {
    fontSize: 20,
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  featureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 10,
    margin: 5,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  featureDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  gameCard: {
    backgroundColor: '#f0f8ff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1976D2',
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 10,
  },
  gameDate: {
    fontSize: 16,
    marginBottom: 5,
  },
  gameTime: {
    fontSize: 16,
    marginBottom: 5,
  },
  gameLocation: {
    fontSize: 14,
    color: '#666',
  },
  memberList: {
    marginTop: 20,
  },
  memberCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  memberLevel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  memberStatus: {
    fontSize: 14,
  },
  profileCard: {
    backgroundColor: '#f0f8ff',
    padding: 25,
    borderRadius: 10,
    marginBottom: 30,
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 10,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  profileLevel: {
    fontSize: 16,
    marginBottom: 5,
  },
  profileGames: {
    fontSize: 16,
    color: '#666',
  },
  button: {
    backgroundColor: '#1976D2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  activeTab: {
    backgroundColor: '#f0f8ff',
    borderRadius: 5,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabText: {
    fontSize: 12,
    color: '#999',
  },
  activeTabText: {
    color: '#1976D2',
    fontWeight: 'bold',
  },
});

export default SimpleMainNavigator;
