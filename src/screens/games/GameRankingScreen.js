// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { View, FlatList, StyleSheet } from 'react-native';
// eslint-disable-next-line no-unused-vars
import { 
  Text, 
  Card, 
  Avatar, 
  Chip, 
  SegmentedButtons,
  ActivityIndicator,
  Surface
// eslint-disable-next-line no-unused-vars
} from 'react-native-paper';
import GameService from '../../services/GameService';

const GameRankingScreen = () => {
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [rankings, setRankings] = useState([]);
  const [rankingType, setRankingType] = useState('overall');

  const rankingOptions = [
    { value: 'overall', label: '종합' },
    { value: 'wins', label: '승수' },
    { value: 'winRate', label: '승률' }
  ];

  useEffect(() => {
    loadRankings();
  }, [rankingType]);

  const loadRankings = async () => {
    try {
      setLoading(true);
      const result = await GameService.getRankings(rankingType);
      
      if (result.success) {
        setRankings(result.data);
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      // 오류 처리
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `${rank}위`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return '#ffd700';
      case 2:
        return '#c0c0c0';
      case 3:
        return '#cd7f32';
      default:
        return '#e0e0e0';
    }
  };

  const renderRankingItem = ({ item, index }) => {
    const rank = index + 1;
    
    return (
      <Card style={[styles.rankingCard, { borderLeftColor: getRankColor(rank) }]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.rankContainer}>
            <Text style={styles.rankText}>{getRankIcon(rank)}</Text>
          </View>
          
          <Avatar.Text 
            size={50} 
            label={item.playerName ? item.playerName.charAt(0) : '?'}
            style={styles.avatar}
          />
          
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>
              {item.playerName || `Player ${item.playerId}`}
            </Text>
            <View style={styles.statsContainer}>
              <Chip mode="outlined" compact style={styles.statChip}>
                승: {item.wins}
              </Chip>
              <Chip mode="outlined" compact style={styles.statChip}>
                패: {item.losses}
              </Chip>
              <Chip mode="outlined" compact style={styles.statChip}>
                승률: {item.winRate}%
              </Chip>
            </View>
          </View>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.totalGames}>{item.totalGames}경기</Text>
            <Text style={styles.avgPoints}>
              평균 {item.avgPointsPerGame}점
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>랭킹 데이터가 없습니다</Text>
      <Text style={styles.emptySubText}>경기를 진행하면 랭킹이 집계됩니다</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>랭킹 로딩 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <Surface style={styles.header}>
        <Text style={styles.title}>배드민턴 랭킹</Text>
        <SegmentedButtons
          value={rankingType}
          onValueChange={setRankingType}
          buttons={rankingOptions}
          style={styles.filterButtons}
        />
      </Surface>

      {/* 랭킹 목록 */}
      <FlatList
        data={rankings}
        renderItem={renderRankingItem}
        keyExtractor={(item, index) => `${item.playerId}-${index}`}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={EmptyComponent}
        showsVerticalScrollIndicator={false}
      />

      {/* 범례 */}
      <Surface style={styles.legend}>
        <Text style={styles.legendTitle}>랭킹 기준</Text>
        <Text style={styles.legendText}>
          • 종합: 승수 + 승률 + 경기수를 종합한 점수
        </Text>
        <Text style={styles.legendText}>
          • 승수: 총 승리 횟수 기준
        </Text>
        <Text style={styles.legendText}>
          • 승률: 승리 확률 기준 (최소 5경기 이상)
        </Text>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    padding: 16,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterButtons: {
    marginBottom: 8,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  rankingCard: {
    marginBottom: 12,
    elevation: 2,
    borderLeftWidth: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatar: {
    marginLeft: 12,
    backgroundColor: '#1976d2',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  statChip: {
    height: 24,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  totalGames: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  avgPoints: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  legend: {
    margin: 16,
    padding: 16,
    elevation: 1,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});

export default GameRankingScreen;
