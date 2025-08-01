import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Avatar, 
  Button, 
  List, 
  Divider,
  IconButton,
  Surface,
  ProgressBar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { statisticsAPI, userAPI } from '../../services/api';
import theme from '../../utils/theme';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserStatistics();
  }, []);

  const loadUserStatistics = async () => {
    try {
      setIsLoading(true);
      const response = await statisticsAPI.getUserStatistics(user.id);
      setStatistics(response.data.data);
    } catch (error) {
      console.error('통계 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '로그아웃', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('로그아웃 오류:', error);
            }
          }
        },
      ]
    );
  };

  const getLevelColor = (level) => {
    return theme.colors.level[level] || theme.colors.primary;
  };

  const getLevelText = (level) => {
    switch (level) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
      case 'expert': return '전문가';
      default: return '초급';
    }
  };

  const renderProfileHeader = () => (
    <Card style={styles.profileCard}>
      <Card.Content>
        <View style={styles.profileHeader}>
          <Avatar.Image
            size={80}
            source={{ uri: user?.profileImage || 'https://via.placeholder.com/80' }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userLevel}>
              {getLevelText(user?.level)} 플레이어
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
          <IconButton
            icon="pencil"
            size={24}
            onPress={() => navigation.navigate('ProfileEdit')}
            style={styles.editButton}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderStatsCard = () => {
    if (!statistics) return null;

    return (
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>활동 통계</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{statistics.gamesPlayed || 0}</Text>
              <Text style={styles.statLabel}>참가 게임</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{statistics.gamesWon || 0}</Text>
              <Text style={styles.statLabel}>승리</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{statistics.winRate || 0}%</Text>
              <Text style={styles.statLabel}>승률</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{statistics.currentRank || '-'}</Text>
              <Text style={styles.statLabel}>랭킹</Text>
            </View>
          </View>

          {/* 랭킹 포인트 진행바 */}
          <View style={styles.rankingContainer}>
            <Text style={styles.rankingLabel}>
              랭킹 포인트: {statistics.rankingPoints || 0}
            </Text>
            <ProgressBar
              progress={(statistics.rankingPoints || 0) / 2000} // 임시로 2000을 최대값으로 설정
              color={theme.colors.primary}
              style={styles.progressBar}
            />
            <Text style={styles.progressText}>
              다음 등급까지 {2000 - (statistics.rankingPoints || 0)} 포인트
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderRecentActivity = () => (
    <Card style={styles.activityCard}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>최근 활동</Text>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Statistics')}
            labelStyle={styles.seeAllText}
          >
            전체보기
          </Button>
        </View>

        <Surface style={styles.achievementItem} elevation={1}>
          <Text style={styles.achievementTitle}>🏆 첫 승리 달성</Text>
          <Text style={styles.achievementDate}>2024년 1월 15일</Text>
        </Surface>

        <Surface style={styles.achievementItem} elevation={1}>
          <Text style={styles.achievementTitle}>🎯 연승 3회 달성</Text>
          <Text style={styles.achievementDate}>2024년 1월 10일</Text>
        </Surface>
      </Card.Content>
    </Card>
  );

  const renderMenuList = () => (
    <Card style={styles.menuCard}>
      <Card.Content>
        <List.Item
          title="내 게임 기록"
          description="참가한 게임과 결과 보기"
          left={(props) => <List.Icon {...props} icon="trophy" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('GameHistory')}
        />
        <Divider />
        
        <List.Item
          title="통계 및 랭킹"
          description="상세 통계와 랭킹 정보"
          left={(props) => <List.Icon {...props} icon="chart-line" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('Statistics')}
        />
        <Divider />
        
        <List.Item
          title="알림 설정"
          description="푸시 알림 및 이메일 설정"
          left={(props) => <List.Icon {...props} icon="bell" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('NotificationSettings')}
        />
        <Divider />
        
        <List.Item
          title="설정"
          description="앱 설정 및 개인정보"
          left={(props) => <List.Icon {...props} icon="cog" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('Settings')}
        />
        <Divider />
        
        <List.Item
          title="고객지원"
          description="도움말 및 문의사항"
          left={(props) => <List.Icon {...props} icon="help-circle" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('Support')}
        />
        <Divider />
        
        <List.Item
          title="로그아웃"
          description="계정에서 로그아웃"
          left={(props) => <List.Icon {...props} icon="logout" color={theme.colors.error} />}
          titleStyle={{ color: theme.colors.error }}
          onPress={handleLogout}
        />
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 프로필 헤더 */}
        {renderProfileHeader()}

        {/* 통계 카드 */}
        {renderStatsCard()}

        {/* 최근 활동 */}
        {renderRecentActivity()}

        {/* 메뉴 리스트 */}
        {renderMenuList()}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    margin: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: theme.spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  userLevel: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
  },
  editButton: {
    margin: 0,
  },
  statsCard: {
    margin: theme.spacing.lg,
    marginTop: 0,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.primaryContainer,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  seeAllText: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  rankingContainer: {
    marginTop: theme.spacing.md,
  },
  rankingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: theme.spacing.sm,
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.text,
    textAlign: 'center',
  },
  activityCard: {
    margin: theme.spacing.lg,
    marginTop: 0,
    marginBottom: theme.spacing.md,
  },
  achievementItem: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.roundness,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  achievementDate: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
  },
  menuCard: {
    margin: theme.spacing.lg,
    marginTop: 0,
  },
  bottomSpacing: {
    height: theme.spacing.xl,
  },
});

export default ProfileScreen;