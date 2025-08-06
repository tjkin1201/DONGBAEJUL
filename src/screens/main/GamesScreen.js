import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ScrollView } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  Searchbar,
  FAB,
  SegmentedButtons,
  ActivityIndicator,
  IconButton,
  Surface
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gameAPI } from '../../services/api';
import theme from '../../utils/theme';

const GamesScreen = ({ navigation }) => {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [filteredGames, setFilteredGames] = useState([]);

  const filterOptions = [
    { value: 'all', label: '전체' },
    { value: 'upcoming', label: '예정' },
    { value: 'completed', label: '완료' },
    { value: 'my', label: '내 게임' },
  ];

  // 게임 관리 메뉴 옵션
  const gameManagementOptions = [
    {
      title: '새 게임 만들기',
      subtitle: '배드민턴 게임을 생성하세요',
      icon: 'plus-circle',
      color: '#4caf50',
      onPress: () => navigation.navigate('CreateGame'),
    },
    {
      title: '스코어 입력',
      subtitle: '실시간 경기 점수 기록',
      icon: 'scoreboard',
      color: '#ff9800',
      onPress: () => navigation.navigate('BadmintonScore'),
    },
    {
      title: '랭킹',
      subtitle: '플레이어 순위 확인',
      icon: 'trophy',
      color: '#ffd700',
      onPress: () => navigation.navigate('GameRanking'),
    },
    {
      title: '통계',
      subtitle: '경기 통계 및 분석',
      icon: 'chart-line',
      color: '#2196f3',
      onPress: () => navigation.navigate('GameStatistics'),
    },
    {
      title: '게임 기록',
      subtitle: '과거 경기 기록 조회',
      icon: 'history',
      color: '#9c27b0',
      onPress: () => navigation.navigate('GameHistory'),
    },
  ];

  useEffect(() => {
    loadGames();
  }, [filter]);

  useEffect(() => {
    filterGames();
  }, [searchQuery, games]);

  const loadGames = async () => {
    try {
      setIsLoading(true);
      let response;
      
      switch (filter) {
        case 'upcoming':
          response = await gameAPI.getUpcomingGames();
          break;
        case 'completed':
          response = await gameAPI.getGames({ status: 'completed' });
          break;
        case 'my':
          response = await gameAPI.getGames({ participant: 'me' });
          break;
        default:
          response = await gameAPI.getGames();
      }
      
      setGames(response.data.data || []);
    } catch (error) {
      console.error('게임 목록 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGames();
    setRefreshing(false);
  };

  const filterGames = () => {
    if (!searchQuery.trim()) {
      setFilteredGames(games);
      return;
    }

    const filtered = games.filter(game =>
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.gameType.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredGames(filtered);
  };

  const getGameStatus = (game) => {
    const now = new Date();
    const gameDate = new Date(game.gameDate);
    
    if (game.results?.isCompleted) {
      return { text: '완료', color: theme.colors.success };
    } else if (gameDate < now) {
      return { text: '진행중', color: theme.colors.warning };
    } else if (game.participants.length >= game.maxParticipants) {
      return { text: '마감', color: theme.colors.error };
    } else {
      return { text: '모집중', color: theme.colors.primary };
    }
  };

  const renderGameCard = ({ item: game }) => {
    const status = getGameStatus(game);
    
    return (
      <Card 
        style={styles.gameCard} 
        onPress={() => navigation.navigate('PremiumGameDetail', { gameId: game._id })}
      >
        <Card.Content>
          <View style={styles.gameHeader}>
            <Text style={styles.gameTitle}>{game.title}</Text>
            <Chip
              mode="flat"
              textStyle={[styles.statusText, { color: status.color }]}
              style={[styles.statusChip, { backgroundColor: `${status.color}20` }]}
            >
              {status.text}
            </Chip>
          </View>

          <View style={styles.gameInfo}>
            <Text style={styles.gameType}>
              🏸 {game.gameType} • {game.level === 'beginner' ? '초급' : 
                                    game.level === 'intermediate' ? '중급' : 
                                    game.level === 'advanced' ? '고급' : '전문가'}
            </Text>
            <Text style={styles.gameDate}>
              📅 {new Date(game.gameDate).toLocaleDateString('ko-KR', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
            <Text style={styles.gameLocation}>
              📍 {game.location.address}
            </Text>
            <Text style={styles.gameParticipants}>
              👥 {game.participants.length}/{game.maxParticipants}명 참가
            </Text>
          </View>

          <View style={styles.gameFooter}>
            <View style={styles.feeContainer}>
              <Text style={styles.feeText}>
                참가비 {game.fee.toLocaleString()}원
              </Text>
            </View>
            
            <Button
              mode="outlined"
              compact
              onPress={() => handleJoinGame(game._id)}
              disabled={game.participants.length >= game.maxParticipants}
              style={styles.joinButton}
            >
              {game.participants.length >= game.maxParticipants ? '마감' : '참가하기'}
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const handleJoinGame = async (gameId) => {
    try {
      await gameAPI.joinGame(gameId);
      navigation.navigate('PremiumGameDetail', { gameId });
    } catch (error) {
      console.error('게임 참가 오류:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>게임을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="게임 제목, 지역으로 검색..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <SegmentedButtons
          value={filter}
          onValueChange={setFilter}
          buttons={filterOptions}
          style={styles.filterButtons}
        />
      </View>

      <FlatList
        data={filteredGames}
        renderItem={renderGameCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? '검색 결과가 없습니다' : '등록된 게임이 없습니다'}
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('GameCreate')}
              style={styles.createButton}
            >
              게임 만들기
            </Button>
          </View>
        )}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('GameCreate')}
      />
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
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    elevation: 2,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.md,
  },
  filterButtons: {
    marginBottom: theme.spacing.sm,
  },
  listContainer: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  gameCard: {
    marginBottom: theme.spacing.md,
    elevation: 2,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  statusChip: {
    marginLeft: theme.spacing.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  gameInfo: {
    marginBottom: theme.spacing.md,
  },
  gameType: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
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
  gameFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeContainer: {
    flex: 1,
  },
  feeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  joinButton: {
    borderColor: theme.colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default GamesScreen;