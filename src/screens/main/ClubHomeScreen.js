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
  ActivityIndicator,
  List,
  Divider,
  FAB
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { gameAPI, bandAPI } from '../../services/api';
import theme from '../../utils/theme';
import Logger from '../../utils/logger';
import GradientCard from '../../components/premium/GradientCard';
import CourtView from '../../components/badminton/CourtView';

/**
 * 밴드 동호회 전용 홈 화면
 * - 단일 밴드 기반 폐쇄형 구조
 * - 동호회 멤버들만의 게임 관리
 * - 참석비, 공지사항, 게임 데이터 중심
 */
const ClubHomeScreen = ({ navigation }) => {
  const { user, selectedBand } = useAuth();
  const { notifications } = useSocket();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clubData, setClubData] = useState({
    upcomingGames: [],
    recentNotices: [],
    memberStats: null,
    paymentStatus: null,
    clubMembers: [],
  });

  useEffect(() => {
    if (selectedBand) {
      loadClubData();
    }
  }, [selectedBand]);

  const loadClubData = async () => {
    try {
      setIsLoading(true);
      
      // 밴드 기반 데이터만 로드
      const [
        upcomingGamesRes,
        bandMembers,
        bandNotices
      ] = await Promise.all([
        gameAPI.getClubGames(selectedBand.id, { status: 'upcoming', limit: 3 }),
        bandAPI.getBandMembers(selectedBand.bandKey),
        bandAPI.getBandPosts(selectedBand.bandKey, null, 5)
      ]);

      setClubData({
        upcomingGames: upcomingGamesRes.data?.data || [],
        clubMembers: bandMembers || [],
        recentNotices: bandNotices?.posts || [],
        memberStats: {
          totalMembers: bandMembers.length,
          activeMembers: bandMembers.filter(m => m.lastActive > Date.now() - 7*24*60*60*1000).length,
          thisMonthGames: 3, // Mock data
        },
        paymentStatus: {
          paid: true,
          amount: 50000,
          dueDate: '2024-02-15',
          method: '정기 모임비'
        }
      });
    } catch (error) {
      Logger.error('동호회 데이터 로드 오류', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClubData();
    setRefreshing(false);
  };

  const renderClubHeader = () => (
    <GradientCard 
      gradient="primary" 
      style={styles.clubCard}
      animated={false}
    >
      <View style={styles.clubHeader}>
        <Avatar.Image 
          size={70} 
          source={{ uri: selectedBand?.clubImage || 'https://via.placeholder.com/140' }}
          style={styles.clubAvatar}
        />
        <View style={styles.clubInfo}>
          <Text style={styles.clubName}>{selectedBand?.name || '동호회'}</Text>
          <Text style={styles.clubDescription}>{selectedBand?.description}</Text>
          <View style={styles.clubStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{clubData.memberStats?.totalMembers || 0}</Text>
              <Text style={styles.statLabel}>멤버</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{clubData.memberStats?.thisMonthGames || 0}</Text>
              <Text style={styles.statLabel}>이번달 게임</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{clubData.memberStats?.activeMembers || 0}</Text>
              <Text style={styles.statLabel}>활성 멤버</Text>
            </View>
          </View>
        </View>
        <IconButton
          icon="message-text"
          size={24}
          iconColor="white"
          onPress={() => navigation.navigate('Board')}
          style={styles.boardButton}
        />
      </View>
    </GradientCard>
  );

  const renderPaymentStatus = () => {
    if (!clubData.paymentStatus) return null;
    
    const { paid, amount, dueDate, method } = clubData.paymentStatus;
    
    return (
      <Card style={styles.paymentCard}>
        <Card.Content>
          <View style={styles.paymentHeader}>
            <Text style={styles.sectionTitle}>💰 모임비 현황</Text>
            <Badge 
              style={[styles.badge, { backgroundColor: paid ? theme.colors.success : theme.colors.error }]}
            >
              {paid ? '납부완료' : '미납'}
            </Badge>
          </View>
          <View style={styles.paymentDetails}>
            <Text style={styles.paymentAmount}>
              {amount.toLocaleString()}원 ({method})
            </Text>
            <Text style={styles.paymentDue}>
              납부 기한: {new Date(dueDate).toLocaleDateString('ko-KR')}
            </Text>
          </View>
          {!paid && (
            <Button 
              mode="contained" 
              style={styles.payButton}
              onPress={() => navigation.navigate('Payment')}
            >
              모임비 납부하기
            </Button>
          )}
        </Card.Content>
      </Card>
    );
  };

  // 실시간 코트 현황 렌더링
  const renderCourtStatus = () => {
    const mockPlayers = [
      { id: 1, name: '김철수', skillLevel: 'intermediate', avatar: null },
      { id: 2, name: '이영희', skillLevel: 'advanced', avatar: null },
      { id: 3, name: '박민수', skillLevel: 'intermediate', avatar: null },
      { id: 4, name: '최지은', skillLevel: 'beginner', avatar: null },
    ];

    return (
      <Surface style={styles.courtSection} elevation={2}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏸 실시간 코트 현황</Text>
          <Chip 
            icon="timer" 
            style={styles.liveChip}
            textStyle={{ color: theme.colors.surface }}
          >
            LIVE
          </Chip>
        </View>
        
        <CourtView
          players={mockPlayers}
          gameType="doubles"
          courtStatus="occupied"
          showPlayerNames={true}
          style={styles.courtView}
        />
      </Surface>
    );
  };

  const renderUpcomingGames = () => (
    <Surface style={styles.gamesCard} elevation={2}>
      <View style={styles.cardContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📅 다가오는 게임</Text>
          <Button 
            mode="text" 
            onPress={() => navigation.navigate('Games')}
            textColor={theme.colors.primary}
          >
            전체보기
          </Button>
        </View>
        
        {clubData.upcomingGames.length > 0 ? (
          clubData.upcomingGames.map((game, index) => (
            <GradientCard
              key={game.id || index}
              gradient="cool"
              style={styles.gameCard}
              onPress={() => navigation.navigate('GameDetail', { gameId: game.id })}
            >
              <View style={styles.gameContent}>
                <View style={styles.gameMain}>
                  <Text style={styles.gameTitle}>{game.title || '정기 모임'}</Text>
                  <Text style={styles.gameDate}>
                    {new Date(game.gameDate).toLocaleDateString('ko-KR')} {new Date(game.gameDate).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <View style={styles.gameDetails}>
                    <Chip 
                      icon="account-group" 
                      style={styles.participantChip}
                      textStyle={{ color: theme.colors.surface }}
                    >
                      {game.participants?.length || 0}/{game.maxParticipants || 8}명
                    </Chip>
                    <Chip 
                      icon="map-marker" 
                      style={styles.locationChip}
                      textStyle={{ color: theme.colors.surface }}
                    >
                      {game.location || '체육관'}
                    </Chip>
                  </View>
                </View>
                <IconButton 
                  icon="chevron-right" 
                  iconColor={theme.colors.surface}
                  size={24}
                />
              </View>
            </GradientCard>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>예정된 게임이 없습니다</Text>
            <Text style={styles.emptySubtext}>새로운 게임을 만들어보세요!</Text>
          </View>
        )}
      </View>
    </Surface>
  );

  const renderNotices = () => (
    <Card style={styles.noticesCard}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📢 동호회 공지</Text>
          <Button 
            mode="text" 
            onPress={() => navigation.navigate('BandNotices')}
          >
            밴드에서 보기
          </Button>
        </View>
        
        {clubData.recentNotices.length > 0 ? (
          clubData.recentNotices.slice(0, 3).map((notice, index) => (
            <View key={notice.post_key || index}>
              <List.Item
                title={notice.content.substring(0, 50) + (notice.content.length > 50 ? '...' : '')}
                description={`${notice.author.name} • ${new Date(notice.created_at).toLocaleDateString('ko-KR')}`}
                left={(props) => <Avatar.Image {...props} size={40} source={{ uri: notice.author.profile_image }} />}
                right={(props) => (
                  <View style={styles.noticeInfo}>
                    <Text style={styles.noticeStats}>
                      👍 {notice.like_count} 💬 {notice.comment_count}
                    </Text>
                  </View>
                )}
              />
              {index < Math.min(clubData.recentNotices.length, 3) - 1 && <Divider />}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>최근 공지사항이 없습니다</Text>
        )}
      </Card.Content>
    </Card>
  );

  const renderMembers = () => (
    <Card style={styles.membersCard}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>👥 동호회 멤버</Text>
          <Text style={styles.memberCount}>
            {clubData.memberStats?.activeMembers || 0}/{clubData.memberStats?.totalMembers || 0}명 활성
          </Text>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.membersScroll}>
          {clubData.clubMembers.slice(0, 10).map((member, index) => (
            <View key={member.user_key || index} style={styles.memberItem}>
              <Avatar.Image 
                size={50} 
                source={{ uri: member.profile_image }}
              />
              <Text style={styles.memberName}>
                {member.name.length > 6 ? member.name.substring(0, 5) + '...' : member.name}
              </Text>
              {member.role === 'leader' && (
                <Badge style={styles.leaderBadge}>
                  👑
                </Badge>
              )}
            </View>
          ))}
        </ScrollView>
        
        <Button 
          mode="text" 
          style={styles.viewAllMembersButton}
          onPress={() => navigation.navigate('ClubMembers')}
        >
          전체 멤버 보기
        </Button>
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>동호회 정보를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedBand) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noBandContainer}>
          <Text style={styles.noBandText}>연결된 밴드가 없습니다</Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('BandClubSelection')}
          >
            밴드 선택하기
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderClubHeader()}
        {renderPaymentStatus()}
        {renderCourtStatus()}
        {renderUpcomingGames()}
        {renderNotices()}
        {renderMembers()}
      </ScrollView>
      
      {/* 플로팅 액션 버튼 */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('GameCreate', { clubId: selectedBand?.id })}
        label="게임 만들기"
      />
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
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fonts.body.fontSize,
    color: theme.colors.onSurface,
    textAlign: 'center',
  },
  noBandContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  noBandText: {
    fontSize: theme.fonts.lg.fontSize,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  
  // 클럽 헤더 스타일
  clubCard: {
    marginBottom: theme.spacing.lg,
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubAvatar: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  clubInfo: {
    flex: 1,
    marginLeft: theme.spacing.lg,
  },
  clubName: {
    fontSize: theme.fonts.h3.fontSize,
    fontWeight: theme.fonts.h3.fontWeight,
    color: theme.colors.surface,
    marginBottom: theme.spacing.xs,
  },
  clubDescription: {
    fontSize: theme.fonts.body.fontSize,
    color: theme.colors.surface,
    opacity: 0.8,
    marginBottom: theme.spacing.md,
  },
  clubStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: theme.fonts.h4.fontSize,
    fontWeight: theme.fonts.h4.fontWeight,
    color: theme.colors.surface,
  },
  statLabel: {
    fontSize: theme.fonts.caption.fontSize,
    color: theme.colors.surface,
    opacity: 0.8,
    marginTop: theme.spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  // 코트 현황 스타일
  courtSection: {
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  courtView: {
    marginTop: theme.spacing.md,
  },
  liveChip: {
    backgroundColor: theme.colors.error,
    height: 28,
  },

  // 공통 섹션 스타일
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fonts.h5.fontSize,
    fontWeight: theme.fonts.h5.fontWeight,
    color: theme.colors.onSurface,
  },

  // 게임 카드 스타일
  gamesCard: {
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.card,
    backgroundColor: theme.colors.surface,
  },
  cardContent: {
    padding: theme.spacing.md,
  },
  gameCard: {
    marginBottom: theme.spacing.md,
  },
  gameContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gameMain: {
    flex: 1,
  },
  gameTitle: {
    fontSize: theme.fonts.subtitle.fontSize,
    fontWeight: theme.fonts.subtitle.fontWeight,
    color: theme.colors.surface,
    marginBottom: theme.spacing.xs,
  },
  gameDate: {
    fontSize: theme.fonts.body.fontSize,
    color: theme.colors.surface,
    opacity: 0.8,
    marginBottom: theme.spacing.sm,
  },
  gameDetails: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  participantChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    height: 28,
  },
  locationChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    height: 28,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fonts.body.fontSize,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: theme.fonts.caption.fontSize,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    opacity: 0.7,
  },

  // FAB 스타일
  fab: {
    position: 'absolute',
    right: theme.spacing.md,
    bottom: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
  },
  paymentCard: {
    marginBottom: theme.spacing.md,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  badge: {
    color: theme.colors.surface,
  },
  paymentDetails: {
    marginBottom: theme.spacing.md,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  paymentDue: {
    fontSize: 14,
    color: theme.colors.onSurface,
    opacity: 0.7,
  },
  payButton: {
    marginTop: theme.spacing.sm,
  },
  gamesSectionCard: {
    marginBottom: theme.spacing.md,
    elevation: 2,
  },
  noticesCard: {
    marginBottom: theme.spacing.md,
    elevation: 2,
  },
  membersCard: {
    marginBottom: theme.spacing.lg,
    elevation: 2,
  },
  cardSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  gameInfo: {
    alignItems: 'center',
  },
  gameParticipants: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  noticeInfo: {
    justifyContent: 'center',
  },
  noticeStats: {
    fontSize: 12,
    color: theme.colors.onSurface,
    opacity: 0.6,
  },
  memberCount: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  membersScroll: {
    marginBottom: theme.spacing.md,
  },
  memberItem: {
    alignItems: 'center',
    marginRight: theme.spacing.md,
    position: 'relative',
  },
  memberName: {
    fontSize: 12,
    color: theme.colors.onSurface,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  leaderBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: theme.colors.warning,
    fontSize: 10,
  },
  viewAllMembersButton: {
    marginTop: theme.spacing.sm,
  },
  createGameButton: {
    marginTop: theme.spacing.md,
  },
  gameEmptyText: {
    textAlign: 'center',
    color: theme.colors.onSurface,
    opacity: 0.6,
    fontSize: 14,
    marginVertical: theme.spacing.lg,
  },
  boardButton: {
    margin: 4,
  },
});

export default ClubHomeScreen;