import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { 
  Text, 
  Card, 
  Avatar,
  SegmentedButtons,
  Surface,
  ActivityIndicator,
  Chip,
  List
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import theme from '../../utils/theme';

const RankingScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [rankings, setRankings] = useState([]);
  const [myRanking, setMyRanking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rankingType, setRankingType] = useState('overall');

  const rankingTypeOptions = [
    { value: 'overall', label: '종합' },
    { value: 'winRate', label: '승률' },
    { value: 'games', label: '게임수' },
    { value: 'points', label: '점수' },
  ];

  useEffect(() => {
    loadRankings();
  }, [rankingType]);

  const loadRankings = async () => {
    try {
      setIsLoading(true);
      const response = await userAPI.getRankings(rankingType);
      const data = response.data.data;
      
      setRankings(data.rankings || []);
      setMyRanking(data.myRanking || null);
    } catch (error) {
      console.error('랭킹 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadRankings();
    setIsRefreshing(false);
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

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}위`;
    }
  };

  const getRankingValue = (ranking, type) => {
    switch (type) {
      case 'overall':
        return `${ranking.totalPoints || 0}점`;
      case 'winRate':
        return `${ranking.winRate || 0}%`;
      case 'games':
        return `${ranking.gamesPlayed || 0}게임`;
      case 'points':
        return `${ranking.totalPoints || 0}점`;
      default:
        return '';
    }
  };

  const renderMyRanking = () => {
    if (!myRanking) return null;

    return (
      <Card style={styles.myRankingCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>내 순위</Text>
          <Surface style={styles.myRankingItem} elevation={2}>
            <View style={styles.rankInfo}>
              <Text style={styles.myRank}>{getRankIcon(myRanking.rank)}</Text>
            </View>
            <Avatar.Image
              size={60}
              source={{ uri: user?.profileImage || 'https://via.placeholder.com/60' }}
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name}</Text>
              <View style={styles.userMeta}>
                <Chip
                  mode="outlined"
                  textStyle={[styles.levelText, { color: getLevelColor(user?.level) }]}
                  style={[styles.levelChip, { borderColor: getLevelColor(user?.level) }]}
                >
                  {getLevelText(user?.level)}
                </Chip>
              </View>
            </View>
            <View style={styles.rankingValue}>
              <Text style={styles.valueText}>
                {getRankingValue(myRanking, rankingType)}
              </Text>
            </View>
          </Surface>
        </Card.Content>
      </Card>
    );
  };

  const renderRankingItem = (ranking, index) => {
    const isMe = ranking.user._id === user?.id;
    
    return (
      <Surface 
        key={ranking.user._id} 
        style={[
          styles.rankingItem,
          isMe && styles.myRankingHighlight
        ]} 
        elevation={1}
      >
        <View style={styles.rankInfo}>
          <Text style={[
            styles.rankNumber,
            index < 3 && styles.topRank
          ]}>
            {getRankIcon(index + 1)}
          </Text>
        </View>
        
        <Avatar.Image
          size={50}
          source={{ uri: ranking.user.profileImage || 'https://via.placeholder.com/50' }}
          style={styles.avatar}
        />
        
        <View style={styles.userInfo}>
          <Text style={[
            styles.userName,
            isMe && styles.myUserName
          ]}>
            {ranking.user.name}
            {isMe && ' (나)'}
          </Text>
          <View style={styles.userMeta}>
            <Chip
              mode="outlined"
              textStyle={[styles.levelText, { color: getLevelColor(ranking.user.level) }]}
              style={[styles.levelChip, { borderColor: getLevelColor(ranking.user.level) }]}
            >
              {getLevelText(ranking.user.level)}
            </Chip>
          </View>
        </View>
        
        <View style={styles.rankingValue}>
          <Text style={styles.valueText}>
            {getRankingValue(ranking, rankingType)}
          </Text>
          <Text style={styles.gamesPlayed}>
            {ranking.gamesPlayed || 0}게임
          </Text>
        </View>
      </Surface>
    );
  };

  const renderRankingList = () => (
    <Card style={styles.rankingCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>전체 랭킹</Text>
        
        {rankings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>랭킹 데이터가 없습니다</Text>
          </View>
        ) : (
          rankings.map((ranking, index) => renderRankingItem(ranking, index))
        )}
      </Card.Content>
    </Card>
  );

  const renderRankingInfo = () => (
    <Card style={styles.infoCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>랭킹 시스템</Text>
        <List.Item
          title="종합 랭킹"
          description="게임 결과, 승률, 활동도를 종합한 점수"
          left={(props) => <List.Icon {...props} icon="trophy" />}
        />
        <List.Item
          title="승률 랭킹"
          description="전체 게임 대비 승리 게임의 비율"
          left={(props) => <List.Icon {...props} icon="percent" />}
        />
        <List.Item
          title="게임수 랭킹"
          description="참여한 총 게임 수"
          left={(props) => <List.Icon {...props} icon="counter" />}
        />
        <List.Item
          title="점수 랭킹"
          description="게임 결과에 따른 누적 점수"
          left={(props) => <List.Icon {...props} icon="star" />}
        />
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>랭킹을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* 랭킹 타입 선택 */}
        <View style={styles.filterContainer}>
          <SegmentedButtons
            value={rankingType}
            onValueChange={setRankingType}
            buttons={rankingTypeOptions}
            style={styles.segmentedButtons}
          />
        </View>

        {renderMyRanking()}
        {renderRankingList()}
        {renderRankingInfo()}

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
  filterContainer: {
    margin: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  segmentedButtons: {
    marginBottom: theme.spacing.sm,
  },
  myRankingCard: {
    margin: theme.spacing.lg,
    marginTop: 0,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  myRankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.roundness,
    backgroundColor: `${theme.colors.primary}10`,
  },
  rankingCard: {
    margin: theme.spacing.lg,
    marginTop: 0,
    marginBottom: theme.spacing.md,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.roundness,
  },
  myRankingHighlight: {
    backgroundColor: `${theme.colors.primary}10`,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  rankInfo: {
    width: 50,
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  myRank: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  topRank: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatar: {
    marginRight: theme.spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  myUserName: {
    color: theme.colors.primary,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelChip: {
    height: 24,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rankingValue: {
    alignItems: 'flex-end',
  },
  valueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  gamesPlayed: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.7,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text,
    opacity: 0.7,
    textAlign: 'center',
  },
  infoCard: {
    margin: theme.spacing.lg,
    marginTop: 0,
    marginBottom: theme.spacing.md,
  },
  bottomSpacing: {
    height: theme.spacing.xl,
  },
});

export default RankingScreen;