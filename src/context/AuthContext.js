import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, userAPI } from '../services/api';
import bandAPI from '../services/bandAPI';
import { showMessage } from 'react-native-flash-message';

// 인증 상태 관리
const AuthContext = createContext();

// 초기 상태
const initialState = {
  isLoading: true,
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

// 액션 타입
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_ERROR: 'SET_ERROR',
  // Band 관련 액션
  BAND_LOGIN_SUCCESS: 'BAND_LOGIN_SUCCESS',
  SET_SELECTED_BAND: 'SET_SELECTED_BAND',
};

// 리듀서
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    case AUTH_ACTIONS.BAND_LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        isBandUser: true,
        user: action.payload.user,
        bandAccessToken: action.payload.accessToken,
        error: null,
      };

    case AUTH_ACTIONS.SET_SELECTED_BAND:
      return {
        ...state,
        selectedBand: action.payload,
      };

    default:
      return state;
  }
};

// 인증 프로바이더
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 앱 시작 시 저장된 토큰 확인
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      // 일반 로그인 토큰 확인
      const [token, refreshToken, userInfo] = await AsyncStorage.multiGet([
        'authToken',
        'refreshToken',
        'userInfo'
      ]);

      const authToken = token[1];
      const refresh = refreshToken[1];
      const user = userInfo[1] ? JSON.parse(userInfo[1]) : null;

      if (authToken && user) {
        // 일반 로그인 사용자
        try {
          const response = await userAPI.getProfile();
          const updatedUser = response.data.data.user;

          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              token: authToken,
              refreshToken: refresh,
              user: updatedUser,
            },
          });

          await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUser));
        } catch (error) {
          await logout();
        }
      } else {
        // Band 로그인 확인
        const bandSession = await bandAPI.restoreSession();
        if (bandSession) {
          const bandUser = bandAPI.convertBandUserToAppUser(bandSession.userInfo);
          
          dispatch({
            type: AUTH_ACTIONS.BAND_LOGIN_SUCCESS,
            payload: {
              accessToken: bandSession.accessToken,
              user: bandUser,
            },
          });

          // Band 사용자 정보 저장
          await AsyncStorage.setItem('bandUserInfo', JSON.stringify(bandUser));
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      }
    } catch (error) {
      console.error('인증 상태 확인 오류:', error);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.login(credentials);
      const { user, accessToken, refreshToken } = response.data.data;

      // 토큰과 사용자 정보 저장
      await AsyncStorage.multiSet([
        ['authToken', accessToken],
        ['refreshToken', refreshToken],
        ['userInfo', JSON.stringify(user)],
      ]);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          token: accessToken,
          refreshToken,
          user,
        },
      });

      showMessage({
        message: '로그인 성공',
        description: `${user.name}님, 환영합니다!`,
        type: 'success',
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || '로그인에 실패했습니다.';
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });

      showMessage({
        message: '로그인 실패',
        description: errorMessage,
        type: 'danger',
      });

      return { success: false, error: errorMessage };
    }
  };

  const signup = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.signup(userData);
      const { user, accessToken, refreshToken } = response.data.data;

      // 토큰과 사용자 정보 저장
      await AsyncStorage.multiSet([
        ['authToken', accessToken],
        ['refreshToken', refreshToken],
        ['userInfo', JSON.stringify(user)],
      ]);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          token: accessToken,
          refreshToken,
          user,
        },
      });

      showMessage({
        message: '회원가입 성공',
        description: `${user.name}님, 동배즐에 오신 것을 환영합니다!`,
        type: 'success',
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || '회원가입에 실패했습니다.';
      
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });

      showMessage({
        message: '회원가입 실패',
        description: errorMessage,
        type: 'danger',
      });

      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      // 서버에 로그아웃 요청
      if (state.isAuthenticated) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('로그아웃 요청 오류:', error);
    } finally {
      // 로컬 저장소 정리
      await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userInfo']);
      
      dispatch({ type: AUTH_ACTIONS.LOGOUT });

      showMessage({
        message: '로그아웃',
        description: '안전하게 로그아웃되었습니다.',
        type: 'info',
      });
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await userAPI.updateProfile(userData);
      const updatedUser = response.data.data.user;

      // 컨텍스트 상태 업데이트
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: updatedUser,
      });

      // 로컬 저장소 업데이트
      await AsyncStorage.setItem('userInfo', JSON.stringify({
        ...state.user,
        ...updatedUser,
      }));

      showMessage({
        message: '프로필 업데이트',
        description: '프로필이 성공적으로 업데이트되었습니다.',
        type: 'success',
      });

      return { success: true, user: updatedUser };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || '프로필 업데이트에 실패했습니다.';
      
      showMessage({
        message: '프로필 업데이트 실패',
        description: errorMessage,
        type: 'danger',
      });

      return { success: false, error: errorMessage };
    }
  };

  const uploadProfileImage = async (imageData) => {
    try {
      const response = await userAPI.uploadProfileImage(imageData);
      const { profileImage } = response.data.data;

      // 사용자 정보 업데이트
      const updatedUser = { ...state.user, profileImage };
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: { profileImage },
      });

      await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUser));

      showMessage({
        message: '프로필 사진 업데이트',
        description: '프로필 사진이 성공적으로 업데이트되었습니다.',
        type: 'success',
      });

      return { success: true, profileImage };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || '프로필 사진 업로드에 실패했습니다.';
      
      showMessage({
        message: '프로필 사진 업로드 실패',
        description: errorMessage,
        type: 'danger',
      });

      return { success: false, error: errorMessage };
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      await authAPI.requestPasswordReset(email);
      
      showMessage({
        message: '비밀번호 재설정',
        description: '이메일로 재설정 링크를 발송했습니다.',
        type: 'success',
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || '비밀번호 재설정 요청에 실패했습니다.';
      
      showMessage({
        message: '비밀번호 재설정 실패',
        description: errorMessage,
        type: 'danger',
      });

      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      await authAPI.resetPassword(token, newPassword);
      
      showMessage({
        message: '비밀번호 재설정 완료',
        description: '새 비밀번호로 로그인해주세요.',
        type: 'success',
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || '비밀번호 재설정에 실패했습니다.';
      
      showMessage({
        message: '비밀번호 재설정 실패',
        description: errorMessage,
        type: 'danger',
      });

      return { success: false, error: errorMessage };
    }
  };

  // Band 로그인
  const loginWithBand = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const result = await bandAPI.startBandLogin();
      const bandUser = bandAPI.convertBandUserToAppUser(result.userInfo);

      dispatch({
        type: AUTH_ACTIONS.BAND_LOGIN_SUCCESS,
        payload: {
          accessToken: result.accessToken,
          user: bandUser,
        },
      });

      // Band 사용자 정보 저장
      await AsyncStorage.setItem('bandUserInfo', JSON.stringify(bandUser));

      showMessage({
        message: 'Band 로그인 성공',
        description: `${bandUser.name}님, 환영합니다!`,
        type: 'success',
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Band 로그인에 실패했습니다.';
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });

      showMessage({
        message: 'Band 로그인 실패',
        description: errorMessage,
        type: 'danger',
      });

      return { success: false, error: errorMessage };
    }
  };

  // Band 동호회 선택
  const selectBandClub = async (bandKey) => {
    try {
      const bandInfo = await bandAPI.getBandInfo(bandKey);
      const members = await bandAPI.getBandMembers(bandKey);
      
      const clubData = bandAPI.convertBandToClub(bandInfo, members);
      
      dispatch({
        type: AUTH_ACTIONS.SET_SELECTED_BAND,
        payload: clubData,
      });

      await AsyncStorage.setItem('selectedBandClub', JSON.stringify(clubData));
      
      return clubData;
    } catch (error) {
      console.error('Band 클럽 선택 실패:', error);
      throw error;
    }
  };

  // Band 동호회 목록 가져오기
  const getBandClubs = async () => {
    try {
      return await bandAPI.findBadmintonBands();
    } catch (error) {
      console.error('Band 클럽 목록 조회 실패:', error);
      return [];
    }
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    signup,
    logout,
    updateProfile,
    uploadProfileImage,
    requestPasswordReset,
    resetPassword,
    clearError,
    // Band 관련 함수
    loginWithBand,
    selectBandClub,
    getBandClubs,
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