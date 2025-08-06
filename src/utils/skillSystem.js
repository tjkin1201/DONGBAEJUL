/**
 * 사용자 실력 등급 및 통계 관리 유틸리티
 */

// ELO 레이팅 시스템 기반 실력 점수 계산
export const calculateSkillRating = (currentRating, opponentRating, gameResult, kFactor = 32) => {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - currentRating) / 400));
  const actualScore = gameResult === 'win' ? 1 : gameResult === 'draw' ? 0.5 : 0;
  
  const newRating = currentRating + kFactor * (actualScore - expectedScore);
  return Math.round(Math.max(800, Math.min(2500, newRating))); // 800-2500 범위 제한
};

// 실력 등급 분류
export const getSkillLevel = (rating) => {
  if (rating < 1000) return { 
    level: '입문', 
    color: '#6C757D', 
    icon: '🥉',
    description: '배드민턴을 시작한 단계'
  };
  if (rating < 1200) return { 
    level: '초급', 
    color: '#28A745', 
    icon: '🥈',
    description: '기본기를 익히는 단계'
  };
  if (rating < 1400) return { 
    level: '중급', 
    color: '#FF6B35', 
    icon: '🥇',
    description: '안정적인 실력의 단계'
  };
  if (rating < 1600) return { 
    level: '고급', 
    color: '#6F42C1', 
    icon: '💎',
    description: '숙련된 플레이어'
  };
  if (rating < 1800) return { 
    level: '전문가', 
    color: '#DC3545', 
    icon: '👑',
    description: '전문적인 수준'
  };
  return { 
    level: '프로', 
    color: '#FFD700', 
    icon: '🏆',
    description: '프로페셔널 레벨'
  };
};

// 승률 계산
export const calculateWinRate = (wins, losses) => {
  const totalGames = wins + losses;
  if (totalGames === 0) return 0;
  return Number(((wins / totalGames) * 100).toFixed(1));
};

// 최근 폼 계산 (최근 10경기 기준)
export const calculateRecentForm = (recentGames) => {
  if (!recentGames || recentGames.length === 0) return { streak: 0, form: 'unknown' };
  
  const wins = recentGames.filter(game => game.result === 'win').length;
  const winRate = (wins / recentGames.length) * 100;
  
  let form;
  if (winRate >= 70) form = 'excellent';
  else if (winRate >= 50) form = 'good';
  else if (winRate >= 30) form = 'average';
  else form = 'poor';
  
  // 연승/연패 계산
  let streak = 0;
  const streakType = recentGames[0]?.result;
  
  for (const game of recentGames) {
    if (game.result === streakType) {
      streak++;
    } else {
      break;
    }
  }
  
  return { streak, streakType, form, winRate: winRate.toFixed(1) };
};

// 성취 뱃지 체크
export const checkAchievements = (userStats, recentGames = []) => {
  const achievements = [];
  
  // 경기 수 기반 성취
  if (userStats.totalGames >= 1) achievements.push('first_game');
  if (userStats.totalGames >= 10) achievements.push('veteran_10');
  if (userStats.totalGames >= 50) achievements.push('veteran_50');
  if (userStats.totalGames >= 100) achievements.push('veteran_100');
  
  // 승리 기반 성취
  if (userStats.wins >= 1) achievements.push('first_win');
  if (userStats.wins >= 10) achievements.push('winner_10');
  if (userStats.wins >= 25) achievements.push('winner_25');
  if (userStats.wins >= 50) achievements.push('winner_50');
  
  // 승률 기반 성취
  const winRate = calculateWinRate(userStats.wins, userStats.losses);
  if (winRate >= 60 && userStats.totalGames >= 10) achievements.push('skilled_player');
  if (winRate >= 75 && userStats.totalGames >= 20) achievements.push('expert_player');
  if (winRate >= 85 && userStats.totalGames >= 30) achievements.push('master_player');
  
  // 레이팅 기반 성취
  if (userStats.skillRating >= 1200) achievements.push('rating_1200');
  if (userStats.skillRating >= 1400) achievements.push('rating_1400');
  if (userStats.skillRating >= 1600) achievements.push('rating_1600');
  if (userStats.skillRating >= 1800) achievements.push('rating_1800');
  
  // 연승 기반 성취
  const form = calculateRecentForm(recentGames);
  if (form.streakType === 'win') {
    if (form.streak >= 3) achievements.push('win_streak_3');
    if (form.streak >= 5) achievements.push('win_streak_5');
    if (form.streak >= 10) achievements.push('win_streak_10');
  }
  
  return achievements;
};

// 성취 뱃지 정보
export const achievementBadges = {
  first_game: { name: '첫 경기', icon: '🎯', description: '첫 번째 경기 완료' },
  first_win: { name: '첫 승리', icon: '🏆', description: '첫 번째 승리 달성' },
  veteran_10: { name: '경험자', icon: '🎖️', description: '10경기 완료' },
  veteran_50: { name: '베테랑', icon: '🏅', description: '50경기 완료' },
  veteran_100: { name: '마스터', icon: '👑', description: '100경기 완료' },
  winner_10: { name: '승리자', icon: '🥉', description: '10승 달성' },
  winner_25: { name: '정복자', icon: '🥈', description: '25승 달성' },
  winner_50: { name: '챔피언', icon: '🥇', description: '50승 달성' },
  skilled_player: { name: '숙련자', icon: '⭐', description: '승률 60% 이상' },
  expert_player: { name: '전문가', icon: '🌟', description: '승률 75% 이상' },
  master_player: { name: '마스터', icon: '💫', description: '승률 85% 이상' },
  rating_1200: { name: '초급 달성', icon: '📈', description: '레이팅 1200 달성' },
  rating_1400: { name: '중급 달성', icon: '📊', description: '레이팅 1400 달성' },
  rating_1600: { name: '고급 달성', icon: '🚀', description: '레이팅 1600 달성' },
  rating_1800: { name: '전문가 달성', icon: '⚡', description: '레이팅 1800 달성' },
  win_streak_3: { name: '3연승', icon: '🔥', description: '3연승 달성' },
  win_streak_5: { name: '5연승', icon: '💥', description: '5연승 달성' },
  win_streak_10: { name: '10연승', icon: '🌪️', description: '10연승 달성' },
};

// 추천 상대 찾기 (레이팅 기반)
export const findSuitableOpponents = (userRating, availablePlayers, maxRatingDiff = 200) => {
  return availablePlayers
    .filter(player => {
      const ratingDiff = Math.abs(player.skillRating - userRating);
      return ratingDiff <= maxRatingDiff;
    })
    .sort((a, b) => {
      const diffA = Math.abs(a.skillRating - userRating);
      const diffB = Math.abs(b.skillRating - userRating);
      return diffA - diffB;
    });
};

// 경기 난이도 계산
export const calculateGameDifficulty = (userRating, opponentRating) => {
  const diff = opponentRating - userRating;
  
  if (diff > 150) return { level: 'very_hard', color: '#DC3545', description: '매우 어려움' };
  if (diff > 75) return { level: 'hard', color: '#FD7E14', description: '어려움' };
  if (diff > -75) return { level: 'balanced', color: '#28A745', description: '균형잡힌 상대' };
  if (diff > -150) return { level: 'easy', color: '#17A2B8', description: '쉬움' };
  return { level: 'very_easy', color: '#6C757D', description: '매우 쉬움' };
};
