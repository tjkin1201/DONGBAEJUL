const express = require('express');
const router = express.Router();

// 관리자 권한 확인 미들웨어 (임시)
const requireAdmin = (req, res, next) => {
  // TODO: 실제 토큰 검증 및 관리자 권한 확인
  const isAdmin = true; // 임시로 모든 요청을 관리자로 처리
  
  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
};

// 모든 사용자 관리
router.get('/users', requireAdmin, (req, res) => {
  // 임시 사용자 데이터
  const users = [
    {
      id: 1,
      name: '김동배',
      phone: '010-1234-5678',
      bandId: 'user001',
      isAdmin: true,
      memberSince: '2024-01-01',
      totalGames: 45,
      status: 'active'
    },
    {
      id: 2,
      name: '이영희',
      phone: '010-2345-6789',
      bandId: 'user002',
      isAdmin: false,
      memberSince: '2024-02-15',
      totalGames: 23,
      status: 'active'
    },
    {
      id: 3,
      name: '박철수',
      phone: '010-3456-7890',
      bandId: 'user003',
      isAdmin: false,
      memberSince: '2024-03-10',
      totalGames: 12,
      status: 'inactive'
    }
  ];
  
  res.json(users);
});

// 사용자 권한 변경
router.put('/users/:userId/role', requireAdmin, (req, res) => {
  const { userId } = req.params;
  const { isAdmin } = req.body;
  
  // 임시 응답
  res.json({
    success: true,
    message: `User ${userId} admin status updated to ${isAdmin}`,
    userId: parseInt(userId),
    isAdmin: Boolean(isAdmin)
  });
});

// 사용자 상태 변경 (활성/비활성)
router.put('/users/:userId/status', requireAdmin, (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;
  
  if (!['active', 'inactive', 'banned'].includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status. Must be active, inactive, or banned' 
    });
  }
  
  // 임시 응답
  res.json({
    success: true,
    message: `User ${userId} status updated to ${status}`,
    userId: parseInt(userId),
    status: status
  });
});

// 게임 관리 - 모든 게임 조회
router.get('/games', requireAdmin, (req, res) => {
  // 임시 게임 데이터
  const games = [
    {
      id: 1,
      date: '2024-12-17',
      time: '19:00',
      location: '체육관 A코트',
      type: '복식',
      status: 'recruiting',
      playersCount: 2,
      maxPlayers: 4,
      createdBy: '김동배'
    },
    {
      id: 2,
      date: '2024-12-18',
      time: '20:00',
      location: '체육관 B코트',
      type: '단식',
      status: 'completed',
      playersCount: 2,
      maxPlayers: 2,
      createdBy: '김동배'
    }
  ];
  
  res.json(games);
});

// 게임 강제 취소
router.delete('/games/:gameId', requireAdmin, (req, res) => {
  const { gameId } = req.params;
  const { reason } = req.body;
  
  // 임시 응답
  res.json({
    success: true,
    message: `Game ${gameId} has been cancelled`,
    gameId: parseInt(gameId),
    reason: reason || 'Cancelled by admin'
  });
});

// 시스템 통계
router.get('/stats', requireAdmin, (req, res) => {
  const stats = {
    totalUsers: 15,
    activeUsers: 12,
    totalGames: 156,
    gamesThisWeek: 8,
    gamesThisMonth: 32,
    averagePlayersPerGame: 3.2,
    popularGameType: '복식',
    busyHours: ['19:00', '20:00', '21:00']
  };
  
  res.json(stats);
});

// 공지사항 관리
router.get('/announcements', requireAdmin, (req, res) => {
  const announcements = [
    {
      id: 1,
      title: '체육관 이용 안내',
      content: '12월 25일 체육관 휴관입니다.',
      type: 'info',
      priority: 'normal',
      isActive: true,
      createdAt: '2024-12-15T10:00:00Z'
    },
    {
      id: 2,
      title: '월말 대회 안내',
      content: '12월 30일 월말 대회가 있습니다.',
      type: 'event',
      priority: 'high',
      isActive: true,
      createdAt: '2024-12-16T15:30:00Z'
    }
  ];
  
  res.json(announcements);
});

// 공지사항 생성
router.post('/announcements', requireAdmin, (req, res) => {
  const { title, content, type, priority } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ 
      error: 'Title and content are required' 
    });
  }
  
  const newAnnouncement = {
    id: Date.now(),
    title,
    content,
    type: type || 'info',
    priority: priority || 'normal',
    isActive: true,
    createdAt: new Date().toISOString()
  };
  
  res.status(201).json(newAnnouncement);
});

module.exports = router;
