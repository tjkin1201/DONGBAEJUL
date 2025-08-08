const express = require('express');
const router = express.Router();

// 임시 인증 라우트 (개발용)
router.post('/login', (req, res) => {
  const { phone, password } = req.body;
  
  // 기본 검증
  if (!phone || !password) {
    return res.status(400).json({ 
      error: 'Phone number and password are required' 
    });
  }
  
  // 임시 사용자 검증
  const tempUser = {
    id: 1,
    name: '김동배',
    phone: phone,
    bandId: 'user001',
    isAdmin: true,
    profileImage: null
  };
  
  // 임시 토큰 생성
  const token = `temp_token_${Date.now()}`;
  
  res.json({
    success: true,
    user: tempUser,
    token: token,
    message: 'Login successful'
  });
});

// 회원가입
router.post('/register', (req, res) => {
  const { name, phone, password } = req.body;
  
  if (!name || !phone || !password) {
    return res.status(400).json({ 
      error: 'Name, phone number, and password are required' 
    });
  }
  
  // 임시 사용자 생성
  const newUser = {
    id: Date.now(),
    name: name,
    phone: phone,
    bandId: `user${Date.now()}`,
    isAdmin: false,
    profileImage: null,
    memberSince: new Date().toISOString().split('T')[0],
    totalGames: 0,
    wins: 0,
    losses: 0,
    winRate: 0
  };
  
  const token = `temp_token_${Date.now()}`;
  
  res.status(201).json({
    success: true,
    user: newUser,
    token: token,
    message: 'Registration successful'
  });
});

// 로그아웃
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// 토큰 검증
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || !token.startsWith('temp_token_')) {
    return res.status(401).json({ 
      error: 'Invalid or missing token' 
    });
  }
  
  // 임시 사용자 반환
  res.json({
    valid: true,
    user: {
      id: 1,
      name: '김동배',
      phone: '010-1234-5678',
      bandId: 'user001',
      isAdmin: true,
      profileImage: null
    }
  });
});

module.exports = router;
