import AsyncStorage from '@react-native-async-storage/async-storage';
import { gameStatistics, skillCalculation } from '../utils/skillSystem';

/**
 * 배드민턴 게임 관리 서비스
 * - 게임 CRUD 작업
 * - 매칭 시스템
 * - 스코어 관리
 * - 통계 및 랭킹
 */
class GameService {
  constructor() {
    this.STORAGE_KEY = 'DONGBAEJUL_GAMES';
    this.MATCHES_KEY = 'DONGBAEJUL_MATCHES';
    this.STATS_KEY = 'DONGBAEJUL_GAME_STATS';
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // 기본 데이터 확인 및 생성
      const games = await this.getStoredData(this.STORAGE_KEY, []);
      const matches = await this.getStoredData(this.MATCHES_KEY, []);
      const stats = await this.getStoredData(this.STATS_KEY, {});

      // 기본 게임 데이터가 없으면 생성
      if (games.length === 0) {
        await this.createSampleGames();
      }

      this.initialized = true;
    } catch (error) {
      console.error('GameService 초기화 실패:', error);
      throw error;
    }
  }

  async getStoredData(key, defaultValue) {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`데이터 조회 실패 (${key}):`, error);
      return defaultValue;
    }
  }

  async setStoredData(key, data) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`데이터 저장 실패 (${key}):`, error);
      throw error;
    }
  }

  // 게임 생성
  async createGame(gameData) {
    try {
      const games = await this.getStoredData(this.STORAGE_KEY, []);
      
      const newGame = {
        id: this.generateId(),
        title: gameData.title,
        description: gameData.description || '',
        gameType: gameData.gameType, // 'singles', 'doubles', 'mixed'
        level: gameData.level, // 'beginner', 'intermediate', 'advanced', 'expert'
        gameDate: gameData.gameDate,
        location: {
          name: gameData.location.name,
          address: gameData.location.address,
          coordinates: gameData.location.coordinates,
          courts: gameData.location.courts || 1
        },
        maxParticipants: gameData.maxParticipants,
        fee: gameData.fee || 0,
        participants: [],
        waitingList: [],
        status: 'recruiting', // 'recruiting', 'full', 'in_progress', 'completed', 'cancelled'
        format: {
          sets: gameData.format?.sets || 3, // 3세트 또는 5세트
          pointsPerSet: gameData.format?.pointsPerSet || 21,
          winByTwo: gameData.format?.winByTwo !== false
        },
        matches: [], // 매치 결과들
        createdBy: gameData.createdBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      games.push(newGame);
      await this.setStoredData(this.STORAGE_KEY, games);
      
      return { success: true, data: newGame };
    } catch (error) {
      console.error('게임 생성 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 게임 목록 조회
  async getGames(filters = {}) {
    try {
      await this.initialize();
      let games = await this.getStoredData(this.STORAGE_KEY, []);

      // 필터 적용
      if (filters.status) {
        games = games.filter(game => game.status === filters.status);
      }

      if (filters.level) {
        games = games.filter(game => game.level === filters.level);
      }

      if (filters.gameType) {
        games = games.filter(game => game.gameType === filters.gameType);
      }

      if (filters.upcoming) {
        const now = new Date();
        games = games.filter(game => new Date(game.gameDate) > now);
      }

      if (filters.participant) {
        games = games.filter(game => 
          game.participants.some(p => p.id === filters.participant)
        );
      }

      // 날짜순 정렬 (최신순)
      games.sort((a, b) => new Date(b.gameDate) - new Date(a.gameDate));

      return { success: true, data: games };
    } catch (error) {
      console.error('게임 목록 조회 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 특정 게임 조회
  async getGame(gameId) {
    try {
      const games = await this.getStoredData(this.STORAGE_KEY, []);
      const game = games.find(g => g.id === gameId);
      
      if (!game) {
        return { success: false, error: '게임을 찾을 수 없습니다.' };
      }

      return { success: true, data: game };
    } catch (error) {
      console.error('게임 조회 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 게임 참가
  async joinGame(gameId, user) {
    try {
      const games = await this.getStoredData(this.STORAGE_KEY, []);
      const gameIndex = games.findIndex(g => g.id === gameId);
      
      if (gameIndex === -1) {
        return { success: false, error: '게임을 찾을 수 없습니다.' };
      }

      const game = games[gameIndex];

      // 이미 참가했는지 확인
      if (game.participants.some(p => p.id === user.id)) {
        return { success: false, error: '이미 참가한 게임입니다.' };
      }

      // 정원 확인
      if (game.participants.length >= game.maxParticipants) {
        // 대기 목록에 추가
        if (!game.waitingList.some(p => p.id === user.id)) {
          game.waitingList.push({
            id: user.id,
            name: user.displayName,
            skillLevel: user.skillLevel,
            joinedAt: new Date().toISOString()
          });
        }
        return { success: false, error: '정원이 마감되어 대기 목록에 추가되었습니다.' };
      }

      // 참가자 추가
      game.participants.push({
        id: user.id,
        name: user.displayName,
        skillLevel: user.skillLevel,
        joinedAt: new Date().toISOString()
      });

      // 상태 업데이트
      if (game.participants.length >= game.maxParticipants) {
        game.status = 'full';
      }

      game.updatedAt = new Date().toISOString();
      games[gameIndex] = game;
      
      await this.setStoredData(this.STORAGE_KEY, games);
      
      return { success: true, data: game };
    } catch (error) {
      console.error('게임 참가 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 게임 나가기
  async leaveGame(gameId, userId) {
    try {
      const games = await this.getStoredData(this.STORAGE_KEY, []);
      const gameIndex = games.findIndex(g => g.id === gameId);
      
      if (gameIndex === -1) {
        return { success: false, error: '게임을 찾을 수 없습니다.' };
      }

      const game = games[gameIndex];

      // 참가자에서 제거
      game.participants = game.participants.filter(p => p.id !== userId);

      // 대기 목록에서 첫 번째 사람을 참가자로 이동
      if (game.waitingList.length > 0 && game.participants.length < game.maxParticipants) {
        const nextPlayer = game.waitingList.shift();
        game.participants.push(nextPlayer);
      }

      // 상태 업데이트
      if (game.participants.length < game.maxParticipants) {
        game.status = 'recruiting';
      }

      game.updatedAt = new Date().toISOString();
      games[gameIndex] = game;
      
      await this.setStoredData(this.STORAGE_KEY, games);
      
      return { success: true, data: game };
    } catch (error) {
      console.error('게임 나가기 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 매칭 시스템 - 실력별 자동 매칭
  async createMatches(gameId) {
    try {
      const gameResult = await this.getGame(gameId);
      if (!gameResult.success) return gameResult;

      const game = gameResult.data;
      
      if (game.gameType === 'singles') {
        return this.createSinglesMatches(game);
      } else if (game.gameType === 'doubles') {
        return this.createDoublesMatches(game);
      } else {
        return this.createMixedMatches(game);
      }
    } catch (error) {
      console.error('매칭 생성 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 단식 매칭
  createSinglesMatches(game) {
    const participants = [...game.participants];
    
    // 실력 레벨로 정렬
    participants.sort((a, b) => a.skillLevel - b.skillLevel);
    
    const matches = [];
    
    // 비슷한 실력끼리 매칭
    for (let i = 0; i < participants.length - 1; i += 2) {
      if (i + 1 < participants.length) {
        matches.push({
          id: this.generateId(),
          gameId: game.id,
          type: 'singles',
          players: {
            player1: participants[i],
            player2: participants[i + 1]
          },
          sets: [],
          status: 'scheduled',
          court: Math.floor(i / 2) + 1,
          scheduledTime: game.gameDate,
          createdAt: new Date().toISOString()
        });
      }
    }

    return { success: true, data: matches };
  }

  // 복식 매칭
  createDoublesMatches(game) {
    const participants = [...game.participants];
    
    if (participants.length < 4) {
      return { success: false, error: '복식은 최소 4명이 필요합니다.' };
    }

    // 실력 레벨로 정렬
    participants.sort((a, b) => a.skillLevel - b.skillLevel);
    
    const matches = [];
    const teams = [];

    // 팀 구성 (실력 균형 맞추기)
    for (let i = 0; i < participants.length - 3; i += 4) {
      const team1 = [participants[i], participants[i + 3]]; // 낮은 실력 + 높은 실력
      const team2 = [participants[i + 1], participants[i + 2]]; // 중간 실력들
      
      teams.push({ team1, team2 });
    }

    // 매치 생성
    teams.forEach((teamPair, index) => {
      matches.push({
        id: this.generateId(),
        gameId: game.id,
        type: 'doubles',
        teams: teamPair,
        sets: [],
        status: 'scheduled',
        court: index + 1,
        scheduledTime: game.gameDate,
        createdAt: new Date().toISOString()
      });
    });

    return { success: true, data: matches };
  }

  // 혼합복식 매칭 (성별 고려)
  createMixedMatches(game) {
    // 혼합복식 로직 (성별 정보가 필요하므로 향후 구현)
    return this.createDoublesMatches(game);
  }

  // 스코어 입력
  async updateMatchScore(matchId, setData) {
    try {
      const matches = await this.getStoredData(this.MATCHES_KEY, []);
      const matchIndex = matches.findIndex(m => m.id === matchId);
      
      if (matchIndex === -1) {
        return { success: false, error: '매치를 찾을 수 없습니다.' };
      }

      const match = matches[matchIndex];
      
      // 세트 데이터 추가/업데이트
      const setIndex = match.sets.findIndex(s => s.setNumber === setData.setNumber);
      
      if (setIndex >= 0) {
        match.sets[setIndex] = setData;
      } else {
        match.sets.push(setData);
      }

      // 매치 완료 확인
      const winCondition = match.type === 'singles' ? 2 : 2; // 3세트 중 2세트 승리
      const setsWon = this.calculateSetsWon(match.sets);
      
      if (Math.max(...Object.values(setsWon)) >= winCondition) {
        match.status = 'completed';
        match.winner = this.determineWinner(match.sets, match.type);
        match.completedAt = new Date().toISOString();
      }

      match.updatedAt = new Date().toISOString();
      matches[matchIndex] = match;
      
      await this.setStoredData(this.MATCHES_KEY, matches);
      
      // 통계 업데이트
      await this.updatePlayerStats(match);
      
      return { success: true, data: match };
    } catch (error) {
      console.error('스코어 업데이트 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 세트 승수 계산
  calculateSetsWon(sets) {
    const wins = { player1: 0, player2: 0, team1: 0, team2: 0 };
    
    sets.forEach(set => {
      if (set.score.player1 > set.score.player2) {
        wins.player1++;
        wins.team1++;
      } else {
        wins.player2++;
        wins.team2++;
      }
    });

    return wins;
  }

  // 승자 결정
  determineWinner(sets, matchType) {
    const setsWon = this.calculateSetsWon(sets);
    
    if (matchType === 'singles') {
      return setsWon.player1 > setsWon.player2 ? 'player1' : 'player2';
    } else {
      return setsWon.team1 > setsWon.team2 ? 'team1' : 'team2';
    }
  }

  // 플레이어 통계 업데이트
  async updatePlayerStats(match) {
    try {
      const stats = await this.getStoredData(this.STATS_KEY, {});
      
      if (match.type === 'singles') {
        await this.updateSinglesStats(stats, match);
      } else {
        await this.updateDoublesStats(stats, match);
      }
      
      await this.setStoredData(this.STATS_KEY, stats);
    } catch (error) {
      console.error('통계 업데이트 실패:', error);
    }
  }

  // 단식 통계 업데이트
  async updateSinglesStats(stats, match) {
    const players = [match.players.player1, match.players.player2];
    const winner = match.winner;
    
    players.forEach((player, index) => {
      const playerId = player.id;
      const isWinner = (index === 0 && winner === 'player1') || 
                      (index === 1 && winner === 'player2');
      
      if (!stats[playerId]) {
        stats[playerId] = {
          totalGames: 0,
          wins: 0,
          losses: 0,
          setsWon: 0,
          setsLost: 0,
          pointsWon: 0,
          pointsLost: 0,
          skillLevel: player.skillLevel
        };
      }
      
      const playerStats = stats[playerId];
      playerStats.totalGames++;
      
      if (isWinner) {
        playerStats.wins++;
      } else {
        playerStats.losses++;
      }
      
      // 세트별 점수 계산
      match.sets.forEach(set => {
        const playerScore = index === 0 ? set.score.player1 : set.score.player2;
        const opponentScore = index === 0 ? set.score.player2 : set.score.player1;
        
        playerStats.pointsWon += playerScore;
        playerStats.pointsLost += opponentScore;
        
        if (playerScore > opponentScore) {
          playerStats.setsWon++;
        } else {
          playerStats.setsLost++;
        }
      });
    });
  }

  // 복식 통계 업데이트
  async updateDoublesStats(stats, match) {
    const team1 = match.teams.team1;
    const team2 = match.teams.team2;
    const winner = match.winner;
    
    const teams = [
      { players: team1, isWinner: winner === 'team1' },
      { players: team2, isWinner: winner === 'team2' }
    ];
    
    teams.forEach(team => {
      team.players.forEach(player => {
        const playerId = player.id;
        
        if (!stats[playerId]) {
          stats[playerId] = {
            totalGames: 0,
            wins: 0,
            losses: 0,
            setsWon: 0,
            setsLost: 0,
            pointsWon: 0,
            pointsLost: 0,
            skillLevel: player.skillLevel
          };
        }
        
        const playerStats = stats[playerId];
        playerStats.totalGames++;
        
        if (team.isWinner) {
          playerStats.wins++;
        } else {
          playerStats.losses++;
        }
      });
    });
  }

  // 랭킹 조회
  async getRankings(type = 'overall') {
    try {
      const stats = await this.getStoredData(this.STATS_KEY, {});
      
      const rankings = Object.entries(stats).map(([playerId, playerStats]) => ({
        playerId,
        ...playerStats,
        winRate: playerStats.totalGames > 0 ? 
          (playerStats.wins / playerStats.totalGames * 100).toFixed(1) : 0,
        avgPointsPerGame: playerStats.totalGames > 0 ? 
          (playerStats.pointsWon / playerStats.totalGames).toFixed(1) : 0
      }));
      
      // 정렬 기준에 따라 정렬
      switch (type) {
        case 'wins':
          rankings.sort((a, b) => b.wins - a.wins);
          break;
        case 'winRate':
          rankings.sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate));
          break;
        default:
          // 종합 점수 (승수 + 승률 + 경기수)
          rankings.sort((a, b) => {
            const scoreA = a.wins * 2 + parseFloat(a.winRate) + a.totalGames * 0.1;
            const scoreB = b.wins * 2 + parseFloat(b.winRate) + b.totalGames * 0.1;
            return scoreB - scoreA;
          });
      }
      
      return { success: true, data: rankings };
    } catch (error) {
      console.error('랭킹 조회 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 유틸리티 함수들
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async createSampleGames() {
    const sampleGames = [
      {
        title: '주말 배드민턴 정기모임',
        description: '매주 토요일 정기 배드민턴 모임입니다.',
        gameType: 'doubles',
        level: 'intermediate',
        gameDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        location: {
          name: '강남 배드민턴장',
          address: '서울 강남구 테헤란로 123',
          courts: 4
        },
        maxParticipants: 16,
        fee: 15000,
        createdBy: 'admin'
      },
      {
        title: '초보자 환영 배드민턴',
        description: '초보자를 위한 배드민턴 게임입니다.',
        gameType: 'singles',
        level: 'beginner',
        gameDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        location: {
          name: '종로 배드민턴장',
          address: '서울 종로구 종로 456',
          courts: 2
        },
        maxParticipants: 8,
        fee: 10000,
        createdBy: 'admin'
      }
    ];

    for (const gameData of sampleGames) {
      await this.createGame(gameData);
    }
  }
}

export default new GameService();
