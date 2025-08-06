import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import webCompatibleBandAPI from '../services/webCompatibleBandAPI';

// 웹 호환 메시지 표시 함수
const showCompatibleMessage = (messageConfig) => {
  if (Platform.OS === 'web') {
    const { message, description, type } = messageConfig;
    const fullMessage = description ? `${message}: ${description}` : message;
    
    if (type === 'danger' || type === 'error') {
      console.error('❌', fullMessage);
    } else {
      console.log('✅', fullMessage);
    }
  }
};

// 인증 컨텍스트 생성
const AuthContext = createContext();

// 초기 상태
const initialState = {
  isLoading: false,
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
  error: null,
  // Band 관련 상태
  isBandUser: false,
  bandAccessToken: null,
  selectedBand: null,
};

// 인증 프로바이더
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(initialState);

  // 앱 시작시 자동 로그인 시도
  useEffect(() => {
    const tryAutoLogin = async () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        
        const autoLoginResult = await webCompatibleBandAPI.tryAutoLogin();
        
        if (autoLoginResult.success) {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            isAuthenticated: true,
            isBandUser: true,
            user: {
              id: autoLoginResult.userInfo.user_key,
              name: autoLoginResult.userInfo.name,
              email: autoLoginResult.userInfo.email || 'band@example.com',
              profileImage: autoLoginResult.userInfo.profile_image_url
            },
            bandAccessToken: autoLoginResult.accessToken,
            selectedBand: autoLoginResult.userInfo.bands && autoLoginResult.userInfo.bands[0] ? autoLoginResult.userInfo.bands[0] : null
          }));
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        setAuthState(prev => ({ ...prev, isLoading: false, error: error.message }));
      }
    };

    tryAutoLogin();
  }, []);

  // 로그인 함수
  const login = async (credentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // 임시 로그인 로직 (실제로는 API 호출)
      showCompatibleMessage({
        message: '로그인 시도',
        description: `${credentials.email || credentials.username}으로 로그인 중...`,
        type: 'info'
      });

      // 임시 성공 처리
      setTimeout(() => {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: true,
          user: {
            id: '1',
            name: '테스트 사용자',
            email: credentials.email || 'test@example.com'
          },
          token: 'temp_token'
        }));

        showCompatibleMessage({
          message: '로그인 성공',
          description: '환영합니다!',
          type: 'success'
        });
      }, 1000);

      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false, error: error.message }));
      showCompatibleMessage({
        message: '로그인 실패',
        description: error.message,
        type: 'danger'
      });
      return { success: false, error: error.message };
    }
  };

  // 회원가입 함수
  const signup = async (userData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      showCompatibleMessage({
        message: '회원가입 시도',
        description: `${userData.email}으로 가입 중...`,
        type: 'info'
      });

      // 임시 성공 처리
      setTimeout(() => {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: true,
          user: {
            id: '1',
            name: userData.name,
            email: userData.email
          },
          token: 'temp_token'
        }));

        showCompatibleMessage({
          message: '회원가입 성공',
          description: `${userData.name}님, 동배즐에 오신 것을 환영합니다!`,
          type: 'success'
        });
      }, 1000);

      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false, error: error.message }));
      showCompatibleMessage({
        message: '회원가입 실패',
        description: error.message,
        type: 'danger'
      });
      return { success: false, error: error.message };
    }
  };

  // 로그아웃 함수
  const logout = async () => {
    setAuthState(initialState);
    showCompatibleMessage({
      message: '로그아웃',
      description: '안전하게 로그아웃되었습니다.',
      type: 'info'
    });
  };

  // Band 로그인 함수
  const loginWithBand = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      showCompatibleMessage({
        message: 'Band 로그인',
        description: 'Band API를 통해 로그인 중...',
        type: 'info'
      });

      // 실제 Band API 호출
      const result = await webCompatibleBandAPI.startBandLogin();

      if (result.success) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: true,
          isBandUser: true,
          user: {
            id: result.userInfo.user_key,
            name: result.userInfo.name,
            email: result.userInfo.email || 'band@example.com',
            profileImage: result.userInfo.profile_image_url
          },
          bandAccessToken: result.accessToken,
          selectedBand: result.userInfo.bands && result.userInfo.bands[0] ? result.userInfo.bands[0] : null
        }));

        showCompatibleMessage({
          message: 'Band 로그인 성공',
          description: `${result.userInfo.name}님, Band 계정으로 성공적으로 로그인되었습니다!`,
          type: 'success'
        });

        return { success: true };
      } else {
        throw new Error('Band 로그인에 실패했습니다.');
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false, error: error.message }));
      showCompatibleMessage({
        message: 'Band 로그인 실패',
        description: error.message,
        type: 'danger'
      });
      return { success: false, error: error.message };
    }
  };

  // 기타 함수들
  const updateProfile = async (_profileData) => {
    showCompatibleMessage({
      message: '프로필 업데이트',
      description: '프로필이 업데이트되었습니다.',
      type: 'success'
    });
    return { success: true };
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const value = {
    ...authState,
    login,
    signup,
    logout,
    loginWithBand,
    updateProfile,
    clearError,
    // 임시 함수들
    uploadProfileImage: async () => ({ success: true }),
    requestPasswordReset: async () => ({ success: true }),
    resetPassword: async () => ({ success: true }),
    selectBandClub: async () => ({ success: true }),
    getBandClubs: async () => []
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 인증 컨텍스트 사용 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
