// 동배줄 백엔드 API 서버
const express = require('express');
const cors = require('cors');
const path = require('path');

// 환경변수 로드
require('dotenv').config();

// Express 앱 초기화
const app = express();
const PORT = process.env.PORT || 3001;

// 전역 미들웨어
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:19006",
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API 라우터 설정
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const gameRoutes = require('./routes/games');
const adminRoutes = require('./routes/admin');

// 라우터 연결
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API 문서 루트
app.get('/api', (req, res) => {
  res.json({
    name: 'Dongbaejul API Server',
    version: '1.0.0',
    description: 'Backend API for Dongbaejul badminton club app',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      games: '/api/games',
      admin: '/api/admin',
      health: '/health'
    }
  });
});

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    timestamp: new Date().toISOString()
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Dongbaejul API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📖 API docs: http://localhost:${PORT}/api`);
});

module.exports = app;
