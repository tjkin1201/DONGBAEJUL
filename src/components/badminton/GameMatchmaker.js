import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Surface, 
  Button, 
  Card, 
  Avatar, 
  Chip, 
  IconButton,
  ProgressBar,
  Divider,
  FAB
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import theme from '../../utils/theme';
import GradientCard from '../premium/GradientCard';

/**
 * 스마트 게임 매칭 시스템
 * - 실력 기반 자동 매칭
 * - 남녀복/단식/복식 구분
 * - 밸런스 조정 알고리즘
 */
const GameMatchmaker = ({
  availablePlayers = [],
  gameType = 'doubles', // singles, doubles, mixed
  onMatchGenerated,
  onGameCreate,
  style,
}) => {
  const { user } = useAuth();
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [matchingInProgress, setMatchingInProgress] = useState(false);
  const [suggestedMatches, setSuggestedMatches] = useState([]);
  const [balanceScore, setBalanceScore] = useState(0);

  // 실력 기반 매칭 알고리즘
  const calculatePlayerStrength = (player) => {
    const ratingWeight = 0.6;
    const winRateWeight = 0.3;
    const recentFormWeight = 0.1;

    return (
      (player.rating || 1200) * ratingWeight +
      (player.winRate || 50) * 10 * winRateWeight +
      (player.recentForm || 50) * 10 * recentFormWeight
    );
  };

  // 팀 밸런스 계산
  const calculateTeamBalance = (team1, team2) => {
    const team1Strength = team1.reduce((sum, player) => sum + calculatePlayerStrength(player), 0) / team1.length;
    const team2Strength = team2.reduce((sum, player) => sum + calculatePlayerStrength(player), 0) / team2.length;
    
    const difference = Math.abs(team1Strength - team2Strength);
    const maxStrength = Math.max(team1Strength, team2Strength);
    
    return Math.max(0, 100 - (difference / maxStrength) * 100);
  };

  // 자동 매칭 생성
  const generateMatches = () => {
    setMatchingInProgress(true);
    
    setTimeout(() => {
      const matches = [];
      const players = [...availablePlayers];
      
      if (gameType === 'singles') {
        // 단식 매칭: 비슷한 실력끼리
        const sortedPlayers = players.sort((a, b) => calculatePlayerStrength(b) - calculatePlayerStrength(a));
        
        for (let i = 0; i < sortedPlayers.length - 1; i += 2) {
          if (sortedPlayers[i + 1]) {
            matches.push({
              id: `match_${i}`,
              type: 'singles',
              team1: [sortedPlayers[i]],
              team2: [sortedPlayers[i + 1]],
              balance: calculateTeamBalance([sortedPlayers[i]], [sortedPlayers[i + 1]]),
              court: Math.floor(i / 2) + 1,
            });
          }
        }
      } else if (gameType === 'doubles') {
        // 복식 매칭: 밸런스 최적화
        const combinations = generateDoublesTeams(players);
        combinations.forEach((combo, index) => {
          matches.push({
            id: `match_${index}`,
            type: 'doubles',
            team1: combo.team1,
            team2: combo.team2,
            balance: combo.balance,
            court: index + 1,
          });
        });
      } else if (gameType === 'mixed') {
        // 혼복 매칭: 남녀 조합 고려
        const mixedMatches = generateMixedDoubles(players);
        matches.push(...mixedMatches);
      }

      setSuggestedMatches(matches.slice(0, 3)); // 상위 3개 매치만 표시
      setMatchingInProgress(false);
    }, 1500);
  };

  const generateDoublesTeams = (players) => {
    const combinations = [];
    
    for (let i = 0; i < players.length - 3; i++) {
      for (let j = i + 1; j < players.length - 2; j++) {
        for (let k = j + 1; k < players.length - 1; k++) {
          for (let l = k + 1; l < players.length; l++) {
            const team1 = [players[i], players[j]];
            const team2 = [players[k], players[l]];
            const balance = calculateTeamBalance(team1, team2);
            
            combinations.push({ team1, team2, balance });
          }
        }
      }
    }
    
    return combinations.sort((a, b) => b.balance - a.balance).slice(0, 10);
  };

  const generateMixedDoubles = (players) => {
    const males = players.filter(p => p.gender === 'male');
    const females = players.filter(p => p.gender === 'female');
    const matches = [];

    if (males.length >= 2 && females.length >= 2) {
      for (let i = 0; i < Math.min(males.length / 2, females.length / 2); i++) {
        const team1 = [males[i * 2], females[i * 2]];
        const team2 = [males[i * 2 + 1], females[i * 2 + 1]];
        
        matches.push({
          id: `mixed_${i}`,
          type: 'mixed',
          team1,
          team2,
          balance: calculateTeamBalance(team1, team2),
          court: i + 1,
        });
      }
    }

    return matches;
  };

  const renderPlayer = (player, isSelected = false) => (
    <Card
      key={player.id}
      style={[
        styles.playerCard,
        isSelected && { borderColor: theme.colors.primary, borderWidth: 2 }
      ]}
      onPress={() => togglePlayerSelection(player)}
    >
      <Card.Content style={styles.playerContent}>
        <Avatar.Image
          size={40}
          source={{ uri: player.avatar || `https://ui-avatars.com/api/?name=${player.name}` }}
        />
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{player.name}</Text>
          <View style={styles.playerStats}>
            <Chip
              style={[
                styles.skillChip,
                { backgroundColor: theme.colors.skillLevel[player.skillLevel] }
              ]}
              textStyle={{ color: theme.colors.surface, fontSize: 10 }}
            >
              {player.rating || 1200}
            </Chip>
            <Text style={styles.winRate}>
              승률 {player.winRate || 50}%
            </Text>
          </View>
        </View>
        {player.gender && (
          <Chip
            icon={player.gender === 'male' ? 'human-male' : 'human-female'}
            style={[
              styles.genderChip,
              { backgroundColor: player.gender === 'male' ? theme.colors.info : theme.colors.tertiary }
            ]}
            textStyle={{ color: theme.colors.surface }}
          >
            {player.gender === 'male' ? '남' : '여'}
          </Chip>
        )}
      </Card.Content>
    </Card>
  );

  const renderMatch = (match, index) => (
    <GradientCard
      key={match.id}
      gradient="primary"
      style={styles.matchCard}
      onPress={() => selectMatch(match)}
    >
      <View style={styles.matchHeader}>
        <Chip
          icon="badminton"
          style={styles.matchTypeChip}
          textStyle={{ color: theme.colors.surface }}
        >
          코트 {match.court} • {match.type === 'singles' ? '단식' : match.type === 'doubles' ? '복식' : '혼복'}
        </Chip>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>밸런스</Text>
          <Text style={[styles.balanceScore, { color: getBalanceColor(match.balance) }]}>
            {Math.round(match.balance)}%
          </Text>
        </View>
      </View>

      <View style={styles.teamsContainer}>
        <View style={styles.team}>
          <Text style={styles.teamLabel}>팀 A</Text>
          {match.team1.map(player => (
            <View key={player.id} style={styles.teamPlayer}>
              <Avatar.Image size={24} source={{ uri: player.avatar }} />
              <Text style={styles.teamPlayerName}>{player.name}</Text>
            </View>
          ))}
        </View>

        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        <View style={styles.team}>
          <Text style={styles.teamLabel}>팀 B</Text>
          {match.team2.map(player => (
            <View key={player.id} style={styles.teamPlayer}>
              <Avatar.Image size={24} source={{ uri: player.avatar }} />
              <Text style={styles.teamPlayerName}>{player.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <ProgressBar
        progress={match.balance / 100}
        color={getBalanceColor(match.balance)}
        style={styles.balanceBar}
      />
    </GradientCard>
  );

  const getBalanceColor = (balance) => {
    if (balance >= 90) return theme.colors.success;
    if (balance >= 75) return theme.colors.warning;
    return theme.colors.error;
  };

  const togglePlayerSelection = (player) => {
    setSelectedPlayers(prev => {
      const isSelected = prev.find(p => p.id === player.id);
      if (isSelected) {
        return prev.filter(p => p.id !== player.id);
      } else {
        const maxPlayers = gameType === 'singles' ? 2 : 4;
        if (prev.length < maxPlayers) {
          return [...prev, player];
        }
        return prev;
      }
    });
  };

  const selectMatch = (match) => {
    Alert.alert(
      '게임 생성',
      `${match.type === 'singles' ? '단식' : match.type === 'doubles' ? '복식' : '혼복'} 게임을 생성하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          onPress: () => {
            onGameCreate && onGameCreate(match);
            onMatchGenerated && onMatchGenerated(match);
          }
        }
      ]
    );
  };

  return (
    <Surface style={[styles.container, style]} elevation={1}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>스마트 매칭</Text>
        <View style={styles.gameTypeSelector}>
          {['singles', 'doubles', 'mixed'].map(type => (
            <Chip
              key={type}
              selected={gameType === type}
              style={[
                styles.typeChip,
                gameType === type && { backgroundColor: theme.colors.primary }
              ]}
              textStyle={{
                color: gameType === type ? theme.colors.surface : theme.colors.onSurface
              }}
            >
              {type === 'singles' ? '단식' : type === 'doubles' ? '복식' : '혼복'}
            </Chip>
          ))}
        </View>
      </View>

      <Divider style={styles.divider} />

      {/* 참가자 목록 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          참가 가능 멤버 ({availablePlayers.length}명)
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.playersContainer}>
            {availablePlayers.map(player => renderPlayer(player))}
          </View>
        </ScrollView>
      </View>

      <Divider style={styles.divider} />

      {/* 자동 매칭 결과 */}
      <View style={styles.section}>
        <View style={styles.matchingHeader}>
          <Text style={styles.sectionTitle}>추천 매치</Text>
          <Button
            mode="contained"
            onPress={generateMatches}
            loading={matchingInProgress}
            disabled={availablePlayers.length < (gameType === 'singles' ? 2 : 4)}
            style={styles.generateButton}
          >
            매칭 생성
          </Button>
        </View>

        {matchingInProgress && (
          <View style={styles.loadingContainer}>
            <ProgressBar indeterminate color={theme.colors.primary} />
            <Text style={styles.loadingText}>최적의 매치를 찾는 중...</Text>
          </View>
        )}

        {suggestedMatches.length > 0 && (
          <ScrollView style={styles.matchesContainer}>
            {suggestedMatches.map((match, index) => renderMatch(match, index))}
          </ScrollView>
        )}
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.fonts.h4.fontSize,
    fontWeight: theme.fonts.h4.fontWeight,
    color: theme.colors.onSurface,
  },
  gameTypeSelector: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  typeChip: {
    height: 32,
  },
  divider: {
    marginVertical: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fonts.subtitle.fontSize,
    fontWeight: theme.fonts.subtitle.fontWeight,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
  },
  playersContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  playerCard: {
    width: 200,
    marginRight: theme.spacing.sm,
  },
  playerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  playerInfo: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  playerName: {
    fontSize: theme.fonts.body.fontSize,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  playerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  skillChip: {
    height: 20,
  },
  winRate: {
    fontSize: theme.fonts.caption.fontSize,
    color: theme.colors.onSurfaceVariant,
  },
  genderChip: {
    height: 28,
    width: 28,
  },
  matchingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  generateButton: {
    borderRadius: theme.borderRadius.button,
  },
  loadingContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fonts.body.fontSize,
    color: theme.colors.onSurfaceVariant,
  },
  matchesContainer: {
    maxHeight: 400,
  },
  matchCard: {
    marginBottom: theme.spacing.md,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  matchTypeChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: theme.fonts.caption.fontSize,
    color: theme.colors.surface,
    opacity: 0.8,
  },
  balanceScore: {
    fontSize: theme.fonts.body.fontSize,
    fontWeight: '700',
  },
  teamsContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  team: {
    flex: 1,
  },
  teamLabel: {
    fontSize: theme.fonts.body.fontSize,
    fontWeight: '600',
    color: theme.colors.surface,
    marginBottom: theme.spacing.xs,
  },
  teamPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  teamPlayerName: {
    fontSize: theme.fonts.body.fontSize,
    color: theme.colors.surface,
    marginLeft: theme.spacing.xs,
  },
  vsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  vsText: {
    fontSize: theme.fonts.subtitle.fontSize,
    fontWeight: '700',
    color: theme.colors.surface,
  },
  balanceBar: {
    height: 4,
    borderRadius: 2,
  },
});

export default GameMatchmaker;