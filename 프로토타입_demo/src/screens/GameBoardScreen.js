import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, ProgressBar } from 'react-native-paper';
import StatusCard from '../components/StatusCard';
import LargeTouchButton from '../components/LargeTouchButton';
import { useGameStore } from '../store/gameStore';
import { colors } from '../utils/theme';

export default function GameBoardScreen({ navigation }) {
  const { user, games, currentGame, participants } = useGameStore();
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 실시간 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // 실제로는 서버에서 데이터를 다시 가져옴
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderMyTurnCard = () => {
    if (!currentGame?.nextOpponent) return null;

    return (
      <StatusCard
        title="🎯 철수님 차례!"
        subtitle={`약 ${currentGame.estimatedWaitTime}분 후`}
        icon="clock-alert"
        status="warning"
        content={
          <View>
            <Text style={styles.nextOpponent}>
              다음 상대: {currentGame.nextOpponent}님
            </Text>
            <Text style={styles.skillLevel}>
              (실력 비슷 • 승률 60% vs 40%)
            </Text>
          </View>
        }
      />
    );
  };

  const renderCurrentGames = () => {
    const activeGames = games.filter(game => game.status === 'playing');
    
    return activeGames.map(game => (
      <Card key={game.id} style={styles.gameCard}>
        <Card.Content style={styles.gameContent}>
          <View style={styles.gameHeader}>
            <Text style={styles.courtName}>{game.court}코트</Text>
            <Text style={styles.gameStatus}>진행 중</Text>
          </View>
          
          <View style={styles.teamsContainer}>
            <View style={styles.team}>
              <Text style={styles.teamName}>
                {game.teams.teamA.join(' & ')}
              </Text>
              <Text style={styles.score}>{game.score.teamA}</Text>
            </View>
            
            <Text style={styles.vs}>VS</Text>
            
            <View style={styles.team}>
              <Text style={styles.teamName}>
                {game.teams.teamB.join(' & ')}
              </Text>
              <Text style={styles.score}>{game.score.teamB}</Text>
            </View>
          </View>
          
          <View style={styles.gameInfo}>
            <Text style={styles.setInfo}>
              {game.currentSet}세트 중 • 21점 먼저
            </Text>
          </View>
        </Card.Content>
      </Card>
    ));
  };

  const renderCompletedGames = () => {
    const completedGames = games.filter(game => game.status === 'completed');
    
    if (completedGames.length === 0) return null;

    return (
      <View>
        <Text style={styles.sectionTitle}>완료된 경기</Text>
        {completedGames.map(game => (
          <Card key={game.id} style={[styles.gameCard, styles.completedGame]}>
            <Card.Content style={styles.gameContent}>
              <View style={styles.gameHeader}>
                <Text style={styles.courtName}>{game.court}코트</Text>
                <Text style={[styles.gameStatus, styles.completedStatus]}>
                  완료
                </Text>
              </View>
              
              <View style={styles.teamsContainer}>
                <View style={styles.team}>
                  <Text style={[
                    styles.teamName,
                    game.winner === 'teamA' && styles.winnerTeam
                  ]}>
                    {game.teams.teamA.join(' & ')}
                  </Text>
                  <Text style={[
                    styles.score,
                    game.winner === 'teamA' && styles.winnerScore
                  ]}>
                    {game.score.teamA}
                  </Text>
                </View>
                
                <Text style={styles.vs}>VS</Text>
                
                <View style={styles.team}>
                  <Text style={[
                    styles.teamName,
                    game.winner === 'teamB' && styles.winnerTeam
                  ]}>
                    {game.teams.teamB.join(' & ')}
                  </Text>
                  <Text style={[
                    styles.score,
                    game.winner === 'teamB' && styles.winnerScore
                  ]}>
                    {game.score.teamB}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>
    );
  };

  const renderOverallProgress = () => {
    const totalGames = 20; // 오늘 예정된 총 게임 수
    const completedGames = games.filter(g => g.status === 'completed').length;
    const progress = completedGames / totalGames;

    return (
      <StatusCard
        title="📊 오늘 전체 진행률"
        icon="chart-line"
        content={
          <View>
            <View style={styles.progressContainer}>
              <ProgressBar 
                progress={progress} 
                color={colors.primary}
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>
                {completedGames}/{totalGames} 경기 ({Math.round(progress * 100)}%)
              </Text>
            </View>
            <Text style={styles.estimatedTime}>
              ⏱ 예상 종료: 오후 9시 30분
            </Text>
          </View>
        }
      />
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* 내 차례 카드 */}
        {renderMyTurnCard()}

        {/* 빠른 액션 버튼들 */}
        <View style={styles.quickActions}>
          <LargeTouchButton
            title="점수 입력"
            variant="primary"
            size="normal"
            onPress={() => navigation.navigate('ScoreInput')}
            style={styles.actionButton}
          />
          <LargeTouchButton
            title="휴식 🚿"
            variant="outline"
            size="normal"
            style={styles.actionButton}
          />
        </View>

        {/* 현재 진행 중인 경기들 */}
        <Text style={styles.sectionTitle}>🏓 현재 경기</Text>
        {renderCurrentGames()}

        {/* 전체 진행률 */}
        {renderOverallProgress()}

        {/* 완료된 경기들 */}
        {renderCompletedGames()}

        {/* 참가자 현황 */}
        <StatusCard
          title="👥 참가자 현황"
          icon="account-group"
          content={
            <View>
              <Text style={styles.infoText}>
                ✅ 체크인: {participants.filter(p => p.checkedIn).length}명
              </Text>
              <Text style={styles.infoText}>
                ⏳ 대기 중: {participants.filter(p => !p.checkedIn).length}명
              </Text>
              <Text style={styles.infoText}>
                🏸 총 참가자: {participants.length}명
              </Text>
            </View>
          }
        />

        {/* 실시간 업데이트 정보 */}
        <Text style={styles.updateInfo}>
          마지막 업데이트: {currentTime.toLocaleTimeString()}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  quickActions: {
    flexDirection: 'row',
    marginVertical: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 8,
  },
  gameCard: {
    marginVertical: 6,
    marginHorizontal: 8,
    elevation: 2,
    borderRadius: 12,
  },
  completedGame: {
    opacity: 0.8,
    backgroundColor: colors.surface,
  },
  gameContent: {
    padding: 16,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  courtName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  gameStatus: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
  },
  completedStatus: {
    color: colors.textSecondary,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  team: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 14,
    textAlign: 'center',
    color: colors.text,
    marginBottom: 4,
  },
  winnerTeam: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  winnerScore: {
    color: colors.primary,
  },
  vs: {
    fontSize: 12,
    color: colors.textSecondary,
    marginHorizontal: 8,
  },
  gameInfo: {
    alignItems: 'center',
    marginTop: 8,
  },
  setInfo: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  nextOpponent: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  skillLevel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  estimatedTime: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    marginBottom: 4,
  },
  updateInfo: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});