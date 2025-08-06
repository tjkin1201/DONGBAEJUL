// 동배줄 백엔드 API 서버
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');
const { createServer } = require('http');
const { Server } = require('socket.io');

// 환경변수 로드
require('dotenv').config();

// Express 앱 초기화
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:19006",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Prisma 클라이언트 초기화
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// 전역 미들웨어
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:19006",
  credentials: true
}));

app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// API 라우터 설정
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const categoryRoutes = require('./routes/categories');
const photoRoutes = require('./routes/photos');
const albumRoutes = require('./routes/albums');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const searchRoutes = require('./routes/search');

// 라우터 연결
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);

// 정적 파일 서빙 (업로드된 이미지)
app.use('/uploads', express.static('uploads'));

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
      posts: '/api/posts',
      comments: '/api/comments',
      categories: '/api/categories',
      photos: '/api/photos',
      albums: '/api/albums',
      chat: '/api/chat',
      admin: '/api/admin',
      search: '/api/search'
    }
  });
});

// Socket.IO 연결 처리
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // 채팅방 참여
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // 채팅방 나가기
  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room ${roomId}`);
  });

  // 메시지 전송
  socket.on('send-message', async (data) => {
    try {
      const { roomId, senderId, content, messageType = 'TEXT' } = data;
      
      // 메시지 DB 저장
      const message = await prisma.chatMessage.create({
        data: {
          roomId,
          senderId,
          content,
          messageType
        },
        include: {
          sender: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true
            }
          }
        }
      });

      // 채팅방의 모든 사용자에게 메시지 전송
      io.to(roomId).emit('new-message', message);
      
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message-error', { error: 'Failed to send message' });
    }
  });

  // 타이핑 표시
  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('user-typing', {
      userId: data.userId,
      displayName: data.displayName
    });
  });

  // 타이핑 중지
  socket.on('stop-typing', (data) => {
    socket.to(data.roomId).emit('user-stop-typing', {
      userId: data.userId
    });
  });

  // 연결 해제
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// 404 에러 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Prisma 에러 처리
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Conflict',
      message: 'Resource already exists',
      timestamp: new Date().toISOString()
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Resource not found',
      timestamp: new Date().toISOString()
    });
  }

  // JWT 에러 처리
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token',
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token expired',
      timestamp: new Date().toISOString()
    });
  }

  // 기본 에러 응답
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : err.message,
    timestamp: new Date().toISOString()
  });
});

// 서버 시작
const PORT = process.env.PORT || 3000;

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

server.listen(PORT, () => {
  console.log(`🚀 Dongbaejul API Server running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, io, prisma };
