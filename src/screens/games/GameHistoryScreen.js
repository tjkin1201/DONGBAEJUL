// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
// eslint-disable-next-line no-unused-vars
import { 
  Text, 
  Card, 
  Chip,
  ActivityIndicator,
  Searchbar,
  FAB,
  Surface
// eslint-disable-next-line no-unused-vars
} from 'react-native-paper';
import GameService from '../../services/GameService';

const GameHistoryScreen = ({ navigation }) => {
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [refreshing, setRefreshing] = useState(false);
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadGameHistory();
  }, []);

  useEffect(() => {
    filterGames();
  }, [games, searchQuery]);

  const loadGameHistory = async () => {
    try {
      setLoading(true);
      const result = await GameService.getGameHistory();
      
      if (result.success) {
        setGames(result.data);
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      // 오류 처리
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadGameHistory();
    } finally {
      setRefreshing(false);
    }
  };

  const filterGames = () => {
    if (!searchQuery.trim()) {
      setFilteredGames(games);
      return;
    }

    const filtered = games.filter(game => 
      game.players?.some(player => 
        player.name?.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      game.gameType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.result?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredGames(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'in_progress':
        return '#ff9800';
      case 'cancelled':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return '완료';
      case 'in_progress':
        return '진행중';
      case 'cancelled':
        return '취소됨';
      default:
        return '알 수 없음';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return '오늘';
    } else if (diffDays === 2) {
      return '어제';
    } else if (diffDays <= 7) {
      return `${diffDays - 1}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderGameItem = ({ item }) => {
    const isCompleted = item.status === 'completed';
    
    return (
      <Card 
        style={styles.gameCard}
        onPress={() => navigation?.navigate('GameDetail', { gameId: item.id })}
      >
        <Card.Content style={styles.cardContent}>
          {/* 게임 헤더 */}
          <View style={styles.gameHeader}>
            <View style={styles.gameInfo}>
              <Text style={styles.gameType}>{item.gameType}</Text>
              <Text style={styles.gameDate}>
                {formatDate(item.createdAt)} {formatTime(item.createdAt)}
              </Text>
            </View>
            <Chip 
              mode="outlined" 
              compact
              textStyle={{ color: getStatusColor(item.status) }}
              style={{ borderColor: getStatusColor(item.status) }}
            >
              {getStatusText(item.status)}
            </Chip>
          </View>

          {/* 플레이어 정보 */}
          <View style={styles.playersSection}>
            {item.players && item.players.length > 0 ? (
              <View style={styles.playersContainer}>
                {item.players.map((player, index) => (
                  <Chip key={index} compact style={styles.playerChip}>
                    {player.name || `Player ${player.id}`}
                  </Chip>
                ))}
              </View>
            ) : (
              <Text style={styles.noPlayers}>참가자 정보 없음</Text>
            )}
          </View>

          {/* 경기 결과 */}
          {isCompleted && item.result && (
            <View style={styles.resultSection}>
              <Text style={styles.resultLabel}>결과:</Text>
              <Text style={styles.resultText}>{item.result}</Text>
            </View>
          )}

          {/* 점수 정보 */}
          {isCompleted && item.score && (
            <View style={styles.scoreSection}>
              <Text style={styles.scoreLabel}>점수:</Text>
              <Text style={styles.scoreText}>{item.score}</Text>
            </View>
          )}

          {/* 게임 시간 */}
          {item.duration && (
            <View style={styles.durationSection}>
              <Text style={styles.durationText}>
                소요 시간: {Math.floor(item.duration / 60)}분 {item.duration % 60}초
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>게임 기록이 없습니다</Text>
      <Text style={styles.emptySubText}>첫 게임을 시작해보세요!</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>게임 기록 로딩 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 검색 바 */}
      <Surface style={styles.searchContainer}>
        <Searchbar
          placeholder="플레이어 이름, 게임 타입으로 검색..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
        />
      </Surface>

      {/* 게임 목록 */}
      <FlatList
        data={filteredGames}
        renderItem={renderGameItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={EmptyComponent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* 새 게임 버튼 */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation?.navigate('CreateGame')}
        label="새 게임"
      />
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
  searchContainer: {
    padding: 16,
    elevation: 2,
  },
  searchBar: {
    elevation: 0,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  gameCard: {
    marginBottom: 12,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  gameInfo: {
    flex: 1,
  },
  gameType: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gameDate: {
    fontSize: 14,
    color: '#666',
  },
  playersSection: {
    marginBottom: 12,
  },
  playersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  playerChip: {
    backgroundColor: '#e3f2fd',
  },
  noPlayers: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  resultSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  scoreText: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: 'bold',
  },
  durationSection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    marginTop: 8,
  },
  durationText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976d2',
  },
});

export default GameHistoryScreen;
