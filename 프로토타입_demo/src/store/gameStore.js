import { create } from 'zustand';

// 프로토타입용 상태 관리
export const useGameStore = create((set, get) => ({
  // 사용자 상태
  user: null,
  isCheckedIn: false,
  
  // 게임 상태
  currentGame: null,
  games: [],
  participants: [],
  
  // UI 상태
  gameStatus: 'beforeGame', // 'beforeGame', 'gameDay', 'duringGame', 'afterGame'
  
  // 액션들
  setUser: (user) => set({ user }),
  
  checkIn: () => set({ 
    isCheckedIn: true,
    gameStatus: 'duringGame'
  }),
  
  updateGameStatus: (status) => set({ gameStatus: status }),
  
  addScore: (gameId, winningTeam) => set((state) => ({
    games: state.games.map(game => 
      game.id === gameId 
        ? {
            ...game,
            score: {
              ...game.score,
              [winningTeam]: game.score[winningTeam] + 1
            }
          }
        : game
    )
  })),
  
  // 프로토타입용 초기 데이터
  initializePrototypeData: () => set({
    user: {
      id: 'user_1',
      name: '김철수',
      role: 'regular', // 'newbie', 'regular', 'organizer'
      level: 'intermediate'
    },
    
    participants: [
      { id: 'user_1', name: '김철수', checkedIn: false, level: 'intermediate' },
      { id: 'user_2', name: '박영희', checkedIn: true, level: 'advanced' },
      { id: 'user_3', name: '이민수', checkedIn: true, level: 'beginner' },
      { id: 'user_4', name: '정지혜', checkedIn: false, level: 'intermediate' },
      { id: 'user_5', name: '최준호', checkedIn: true, level: 'advanced' },
      { id: 'user_6', name: '한현우', checkedIn: true, level: 'intermediate' },
    ],
    
    games: [
      {
        id: 'game_1',
        court: 'A',
        players: ['박영희', '이민수', '최준호', '한현우'],
        teams: {
          teamA: ['박영희', '이민수'],
          teamB: ['최준호', '한현우']
        },
        score: { teamA: 15, teamB: 12 },
        status: 'playing',
        currentSet: 1
      },
      {
        id: 'game_2', 
        court: 'B',
        players: ['정지혜', '김민기', '이수진', '박태현'],
        teams: {
          teamA: ['정지혜', '김민기'],
          teamB: ['이수진', '박태현']
        },
        score: { teamA: 21, teamB: 18 },
        status: 'completed',
        winner: 'teamA'
      }
    ],
    
    currentGame: {
      nextOpponent: '박영희',
      estimatedWaitTime: 12, // 분
      myPosition: 3
    },
    
    gameStatus: 'gameDay' // 프로토타입 시작을 게임 당일로 설정
  }),
}));