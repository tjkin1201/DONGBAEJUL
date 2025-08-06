// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { View, StyleSheet, Alert } from 'react-native';
// eslint-disable-next-line no-unused-vars
import {
  Text,
  Card,
  Button,
  IconButton,
  Chip,
  Surface,
  Dialog,
  Portal,
  ActivityIndicator
// eslint-disable-next-line no-unused-vars
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import GameService from '../../services/GameService';

const BadmintonScoreScreen = ({ route, navigation }) => {
  const { matchId } = route.params;
  const { user } = useAuth();
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState(null);
  const [currentSet, setCurrentSet] = useState(1);
  const [scores, setScores] = useState({
    player1: 0,
    player2: 0,
    team1: 0,
    team2: 0
  });
  const [sets, setSets] = useState([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);

  useEffect(() => {
    loadMatch();
  }, [matchId]);

  const loadMatch = async () => {
    try {
      // 실제로는 GameService에서 매치 정보를 가져와야 함
      // 여기서는 샘플 데이터 사용
      const sampleMatch = {
        id: matchId,
        type: 'doubles',
        teams: {
          team1: [
            { id: '1', name: '김철수', skillLevel: 5 },
            { id: '2', name: '이영희', skillLevel: 4 }
          ],
          team2: [
            { id: '3', name: '박민수', skillLevel: 6 },
            { id: '4', name: '정수진', skillLevel: 5 }
          ]
        },
        sets: [],
        status: 'in_progress',
        court: 1
      };

      setMatch(sampleMatch);
      
      if (sampleMatch.sets.length > 0) {
        setSets(sampleMatch.sets);
        setCurrentSet(sampleMatch.sets.length + 1);
      }
      
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      Alert.alert('오류', '매치 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const addScore = (team) => {
    setScores(prev => ({
      ...prev,
      [team]: prev[team] + 1
    }));
  };

  const subtractScore = (team) => {
    setScores(prev => ({
      ...prev,
      [team]: Math.max(0, prev[team] - 1)
    }));
  };

  const finishSet = async () => {
    const team1Score = match.type === 'singles' ? scores.player1 : scores.team1;
    const team2Score = match.type === 'singles' ? scores.player2 : scores.team2;

    // 세트 완료 조건 확인 (21점, 2점차)
    if (Math.max(team1Score, team2Score) < 21) {
      Alert.alert('알림', '한 팀이 최소 21점을 득점해야 합니다.');
      return;
    }

    if (Math.abs(team1Score - team2Score) < 2 && Math.max(team1Score, team2Score) < 30) {
      Alert.alert('알림', '2점차 이상으로 승부가 나야 합니다.');
      return;
    }

    const setData = {
      setNumber: currentSet,
      score: {
        [match.type === 'singles' ? 'player1' : 'team1']: team1Score,
        [match.type === 'singles' ? 'player2' : 'team2']: team2Score
      },
      winner: team1Score > team2Score ? 
        (match.type === 'singles' ? 'player1' : 'team1') : 
        (match.type === 'singles' ? 'player2' : 'team2'),
      completedAt: new Date().toISOString()
    };

    const newSets = [...sets, setData];
    setSets(newSets);

    // 매치 완료 확인 (3세트 중 2세트 승리)
    const team1Wins = newSets.filter(set => 
      set.winner === (match.type === 'singles' ? 'player1' : 'team1')
    ).length;
    
    const team2Wins = newSets.filter(set => 
      set.winner === (match.type === 'singles' ? 'player2' : 'team2')
    ).length;

    if (team1Wins >= 2 || team2Wins >= 2) {
      setGameComplete(true);
      setDialogVisible(true);
      
      // GameService에 결과 저장
      try {
        await GameService.updateMatchScore(matchId, setData);
        Alert.alert('게임 완료', '경기가 완료되었습니다!');
        navigation.goBack();
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        Alert.alert('오류', '결과 저장에 실패했습니다.');
      }
    } else {
      // 다음 세트 준비
      setCurrentSet(prev => prev + 1);
      setScores({
        player1: 0,
        player2: 0,
        team1: 0,
        team2: 0
      });
      
      // GameService에 세트 결과 저장
      try {
        await GameService.updateMatchScore(matchId, setData);
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        // 오류 처리
      }
    }
  };

  const resetCurrentSet = () => {
    setScores({
      player1: 0,
      player2: 0,
      team1: 0,
      team2: 0
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>매치 정보 로딩 중...</Text>
      </View>
    );
  }

  if (!match) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>매치 정보를 찾을 수 없습니다.</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          뒤로 가기
        </Button>
      </View>
    );
  }

  const team1Score = match.type === 'singles' ? scores.player1 : scores.team1;
  const team2Score = match.type === 'singles' ? scores.player2 : scores.team2;

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <Surface style={styles.header}>
        <Text style={styles.courtText}>코트 {match.court}</Text>
        <Text style={styles.setText}>Set {currentSet}</Text>
        <Text style={styles.matchTypeText}>
          {match.type === 'singles' ? '단식' : '복식'}
        </Text>
      </Surface>

      {/* 세트 결과 */}
      {sets.length > 0 && (
        <Card style={styles.setsCard}>
          <Card.Content>
            <Text style={styles.setsTitle}>세트 결과</Text>
            <View style={styles.setsContainer}>
              {sets.map((set, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  style={styles.setChip}
                >
                  {set.score[match.type === 'singles' ? 'player1' : 'team1']} - {set.score[match.type === 'singles' ? 'player2' : 'team2']}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* 스코어보드 */}
      <View style={styles.scoreboard}>
        {/* 팀1/플레이어1 */}
        <View style={styles.teamContainer}>
          <Card style={[styles.teamCard, styles.team1Card]}>
            <Card.Content style={styles.teamContent}>
              <Text style={styles.teamName}>
                {match.type === 'singles' 
                  ? match.players?.player1?.name || '플레이어 1'
                  : `${match.teams.team1[0].name}\n${match.teams.team1[1].name}`
                }
              </Text>
              
              <View style={styles.scoreContainer}>
                <IconButton
                  icon="minus-circle"
                  size={40}
                  iconColor="#f44336"
                  onPress={() => subtractScore(match.type === 'singles' ? 'player1' : 'team1')}
                />
                
                <Text style={styles.scoreText}>{team1Score}</Text>
                
                <IconButton
                  icon="plus-circle"
                  size={40}
                  iconColor="#4caf50"
                  onPress={() => addScore(match.type === 'singles' ? 'player1' : 'team1')}
                />
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* VS */}
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        {/* 팀2/플레이어2 */}
        <View style={styles.teamContainer}>
          <Card style={[styles.teamCard, styles.team2Card]}>
            <Card.Content style={styles.teamContent}>
              <Text style={styles.teamName}>
                {match.type === 'singles' 
                  ? match.players?.player2?.name || '플레이어 2'
                  : `${match.teams.team2[0].name}\n${match.teams.team2[1].name}`
                }
              </Text>
              
              <View style={styles.scoreContainer}>
                <IconButton
                  icon="minus-circle"
                  size={40}
                  iconColor="#f44336"
                  onPress={() => subtractScore(match.type === 'singles' ? 'player2' : 'team2')}
                />
                
                <Text style={styles.scoreText}>{team2Score}</Text>
                
                <IconButton
                  icon="plus-circle"
                  size={40}
                  iconColor="#4caf50"
                  onPress={() => addScore(match.type === 'singles' ? 'player2' : 'team2')}
                />
              </View>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* 컨트롤 버튼 */}
      <View style={styles.controls}>
        <Button
          mode="outlined"
          onPress={resetCurrentSet}
          style={styles.controlButton}
        >
          세트 리셋
        </Button>
        
        <Button
          mode="contained"
          onPress={finishSet}
          style={styles.controlButton}
          disabled={team1Score === 0 && team2Score === 0}
        >
          세트 완료
        </Button>
      </View>

      {/* 완료 다이얼로그 */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>경기 완료</Dialog.Title>
          <Dialog.Content>
            <Text>경기가 완료되었습니다! 결과가 저장되었습니다.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setDialogVisible(false);
              navigation.goBack();
            }}>
              확인
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  header: {
    padding: 16,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courtText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  setText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  matchTypeText: {
    fontSize: 16,
    color: '#666',
  },
  setsCard: {
    margin: 16,
    elevation: 2,
  },
  setsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  setsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  setChip: {
    backgroundColor: '#e3f2fd',
  },
  scoreboard: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  teamContainer: {
    flex: 1,
  },
  teamCard: {
    elevation: 4,
  },
  team1Card: {
    backgroundColor: '#e8f5e8',
  },
  team2Card: {
    backgroundColor: '#fff3e0',
  },
  teamContent: {
    alignItems: 'center',
    padding: 20,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginHorizontal: 20,
    color: '#1976d2',
  },
  vsContainer: {
    paddingHorizontal: 16,
  },
  vsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
  },
  controls: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  controlButton: {
    flex: 1,
  },
});

export default BadmintonScoreScreen;
