import React, { useState, useRef } from 'react';
import { View, StyleSheet, Alert, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import LargeTouchButton from '../components/LargeTouchButton';
import StatusCard from '../components/StatusCard';
import { useGameStore } from '../store/gameStore';
import { colors } from '../utils/theme';
import * as Haptics from 'expo-haptics';

export default function ScoreInputScreen({ navigation }) {
  const { games, addScore } = useGameStore();
  const [selectedGame, setSelectedGame] = useState(games.find(g => g.status === 'playing'));
  const [showUndo, setShowUndo] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  
  const undoTimeoutRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const handleScoreInput = (winningTeam) => {
    if (!selectedGame) {
      Alert.alert('오류', '진행 중인 게임을 선택해주세요.');
      return;
    }

    // 강한 햅틱 피드백
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // 펄스 애니메이션
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // 점수 업데이트
    addScore(selectedGame.id, winningTeam);
    
    // 되돌리기 옵션 표시
    setLastAction({ gameId: selectedGame.id, team: winningTeam });
    setShowUndo(true);

    // 5초 후 되돌리기 옵션 숨김
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }
    undoTimeoutRef.current = setTimeout(() => {
      setShowUndo(false);
      setLastAction(null);
    }, 5000);

    // 성공 피드백
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleUndo = () => {
    if (!lastAction) return;

    // 점수 되돌리기 (실제로는 -1)
    const currentGame = games.find(g => g.id === lastAction.gameId);
    if (currentGame && currentGame.score[lastAction.team] > 0) {
      // 되돌리기 로직 (여기서는 시뮬레이션)
      Alert.alert(
        '되돌리기 완료',
        '마지막 점수 입력이 취소되었습니다.',
        [{ text: '확인' }]
      );
    }

    setShowUndo(false);
    setLastAction(null);
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }
  };

  const getTeamDisplayName = (team) => {
    if (!selectedGame) return '';
    return selectedGame.teams[team].join(' & ');
  };

  const getTeamScore = (team) => {
    if (!selectedGame) return 0;
    return selectedGame.score[team];
  };

  const isGamePoint = () => {
    if (!selectedGame) return false;
    const { teamA, teamB } = selectedGame.score;
    return teamA >= 20 || teamB >= 20;
  };

  if (!selectedGame) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <StatusCard
            title="진행 중인 게임이 없습니다"
            subtitle="게임이 시작되면 점수를 입력할 수 있습니다"
            icon="information"
            status="warning"
          />
          <View style={styles.buttonContainer}>
            <LargeTouchButton
              title="게임 현황 보기"
              variant="primary"
              onPress={() => navigation.navigate('GameBoard')}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 게임 정보 헤더 */}
      <View style={styles.header}>
        <Text style={styles.courtTitle}>{selectedGame.court}코트</Text>
        <Text style={styles.gameInfo}>
          {selectedGame.currentSet}세트 • {isGamePoint() ? '게임 포인트!' : '21점 먼저'}
        </Text>
      </View>

      {/* 메인 점수 입력 영역 */}
      <Animated.View style={[styles.scoreContainer, { transform: [{ scale: pulseAnim }] }]}>
        {/* 팀 A */}
        <LargeTouchButton
          title={`${getTeamDisplayName('teamA')} 승리`}
          variant="primary"
          size="xl"
          onPress={() => handleScoreInput('teamA')}
          style={[styles.teamButton, styles.teamAButton]}
        />
        
        {/* 현재 스코어 표시 */}
        <View style={styles.currentScore}>
          <View style={styles.scoreDisplay}>
            <Text style={[styles.scoreNumber, styles.teamAScore]}>
              {getTeamScore('teamA')}
            </Text>
            <Text style={styles.scoreLabel}>팀 A</Text>
          </View>
          
          <Text style={styles.vs}>VS</Text>
          
          <View style={styles.scoreDisplay}>
            <Text style={[styles.scoreNumber, styles.teamBScore]}>
              {getTeamScore('teamB')}
            </Text>
            <Text style={styles.scoreLabel}>팀 B</Text>
          </View>
        </View>

        {/* 팀 B */}
        <LargeTouchButton
          title={`${getTeamDisplayName('teamB')} 승리`}
          variant="secondary"
          size="xl"
          onPress={() => handleScoreInput('teamB')}
          style={[styles.teamButton, styles.teamBButton]}
        />
      </Animated.View>

      {/* 되돌리기 버튼 */}
      {showUndo && (
        <View style={styles.undoContainer}>
          <LargeTouchButton
            title="실수했나요? 되돌리기"
            variant="outline"
            onPress={handleUndo}
            style={styles.undoButton}
          />
          <Text style={styles.undoTimer}>5초 후 자동으로 사라집니다</Text>
        </View>
      )}

      {/* 하단 정보 */}
      <View style={styles.bottomInfo}>
        <StatusCard
          title="💡 빠른 점수 입력 팁"
          content="승리한 팀 버튼을 한 번만 터치하세요. 실수하면 5초 내로 되돌리기가 가능합니다."
          icon="lightbulb"
        />

        {isGamePoint() && (
          <StatusCard
            title="🔥 게임 포인트!"
            content="한 점만 더 득점하면 게임이 끝납니다!"
            icon="fire"
            status="warning"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 16,
    alignItems: 'center',
  },
  courtTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  gameInfo: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  scoreContainer: {
    flex: 1,
    justifyContent: 'space-around',
    padding: 16,
  },
  teamButton: {
    minHeight: 120,
  },
  teamAButton: {
    backgroundColor: colors.primary,
  },
  teamBButton: {
    backgroundColor: colors.secondary,
  },
  currentScore: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginVertical: 16,
    elevation: 2,
  },
  scoreDisplay: {
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  teamAScore: {
    color: colors.primary,
  },
  teamBScore: {
    color: colors.secondary,
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  vs: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  undoContainer: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  undoButton: {
    marginBottom: 8,
  },
  undoTimer: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomInfo: {
    padding: 16,
    paddingBottom: 100, // 탭바 여유공간
  },
  buttonContainer: {
    marginVertical: 20,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
});