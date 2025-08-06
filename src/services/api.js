import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import Logger from '../utils/logger';

// API 기본 설정
const api = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 인증 토큰 자동 추가
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      Logger.error('토큰 조회 오류', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리 및 토큰 갱신
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 Unauthorized - 토큰 만료
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // 리프레시 토큰으로 새 액세스 토큰 획득
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          });
          
          const { accessToken } = response.data.data;
          await AsyncStorage.setItem('authToken', accessToken);
          
          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // 리프레시 실패 시 로그아웃
        await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userInfo']);
        // 로그인 화면으로 리다이렉트는 AuthContext에서 처리
      }
    }
    
    return Promise.reject(error);
  }
);

// API 메서드들
export const authAPI = {
  // 회원가입
  signup: (userData) => api.post('/auth/signup', userData),
  
  // 로그인
  login: (credentials) => api.post('/auth/login', credentials),
  
  // 로그아웃
  logout: () => api.post('/auth/logout'),
  
  // 토큰 갱신
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  
  // 비밀번호 재설정 요청
  requestPasswordReset: (email) => api.post('/auth/forgot-password', { email }),
  
  // 비밀번호 재설정
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
};

export const userAPI = {
  // 내 정보 조회
  getProfile: () => api.get('/users/me'),
  
  // 프로필 업데이트
  updateProfile: (userData) => api.put('/users/me', userData),
  
  // 프로필 이미지 업로드
  uploadProfileImage: (imageData) => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageData.uri,
      type: imageData.type,
      name: imageData.fileName || 'profile.jpg',
    });
    return api.post('/upload/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  // 사용자 검색
  searchUsers: (query) => api.get(`/users/search?q=${encodeURIComponent(query)}`),
  
  // 사용자 상세 정보
  getUserById: (userId) => api.get(`/users/${userId}`),
};

export const clubAPI = {
  // 클럽 목록 조회
  getClubs: (params = {}) => api.get('/clubs', { params }),
  
  // 내가 가입한 클럽 목록
  getMyClubs: () => api.get('/clubs/my-clubs'),
  
  // 클럽 상세 정보
  getClubById: (clubId) => api.get(`/clubs/${clubId}`),
  
  // 클럽 생성
  createClub: (clubData) => api.post('/clubs', clubData),
  
  // 클럽 수정
  updateClub: (clubId, clubData) => api.put(`/clubs/${clubId}`, clubData),
  
  // 클럽 삭제
  deleteClub: (clubId) => api.delete(`/clubs/${clubId}`),
  
  // 클럽 가입 신청
  joinClub: (clubId) => api.post(`/clubs/${clubId}/join`),
  
  // 클럽 탈퇴
  leaveClub: (clubId) => api.post(`/clubs/${clubId}/leave`),
  
  // 클럽 멤버 승인
  approveMember: (clubId, userId) => api.patch(`/clubs/${clubId}/members/${userId}/approve`),
  
  // 클럽 멤버 역할 변경
  changeMemberRole: (clubId, userId, role) => api.patch(`/clubs/${clubId}/members/${userId}/role`, { role }),
  
  // 클럽 이미지 업로드
  uploadClubImage: (clubId, imageData) => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageData.uri,
      type: imageData.type,
      name: imageData.fileName || 'club.jpg',
    });
    return api.post(`/upload/clubs/${clubId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const gameAPI = {
  // 게임 목록 조회
  getGames: (params = {}) => api.get('/games', { params }),
  
  // 다가오는 게임 목록
  getUpcomingGames: (params = {}) => api.get('/games/upcoming', { params }),
  
  // 최근 게임 목록 (내가 참가한)
  getRecentGames: (params = {}) => api.get('/games/recent', { params }),
  
  // 게임 상세 정보
  getGameById: (gameId) => api.get(`/games/${gameId}`),
  
  // 게임 생성
  createGame: (gameData) => api.post('/games', gameData),
  
  // 게임 수정
  updateGame: (gameId, gameData) => api.put(`/games/${gameId}`, gameData),
  
  // 게임 삭제
  deleteGame: (gameId) => api.delete(`/games/${gameId}`),
  
  // 게임 참가
  joinGame: (gameId) => api.post(`/games/${gameId}/join`),
  
  // 게임 탈퇴
  leaveGame: (gameId) => api.post(`/games/${gameId}/leave`),
  
  // 게임 결과 입력
  submitResult: (gameId, resultData) => api.post(`/games/${gameId}/results`, resultData),
  
  // 게임 이미지 업로드
  uploadGameImages: (gameId, images) => {
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append('images', {
        uri: image.uri,
        type: image.type,
        name: image.fileName || `game_${index}.jpg`,
      });
    });
    return api.post(`/upload/games/${gameId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const statisticsAPI = {
  // 내 통계 조회
  getMyStatistics: () => api.get('/statistics/me'),
  
  // 사용자 통계 조회
  getUserStatistics: (userId) => api.get(`/statistics/users/${userId}`),
  
  // 랭킹 조회
  getRankings: (params = {}) => api.get('/statistics/rankings', { params }),
  
  // 레벨별 랭킹
  getLevelRankings: (level, params = {}) => api.get(`/statistics/rankings/${level}`, { params }),
  
  // 상위 플레이어
  getTopPlayers: (limit = 10) => api.get(`/statistics/top-players?limit=${limit}`),
  
  // 월별 통계
  getMonthlyStatistics: (year, month) => api.get(`/statistics/me/monthly?year=${year}&month=${month}`),
  
  // 상대방과의 전적
  getOpponentRecord: (opponentId) => api.get(`/statistics/opponents/${opponentId}`),
  
  // 성취 목록
  getAchievements: (userId) => {
    const endpoint = userId ? `/statistics/users/${userId}/achievements` : '/statistics/me/achievements';
    return api.get(endpoint);
  },
  
  // 통계 대시보드
  getDashboard: () => api.get('/statistics/dashboard'),
};

export const fcmAPI = {
  // FCM 토큰 등록
  registerToken: (fcmToken, deviceInfo) => api.post('/fcm/tokens', { fcmToken, deviceInfo }),
  
  // FCM 토큰 삭제
  unregisterToken: (fcmToken) => api.delete('/fcm/tokens', { data: { fcmToken } }),
  
  // 토픽 구독
  subscribeToTopic: (topic) => api.post('/fcm/topics/subscribe', { topic }),
  
  // 토픽 구독 해제
  unsubscribeFromTopic: (topic) => api.post('/fcm/topics/unsubscribe', { topic }),
  
  // 알림 설정 업데이트
  updateNotificationSettings: (settings) => api.put('/fcm/settings', { notificationSettings: settings }),
  
  // 사용자 토큰 목록 조회
  getUserTokens: () => api.get('/fcm/tokens'),
  
  // FCM 서비스 상태
  getStatus: () => api.get('/fcm/status'),
};

export const notificationAPI = {
  // 알림 목록 조회
  getNotifications: (params = {}) => api.get('/notifications', { params }),
  
  // 읽지 않은 알림 수
  getUnreadCount: () => api.get('/notifications/unread-count'),
  
  // 알림 읽음 처리
  markAsRead: (notificationId) => api.patch(`/notifications/${notificationId}/read`),
  
  // 모든 알림 읽음 처리
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  
  // 알림 삭제
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
  
  // 알림 설정 조회
  getSettings: () => api.get('/notifications/settings'),
  
  // 알림 설정 업데이트
  updateSettings: (settings) => api.put('/notifications/settings', settings),
};

export default api;