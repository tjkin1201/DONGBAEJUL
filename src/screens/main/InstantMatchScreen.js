import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  Text,
} from 'react-native';
import { Card, Button, Chip, FAB, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'expo-linear-gradient';
import { useAuth } from '../../context/SimpleAuthContext';
import newTheme from '../../utils/newTheme';
import { 
  findSuitableOpponents, 
  getSkillLevel,
  calculateSkillDifference 
} from '../../utils/skillSystem';

const InstantMatchScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [isSearching, setIsSearching] = useState(false);
  const [matchFound, setMatchFound] = useState(null);
  const [searchAnimation] = useState(new Animated.Value(0));
  const [availableOpponents, setAvailableOpponents] = useState([]);
  const [userProfile] = useState({
    skillRating: 1350,
    preferredPosition: 'doubles',
    location: '서울시 강남구',
    playStyle: 'balanced'
  });

  // 검색 애니메이션
  useEffect(() => {
    if (isSearching) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(searchAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(searchAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      searchAnimation.setValue(0);
    }
  }, [isSearching, searchAnimation]);

  // 상대방 찾기 시뮬레이션
  const startSearch = () => {
    setIsSearching(true);
    setMatchFound(null);

    // 가상의 온라인 사용자들
    const mockUsers = [
      { id: 1, name: '김철수', skillRating: 1340, location: '서울시 강남구', distance: 0.8, avatar: '👨' },
      { id: 2, name: '이영희', skillRating: 1370, location: '서울시 서초구', distance: 2.1, avatar: '👩' },
      { id: 3, name: '박민수', skillRating: 1320, location: '서울시 강남구', distance: 1.5, avatar: '👨' },
      { id: 4, name: '정수진', skillRating: 1385, location: '서울시 송파구', distance: 3.2, avatar: '👩' },
      { id: 5, name: '김영호', skillRating: 1330, location: '서울시 강남구', distance: 1.1, avatar: '👨' },
    ];

    // 적합한 상대방 찾기
    const suitableOpponents = findSuitableOpponents(userProfile, mockUsers);
    setAvailableOpponents(suitableOpponents.slice(0, 3));

    // 3초 후 매칭 완료
    setTimeout(() => {
      setIsSearching(false);
      if (suitableOpponents.length > 0) {
        setMatchFound(suitableOpponents[0]);
      } else {
        Alert.alert('매칭 실패', '현재 적합한 상대방을 찾을 수 없습니다.');
      }
    }, 3000);
  };

  const cancelSearch = () => {
    setIsSearching(false);
    setMatchFound(null);
  };

  const acceptMatch = () => {
    Alert.alert(
      '게임 요청', 
      `${matchFound.name}님과의 게임을 시작하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '확인', 
          onPress: () => {
            navigation.navigate('GameDetail', { opponent: matchFound });
          }
        }
      ]
    );
  };

  const declineMatch = () => {
    setMatchFound(null);
    setAvailableOpponents(prev => prev.slice(1));
  };

  const searchScale = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const searchOpacity = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  const renderOpponentCard = (opponent, index) => {
    const skillLevel = getSkillLevel(opponent.skillRating);
    const skillDiff = calculateSkillDifference(userProfile.skillRating, opponent.skillRating);

    return (
      <Card key={opponent.id} style={[styles.opponentCard, { marginTop: index * 10 }]}>
        <Card.Content style={styles.opponentContent}>
          <View style={styles.opponentHeader}>
            <View style={styles.opponentInfo}>
              <Text style={styles.opponentAvatar}>{opponent.avatar}</Text>
              <View style={styles.opponentDetails}>
                <Text style={styles.opponentName}>{opponent.name}</Text>
                <View style={styles.opponentSkill}>
                  <Text style={styles.skillIcon}>{skillLevel.icon}</Text>
                  <Text style={styles.skillText}>{skillLevel.level} ({opponent.skillRating})</Text>
                </View>
                <Text style={styles.locationText}>📍 {opponent.location} ({opponent.distance}km)</Text>
              </View>
            </View>
            
            <View style={styles.matchInfo}>
              <Chip 
                style={[
                  styles.difficultyChip,
                  skillDiff.difficulty === 'easy' ? styles.easyChip :
                  skillDiff.difficulty === 'balanced' ? styles.balancedChip :
                  styles.hardChip
                ]}
                textStyle={styles.chipText}
              >
                {skillDiff.difficulty === 'easy' ? '수월함' :
                 skillDiff.difficulty === 'balanced' ? '균형' :
                 '도전적'}
              </Chip>
              <Text style={styles.winChance}>승률 {skillDiff.winProbability}%</Text>
            </View>
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
            <Text style={styles.headerTitle}>인스턴트 매칭</Text>
            <Text style={styles.headerSubtitle}>실시간으로 상대방을 찾아보세요</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 사용자 정보 카드 */}
        <Card style={styles.userCard}>
          <Card.Content style={styles.userContent}>
            <Text style={styles.sectionTitle}>내 정보</Text>
            <View style={styles.userInfo}>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user?.name || '사용자'}</Text>
                <Text style={styles.userSkill}>
                  {getSkillLevel(userProfile.skillRating).icon} {getSkillLevel(userProfile.skillRating).level}
                </Text>
                <Text style={styles.userLocation}>📍 {userProfile.location}</Text>
              </View>
              <View style={styles.userPreferences}>
                <Chip style={styles.preferenceChip} textStyle={styles.chipText}>
                  {userProfile.preferredPosition === 'singles' ? '단식' : '복식'}
                </Chip>
                <Chip style={styles.preferenceChip} textStyle={styles.chipText}>
                  {userProfile.playStyle === 'aggressive' ? '공격적' : 
                   userProfile.playStyle === 'defensive' ? '수비적' : '균형잡힌'}
                </Chip>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* 검색 상태 */}
        {isSearching && (
          <Card style={styles.searchCard}>
            <Card.Content style={styles.searchContent}>
              <Animated.View 
                style={[
                  styles.searchIndicator,
                  {
                    transform: [{ scale: searchScale }],
                    opacity: searchOpacity,
                  }
                ]}
              >
                <Text style={styles.searchIcon}>🏸</Text>
              </Animated.View>
              <Text style={styles.searchTitle}>상대방을 찾는 중...</Text>
              <Text style={styles.searchSubtitle}>최적의 상대방을 매칭하고 있습니다</Text>
              
              <Button
                mode="outlined"
                onPress={cancelSearch}
                style={styles.cancelButton}
                labelStyle={styles.cancelButtonText}
              >
                검색 취소
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* 매칭 결과 */}
        {matchFound && (
          <Card style={styles.matchCard}>
            <Card.Content style={styles.matchContent}>
              <Text style={styles.matchTitle}>🎯 매칭 완료!</Text>
              {renderOpponentCard(matchFound, 0)}
              
              <View style={styles.matchActions}>
                <Button
                  mode="contained"
                  onPress={acceptMatch}
                  style={styles.acceptButton}
                  labelStyle={styles.acceptButtonText}
                  icon="check"
                >
                  게임 시작
                </Button>
                <Button
                  mode="outlined"
                  onPress={declineMatch}
                  style={styles.declineButton}
                  labelStyle={styles.declineButtonText}
                  icon="close"
                >
                  거절
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* 대기 중인 상대방들 */}
        {!isSearching && !matchFound && availableOpponents.length > 0 && (
          <Card style={styles.availableCard}>
            <Card.Content style={styles.availableContent}>
              <Text style={styles.sectionTitle}>온라인 상대방</Text>
              <Text style={styles.sectionSubtitle}>현재 게임을 찾고 있는 플레이어들</Text>
              
              {availableOpponents.map((opponent, index) => renderOpponentCard(opponent, index))}
            </Card.Content>
          </Card>
        )}

        {/* 매칭 설정 */}
        <Card style={styles.settingsCard}>
          <Card.Content style={styles.settingsContent}>
            <Text style={styles.sectionTitle}>매칭 설정</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>검색 범위</Text>
              <View style={styles.settingOptions}>
                <Chip style={styles.settingChip} textStyle={styles.chipText}>5km 이내</Chip>
                <IconButton icon="chevron-right" size={16} />
              </View>
            </View>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>실력 차이</Text>
              <View style={styles.settingOptions}>
                <Chip style={styles.settingChip} textStyle={styles.chipText}>±100 레이팅</Chip>
                <IconButton icon="chevron-right" size={16} />
              </View>
            </View>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>게임 형식</Text>
              <View style={styles.settingOptions}>
                <Chip style={styles.settingChip} textStyle={styles.chipText}>복식 우선</Chip>
                <IconButton icon="chevron-right" size={16} />
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* 플로팅 검색 버튼 */}
      {!isSearching && !matchFound && (
        <FAB
          style={styles.searchFab}
          icon="magnify"
          label="상대방 찾기"
          onPress={startSearch}
        />
      )}
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
    paddingBottom: newTheme.spacing.xl,
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
    padding: newTheme.spacing.lg,
  },

  // 사용자 카드
  userCard: {
    marginBottom: newTheme.spacing.lg,
    ...newTheme.shadows.sm,
  },
  userContent: {
    padding: newTheme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: newTheme.colors.text.primary,
    marginBottom: newTheme.spacing.md,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: newTheme.colors.text.secondary,
    marginBottom: newTheme.spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: newTheme.colors.text.primary,
    marginBottom: 4,
  },
  userSkill: {
    fontSize: 16,
    color: newTheme.colors.primary,
    marginBottom: 4,
  },
  userLocation: {
    fontSize: 14,
    color: newTheme.colors.text.secondary,
  },
  userPreferences: {
    alignItems: 'flex-end',
    gap: newTheme.spacing.sm,
  },
  preferenceChip: {
    backgroundColor: newTheme.colors.surface.light,
  },

  // 검색 카드
  searchCard: {
    marginBottom: newTheme.spacing.lg,
    backgroundColor: newTheme.colors.primary,
    ...newTheme.shadows.md,
  },
  searchContent: {
    padding: newTheme.spacing.xl,
    alignItems: 'center',
  },
  searchIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: newTheme.spacing.lg,
  },
  searchIcon: {
    fontSize: 40,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: newTheme.colors.text.inverse,
    marginBottom: 8,
  },
  searchSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: newTheme.spacing.lg,
  },
  cancelButton: {
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  cancelButtonText: {
    color: newTheme.colors.text.inverse,
  },

  // 매칭 카드
  matchCard: {
    marginBottom: newTheme.spacing.lg,
    backgroundColor: newTheme.colors.success,
    ...newTheme.shadows.md,
  },
  matchContent: {
    padding: newTheme.spacing.lg,
  },
  matchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: newTheme.colors.text.inverse,
    textAlign: 'center',
    marginBottom: newTheme.spacing.lg,
  },
  matchActions: {
    flexDirection: 'row',
    gap: newTheme.spacing.md,
    marginTop: newTheme.spacing.lg,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: newTheme.colors.text.inverse,
  },
  acceptButtonText: {
    color: newTheme.colors.success,
    fontWeight: 'bold',
  },
  declineButton: {
    flex: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  declineButtonText: {
    color: newTheme.colors.text.inverse,
  },

  // 대기 상대방 카드
  availableCard: {
    marginBottom: newTheme.spacing.lg,
    ...newTheme.shadows.sm,
  },
  availableContent: {
    padding: newTheme.spacing.lg,
  },

  // 상대방 카드
  opponentCard: {
    backgroundColor: newTheme.colors.surface.light,
    marginBottom: newTheme.spacing.md,
    ...newTheme.shadows.xs,
  },
  opponentContent: {
    padding: newTheme.spacing.md,
  },
  opponentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  opponentInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  opponentAvatar: {
    fontSize: 40,
    marginRight: newTheme.spacing.md,
  },
  opponentDetails: {
    flex: 1,
  },
  opponentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: newTheme.colors.text.primary,
    marginBottom: 4,
  },
  opponentSkill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  skillIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  skillText: {
    fontSize: 14,
    color: newTheme.colors.primary,
  },
  locationText: {
    fontSize: 12,
    color: newTheme.colors.text.secondary,
  },
  matchInfo: {
    alignItems: 'flex-end',
  },
  difficultyChip: {
    marginBottom: 4,
  },
  easyChip: {
    backgroundColor: '#E8F5E8',
  },
  balancedChip: {
    backgroundColor: '#FFF3E0',
  },
  hardChip: {
    backgroundColor: '#FFEBEE',
  },
  winChance: {
    fontSize: 12,
    color: newTheme.colors.text.secondary,
  },

  // 설정 카드
  settingsCard: {
    marginBottom: newTheme.spacing.xl,
    ...newTheme.shadows.sm,
  },
  settingsContent: {
    padding: newTheme.spacing.lg,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: newTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLabel: {
    fontSize: 16,
    color: newTheme.colors.text.primary,
  },
  settingOptions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingChip: {
    backgroundColor: newTheme.colors.surface.light,
  },

  // 공통 스타일
  chipText: {
    fontSize: 12,
  },

  // FAB
  searchFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: newTheme.colors.primary,
  },
});

export default InstantMatchScreen;
