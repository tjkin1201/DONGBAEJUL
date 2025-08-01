import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { 
  Text, 
  Card, 
  Avatar, 
  Button, 
  Chip, 
  Surface,
  IconButton,
  ActivityIndicator 
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { gameAPI, clubAPI, statisticsAPI } from '../../services/api';
import theme from '../../utils/theme';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { notifications } = useSocket();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    upcomingGames: [],
    recentGames: [],
    myClubs: [],
    statistics: null,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [
        upcomingGamesRes,
        recentGamesRes,
        myClubsRes,
        statisticsRes
      ] = await Promise.all([
        gameAPI.getUpcomingGames({ limit: 3 }),
        gameAPI.getRecentGames({ limit: 5 }),
        clubAPI.getMyClubs(),
        statisticsAPI.getUserStatistics(user.id)
      ]);

      setDashboardData({
        upcomingGames: upcomingGamesRes.data.data || [],
        recentGames: recentGamesRes.data.data || [],
        myClubs: myClubsRes.data.data || [],
        statistics: statisticsRes.data.data || null,
      });
    } catch (error) {
      console.error('대시보드 데이터 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const renderQuickStats = () => {
    if (!dashboardData.statistics) return null;

    const stats = dashboardData.statistics;
    
    return (
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>내 활동 통계</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.gamesPlayed || 0}</Text>
              <Text style={styles.statLabel}>참가 게임</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.winRate || 0}%</Text>
              <Text style={styles.statLabel}>승률</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.currentRank || '-'}</Text>
              <Text style={styles.statLabel}>현재 랭킹</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalClubs || 0}</Text>
              <Text style={styles.statLabel}>가입 클럽</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderUpcomingGames = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>다가오는 게임</Text>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Games')}
            labelStyle={styles.seeAllText}
          >
            전체보기
          </Button>
        </View>
        
        {dashboardData.upcomingGames.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>예정된 게임이 없습니다</Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('GameCreate')}
              style={styles.createButton}
            >
              게임 만들기
            </Button>
          </View>
        ) : (
          dashboardData.upcomingGames.map((game, index) => (
            <Surface key={game._id} style={styles.gameItem} elevation={1}>
              <View style={styles.gameHeader}>
                <Text style={styles.gameTitle}>{game.title}</Text>
                <Chip
                  mode="outlined"
                  textStyle={[styles.chipText, { color: theme.colors.level[game.level] }]}
                  style={[styles.levelChip, { borderColor: theme.colors.level[game.level] }]}
                >
                  {game.level === 'beginner' ? '초급' : 
                   game.level === 'intermediate' ? '중급' : 
                   game.level === 'advanced' ? '고급' : '전문가'}
                </Chip>
              </View>
              
              <View style={styles.gameInfo}>
                <Text style={styles.gameDate}>
                  📅 {new Date(game.gameDate).toLocaleDateString('ko-KR')}
                </Text>
                <Text style={styles.gameLocation}>
                  📍 {game.location.address}
                </Text>
                <Text style={styles.gameParticipants}>
                  👥 {game.participants.length}/{game.maxParticipants}명
                </Text>
              </View>
              
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('GameDetail', { gameId: game._id })}
                style={styles.viewButton}
              >
                자세히 보기
              </Button>
            </Surface>
          ))
        )}
      </Card.Content>
    </Card>
  );

  const renderMyClubs = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>내 클럽</Text>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Clubs')}
            labelStyle={styles.seeAllText}
          >
            전체보기
          </Button>
        </View>
        
        {dashboardData.myClubs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>가입한 클럽이 없습니다</Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('ClubSearch')}
              style={styles.joinButton}
            >
              클럽 찾기
            </Button>
          </View>
        ) : (
          dashboardData.myClubs.slice(0, 3).map((club) => (
            <Surface key={club._id} style={styles.clubItem} elevation={1}>
              <Avatar.Image
                size={50}
                source={{ uri: club.clubImage || 'https://via.placeholder.com/50' }}
                style={styles.clubAvatar}
              />
              <View style={styles.clubInfo}>
                <Text style={styles.clubName}>{club.name}</Text>
                <Text style={styles.clubMembers}>
                  멤버 {club.members.length}명
                </Text>
                <Text style={styles.clubLocation}>
                  📍 {club.location}
                </Text>
              </View>
              <IconButton
                icon="chevron-right"
                onPress={() => navigation.navigate('ClubDetail', { clubId: club._id })}
              />
            </Surface>
          ))
        )}
      </Card.Content>
    </Card>
  );

  const renderRecentActivity = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>최근 활동</Text>
        
        {dashboardData.recentGames.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>최근 활동이 없습니다</Text>
          </View>
        ) : (
          dashboardData.recentGames.map((game) => (
            <Surface key={game._id} style={styles.activityItem} elevation={1}>
              <View style={styles.activityHeader}>
                <Text style={styles.activityTitle}>{game.title}</Text>
                <Text style={styles.activityDate}>
                  {new Date(game.gameDate).toLocaleDateString('ko-KR')}
                </Text>
              </View>
              
              {game.results?.isCompleted && (
                <View style={styles.resultContainer}>
                  <Chip
                    mode="flat"
                    textStyle={[
                      styles.resultText,
                      { color: game.results.myResult === 'win' ? theme.colors.success : theme.colors.error }
                    ]}
                  >
                    {game.results.myResult === 'win' ? '승리' : '패배'}
                  </Chip>
                </View>
              )}
            </Surface>
          ))
        )}
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>안녕하세요,</Text>
            <Text style={styles.userName}>{user?.name}님! 🏸</Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton
              icon="bell"
              size={24}
              onPress={() => navigation.navigate('Notifications')}
              style={[
                styles.notificationButton,
                notifications.length > 0 && styles.hasNotifications
              ]}
            />
            {notifications.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>
                  {notifications.length > 9 ? '9+' : notifications.length}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 빠른 통계 */}
        {renderQuickStats()}

        {/* 다가오는 게임 */}
        {renderUpcomingGames()}

        {/* 내 클럽 */}
        {renderMyClubs()}

        {/* 최근 활동 */}
        {renderRecentActivity()}

        {/* 빠른 액션 */}
        <Card style={styles.quickActionsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>빠른 실행</Text>
            <View style={styles.quickActionsGrid}>
              <Button
                mode="contained"
                icon="plus"
                onPress={() => navigation.navigate('GameCreate')}
                style={[styles.quickActionButton, { backgroundColor: theme.colors.primary }]}
                labelStyle={styles.quickActionText}
              >
                게임 만들기
              </Button>
              <Button
                mode="outlined"
                icon="magnify"
                onPress={() => navigation.navigate('GameSearch')}
                style={styles.quickActionButton}
                labelStyle={styles.quickActionText}
              >
                게임 찾기
              </Button>
              <Button
                mode="outlined"
                icon="account-group"
                onPress={() => navigation.navigate('ClubSearch')}
                style={styles.quickActionButton}
                labelStyle={styles.quickActionText}
              >
                클럽 찾기
              </Button>
              <Button
                mode="outlined"
                icon="chart-line"
                onPress={() => navigation.navigate('Statistics')}
                style={styles.quickActionButton}
                labelStyle={styles.quickActionText}
              >
                통계 보기
              </Button>
            </View>
          </Card.Content>
        </Card>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    elevation: 2,
  },
  greeting: {
    fontSize: 16,
    color: theme.colors.text,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  headerActions: {
    position: 'relative',
  },
  notificationButton: {
    margin: 0,
  },
  hasNotifications: {
    backgroundColor: theme.colors.primaryContainer,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: theme.colors.onError,
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionCard: {
    margin: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  statsCard: {
    margin: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.primaryContainer,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.sm,
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
  },
  joinButton: {
    backgroundColor: theme.colors.secondary,
  },
  gameItem: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.roundness,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  levelChip: {
    marginLeft: theme.spacing.sm,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  gameInfo: {
    marginBottom: theme.spacing.md,
  },
  gameDate: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  gameLocation: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  gameParticipants: {
    fontSize: 14,
    color: theme.colors.text,
  },
  viewButton: {
    alignSelf: 'flex-start',
  },
  clubItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.roundness,
  },
  clubAvatar: {
    marginRight: theme.spacing.md,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  clubMembers: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  clubLocation: {
    fontSize: 14,
    color: theme.colors.text,
  },
  activityItem: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.roundness,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  activityDate: {
    fontSize: 14,
    color: theme.colors.text,
  },
  resultContainer: {
    alignItems: 'flex-start',
  },
  resultText: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickActionsCard: {
    margin: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  quickActionButton: {
    width: '48%',
    marginBottom: theme.spacing.sm,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: theme.spacing.xl,
  },
});

export default HomeScreen;