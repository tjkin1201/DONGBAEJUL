import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Share } from 'react-native';
import { 
  Text, 
  Card, 
  Avatar, 
  Button, 
  Chip, 
  List,
  Divider,
  Surface,
  IconButton,
  ActivityIndicator,
  ProgressBar,
  Dialog,
  Portal
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { gameAPI, clubAPI } from '../../services/api';
import theme from '../../utils/theme';

const GameDetailScreen = ({ route, navigation }) => {
  const { gameId } = route.params;
  const { user } = useAuth();
  const { socket } = useSocket();
  const [game, setGame] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  useEffect(() => {
    loadGameDetails();
    
    // Socket 이벤트 리스너
    if (socket) {
      socket.emit('join_game_room', { gameId });
      
      socket.on('game:participant_joined', handleParticipantJoined);
      socket.on('game:participant_left', handleParticipantLeft);
      socket.on('game:updated', handleGameUpdated);

      return () => {
        socket.emit('leave_room', { roomId: `game_${gameId}` });
        socket.off('game:participant_joined');
        socket.off('game:participant_left');
        socket.off('game:updated');
      };
    }
  }, [gameId, socket]);

  const loadGameDetails = async () => {
    try {
      setIsLoading(true);
      const response = await gameAPI.getGameById(gameId);
      const gameData = response.data.data;
      
      setGame(gameData);
      setParticipants(gameData.participants || []);
      setIsParticipant(gameData.participants?.some(p => p._id === user.id) || false);
    } catch (error) {
      console.error('게임 상세 정보 로드 오류:', error);
      Alert.alert('오류', '게임 정보를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleParticipantJoined = (data) => {
    if (data.gameId === gameId) {
      setParticipants(prev => [...prev, data.participant]);
      setGame(prev => ({
        ...prev,
        participants: [...prev.participants, data.participant]
      }));
    }
  };

  const handleParticipantLeft = (data) => {
    if (data.gameId === gameId) {
      setParticipants(prev => prev.filter(p => p._id !== data.participant._id));
      setGame(prev => ({
        ...prev,
        participants: prev.participants.filter(p => p._id !== data.participant._id)
      }));
    }
  };

  const handleGameUpdated = (data) => {
    if (data.gameId === gameId) {
      setGame(prev => ({ ...prev, ...data.updates }));
    }
  };

  const handleJoinGame = async () => {
    try {
      setIsJoining(true);
      await gameAPI.joinGame(gameId);
      
      Alert.alert(
        '참가 완료',
        '게임에 성공적으로 참가했습니다!',
        [{ text: '확인' }]
      );
      
      setIsParticipant(true);
    } catch (error) {
      console.error('게임 참가 오류:', error);
      Alert.alert(
        '참가 실패', 
        error.response?.data?.error?.message || '게임 참가 중 오류가 발생했습니다.'
      );
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveGame = async () => {
    try {
      await gameAPI.leaveGame(gameId);
      Alert.alert('참가 취소', '게임 참가를 취소했습니다.');
      setIsParticipant(false);
      setShowLeaveDialog(false);
    } catch (error) {
      Alert.alert('취소 실패', '참가 취소 중 오류가 발생했습니다.');
    }
  };

  const handleShareGame = async () => {
    try {
      const gameUrl = `https://dongbaejul.com/games/${gameId}`;
      await Share.share({
        message: `${game.title}\n\n📅 ${new Date(game.gameDate).toLocaleDateString('ko-KR')}\n📍 ${game.location.address}\n\n게임 참가하기: ${gameUrl}`,
        title: '배드민턴 게임 초대',
      });
    } catch (error) {
      console.error('공유 오류:', error);
    }
  };

  const getGameStatus = () => {
    if (!game) return { text: '로딩중', color: theme.colors.outline };
    
    const now = new Date();
    const gameDate = new Date(game.gameDate);
    
    if (game.results?.isCompleted) {
      return { text: '완료', color: theme.colors.success };
    } else if (gameDate < now) {
      return { text: '진행중', color: theme.colors.warning };
    } else if (participants.length >= game.maxParticipants) {
      return { text: '마감', color: theme.colors.error };
    } else {
      return { text: '모집중', color: theme.colors.primary };
    }
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

  const canJoinGame = () => {
    if (!game || isParticipant) return false;
    const now = new Date();
    const gameDate = new Date(game.gameDate);
    return gameDate > now && participants.length < game.maxParticipants;
  };

  const renderGameHeader = () => {
    const status = getGameStatus();
    
    return (
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.gameHeader}>
            <View style={styles.gameTitle}>
              <Text style={styles.gameName}>{game?.title}</Text>
              <Chip
                mode="flat"
                textStyle={[styles.statusText, { color: status.color }]}
                style={[styles.statusChip, { backgroundColor: `${status.color}20` }]}
              >
                {status.text}
              </Chip>
            </View>
            <IconButton
              icon="share-variant"
              size={24}
              onPress={handleShareGame}
              style={styles.shareButton}
            />
          </View>

          <Text style={styles.gameDescription}>{game?.description}</Text>

          {/* 게임 기본 정보 */}
          <View style={styles.gameInfoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>게임 유형</Text>
              <Text style={styles.infoValue}>🏸 {game?.gameType}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>실력 레벨</Text>
              <Text style={styles.infoValue}>{getLevelText(game?.level)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>참가비</Text>
              <Text style={styles.infoValue}>₩{game?.fee?.toLocaleString()}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>소요시간</Text>
              <Text style={styles.infoValue}>{game?.duration}분</Text>
            </View>
          </View>

          {/* 날짜 및 장소 */}
          <Surface style={styles.dateLocationCard} elevation={1}>
            <View style={styles.dateTimeContainer}>
              <Text style={styles.dateTimeLabel}>일시</Text>
              <Text style={styles.dateTimeValue}>
                📅 {new Date(game?.gameDate).toLocaleDateString('ko-KR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
              <Text style={styles.dateTimeValue}>
                🕐 {new Date(game?.gameDate).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.locationContainer}>
              <Text style={styles.locationLabel}>장소</Text>
              <Text style={styles.locationValue}>📍 {game?.location?.address}</Text>
              {game?.location?.name && (
                <Text style={styles.locationName}>{game.location.name}</Text>
              )}
              <Button
                mode="outlined"
                compact
                onPress={() => {
                  // 지도 앱 연동 (추후 구현)
                  Alert.alert('알림', '지도 연동 기능은 곧 추가될 예정입니다.');
                }}
                style={styles.mapButton}
              >
                지도에서 보기
              </Button>
            </View>
          </Surface>

          {/* 참가 현황 */}
          <View style={styles.participantStatus}>
            <View style={styles.participantHeader}>
              <Text style={styles.participantTitle}>참가 현황</Text>
              <Text style={styles.participantCount}>
                {participants.length}/{game?.maxParticipants}명
              </Text>
            </View>
            <ProgressBar
              progress={participants.length / (game?.maxParticipants || 1)}
              color={participants.length >= game?.maxParticipants ? theme.colors.error : theme.colors.primary}
              style={styles.progressBar}
            />
          </View>

          {/* 참가/취소 버튼 */}
          <View style={styles.actionContainer}>
            {canJoinGame() ? (
              <Button
                mode="contained"
                onPress={handleJoinGame}
                loading={isJoining}
                disabled={isJoining}
                style={styles.joinButton}
                labelStyle={styles.buttonText}
              >
                게임 참가하기
              </Button>
            ) : isParticipant ? (
              <Button
                mode="outlined"
                onPress={() => setShowLeaveDialog(true)}
                style={styles.leaveButton}
                labelStyle={styles.leaveButtonText}
              >
                참가 취소하기
              </Button>
            ) : (
              <Button
                mode="contained"
                disabled
                style={[styles.joinButton, styles.disabledButton]}
                labelStyle={styles.disabledButtonText}
              >
                {participants.length >= game?.maxParticipants ? '참가 마감' : '참가 불가'}
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderParticipants = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>참가자 목록</Text>
        
        {participants.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>아직 참가자가 없습니다</Text>
          </View>
        ) : (
          participants.map((participant, index) => (
            <Surface key={participant._id} style={styles.participantItem} elevation={1}>
              <Avatar.Image
                size={50}
                source={{ uri: participant.profileImage || 'https://via.placeholder.com/50' }}
                style={styles.participantAvatar}
              />
              <View style={styles.participantInfo}>
                <Text style={styles.participantName}>{participant.name}</Text>
                <Text style={styles.participantLevel}>
                  {getLevelText(participant.level)}
                </Text>
                <Text style={styles.joinTime}>
                  참가일: {new Date(participant.joinedAt || Date.now()).toLocaleDateString('ko-KR')}
                </Text>
              </View>
              {participant._id === user.id && (
                <Chip
                  mode="flat"
                  textStyle={styles.meChipText}
                  style={styles.meChip}
                >
                  나
                </Chip>
              )}
            </Surface>
          ))
        )}
      </Card.Content>
    </Card>
  );

  const renderGameRules = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>게임 규칙</Text>
        <View style={styles.rulesContainer}>
          <Text style={styles.ruleText}>• 게임 시작 10분 전까지 도착해주세요</Text>
          <Text style={styles.ruleText}>• 무단 불참 시 향후 게임 참가 제한이 있을 수 있습니다</Text>
          <Text style={styles.ruleText}>• 안전한 게임을 위해 준비운동을 필수로 해주세요</Text>
          <Text style={styles.ruleText}>• 게임 도중 부상 발생 시 즉시 알려주세요</Text>
          <Text style={styles.ruleText}>• 페어 매칭은 현장에서 랜덤으로 진행됩니다</Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderGameResults = () => {
    if (!game?.results?.isCompleted) return null;

    return (
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>게임 결과</Text>
          
          {game.results.matches?.map((match, index) => (
            <Surface key={index} style={styles.matchResult} elevation={1}>
              <View style={styles.matchHeader}>
                <Text style={styles.matchTitle}>매치 {index + 1}</Text>
                <Chip
                  mode="flat"
                  textStyle={{ color: theme.colors.success }}
                  style={styles.winnerChip}
                >
                  {match.winner === 'team1' ? '팀1 승리' : '팀2 승리'}
                </Chip>
              </View>
              
              <View style={styles.teamsContainer}>
                <View style={styles.team}>
                  <Text style={styles.teamLabel}>팀 1</Text>
                  {match.team1?.map((playerId, i) => {
                    const player = participants.find(p => p._id === playerId);
                    return (
                      <Text key={i} style={styles.playerName}>
                        {player?.name || '알 수 없음'}
                      </Text>
                    );
                  })}
                </View>
                
                <Text style={styles.vs}>VS</Text>
                
                <View style={styles.team}>
                  <Text style={styles.teamLabel}>팀 2</Text>
                  {match.team2?.map((playerId, i) => {
                    const player = participants.find(p => p._id === playerId);
                    return (
                      <Text key={i} style={styles.playerName}>
                        {player?.name || '알 수 없음'}
                      </Text>
                    );
                  })}
                </View>
              </View>
              
              <View style={styles.setsContainer}>
                {match.sets?.map((set, setIndex) => (
                  <View key={setIndex} style={styles.setScore}>
                    <Text style={styles.scoreText}>
                      세트 {setIndex + 1}: {set.team1Score} - {set.team2Score}
                    </Text>
                  </View>
                ))}
              </View>
            </Surface>
          ))}
        </Card.Content>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>게임 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (!game) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>게임 정보를 찾을 수 없습니다.</Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          돌아가기
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderGameHeader()}
        {renderParticipants()}
        {renderGameRules()}
        {renderGameResults()}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* 참가 취소 확인 다이얼로그 */}
      <Portal>
        <Dialog visible={showLeaveDialog} onDismiss={() => setShowLeaveDialog(false)}>
          <Dialog.Title>참가 취소</Dialog.Title>
          <Dialog.Content>
            <Text>정말로 이 게임 참가를 취소하시겠습니까?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLeaveDialog(false)}>취소</Button>
            <Button onPress={handleLeaveGame} textColor={theme.colors.error}>
              참가 취소
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    backgroundColor: theme.colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  gameTitle: {
    flex: 1,
  },
  gameName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  shareButton: {
    margin: 0,
  },
  gameDescription: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  gameInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  infoItem: {
    width: '48%',
    marginBottom: theme.spacing.md,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.7,
    marginBottom: theme.spacing.xs,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  dateLocationCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.roundness,
    marginBottom: theme.spacing.lg,
  },
  dateTimeContainer: {
    marginBottom: theme.spacing.md,
  },
  dateTimeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  dateTimeValue: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  divider: {
    marginVertical: theme.spacing.md,
  },
  locationContainer: {
    marginTop: theme.spacing.md,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  locationValue: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  locationName: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
    marginBottom: theme.spacing.md,
  },
  mapButton: {
    alignSelf: 'flex-start',
    borderColor: theme.colors.primary,
  },
  participantStatus: {
    marginBottom: theme.spacing.lg,
  },
  participantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  participantTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  participantCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  actionContainer: {
    marginTop: theme.spacing.md,
  },
  joinButton: {
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  leaveButton: {
    borderColor: theme.colors.error,
  },
  leaveButtonText: {
    color: theme.colors.error,
  },
  disabledButton: {
    backgroundColor: theme.colors.outline,
  },
  disabledButtonText: {
    color: theme.colors.surface,
  },
  sectionCard: {
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.roundness,
  },
  participantAvatar: {
    marginRight: theme.spacing.md,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  participantLevel: {
    fontSize: 14,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  joinTime: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.7,
  },
  meChip: {
    backgroundColor: `${theme.colors.primary}20`,
  },
  meChipText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  rulesContainer: {
    marginTop: theme.spacing.sm,
  },
  ruleText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  matchResult: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.roundness,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  winnerChip: {
    backgroundColor: `${theme.colors.success}20`,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  team: {
    alignItems: 'center',
    flex: 1,
  },
  teamLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  playerName: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  vs: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginHorizontal: theme.spacing.lg,
  },
  setsContainer: {
    alignItems: 'center',
  },
  setScore: {
    marginBottom: theme.spacing.xs,
  },
  scoreText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  bottomSpacing: {
    height: theme.spacing.xl,
  },
});

export default GameDetailScreen;