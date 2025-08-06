import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  Text,
  TouchableOpacity,
  Share,
  Platform,
  StatusBar,
} from 'react-native';
import { 
  Card, 
  Button, 
  Chip, 
  IconButton,
  ProgressBar,
  Badge,
  Divider,
  FAB,
  Surface
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'expo-linear-gradient';
import { newTheme } from '../../utils/newTheme';
import { getSkillLevel } from '../../utils/skillSystem';

const PremiumGameDetailScreen = ({ route, navigation }) => {
  const { gameId } = route.params || {};
  // const { user } = useAuth(); // 향후 사용자 정보 필요시 활용
  
  // 애니메이션 상태
  const [headerAnimation] = useState(new Animated.Value(0));
  const [cardAnimations] = useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]);
  const [floatingButtonAnim] = useState(new Animated.Value(0));
  const [participantAnimations] = useState({});
  
  // 화면 상태
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const [showParticipants, setShowParticipants] = useState(true); // 향후 참가자 표시 토글용
  const [activeTab, setActiveTab] = useState('info');
  
  // 가상의 게임 데이터
  const [gameData] = useState({
    id: gameId || 1,
    title: '주말 고급자 복식 토너먼트',
    type: 'tournament',
    format: 'doubles',
    skillLevel: 'advanced',
    date: '2024-08-10',
    time: '14:00',
    duration: 120,
    location: '서울 프리미엄 배드민턴센터',
    address: '서울시 강남구 테헤란로 123',
    distance: 2.1,
    creator: {
      id: 'creator1',
      name: '김프로',
      skillRating: 1650,
      avatar: '👨‍💼',
      winRate: 78,
      totalGames: 124
    },
    participants: [
      {
        id: 'p1',
        name: '이선수',
        skillRating: 1620,
        avatar: '👩‍🏫',
        position: 'doubles',
        joinedAt: '2024-08-01 10:30',
        status: 'confirmed'
      },
      {
        id: 'p2', 
        name: '박챔피언',
        skillRating: 1680,
        avatar: '👨‍⚕️',
        position: 'doubles',
        joinedAt: '2024-08-01 15:20',
        status: 'confirmed'
      },
      {
        id: 'p3',
        name: '정에이스',
        skillRating: 1595,
        avatar: '👩‍💻',
        position: 'doubles', 
        joinedAt: '2024-08-02 09:15',
        status: 'pending'
      }
    ],
    maxParticipants: 8,
    courtFee: 25000,
    isRanked: true,
    status: 'upcoming',
    description: '고급자들을 위한 치열한 복식 토너먼트입니다. 실력 향상과 좋은 경험을 함께 나누어요! 🏆',
    rules: [
      '21점 3세트 경기',
      '토너먼트 방식 진행',
      '레이팅 점수 반영',
      '우승자 상금 지급'
    ],
    equipment: ['셔틀콕 제공', '음료 무료', '타월 대여'],
    weatherInfo: {
      temperature: '26°C',
      humidity: '65%',
      condition: '맑음'
    }
  });

  useEffect(() => {
    // 진입 애니메이션 시작
    startEntranceAnimation();
    
    // 참가자 애니메이션 초기화
    gameData.participants.forEach((_, index) => {
      participantAnimations[index] = new Animated.Value(0);
    });
    
    // 참가자 순차 애니메이션
    setTimeout(() => {
      animateParticipants();
    }, 800);
    
  }, []);

  const startEntranceAnimation = () => {
    // 헤더 애니메이션
    Animated.timing(headerAnimation, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // 카드들 순차 애니메이션
    cardAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: index * 150,
        useNativeDriver: true,
      }).start();
    });

    // 플로팅 버튼 애니메이션
    Animated.timing(floatingButtonAnim, {
      toValue: 1,
      duration: 600,
      delay: 800,
      useNativeDriver: true,
    }).start();
  };

  const animateParticipants = () => {
    gameData.participants.forEach((_, index) => {
      Animated.spring(participantAnimations[index], {
        toValue: 1,
        delay: index * 100,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleJoinGame = async () => {
    if (isJoined) {
      Alert.alert(
        '게임 나가기',
        '정말로 이 게임에서 나가시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { 
            text: '나가기', 
            style: 'destructive',
            onPress: () => {
              setIsJoined(false);
              // 나가기 애니메이션
              Animated.sequence([
                Animated.timing(floatingButtonAnim, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true,
                }),
                Animated.timing(floatingButtonAnim, {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: true,
                })
              ]).start();
            }
          }
        ]
      );
      return;
    }

    setIsLoading(true);
    
    // 참가 시뮬레이션
    setTimeout(() => {
      setIsJoined(true);
      setIsLoading(false);
      
      // 성공 애니메이션
      Animated.sequence([
        Animated.spring(floatingButtonAnim, {
          toValue: 1.1,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.spring(floatingButtonAnim, {
          toValue: 1,
          tension: 100,
          useNativeDriver: true,
        })
      ]).start();
      
      Alert.alert('참가 완료!', '게임에 성공적으로 참가했습니다. 게임 시작 전까지 준비해주세요!');
    }, 1500);
  };

  const handleShareGame = async () => {
    try {
      await Share.share({
        message: `🏸 ${gameData.title}\n📅 ${gameData.date} ${gameData.time}\n📍 ${gameData.location}\n\n동배즐에서 함께 배드민턴 해요!`,
        title: '게임 공유하기'
      });
    } catch {
      // Share error handling
      Alert.alert('공유 실패', '게임 공유 중 오류가 발생했습니다.');
    }
  };

  const getSkillMatchIndicator = (participantRating) => {
    const userRating = 1350; // 현재 사용자 레이팅
    const diff = Math.abs(participantRating - userRating);
    
    if (diff <= 50) return { 
      color: '#4CAF50', 
      label: '완벽 매치', 
      icon: '🎯',
      percentage: 95 
    };
    if (diff <= 100) return { 
      color: '#8BC34A', 
      label: '좋은 매치', 
      icon: '✅',
      percentage: 80 
    };
    if (diff <= 200) return { 
      color: '#FFC107', 
      label: '도전적', 
      icon: '⚡',
      percentage: 65 
    };
    return { 
      color: '#FF5722', 
      label: '매우 도전적', 
      icon: '🔥',
      percentage: 40 
    };
  };

  const renderAnimatedCard = (children, index, style = {}) => {
    return (
      <Animated.View
        style={[
          {
            opacity: cardAnimations[index],
            transform: [{
              translateY: cardAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            }],
          },
          style
        ]}
      >
        {children}
      </Animated.View>
    );
  };

  const renderParticipantCard = (participant, index) => {
    const skillLevel = getSkillLevel(participant.skillRating);
    const matchInfo = getSkillMatchIndicator(participant.skillRating);
    const animValue = participantAnimations[index] || new Animated.Value(0);
    
    return (
      <Animated.View
        key={participant.id}
        style={[
          styles.participantCard,
          {
            opacity: animValue,
            transform: [
              {
                translateX: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-120, 0],
                }),
              },
              {
                scale: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
              {
                rotateY: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['15deg', '0deg'],
                }),
              }
            ],
          }
        ]}
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
          style={styles.participantGradient}
        >
          <View style={styles.participantInfo}>
            <View style={styles.participantAvatar}>
              <LinearGradient
                colors={['#FF6B35', '#20B2AA']}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarText}>{participant.avatar}</Text>
              </LinearGradient>
              <Badge 
                style={[styles.skillBadge, { backgroundColor: skillLevel.color }]}
                size={14}
              />
            </View>
            
            <View style={styles.participantDetails}>
              <Text style={styles.participantName}>{participant.name}</Text>
              <View style={styles.participantStats}>
                <Text style={styles.participantRating}>
                  {skillLevel.icon} {participant.skillRating}
                </Text>
                <Chip 
                  style={[styles.matchChip, { backgroundColor: matchInfo.color }]}
                  textStyle={styles.matchChipText}
                  icon={() => <Text style={styles.matchIcon}>{matchInfo.icon}</Text>}
                >
                  {matchInfo.label} {matchInfo.percentage}%
                </Chip>
              </View>
              <Text style={styles.joinTime}>
                📅 {new Date(participant.joinedAt).toLocaleDateString()} 참가
              </Text>
            </View>
            
            <View style={styles.participantStatus}>
              <Chip 
                style={[
                  styles.statusChip,
                  participant.status === 'confirmed' ? styles.confirmedChip : styles.pendingChip
                ]}
                textStyle={styles.statusChipText}
                icon={() => (
                  <Text style={styles.statusIcon}>
                    {participant.status === 'confirmed' ? '✅' : '⏳'}
                  </Text>
                )}
              >
                {participant.status === 'confirmed' ? '확정' : '대기'}
              </Chip>
              
              <TouchableOpacity 
                style={styles.messageButton}
                onPress={() => navigation.navigate('Chat', { userId: participant.id })}
              >
                <LinearGradient
                  colors={['rgba(255, 107, 53, 0.1)', 'rgba(32, 178, 170, 0.1)']}
                  style={styles.messageButtonGradient}
                >
                  <Text style={styles.messageIcon}>💬</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <View style={styles.tabContent}>
            {/* 게임 규칙 */}
            {renderAnimatedCard(
              <Card style={styles.infoCard}>
                <Card.Content style={styles.cardContent}>
                  <Text style={styles.cardTitle}>📋 게임 규칙</Text>
                  {gameData.rules.map((rule, index) => (
                    <View key={index} style={styles.ruleItem}>
                      <Text style={styles.ruleNumber}>{index + 1}</Text>
                      <Text style={styles.ruleText}>{rule}</Text>
                    </View>
                  ))}
                </Card.Content>
              </Card>,
              2
            )}
            
            {/* 제공 장비 */}
            {renderAnimatedCard(
              <Card style={styles.infoCard}>
                <Card.Content style={styles.cardContent}>
                  <Text style={styles.cardTitle}>🎾 제공 장비</Text>
                  <View style={styles.equipmentGrid}>
                    {gameData.equipment.map((item, index) => (
                      <Chip key={index} style={styles.equipmentChip} textStyle={styles.equipmentText}>
                        {item}
                      </Chip>
                    ))}
                  </View>
                </Card.Content>
              </Card>,
              3
            )}
          </View>
        );
        
      case 'participants':
        return (
          <View style={styles.tabContent}>
            {gameData.participants.map(renderParticipantCard)}
          </View>
        );
        
      case 'location':
        return (
          <View style={styles.tabContent}>
            {renderAnimatedCard(
              <Card style={styles.locationCard}>
                <Card.Content style={styles.cardContent}>
                  <Text style={styles.cardTitle}>📍 위치 정보</Text>
                  <Text style={styles.locationName}>{gameData.location}</Text>
                  <Text style={styles.locationAddress}>{gameData.address}</Text>
                  
                  <View style={styles.weatherInfo}>
                    <Text style={styles.weatherTitle}>날씨 정보</Text>
                    <View style={styles.weatherRow}>
                      <Text style={styles.weatherItem}>🌡️ {gameData.weatherInfo.temperature}</Text>
                      <Text style={styles.weatherItem}>💧 {gameData.weatherInfo.humidity}</Text>
                      <Text style={styles.weatherItem}>☀️ {gameData.weatherInfo.condition}</Text>
                    </View>
                  </View>
                  
                  <Button
                    mode="outlined"
                    onPress={() => {/* 지도 앱 열기 */}}
                    style={styles.mapButton}
                    icon="map"
                  >
                    지도에서 보기
                  </Button>
                </Card.Content>
              </Card>,
              2
            )}
          </View>
        );
        
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* 동적 헤더 */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnimation,
            transform: [{
              translateY: headerAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0],
              }),
            }],
          }
        ]}
      >
        <LinearGradient
          colors={[newTheme.colors.primary, newTheme.colors.secondary]}
          style={styles.headerGradient}
        >
          <SafeAreaView>
            <View style={styles.headerContent}>
              <View style={styles.headerTop}>
                <IconButton 
                  icon="arrow-left" 
                  iconColor="white" 
                  size={24}
                  onPress={() => navigation.goBack()}
                />
                <View style={styles.headerActions}>
                  <IconButton 
                    icon="share-variant" 
                    iconColor="white" 
                    size={20}
                    onPress={handleShareGame}
                  />
                  <IconButton 
                    icon="heart-outline" 
                    iconColor="white" 
                    size={20}
                    onPress={() => {/* 즐겨찾기 토글 */}}
                  />
                </View>
              </View>
              
              <View style={styles.headerInfo}>
                <Text style={styles.gameTitle}>{gameData.title}</Text>
                <View style={styles.gameMetaInfo}>
                  <Chip style={styles.gameTypeChip} textStyle={styles.gameTypeText}>
                    🏆 토너먼트
                  </Chip>
                  {gameData.isRanked && (
                    <Chip style={styles.rankedChip} textStyle={styles.rankedText}>
                      랭크 게임
                    </Chip>
                  )}
                </View>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>

      {/* 메인 컨텐츠 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 게임 기본 정보 카드 */}
        {renderAnimatedCard(
          <Card style={styles.mainInfoCard}>
            <Card.Content style={styles.mainCardContent}>
              <View style={styles.gameInfoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoIcon}>📅</Text>
                  <View style={styles.infoDetails}>
                    <Text style={styles.infoLabel}>날짜</Text>
                    <Text style={styles.infoValue}>{gameData.date}</Text>
                  </View>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoIcon}>⏰</Text>
                  <View style={styles.infoDetails}>
                    <Text style={styles.infoLabel}>시간</Text>
                    <Text style={styles.infoValue}>{gameData.time}</Text>
                  </View>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoIcon}>⏱️</Text>
                  <View style={styles.infoDetails}>
                    <Text style={styles.infoLabel}>소요시간</Text>
                    <Text style={styles.infoValue}>{gameData.duration}분</Text>
                  </View>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoIcon}>💰</Text>
                  <View style={styles.infoDetails}>
                    <Text style={styles.infoLabel}>참가비</Text>
                    <Text style={styles.infoValue}>
                      {Math.floor(gameData.courtFee / gameData.maxParticipants).toLocaleString()}원
                    </Text>
                  </View>
                </View>
              </View>
              
              <Divider style={styles.divider} />
              
              {/* 참가 현황 */}
              <View style={styles.participationSection}>
                <View style={styles.participationHeader}>
                  <Text style={styles.participationTitle}>참가 현황</Text>
                  <Text style={styles.participationCount}>
                    {gameData.participants.length}/{gameData.maxParticipants}명
                  </Text>
                </View>
                
                <ProgressBar 
                  progress={gameData.participants.length / gameData.maxParticipants}
                  color={newTheme.colors.primary}
                  style={styles.progressBar}
                />
                
                <Text style={styles.spotsLeft}>
                  {gameData.maxParticipants - gameData.participants.length}자리 남음
                </Text>
              </View>
            </Card.Content>
          </Card>,
          0
        )}

        {/* 주최자 정보 카드 */}
        {renderAnimatedCard(
          <Card style={styles.creatorCard}>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.cardTitle}>👑 주최자</Text>
              <View style={styles.creatorInfo}>
                <View style={styles.creatorAvatar}>
                  <Text style={styles.creatorAvatarText}>{gameData.creator.avatar}</Text>
                </View>
                <View style={styles.creatorDetails}>
                  <Text style={styles.creatorName}>{gameData.creator.name}</Text>
                  <Text style={styles.creatorRating}>
                    레이팅: {gameData.creator.skillRating} ({gameData.creator.totalGames}경기)
                  </Text>
                  <Text style={styles.creatorWinRate}>승률: {gameData.creator.winRate}%</Text>
                </View>
                <Button
                  mode="outlined"
                  compact
                  onPress={() => navigation.navigate('Chat', { userId: gameData.creator.id })}
                  style={styles.contactButton}
                >
                  연락하기
                </Button>
              </View>
            </Card.Content>
          </Card>,
          1
        )}

        {/* 탭 네비게이션 */}
        <View style={styles.tabNavigation}>
          {[
            { key: 'info', label: '정보', icon: '📋' },
            { key: 'participants', label: '참가자', icon: '👥' },
            { key: 'location', label: '위치', icon: '📍' }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                activeTab === tab.key && styles.activeTabButton
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[
                styles.tabLabel,
                activeTab === tab.key && styles.activeTabLabel
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 탭 컨텐츠 */}
        {renderTabContent()}
        
        {/* 하단 여백 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* 스마트 플로팅 액션 버튼 */}
      <Animated.View
        style={[
          styles.floatingButton,
          {
            opacity: floatingButtonAnim,
            transform: [
              {
                scale: floatingButtonAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
              },
              {
                translateY: floatingButtonAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              }
            ],
          }
        ]}
      >
        <TouchableOpacity
          onPress={handleJoinGame}
          disabled={isLoading || gameData.participants.length >= gameData.maxParticipants}
          style={styles.fabTouchable}
        >
          <LinearGradient
            colors={isJoined ? 
              ['#4CAF50', '#2E7D32', '#1B5E20'] : 
              [newTheme.colors.primary, newTheme.colors.secondary, '#FF4500']
            }
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.fabContent}>
              <Text style={styles.fabIcon}>
                {isLoading ? '⏳' : isJoined ? '✅' : '🚀'}
              </Text>
              <View style={styles.fabTextContainer}>
                <Text style={styles.fabText}>
                  {isLoading ? '처리중...' : isJoined ? '참가중' : '참가하기'}
                </Text>
                {!isJoined && !isLoading && (
                  <Text style={styles.fabSubtext}>
                    {Math.floor(gameData.courtFee / gameData.maxParticipants).toLocaleString()}원
                  </Text>
                )}
              </View>
              {!isJoined && !isLoading && (
                <Text style={styles.fabArrow}>→</Text>
              )}
            </View>
            
            {/* 펄스 효과 */}
            {!isJoined && (
              <Animated.View
                style={[
                  styles.pulseEffect,
                  {
                    opacity: floatingButtonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.3],
                    }),
                  }
                ]}
              />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
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
    zIndex: 1000,
  },
  headerGradient: {
    paddingBottom: newTheme.spacing.lg,
  },
  headerContent: {
    paddingHorizontal: newTheme.spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerInfo: {
    marginTop: newTheme.spacing.sm,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: newTheme.colors.text.inverse,
    marginBottom: newTheme.spacing.sm,
  },
  gameMetaInfo: {
    flexDirection: 'row',
    gap: newTheme.spacing.sm,
  },
  gameTypeChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  gameTypeText: {
    color: newTheme.colors.text.inverse,
    fontSize: 12,
    fontWeight: 'bold',
  },
  rankedChip: {
    backgroundColor: '#FFD700',
  },
  rankedText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // 컨텐츠
  content: {
    flex: 1,
    paddingHorizontal: newTheme.spacing.lg,
    marginTop: -newTheme.spacing.md,
  },

  // 메인 정보 카드
  mainInfoCard: {
    marginBottom: newTheme.spacing.lg,
    ...newTheme.shadows.md,
    borderRadius: newTheme.borderRadius.xl,
  },
  mainCardContent: {
    padding: newTheme.spacing.xl,
  },
  gameInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: newTheme.spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: newTheme.spacing.md,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: newTheme.spacing.sm,
  },
  infoDetails: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: newTheme.colors.text.secondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: newTheme.colors.text.primary,
  },
  divider: {
    marginVertical: newTheme.spacing.lg,
    backgroundColor: '#E0E0E0',
  },
  participationSection: {
    alignItems: 'center',
  },
  participationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: newTheme.spacing.sm,
  },
  participationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: newTheme.colors.text.primary,
  },
  participationCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: newTheme.colors.primary,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginBottom: newTheme.spacing.sm,
  },
  spotsLeft: {
    fontSize: 14,
    color: newTheme.colors.text.secondary,
  },

  // 주최자 카드
  creatorCard: {
    marginBottom: newTheme.spacing.lg,
    ...newTheme.shadows.sm,
    borderRadius: newTheme.borderRadius.lg,
  },
  cardContent: {
    padding: newTheme.spacing.lg,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: newTheme.colors.text.primary,
    marginBottom: newTheme.spacing.md,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: newTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: newTheme.spacing.md,
  },
  creatorAvatarText: {
    fontSize: 24,
  },
  creatorDetails: {
    flex: 1,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: newTheme.colors.text.primary,
    marginBottom: 2,
  },
  creatorRating: {
    fontSize: 14,
    color: newTheme.colors.text.secondary,
    marginBottom: 2,
  },
  creatorWinRate: {
    fontSize: 14,
    color: newTheme.colors.success,
    fontWeight: '600',
  },
  contactButton: {
    borderColor: newTheme.colors.primary,
  },

  // 탭 네비게이션
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: newTheme.colors.surface.light,
    borderRadius: newTheme.borderRadius.lg,
    padding: 4,
    marginBottom: newTheme.spacing.lg,
    ...newTheme.shadows.sm,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: newTheme.spacing.md,
    borderRadius: newTheme.borderRadius.md,
  },
  activeTabButton: {
    backgroundColor: newTheme.colors.primary,
  },
  tabIcon: {
    fontSize: 16,
    marginRight: newTheme.spacing.xs,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: newTheme.colors.text.secondary,
  },
  activeTabLabel: {
    color: newTheme.colors.text.inverse,
  },

  // 탭 컨텐츠
  tabContent: {
    gap: newTheme.spacing.lg,
  },

  // 정보 탭
  infoCard: {
    ...newTheme.shadows.sm,
    borderRadius: newTheme.borderRadius.lg,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: newTheme.spacing.sm,
  },
  ruleNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: newTheme.colors.primary,
    color: newTheme.colors.text.inverse,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: newTheme.spacing.md,
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    color: newTheme.colors.text.primary,
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: newTheme.spacing.sm,
  },
  equipmentChip: {
    backgroundColor: newTheme.colors.surface.light,
  },
  equipmentText: {
    fontSize: 12,
    color: newTheme.colors.text.primary,
  },

  // 참가자 카드
  participantCard: {
    borderRadius: newTheme.borderRadius.xl,
    marginBottom: newTheme.spacing.lg,
    overflow: 'hidden',
    ...newTheme.shadows.md,
  },
  participantGradient: {
    padding: newTheme.spacing.lg,
    borderRadius: newTheme.borderRadius.xl,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAvatar: {
    position: 'relative',
    marginRight: newTheme.spacing.md,
  },
  avatarGradient: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
    ...newTheme.shadows.sm,
  },
  avatarText: {
    fontSize: 26,
    color: '#FFFFFF',
  },
  skillBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: newTheme.colors.text.primary,
    marginBottom: 6,
  },
  participantStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: newTheme.spacing.sm,
    marginBottom: 6,
  },
  participantRating: {
    fontSize: 14,
    color: newTheme.colors.primary,
    fontWeight: '600',
  },
  matchChip: {
    height: 26,
    borderRadius: 13,
  },
  matchChipText: {
    fontSize: 10,
    color: newTheme.colors.text.inverse,
    fontWeight: 'bold',
  },
  matchIcon: {
    fontSize: 10,
    marginRight: 2,
  },
  joinTime: {
    fontSize: 12,
    color: newTheme.colors.text.secondary,
  },
  participantStatus: {
    alignItems: 'center',
    gap: newTheme.spacing.sm,
  },
  statusChip: {
    height: 24,
    borderRadius: 12,
  },
  confirmedChip: {
    backgroundColor: newTheme.colors.success,
  },
  pendingChip: {
    backgroundColor: '#FFC107',
  },
  statusChipText: {
    fontSize: 10,
    color: newTheme.colors.text.inverse,
    fontWeight: 'bold',
  },
  statusIcon: {
    fontSize: 10,
    marginRight: 2,
  },
  messageButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  messageButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageIcon: {
    fontSize: 16,
  },

  // 위치 탭
  locationCard: {
    ...newTheme.shadows.sm,
    borderRadius: newTheme.borderRadius.lg,
  },
  locationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: newTheme.colors.text.primary,
    marginBottom: newTheme.spacing.xs,
  },
  locationAddress: {
    fontSize: 14,
    color: newTheme.colors.text.secondary,
    marginBottom: newTheme.spacing.lg,
  },
  weatherInfo: {
    backgroundColor: newTheme.colors.surface.light,
    borderRadius: newTheme.borderRadius.md,
    padding: newTheme.spacing.md,
    marginBottom: newTheme.spacing.lg,
  },
  weatherTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: newTheme.colors.text.primary,
    marginBottom: newTheme.spacing.sm,
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weatherItem: {
    fontSize: 14,
    color: newTheme.colors.text.secondary,
  },
  mapButton: {
    borderColor: newTheme.colors.primary,
  },

  // 플로팅 버튼
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  fabTouchable: {
    borderRadius: 30,
    overflow: 'hidden',
    ...newTheme.shadows.lg,
  },
  fabGradient: {
    paddingVertical: newTheme.spacing.lg,
    paddingHorizontal: newTheme.spacing.xl,
    borderRadius: 30,
    position: 'relative',
  },
  fabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 24,
    marginRight: newTheme.spacing.md,
  },
  fabTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  fabText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: newTheme.colors.text.inverse,
  },
  fabSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginTop: 2,
  },
  fabArrow: {
    fontSize: 20,
    color: newTheme.colors.text.inverse,
    marginLeft: newTheme.spacing.md,
    fontWeight: 'bold',
  },
  pulseEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 40,
    backgroundColor: newTheme.colors.primary,
  },
  fab: {
    backgroundColor: 'transparent',
    elevation: 0,
  },

  // 기타
  bottomSpacing: {
    height: 100,
  },
});

export default PremiumGameDetailScreen;
