import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Text, Card, Button, Avatar, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'expo-linear-gradient';
import { useAuth } from '../../context/SimpleAuthContext';
import newTheme from '../../utils/newTheme';

const { width } = Dimensions.get('window');

const PremiumHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1분마다 업데이트

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '좋은 아침이에요';
    if (hour < 18) return '좋은 오후에요';
    return '좋은 저녁이에요';
  };

  const quickActions = [
    {
      id: 'instant-match',
      title: '즉석 매칭',
      subtitle: '바로 상대 찾기',
      icon: '⚡',
      color: ['#FF6B35', '#FF4500'],
      onPress: () => navigation.navigate('Matching'),
    },
    {
      id: 'create-game',
      title: '게임 만들기',
      subtitle: '새로운 경기 생성',
      icon: '🎯',
      color: ['#20B2AA', '#17A2B8'],
      onPress: () => navigation.navigate('CreateGame'),
    },
    {
      id: 'find-court',
      title: '코트 찾기',
      subtitle: '주변 코트 검색',
      icon: '🗺️',
      color: ['#28A745', '#20C997'],
      onPress: () => navigation.navigate('Courts'),
    },
    {
      id: 'my-club',
      title: '내 클럽',
      subtitle: '클럽 활동 확인',
      icon: '👥',
      color: ['#6F42C1', '#8E44AD'],
      onPress: () => navigation.navigate('MyClub'),
    },
  ];

  const todayStats = {
    gamesPlayed: 2,
    winRate: 75,
    rankingChange: '+3',
    weeklyGoal: 60, // 이번 주 목표 달성률
  };

  const upcomingGames = [
    {
      id: 1,
      opponent: '김철수',
      time: '오늘 오후 7:00',
      court: '올림픽공원 배드민턴장',
      level: '중급',
    },
    {
      id: 2,
      opponent: '이영희',
      time: '내일 오전 10:00',
      court: '스포츠센터 A코트',
      level: '고급',
    },
  ];

  return (
    <View style={styles.container} testID="home-screen">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* 헤더 그라디언트 */}
      <LinearGradient
        colors={['#FF6B35', '#FF4500']}
        style={styles.headerGradient}
      >
        <SafeAreaView>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{user?.name || '사용자'}님! 🏸</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.notificationButton}>
                <Text style={styles.notificationIcon}>🔔</Text>
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>3</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileButton}>
                <Avatar.Text 
                  size={40} 
                  label={user?.name?.[0] || 'U'} 
                  style={styles.avatar}
                />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 빠른 액션 카드들 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>빠른 시작</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionCard, { 
                  width: (width - 48) / 2 - 8,
                  marginRight: index % 2 === 0 ? 16 : 0,
                }]}
                onPress={action.onPress}
              >
                <LinearGradient
                  colors={action.color}
                  style={styles.quickActionGradient}
                >
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 오늘의 통계 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>오늘의 활동</Text>
          <Card style={styles.statsCard}>
            <Card.Content style={styles.statsContent}>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{todayStats.gamesPlayed}</Text>
                  <Text style={styles.statLabel}>경기 완료</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{todayStats.winRate}%</Text>
                  <Text style={styles.statLabel}>승률</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, styles.positive]}>
                    {todayStats.rankingChange}
                  </Text>
                  <Text style={styles.statLabel}>랭킹 변화</Text>
                </View>
              </View>
              
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>이번 주 목표 달성률</Text>
                  <Text style={styles.progressPercent}>{todayStats.weeklyGoal}%</Text>
                </View>
                <ProgressBar 
                  progress={todayStats.weeklyGoal / 100} 
                  color={newTheme.colors.primary}
                  style={styles.progressBar}
                />
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* 예정된 게임 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>예정된 게임</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>전체보기</Text>
            </TouchableOpacity>
          </View>
          
          {upcomingGames.map((game) => (
            <Card key={game.id} style={styles.gameCard}>
              <Card.Content style={styles.gameContent}>
                <View style={styles.gameHeader}>
                  <View style={styles.gameInfo}>
                    <Text style={styles.opponentName}>vs {game.opponent}</Text>
                    <Text style={styles.gameTime}>{game.time}</Text>
                    <Text style={styles.gameCourt}>{game.court}</Text>
                  </View>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>{game.level}</Text>
                  </View>
                </View>
                <View style={styles.gameActions}>
                  <Button 
                    mode="outlined" 
                    style={styles.gameButton}
                    labelStyle={styles.gameButtonLabel}
                  >
                    상세보기
                  </Button>
                  <Button 
                    mode="contained" 
                    style={styles.gameButton}
                    labelStyle={styles.gameButtonLabel}
                  >
                    준비완료
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* 추천 기능 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>추천 기능</Text>
          <Card style={styles.recommendCard}>
            <LinearGradient
              colors={['#6F42C1', '#8E44AD']}
              style={styles.recommendGradient}
            >
              <Text style={styles.recommendTitle}>🎯 실력 분석 보고서</Text>
              <Text style={styles.recommendSubtitle}>
                지난 주 경기 데이터를 바탕으로{'\n'}
                맞춤형 분석 보고서를 확인해보세요
              </Text>
              <Button 
                mode="contained" 
                style={styles.recommendButton}
                labelStyle={styles.recommendButtonText}
              >
                분석 보기
              </Button>
            </LinearGradient>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: newTheme.colors.background.light,
  },
  headerGradient: {
    paddingBottom: newTheme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: newTheme.spacing.lg,
    paddingTop: newTheme.spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: newTheme.colors.text.inverse,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: newTheme.spacing.sm,
  },
  notificationButton: {
    position: 'relative',
    padding: newTheme.spacing.sm,
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: newTheme.colors.accent,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: newTheme.colors.text.primary,
  },
  profileButton: {
    marginLeft: newTheme.spacing.sm,
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: newTheme.spacing.lg,
    paddingBottom: newTheme.spacing.xl,
  },
  
  section: {
    marginBottom: newTheme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: newTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: newTheme.colors.text.primary,
    marginBottom: newTheme.spacing.md,
  },
  seeAllText: {
    fontSize: 14,
    color: newTheme.colors.primary,
    fontWeight: '600',
  },
  
  // 빠른 액션
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    marginBottom: newTheme.spacing.md,
    borderRadius: newTheme.borderRadius.lg,
    overflow: 'hidden',
    ...newTheme.shadows.md,
  },
  quickActionGradient: {
    padding: newTheme.spacing.lg,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: newTheme.spacing.sm,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: newTheme.colors.text.inverse,
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  
  // 통계 카드
  statsCard: {
    backgroundColor: newTheme.colors.surface.light,
    ...newTheme.shadows.sm,
  },
  statsContent: {
    padding: newTheme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: newTheme.spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: newTheme.colors.text.primary,
    marginBottom: 4,
  },
  positive: {
    color: newTheme.colors.success,
  },
  statLabel: {
    fontSize: 12,
    color: newTheme.colors.text.secondary,
  },
  progressSection: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: newTheme.spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: newTheme.spacing.sm,
  },
  progressTitle: {
    fontSize: 14,
    color: newTheme.colors.text.primary,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 14,
    color: newTheme.colors.primary,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  
  // 게임 카드
  gameCard: {
    backgroundColor: newTheme.colors.surface.light,
    marginBottom: newTheme.spacing.md,
    ...newTheme.shadows.sm,
  },
  gameContent: {
    padding: newTheme.spacing.lg,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: newTheme.spacing.md,
  },
  gameInfo: {
    flex: 1,
  },
  opponentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: newTheme.colors.text.primary,
    marginBottom: 4,
  },
  gameTime: {
    fontSize: 14,
    color: newTheme.colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  gameCourt: {
    fontSize: 12,
    color: newTheme.colors.text.secondary,
  },
  levelBadge: {
    backgroundColor: newTheme.colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelText: {
    fontSize: 12,
    color: newTheme.colors.text.inverse,
    fontWeight: 'bold',
  },
  gameActions: {
    flexDirection: 'row',
    gap: newTheme.spacing.sm,
  },
  gameButton: {
    flex: 1,
  },
  gameButtonLabel: {
    fontSize: 12,
  },
  
  // 추천 카드
  recommendCard: {
    overflow: 'hidden',
    ...newTheme.shadows.md,
  },
  recommendGradient: {
    padding: newTheme.spacing.lg,
  },
  recommendTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: newTheme.colors.text.inverse,
    marginBottom: newTheme.spacing.sm,
  },
  recommendSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: newTheme.spacing.lg,
  },
  recommendButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: newTheme.borderRadius.md,
  },
  recommendButtonText: {
    color: newTheme.colors.text.inverse,
    fontWeight: 'bold',
  },
});

export default PremiumHomeScreen;
