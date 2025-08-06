import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Text,
} from 'react-native';
import { Card, Button, Avatar, ProgressBar, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'expo-linear-gradient';
import { useAuth } from '../../context/SimpleAuthContext';
import newTheme from '../../utils/newTheme';
import { 
  getSkillLevel, 
  calculateWinRate, 
  calculateRecentForm,
  checkAchievements,
  achievementBadges 
} from '../../utils/skillSystem';

const { width } = Dimensions.get('window');

const UserProfileScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [userStats] = useState({
    skillRating: 1350,
    totalGames: 47,
    wins: 32,
    losses: 15,
    preferredPosition: 'doubles',
    playStyle: 'balanced',
  });

  const [recentGames] = useState([
    { id: 1, result: 'win', opponent: '김철수', date: '2024-08-01' },
    { id: 2, result: 'win', opponent: '이영희', date: '2024-07-30' },
    { id: 3, result: 'loss', opponent: '박민수', date: '2024-07-28' },
    { id: 4, result: 'win', opponent: '정수진', date: '2024-07-25' },
    { id: 5, result: 'win', opponent: '김영호', date: '2024-07-23' },
  ]);

  const skillLevel = getSkillLevel(userStats.skillRating);
  const winRate = calculateWinRate(userStats.wins, userStats.losses);
  const recentForm = calculateRecentForm(recentGames);
  const achievements = checkAchievements(userStats, recentGames);

  const handleEditProfile = () => {
    Alert.alert('프로필 편집', '프로필 편집 화면으로 이동합니다.');
  };

  const handleViewDetailedStats = () => {
    Alert.alert('상세 통계', '상세 통계 화면으로 이동합니다.');
  };

  const renderAchievementBadge = (achievementId) => {
    const badge = achievementBadges[achievementId];
    if (!badge) return null;

    return (
      <TouchableOpacity key={achievementId} style={styles.achievementBadge}>
        <Text style={styles.achievementIcon}>{badge.icon}</Text>
        <Text style={styles.achievementName}>{badge.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 프로필 헤더 */}
        <LinearGradient
          colors={[skillLevel.color, '#FF6B35']}
          style={styles.profileHeader}
        >
          <SafeAreaView>
            <View style={styles.headerContent}>
              <View style={styles.profileInfo}>
                <Avatar.Text 
                  size={80} 
                  label={user?.name?.[0] || 'U'} 
                  style={styles.profileAvatar}
                />
                <View style={styles.profileText}>
                  <Text style={styles.userName}>{user?.name || '사용자'}</Text>
                  <View style={styles.skillLevelContainer}>
                    <Text style={styles.skillIcon}>{skillLevel.icon}</Text>
                    <Text style={styles.skillLevel}>{skillLevel.level}</Text>
                    <Text style={styles.skillRating}>({userStats.skillRating})</Text>
                  </View>
                  <Text style={styles.skillDescription}>{skillLevel.description}</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.editButton}
                onPress={handleEditProfile}
              >
                <Text style={styles.editButtonText}>편집</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* 핵심 통계 */}
        <Card style={styles.statsCard}>
          <Card.Content style={styles.statsContent}>
            <Text style={styles.cardTitle}>핵심 통계</Text>
            
            <View style={styles.mainStatsGrid}>
              <View style={styles.mainStatItem}>
                <Text style={styles.mainStatNumber}>{userStats.totalGames}</Text>
                <Text style={styles.mainStatLabel}>총 경기</Text>
              </View>
              <View style={styles.mainStatItem}>
                <Text style={[styles.mainStatNumber, styles.winColor]}>{userStats.wins}</Text>
                <Text style={styles.mainStatLabel}>승리</Text>
              </View>
              <View style={styles.mainStatItem}>
                <Text style={[styles.mainStatNumber, styles.lossColor]}>{userStats.losses}</Text>
                <Text style={styles.mainStatLabel}>패배</Text>
              </View>
              <View style={styles.mainStatItem}>
                <Text style={styles.mainStatNumber}>{winRate}%</Text>
                <Text style={styles.mainStatLabel}>승률</Text>
              </View>
            </View>

            {/* 승률 프로그레스 바 */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>승률</Text>
                <Text style={styles.progressPercent}>{winRate}%</Text>
              </View>
              <ProgressBar 
                progress={winRate / 100} 
                color={winRate >= 60 ? newTheme.colors.success : newTheme.colors.primary}
                style={styles.progressBar}
              />
            </View>
          </Card.Content>
        </Card>

        {/* 최근 폼 */}
        <Card style={styles.formCard}>
          <Card.Content style={styles.formContent}>
            <Text style={styles.cardTitle}>최근 폼</Text>
            
            <View style={styles.formStats}>
              <View style={styles.formItem}>
                <Text style={styles.formLabel}>연속 기록</Text>
                <Text style={[
                  styles.formValue,
                  recentForm.streakType === 'win' ? styles.winColor : styles.lossColor
                ]}>
                  {recentForm.streak}{recentForm.streakType === 'win' ? '연승' : '연패'}
                </Text>
              </View>
              
              <View style={styles.formItem}>
                <Text style={styles.formLabel}>최근 5경기 승률</Text>
                <Text style={styles.formValue}>{recentForm.winRate}%</Text>
              </View>
            </View>

            {/* 최근 경기 결과 */}
            <View style={styles.recentGamesContainer}>
              <Text style={styles.recentGamesTitle}>최근 경기</Text>
              <View style={styles.recentGames}>
                {recentGames.slice(0, 5).map((game) => (
                  <View 
                    key={game.id} 
                    style={[
                      styles.gameResultDot,
                      game.result === 'win' ? styles.winDot : styles.lossDot
                    ]}
                  />
                ))}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* 플레이 스타일 */}
        <Card style={styles.styleCard}>
          <Card.Content style={styles.styleContent}>
            <Text style={styles.cardTitle}>플레이 정보</Text>
            
            <View style={styles.styleInfo}>
              <View style={styles.styleItem}>
                <Text style={styles.styleLabel}>선호 포지션</Text>
                <Chip 
                  icon="account-group"
                  style={styles.styleChip}
                  textStyle={styles.chipText}
                >
                  {userStats.preferredPosition === 'singles' ? '단식' : '복식'}
                </Chip>
              </View>
              
              <View style={styles.styleItem}>
                <Text style={styles.styleLabel}>플레이 스타일</Text>
                <Chip 
                  icon="chart-line"
                  style={styles.styleChip}
                  textStyle={styles.chipText}
                >
                  {userStats.playStyle === 'aggressive' ? '공격적' : 
                   userStats.playStyle === 'defensive' ? '수비적' : '균형잡힌'}
                </Chip>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* 성취 뱃지 */}
        <Card style={styles.achievementsCard}>
          <Card.Content style={styles.achievementsContent}>
            <View style={styles.achievementsHeader}>
              <Text style={styles.cardTitle}>성취 뱃지</Text>
              <Text style={styles.achievementCount}>
                {achievements.length}/{Object.keys(achievementBadges).length}
              </Text>
            </View>
            
            <View style={styles.achievementsList}>
              {achievements.slice(0, 6).map(achievementId => 
                renderAchievementBadge(achievementId)
              )}
              {achievements.length > 6 && (
                <TouchableOpacity style={styles.moreAchievements}>
                  <Text style={styles.moreAchievementsText}>+{achievements.length - 6}</Text>
                </TouchableOpacity>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* 액션 버튼들 */}
        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            onPress={handleViewDetailedStats}
            style={styles.actionButton}
            labelStyle={styles.actionButtonText}
            icon="chart-box"
          >
            상세 통계 보기
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('GameHistory')}
            style={styles.actionButton}
            labelStyle={styles.outlineButtonText}
            icon="history"
          >
            경기 기록
          </Button>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: newTheme.spacing.xl,
  },
  
  // 프로필 헤더
  profileHeader: {
    paddingBottom: newTheme.spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: newTheme.spacing.lg,
    paddingTop: newTheme.spacing.md,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: newTheme.spacing.lg,
  },
  profileText: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: newTheme.colors.text.inverse,
    marginBottom: newTheme.spacing.xs,
  },
  skillLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: newTheme.spacing.xs,
  },
  skillIcon: {
    fontSize: 20,
    marginRight: newTheme.spacing.xs,
  },
  skillLevel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: newTheme.colors.text.inverse,
    marginRight: newTheme.spacing.xs,
  },
  skillRating: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  skillDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: newTheme.spacing.md,
    paddingVertical: newTheme.spacing.sm,
    borderRadius: newTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  editButtonText: {
    color: newTheme.colors.text.inverse,
    fontWeight: '600',
  },

  // 카드 공통 스타일
  statsCard: {
    margin: newTheme.spacing.lg,
    marginBottom: newTheme.spacing.md,
    ...newTheme.shadows.sm,
  },
  formCard: {
    margin: newTheme.spacing.lg,
    marginTop: 0,
    marginBottom: newTheme.spacing.md,
    ...newTheme.shadows.sm,
  },
  styleCard: {
    margin: newTheme.spacing.lg,
    marginTop: 0,
    marginBottom: newTheme.spacing.md,
    ...newTheme.shadows.sm,
  },
  achievementsCard: {
    margin: newTheme.spacing.lg,
    marginTop: 0,
    marginBottom: newTheme.spacing.md,
    ...newTheme.shadows.sm,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: newTheme.colors.text.primary,
    marginBottom: newTheme.spacing.md,
  },

  // 통계 섹션
  statsContent: {
    padding: newTheme.spacing.lg,
  },
  mainStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: newTheme.spacing.lg,
  },
  mainStatItem: {
    alignItems: 'center',
  },
  mainStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: newTheme.colors.text.primary,
    marginBottom: 4,
  },
  mainStatLabel: {
    fontSize: 12,
    color: newTheme.colors.text.secondary,
  },
  winColor: {
    color: newTheme.colors.success,
  },
  lossColor: {
    color: '#DC3545',
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

  // 폼 섹션
  formContent: {
    padding: newTheme.spacing.lg,
  },
  formStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: newTheme.spacing.lg,
  },
  formItem: {
    alignItems: 'center',
  },
  formLabel: {
    fontSize: 12,
    color: newTheme.colors.text.secondary,
    marginBottom: 4,
  },
  formValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: newTheme.colors.text.primary,
  },
  recentGamesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: newTheme.spacing.md,
  },
  recentGamesTitle: {
    fontSize: 14,
    color: newTheme.colors.text.primary,
    fontWeight: '600',
    marginBottom: newTheme.spacing.sm,
  },
  recentGames: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: newTheme.spacing.sm,
  },
  gameResultDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  winDot: {
    backgroundColor: newTheme.colors.success,
  },
  lossDot: {
    backgroundColor: '#DC3545',
  },

  // 스타일 섹션
  styleContent: {
    padding: newTheme.spacing.lg,
  },
  styleInfo: {
    gap: newTheme.spacing.md,
  },
  styleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  styleLabel: {
    fontSize: 14,
    color: newTheme.colors.text.primary,
    fontWeight: '600',
  },
  styleChip: {
    backgroundColor: newTheme.colors.primary,
  },
  chipText: {
    color: newTheme.colors.text.inverse,
    fontSize: 12,
  },

  // 성취 섹션
  achievementsContent: {
    padding: newTheme.spacing.lg,
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: newTheme.spacing.md,
  },
  achievementCount: {
    fontSize: 14,
    color: newTheme.colors.text.secondary,
  },
  achievementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: newTheme.spacing.sm,
  },
  achievementBadge: {
    backgroundColor: newTheme.colors.surface.light,
    borderWidth: 1,
    borderColor: newTheme.colors.primary,
    borderRadius: newTheme.borderRadius.md,
    padding: newTheme.spacing.sm,
    alignItems: 'center',
    width: (width - 80) / 3 - 8,
  },
  achievementIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  achievementName: {
    fontSize: 10,
    color: newTheme.colors.text.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  moreAchievements: {
    backgroundColor: '#F0F0F0',
    borderRadius: newTheme.borderRadius.md,
    padding: newTheme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    width: (width - 80) / 3 - 8,
    minHeight: 60,
  },
  moreAchievementsText: {
    fontSize: 12,
    color: newTheme.colors.text.secondary,
    fontWeight: 'bold',
  },

  // 액션 버튼
  actionButtons: {
    paddingHorizontal: newTheme.spacing.lg,
    gap: newTheme.spacing.md,
  },
  actionButton: {
    borderRadius: newTheme.borderRadius.md,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserProfileScreen;
