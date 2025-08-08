const express = require('express');
const router = express.Router();

// 임시 게임 데이터 (개발용)
let tempGames = [
  {
    id: 1,
    date: '2024-12-17',
    time: '19:00',
    location: '체육관 A코트',
    type: '복식',
    maxPlayers: 4,
    currentPlayers: 2,
    status: 'recruiting',
    createdBy: {
      id: 1,
      name: '김동배'
    },
    players: [
      { id: 1, name: '김동배', phone: '010-1234-5678' },
      { id: 2, name: '이영희', phone: '010-2345-6789' }
    ],
    results: null,
    createdAt: '2024-12-17T10:00:00Z'
  },
  {
    id: 2,
    date: '2024-12-18',
    time: '20:00',
    location: '체육관 B코트',
    type: '단식',
    maxPlayers: 2,
    currentPlayers: 2,
    status: 'full',
    createdBy: {
      id: 1,
      name: '김동배'
    },
    players: [
      { id: 1, name: '김동배', phone: '010-1234-5678' },
      { id: 3, name: '박철수', phone: '010-3456-7890' }
    ],
    results: null,
    createdAt: '2024-12-17T11:00:00Z'
  }
];

// 모든 게임 조회
router.get('/', (req, res) => {
  const { status, date } = req.query;
  
  let filteredGames = tempGames;
  
  if (status) {
    filteredGames = filteredGames.filter(game => game.status === status);
  }
  
  if (date) {
    filteredGames = filteredGames.filter(game => game.date === date);
  }
  
  res.json(filteredGames);
});

// 특정 게임 조회
router.get('/:gameId', (req, res) => {
  const { gameId } = req.params;
  const game = tempGames.find(g => g.id == gameId);
  
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  res.json(game);
});

// 새 게임 생성
router.post('/', (req, res) => {
  const { date, time, location, type, maxPlayers } = req.body;
  
  if (!date || !time || !location || !type || !maxPlayers) {
    return res.status(400).json({ 
      error: 'All game details are required' 
    });
  }
  
  const newGame = {
    id: Date.now(),
    date,
    time,
    location,
    type,
    maxPlayers: parseInt(maxPlayers),
    currentPlayers: 1,
    status: 'recruiting',
    createdBy: {
      id: 1, // TODO: 실제 사용자 ID
      name: '김동배'
    },
    players: [
      { id: 1, name: '김동배', phone: '010-1234-5678' }
    ],
    results: null,
    createdAt: new Date().toISOString()
  };
  
  tempGames.push(newGame);
  res.status(201).json(newGame);
});

// 게임 참가
router.post('/:gameId/join', (req, res) => {
  const { gameId } = req.params;
  const { userId, userName, userPhone } = req.body;
  
  const gameIndex = tempGames.findIndex(g => g.id == gameId);
  if (gameIndex === -1) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  const game = tempGames[gameIndex];
  
  // 이미 참가한 사용자인지 확인
  const isAlreadyJoined = game.players.some(p => p.id == userId);
  if (isAlreadyJoined) {
    return res.status(400).json({ error: 'Already joined this game' });
  }
  
  // 게임이 꽉 찼는지 확인
  if (game.currentPlayers >= game.maxPlayers) {
    return res.status(400).json({ error: 'Game is full' });
  }
  
  // 플레이어 추가
  game.players.push({
    id: userId || Date.now(),
    name: userName || '사용자',
    phone: userPhone || ''
  });
  
  game.currentPlayers = game.players.length;
  
  // 게임이 꽉 찼으면 상태 변경
  if (game.currentPlayers >= game.maxPlayers) {
    game.status = 'full';
  }
  
  tempGames[gameIndex] = game;
  res.json(game);
});

// 게임 떠나기
router.post('/:gameId/leave', (req, res) => {
  const { gameId } = req.params;
  const { userId } = req.body;
  
  const gameIndex = tempGames.findIndex(g => g.id == gameId);
  if (gameIndex === -1) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  const game = tempGames[gameIndex];
  
  // 플레이어 제거
  game.players = game.players.filter(p => p.id != userId);
  game.currentPlayers = game.players.length;
  
  // 상태 업데이트
  if (game.currentPlayers < game.maxPlayers) {
    game.status = 'recruiting';
  }
  
  // 플레이어가 없으면 게임 삭제
  if (game.currentPlayers === 0) {
    tempGames.splice(gameIndex, 1);
    return res.json({ message: 'Game deleted (no players left)' });
  }
  
  tempGames[gameIndex] = game;
  res.json(game);
});

// 게임 결과 업데이트
router.put('/:gameId/results', (req, res) => {
  const { gameId } = req.params;
  const { results } = req.body;
  
  const gameIndex = tempGames.findIndex(g => g.id == gameId);
  if (gameIndex === -1) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  tempGames[gameIndex].results = results;
  tempGames[gameIndex].status = 'completed';
  
  res.json(tempGames[gameIndex]);
});

module.exports = router;
