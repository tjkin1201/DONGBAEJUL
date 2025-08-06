const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');

const router = express.Router();
const prisma = new PrismaClient();

// JWT 토큰 생성 함수
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      bandUserId: user.bandUserId,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// 로그인 (Band OAuth 시뮬레이션)
router.post('/login', [
  body('bandUserId').notEmpty().withMessage('Band User ID is required'),
  body('username').notEmpty().withMessage('Username is required'),
  body('displayName').notEmpty().withMessage('Display name is required')
], async (req, res) => {
  try {
    // 입력값 검증
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { bandUserId, username, displayName, email, avatarUrl } = req.body;

    // 기존 사용자 조회 또는 생성
    let user = await prisma.user.findUnique({
      where: { bandUserId }
    });

    if (!user) {
      // 새 사용자 생성
      user = await prisma.user.create({
        data: {
          bandUserId,
          username,
          displayName,
          email,
          avatarUrl,
          role: 'MEMBER',
          status: 'ACTIVE'
        }
      });
    } else {
      // 기존 사용자 정보 업데이트
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          displayName,
          email,
          avatarUrl,
          lastActiveAt: new Date()
        }
      });
    }

    // JWT 토큰 생성
    const token = generateToken(user);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          bandUserId: user.bandUserId,
          username: user.username,
          displayName: user.displayName,
          email: user.email,
          avatarUrl: user.avatarUrl,
          role: user.role,
          status: user.status,
          skillLevel: user.skillLevel
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Login failed'
    });
  }
});

// 토큰 갱신
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Token is required'
      });
    }

    // 토큰 검증 (만료된 토큰도 허용)
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    
    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid user'
      });
    }

    // 새 토큰 생성
    const newToken = generateToken(user);

    res.json({
      success: true,
      data: {
        token: newToken,
        user: {
          id: user.id,
          bandUserId: user.bandUserId,
          username: user.username,
          displayName: user.displayName,
          email: user.email,
          avatarUrl: user.avatarUrl,
          role: user.role,
          status: user.status,
          skillLevel: user.skillLevel
        }
      }
    });

  } catch (error) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token'
    });
  }
});

// 로그아웃
router.post('/logout', async (req, res) => {
  try {
    // 실제로는 토큰 블랙리스트에 추가하거나 Redis에서 제거
    // 여기서는 단순히 성공 응답만 반환
    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Logout failed'
    });
  }
});

// 현재 사용자 정보 조회
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      });
    }

    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        bandUserId: true,
        username: true,
        displayName: true,
        email: true,
        avatarUrl: true,
        role: true,
        status: true,
        skillLevel: true,
        joinedAt: true,
        lastActiveAt: true
      }
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid user'
      });
    }

    // 마지막 활동 시간 업데이트
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() }
    });

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get user info'
    });
  }
});

module.exports = router;
