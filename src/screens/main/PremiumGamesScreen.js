import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Text,
} from 'react-native';
import { 
  Card, 
  Button, 
  Chip, 
  FAB, 
  Searchbar,
  SegmentedButtons,
  Menu,
  IconButton
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'expo-linear-gradient';
import { useAuth } from '../../context/SimpleAuthContext';
import newTheme from '../../utils/newTheme';

const PremiumGamesScreen = ({ navigation }) => {
  const { user } = useAuth();  // 사용자 정보 (게임 생성 시 필요)
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [gameFilter, setGameFilter] = useState('all');
  const [skillFilter] = useState('all');
  const [distanceFilter] = useState('all');
  const [games, setGames] = useState([]);

  const filterOptions = [
    { value: 'all', label: '전체' },
    { value: 'upcoming', label: '예정된 게임' },
    { value: 'ongoing', label: '진행중' },
    { value: 'completed', label: '완료된 게임' },
  ];

  // 가상의 게임 데이터
  const mockGames = [
    {
      id: 1,
      title: '주말 복식 게임',
      type: 'casual',
      format: 'doubles',
      skillLevel: 'intermediate',
      date: '2024-08-10',
      time: '14:00',
      location: '서울배드민턴센터',
      distance: 2.1,
      creator: '김철수',
      participants: 3,
      maxParticipants: 4,
      courtFee: 15000,
      isRanked: false,
      status: 'upcoming',
      description: '즐거운 주말 복식 게임! 초보자도 환영합니다.'
    },
    {
      id: 2,
      title: '고급자 단식 경기',
      type: 'tournament',
      format: 'singles',
      skillLevel: 'advanced',
      date: '2024-08-12',
      time: '19:00',
      location: '강남스포츠센터',
      distance: 5.3,
      creator: '이영희',
      participants: 7,
      maxParticipants: 8,
      courtFee: 20000,
      isRanked: true,
      status: 'upcoming',
      description: '고급자들의 치열한 단식 토너먼트'
    },
    {
      id: 3,
      title: '저녁 연습게임',
      type: 'training',
      format: 'doubles',
      skillLevel: 'beginner',
      date: '2024-08-08',
      time: '20:00',
      location: '동네체육관',
      distance: 1.2,
      creator: '박민수',
      participants: 4,
      maxParticipants: 6,
      courtFee: 8000,
      isRanked: false,
      status: 'ongoing',
      description: '기초 실력 향상을 위한 연습 게임'
    },
    {
      id: 4,
      title: '오전 혼합복식',
      type: 'casual',
      format: 'mixed',
      skillLevel: 'all',
      date: '2024-08-07',
      time: '10:00',
      location: '시민체육관',
      distance: 3.8,
      creator: '정수진',
      participants: 4,
      maxParticipants: 4,
      courtFee: 12000,
      isRanked: false,
      status: 'completed',
      description: '남녀 혼합 복식 게임 완료'
    },
  ];

  useEffect(() => {
    loadGames();
  }, [gameFilter, skillFilter, distanceFilter]);

  const loadGames = () => {
    // 필터 적용된 게임 목록 로드
    let filteredGames = mockGames;

    if (gameFilter !== 'all') {
      filteredGames = filteredGames.filter(game => game.status === gameFilter);
    }

    if (skillFilter !== 'all') {
      filteredGames = filteredGames.filter(game => 
        game.skillLevel === skillFilter || game.skillLevel === 'all'
      );
    }

    if (distanceFilter !== 'all') {
      const maxDistance = distanceFilter === 'near' ? 3 : distanceFilter === 'medium' ? 10 : 50;
      filteredGames = filteredGames.filter(game => game.distance <= maxDistance);
    }

    if (searchQuery) {
      filteredGames = filteredGames.filter(game =>
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.creator.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setGames(filteredGames);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadGames();
      setRefreshing(false);
    }, 1000);
  };

  const getGameTypeIcon = (type) => {
    switch (type) {
      case 'casual': return '🏸';
      case 'tournament': return '🏆';
      case 'training': return '📚';
      default: return '🏸';
    }
  };

  const getGameTypeLabel = (type) => {
    switch (type) {
      case 'casual': return '캐주얼';
      case 'tournament': return '토너먼트';
      case 'training': return '연습';
      default: return type;
    }
  };

  const getFormatLabel = (format) => {
    switch (format) {
      case 'singles': return '단식';
      case 'doubles': return '복식';
      case 'mixed': return '혼복';
      default: return format;
    }
  };

  const getSkillLevelLabel = (level) => {
    switch (level) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
      case 'all': return '모든레벨';
      default: return level;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return newTheme.colors.primary;
      case 'ongoing': return newTheme.colors.success;
      case 'completed': return '#757575';
      default: return newTheme.colors.primary;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'upcoming': return '예정';
      case 'ongoing': return '진행중';
      case 'completed': return '완료';
      default: return status;
    }
  };

  const handleJoinGame = (gameId) => {
    navigation.navigate('GameDetail', { gameId });
  };

  const handleCreateGame = () => {
    navigation.navigate('PremiumGameCreate');
  };

  const renderGameCard = (game) => {
    const isFull = game.participants >= game.maxParticipants;
    const isCompleted = game.status === 'completed';
    
    return (
      <Card key={game.id} style={styles.gameCard}>
        <Card.Content style={styles.gameContent}>
          {/* 게임 헤더 */}
          <View style={styles.gameHeader}>
            <View style={styles.gameTitle}>
              <Text style={styles.gameTitleIcon}>{getGameTypeIcon(game.type)}</Text>
              <Text style={styles.gameTitleText}>{game.title}</Text>
              {game.isRanked && (
                <Chip style={styles.rankedChip} textStyle={styles.rankedChipText}>
                  랭크
                </Chip>
              )}
            </View>
            <Chip 
              style={[styles.statusChip, { backgroundColor: getStatusColor(game.status) }]}
              textStyle={styles.statusChipText}
            >
              {getStatusLabel(game.status)}
            </Chip>
          </View>

          {/* 게임 정보 */}
          <View style={styles.gameInfo}>
            <View style={styles.gameInfoRow}>
              <Text style={styles.gameInfoIcon}>📅</Text>
              <Text style={styles.gameInfoText}>{game.date} {game.time}</Text>
            </View>
            <View style={styles.gameInfoRow}>
              <Text style={styles.gameInfoIcon}>📍</Text>
              <Text style={styles.gameInfoText}>{game.location} ({game.distance}km)</Text>
            </View>
            <View style={styles.gameInfoRow}>
              <Text style={styles.gameInfoIcon}>👥</Text>
              <Text style={styles.gameInfoText}>
                {game.participants}/{game.maxParticipants}명 · {getFormatLabel(game.format)}
              </Text>
            </View>
            <View style={styles.gameInfoRow}>
              <Text style={styles.gameInfoIcon}>💰</Text>
              <Text style={styles.gameInfoText}>
                {game.courtFee.toLocaleString()}원 ({Math.floor(game.courtFee / game.maxParticipants).toLocaleString()}원/인)
              </Text>
            </View>
          </View>

          {/* 게임 태그들 */}
          <View style={styles.gameTags}>
            <Chip style={styles.gameTag} textStyle={styles.gameTagText}>
              {getGameTypeLabel(game.type)}
            </Chip>
            <Chip style={styles.gameTag} textStyle={styles.gameTagText}>
              {getSkillLevelLabel(game.skillLevel)}
            </Chip>
            {game.distance <= 3 && (
              <Chip style={[styles.gameTag, styles.nearTag]} textStyle={styles.gameTagText}>
                가까움
              </Chip>
            )}
          </View>

          {/* 게임 설명 */}
          {game.description && (
            <Text style={styles.gameDescription}>{game.description}</Text>
          )}

          {/* 액션 버튼 */}
          <View style={styles.gameActions}>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('PremiumGameDetail', { gameId: game.id })}
              style={styles.detailButton}
              labelStyle={styles.detailButtonText}
              icon="information"
            >
              상세보기
            </Button>
            
            {!isCompleted && (
              <Button
                mode="contained"
                onPress={() => handleJoinGame(game.id)}
                style={[
                  styles.joinButton,
                  isFull && styles.joinButtonDisabled
                ]}
                labelStyle={styles.joinButtonText}
                disabled={isFull}
                icon={isFull ? "account-off" : "account-plus"}
              >
                {isFull ? '마감' : '참가하기'}
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[newTheme.colors.primary, newTheme.colors.secondary]}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>게임 찾기</Text>
            <Text style={styles.headerSubtitle}>배드민턴 게임에 참가하세요</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.content}>
        {/* 검색 및 필터 */}
        <View style={styles.searchSection}>
          <Searchbar
            placeholder="게임, 장소, 주최자 검색..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            inputStyle={styles.searchInput}
          />
          
          <Menu
            visible={filterMenuVisible}
            onDismiss={() => setFilterMenuVisible(false)}
            anchor={
              <IconButton
                icon="tune"
                size={24}
                onPress={() => setFilterMenuVisible(true)}
                style={styles.filterButton}
              />
            }
          >
            <Menu.Item onPress={() => {}} title="거리 필터" />
            <Menu.Item onPress={() => {}} title="실력 필터" />
            <Menu.Item onPress={() => {}} title="게임 타입" />
          </Menu>
        </View>

        {/* 게임 상태 필터 */}
        <View style={styles.filterSection}>
          <SegmentedButtons
            value={gameFilter}
            onValueChange={setGameFilter}
            buttons={filterOptions}
            style={styles.segmentedButtons}
          />
        </View>

        {/* 게임 목록 */}
        <ScrollView
          style={styles.gamesList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[newTheme.colors.primary]}
            />
          }
        >
          {games.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Text style={styles.emptyIcon}>🏸</Text>
                <Text style={styles.emptyTitle}>게임이 없습니다</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery ? '검색 조건을 바꿔보세요' : '새로운 게임을 만들어보세요!'}
                </Text>
                {!searchQuery && (
                  <Button
                    mode="contained"
                    onPress={handleCreateGame}
                    style={styles.createGameButton}
                    labelStyle={styles.createGameButtonText}
                    icon="plus"
                  >
                    게임 만들기
                  </Button>
                )}
              </Card.Content>
            </Card>
          ) : (
            games.map(renderGameCard)
          )}
        </ScrollView>
      </View>

      {/* 플로팅 액션 버튼 */}
      <FAB
        style={styles.fab}
        icon="plus"
        label="게임 만들기"
        onPress={handleCreateGame}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: newTheme.colors.background.light,
  },
  
  // 헤더
  header: {
    paddingBottom: newTheme.spacing.lg,
  },
  headerContent: {
    paddingHorizontal: newTheme.spacing.lg,
    paddingTop: newTheme.spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: newTheme.colors.text.inverse,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },

  // 컨텐츠
  content: {
    flex: 1,
  },

  // 검색 섹션
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: newTheme.spacing.lg,
    paddingBottom: newTheme.spacing.md,
    gap: newTheme.spacing.sm,
  },
  searchbar: {
    flex: 1,
    backgroundColor: newTheme.colors.surface.light,
    elevation: 2,
  },
  searchInput: {
    fontSize: 16,
  },
  filterButton: {
    backgroundColor: newTheme.colors.surface.light,
    margin: 0,
  },

  // 필터 섹션
  filterSection: {
    paddingHorizontal: newTheme.spacing.lg,
    paddingBottom: newTheme.spacing.md,
  },
  segmentedButtons: {
    backgroundColor: newTheme.colors.surface.light,
  },

  // 게임 목록
  gamesList: {
    flex: 1,
    paddingHorizontal: newTheme.spacing.lg,
  },

  // 게임 카드
  gameCard: {
    marginBottom: newTheme.spacing.lg,
    ...newTheme.shadows.sm,
  },
  gameContent: {
    padding: newTheme.spacing.lg,
  },

  // 게임 헤더
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: newTheme.spacing.md,
  },
  gameTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: newTheme.spacing.md,
  },
  gameTitleIcon: {
    fontSize: 20,
    marginRight: newTheme.spacing.sm,
  },
  gameTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: newTheme.colors.text.primary,
    flex: 1,
  },
  rankedChip: {
    backgroundColor: '#FFD700',
    marginLeft: newTheme.spacing.sm,
  },
  rankedChipText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  statusChip: {
    minWidth: 60,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: newTheme.colors.text.inverse,
  },

  // 게임 정보
  gameInfo: {
    marginBottom: newTheme.spacing.md,
  },
  gameInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  gameInfoIcon: {
    fontSize: 14,
    width: 20,
    marginRight: newTheme.spacing.sm,
  },
  gameInfoText: {
    fontSize: 14,
    color: newTheme.colors.text.secondary,
    flex: 1,
  },

  // 게임 태그
  gameTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: newTheme.spacing.sm,
    marginBottom: newTheme.spacing.md,
  },
  gameTag: {
    backgroundColor: newTheme.colors.surface.light,
    height: 28,
  },
  gameTagText: {
    fontSize: 12,
    color: newTheme.colors.text.primary,
  },
  nearTag: {
    backgroundColor: '#E8F5E8',
  },

  // 게임 설명
  gameDescription: {
    fontSize: 14,
    color: newTheme.colors.text.secondary,
    fontStyle: 'italic',
    marginBottom: newTheme.spacing.md,
    lineHeight: 20,
  },

  // 액션 버튼
  gameActions: {
    flexDirection: 'row',
    gap: newTheme.spacing.md,
  },
  detailButton: {
    flex: 1,
    borderColor: newTheme.colors.primary,
  },
  detailButtonText: {
    color: newTheme.colors.primary,
    fontSize: 14,
  },
  joinButton: {
    flex: 1,
    backgroundColor: newTheme.colors.primary,
  },
  joinButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  joinButtonText: {
    color: newTheme.colors.text.inverse,
    fontSize: 14,
    fontWeight: 'bold',
  },

  // 빈 상태
  emptyCard: {
    marginTop: newTheme.spacing.xl,
    ...newTheme.shadows.sm,
  },
  emptyContent: {
    padding: newTheme.spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: newTheme.spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: newTheme.colors.text.primary,
    marginBottom: newTheme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: 16,
    color: newTheme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: newTheme.spacing.lg,
  },
  createGameButton: {
    backgroundColor: newTheme.colors.primary,
  },
  createGameButtonText: {
    color: newTheme.colors.text.inverse,
    fontWeight: 'bold',
  },

  // FAB
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: newTheme.colors.primary,
  },
});

export default PremiumGamesScreen;
