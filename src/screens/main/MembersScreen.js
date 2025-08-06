import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { 
  Text, 
  Card, 
  Avatar, 
  Button, 
  Chip, 
  Searchbar,
  List,
  Divider,
  Surface,
  IconButton,
  ActivityIndicator,
  Badge
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { bandAPI } from '../../services/api';
import theme from '../../utils/theme';

/**
 * 동호회 멤버 관리 화면
 * - NAVER Band 연동 멤버 목록
 * - 멤버별 활동 통계
 * - 연락처 및 소통 기능
 * - 출석 및 참여도 관리
 */
const MembersScreen = ({ navigation }) => {
  const { user, selectedBand } = useAuth();
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive, leader

  useEffect(() => {
    if (selectedBand) {
      loadMembers();
    }
  }, [selectedBand]);

  useEffect(() => {
    filterMembers();
  }, [searchQuery, members, filterStatus]);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const bandMembers = await bandAPI.getBandMembers(selectedBand.bandKey);
      
      // 멤버 데이터 가공 (활동 통계 추가)
      const enrichedMembers = bandMembers.map(member => ({
        ...member,
        stats: {
          totalGames: Math.floor(Math.random() * 20) + 1, // Mock data
          winRate: Math.floor(Math.random() * 100),
          attendance: Math.floor(Math.random() * 100),
          lastActiveDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
          monthlyFeeStatus: Math.random() > 0.3 ? 'paid' : 'unpaid',
          favoritePartner: bandMembers[Math.floor(Math.random() * bandMembers.length)]?.name || '없음'
        }
      }));

      setMembers(enrichedMembers);
    } catch (error) {
      console.error('멤버 목록 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMembers();
    setRefreshing(false);
  };

  const filterMembers = () => {
    let filtered = members;

    // 검색어 필터링
    if (searchQuery) {
      filtered = filtered.filter(member => 
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 상태별 필터링
    switch (filterStatus) {
      case 'active':
        filtered = filtered.filter(member => 
          member.stats.lastActiveDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
        break;
      case 'inactive':
        filtered = filtered.filter(member => 
          member.stats.lastActiveDate <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
        break;
      case 'leader':
        filtered = filtered.filter(member => member.role === 'leader');
        break;
      default:
        break;
    }

    setFilteredMembers(filtered);
  };

  const getActivityStatus = (member) => {
    const daysSinceActive = Math.floor((Date.now() - member.stats.lastActiveDate) / (24 * 60 * 60 * 1000));
    if (daysSinceActive <= 1) return { status: 'online', color: theme.colors.success };
    if (daysSinceActive <= 7) return { status: 'active', color: theme.colors.warning };
    return { status: 'inactive', color: theme.colors.error };
  };

  const renderFilterChips = () => (
    <View style={styles.filterContainer}>
      <Chip
        selected={filterStatus === 'all'}
        onPress={() => setFilterStatus('all')}
        style={styles.filterChip}
      >
        전체 ({members.length})
      </Chip>
      <Chip
        selected={filterStatus === 'active'}
        onPress={() => setFilterStatus('active')}
        style={styles.filterChip}
      >
        활성 ({members.filter(m => m.stats.lastActiveDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length})
      </Chip>
      <Chip
        selected={filterStatus === 'leader'}
        onPress={() => setFilterStatus('leader')}
        style={styles.filterChip}
      >
        임원 ({members.filter(m => m.role === 'leader').length})
      </Chip>
    </View>
  );

  const renderMemberStats = () => {
    const activeMembers = members.filter(m => 
      m.stats.lastActiveDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    const paidMembers = members.filter(m => m.stats.monthlyFeeStatus === 'paid').length;
    
    return (
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text style={styles.statsTitle}>🏸 동호회 현황</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{members.length}</Text>
              <Text style={styles.statLabel}>총 멤버</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{activeMembers}</Text>
              <Text style={styles.statLabel}>활성 멤버</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{paidMembers}</Text>
              <Text style={styles.statLabel}>모임비 납부</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{Math.round((paidMembers / members.length) * 100) || 0}%</Text>
              <Text style={styles.statLabel}>납부율</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderMemberItem = ({ item: member }) => {
    const activity = getActivityStatus(member);
    const isCurrentUser = member.user_key === user.bandUserKey;
    
    return (
      <Card style={styles.memberCard}>
        <List.Item
          title={
            <View style={styles.memberTitle}>
              <Text style={styles.memberName}>{member.name}</Text>
              {member.role === 'leader' && (
                <Badge style={styles.leaderBadge}>👑 임원</Badge>
              )}
              {isCurrentUser && (
                <Badge style={styles.meBadge}>나</Badge>
              )}
            </View>
          }
          description={
            <View style={styles.memberDescription}>
              <Text style={styles.memberStats}>
                게임 {member.stats.totalGames}회 • 승률 {member.stats.winRate}% • 출석률 {member.stats.attendance}%
              </Text>
              <Text style={styles.memberLastActive}>
                마지막 활동: {member.stats.lastActiveDate.toLocaleDateString('ko-KR')}
              </Text>
              <View style={styles.memberBadges}>
                <Chip 
                  style={[
                    styles.paymentChip,
                    { backgroundColor: member.stats.monthlyFeeStatus === 'paid' ? theme.colors.success : theme.colors.error }
                  ]}
                  textStyle={{ color: theme.colors.surface, fontSize: 10 }}
                >
                  {member.stats.monthlyFeeStatus === 'paid' ? '모임비 완료' : '모임비 미납'}
                </Chip>
                <Chip 
                  style={[styles.activityChip, { backgroundColor: activity.color }]}
                  textStyle={{ color: theme.colors.surface, fontSize: 10 }}
                >
                  {activity.status === 'online' ? '접속중' : 
                   activity.status === 'active' ? '활성' : '비활성'}
                </Chip>
              </View>
            </View>
          }
          left={(props) => (
            <View style={styles.avatarContainer}>
              <Avatar.Image 
                {...props} 
                size={50} 
                source={{ uri: member.profile_image }}
              />
              <Badge 
                style={[
                  styles.activityDot, 
                  { backgroundColor: activity.color }
                ]}
                size={12}
              />
            </View>
          )}
          right={(props) => (
            <View style={styles.memberActions}>
              <IconButton 
                {...props} 
                icon="message-text" 
                size={20}
                onPress={() => {/* 1:1 채팅 */}}
              />
              <IconButton 
                {...props} 
                icon="phone" 
                size={20}
                onPress={() => {/* 전화 걸기 */}}
              />
            </View>
          )}
          onPress={() => navigation.navigate('MemberProfile', { member })}
        />
      </Card>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>멤버 목록을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedBand) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noBandContainer}>
          <Text style={styles.noBandText}>연결된 동호회가 없습니다</Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('BandClubSelection')}
          >
            동호회 선택하기
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="멤버 검색..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <FlatList
        data={filteredMembers}
        renderItem={renderMemberItem}
        keyExtractor={(item) => item.user_key}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View>
            {renderMemberStats()}
            {renderFilterChips()}
          </View>
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  searchBar: {
    marginBottom: theme.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  noBandContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  noBandText: {
    fontSize: 18,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  statsCard: {
    marginBottom: theme.spacing.md,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.onSurface,
    opacity: 0.7,
    marginTop: theme.spacing.xs,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  filterChip: {
    marginRight: theme.spacing.xs,
  },
  memberCard: {
    marginBottom: theme.spacing.sm,
    elevation: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  activityDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  memberTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  leaderBadge: {
    backgroundColor: theme.colors.warning,
    fontSize: 10,
  },
  meBadge: {
    backgroundColor: theme.colors.primary,
    fontSize: 10,
  },
  memberDescription: {
    marginTop: theme.spacing.xs,
  },
  memberStats: {
    fontSize: 14,
    color: theme.colors.onSurface,
    opacity: 0.8,
    marginBottom: theme.spacing.xs,
  },
  memberLastActive: {
    fontSize: 12,
    color: theme.colors.onSurface,
    opacity: 0.6,
    marginBottom: theme.spacing.sm,
  },
  memberBadges: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  paymentChip: {
    height: 24,
  },
  activityChip: {
    height: 24,
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default MembersScreen;