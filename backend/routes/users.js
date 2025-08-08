const express = require('express');
const router = express.Router();

// 임시 사용자 데이터 (개발용)
const tempUsers = [
  {
    id: 1,
    name: '김동배',
    phone: '010-1234-5678',
    bandId: 'user001',
    isAdmin: true,
    profileImage: null,
    memberSince: '2024-01-01',
    totalGames: 45,
    wins: 32,
    losses: 13,
    winRate: 71.1
  },
  {
    id: 2,
    name: '이영희',
    phone: '010-2345-6789',
    bandId: 'user002',
    isAdmin: false,
    profileImage: null,
    memberSince: '2024-02-15',
    totalGames: 23,
    wins: 15,
    losses: 8,
    winRate: 65.2
  }
];

// 기본 사용자 정보 조회
router.get('/me', (req, res) => {
  // TODO: 실제 인증 미들웨어 구현 후 req.user 사용
  const userId = req.query.userId || 1;
  const user = tempUsers.find(u => u.id == userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(user);
});

// 모든 사용자 목록 조회 (관리자용)
router.get('/', (req, res) => {
  res.json(tempUsers);
});

// 사용자 프로필 업데이트
router.put('/:userId', (req, res) => {
  const { userId } = req.params;
  const { name, phone } = req.body;
  
  const userIndex = tempUsers.findIndex(u => u.id == userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  if (name) tempUsers[userIndex].name = name;
  if (phone) tempUsers[userIndex].phone = phone;
  
  res.json(tempUsers[userIndex]);
});

// 사용자 통계 조회
router.get('/:userId/stats', (req, res) => {
  const { userId } = req.params;
  const user = tempUsers.find(u => u.id == userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    totalGames: user.totalGames,
    wins: user.wins,
    losses: user.losses,
    winRate: user.winRate,
    memberSince: user.memberSince
  });
});

module.exports = router;
