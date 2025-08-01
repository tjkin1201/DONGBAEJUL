import React, { createContext, useContext, useReducer, useEffect } from 'react';
import bandAPI from '../services/bandAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Band Context 생성
const BandContext = createContext();

// 초기 상태
const initialState = {
  isLoading: true,
  isAuthenticated: false,
  user: null,
  accessToken: null,
  userBands: [],
  badmintonBands: [],
  selectedBand: null,
  error: null,
};

// 액션 타입
const BAND_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER_BANDS: 'SET_USER_BANDS',
  SET_BADMINTON_BANDS: 'SET_BADMINTON_BANDS',
  SET_SELECTED_BAND: 'SET_SELECTED_BAND',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// 리듀서
const bandReducer = (state, action) => {
  switch (action.type) {
    case BAND_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case BAND_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.userInfo,
        accessToken: action.payload.accessToken,
        error: null,
      };

    case BAND_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        error: action.payload,
      };

    case BAND_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };

    case BAND_ACTIONS.SET_USER_BANDS:
      return {
        ...state,
        userBands: action.payload,
      };

    case BAND_ACTIONS.SET_BADMINTON_BANDS:
      return {
        ...state,
        badmintonBands: action.payload,
      };

    case BAND_ACTIONS.SET_SELECTED_BAND:
      return {
        ...state,
        selectedBand: action.payload,
      };

    case BAND_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Band Provider 컴포넌트
export const BandProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bandReducer, initialState);

  // 초기화 시 저장된 세션 복원 시도
  useEffect(() => {
    restoreSession();
  }, []);

  // 세션 복원
  const restoreSession = async () => {
    try {
      dispatch({ type: BAND_ACTIONS.SET_LOADING, payload: true });
      
      const session = await bandAPI.restoreSession();
      if (session) {
        dispatch({
          type: BAND_ACTIONS.LOGIN_SUCCESS,
          payload: session,
        });
        
        // 사용자 밴드 목록 로드
        await loadUserBands();
      } else {
        dispatch({ type: BAND_ACTIONS.SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error('세션 복원 실패:', error);
      dispatch({ type: BAND_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Band 로그인
  const loginWithBand = async () => {
    try {
      dispatch({ type: BAND_ACTIONS.SET_LOADING, payload: true });
      
      const result = await bandAPI.startBandLogin();
      dispatch({
        type: BAND_ACTIONS.LOGIN_SUCCESS,
        payload: result,
      });

      // 사용자 밴드 목록 로드
      await loadUserBands();
      
      return result;
    } catch (error) {
      console.error('Band 로그인 실패:', error);
      dispatch({
        type: BAND_ACTIONS.LOGIN_FAILURE,
        payload: error.message,
      });
      throw error;
    }
  };

  // 사용자 밴드 목록 로드
  const loadUserBands = async () => {
    try {
      const bands = await bandAPI.getUserBands();
      dispatch({
        type: BAND_ACTIONS.SET_USER_BANDS,
        payload: bands,
      });

      // 배드민턴 관련 밴드 필터링
      const badmintonBands = await bandAPI.findBadmintonBands();
      dispatch({
        type: BAND_ACTIONS.SET_BADMINTON_BANDS,
        payload: badmintonBands,
      });

      return bands;
    } catch (error) {
      console.error('밴드 목록 로드 실패:', error);
      throw error;
    }
  };

  // 밴드 선택
  const selectBand = async (bandKey) => {
    try {
      const bandInfo = await bandAPI.getBandInfo(bandKey);
      const members = await bandAPI.getBandMembers(bandKey);
      
      const selectedBand = {
        ...bandInfo,
        members: members,
      };

      dispatch({
        type: BAND_ACTIONS.SET_SELECTED_BAND,
        payload: selectedBand,
      });

      // 선택된 밴드 저장
      await AsyncStorage.setItem('selected_band_key', bandKey);
      
      return selectedBand;
    } catch (error) {
      console.error('밴드 선택 실패:', error);
      throw error;
    }
  };

  // 밴드 데이터를 앱 클럽 형식으로 동기화
  const syncBandToClub = async (bandKey) => {
    try {
      const bandInfo = await bandAPI.getBandInfo(bandKey);
      const members = await bandAPI.getBandMembers(bandKey);
      
      // 밴드 데이터를 클럽 형식으로 변환
      const clubData = bandAPI.convertBandToClub(bandInfo, members);
      
      return clubData;
    } catch (error) {
      console.error('밴드 동기화 실패:', error);
      throw error;
    }
  };

  // 밴드에 게임 정보 공유
  const shareGameToBand = async (bandKey, gameData) => {
    try {
      const content = `🏸 새로운 배드민턴 게임이 등록되었습니다!

📋 게임명: ${gameData.title}
📅 일시: ${new Date(gameData.gameDate).toLocaleDateString('ko-KR')} ${new Date(gameData.gameDate).toLocaleTimeString('ko-KR')}
📍 장소: ${gameData.location.address}
👥 모집인원: ${gameData.maxParticipants}명
💰 참가비: ${gameData.fee.toLocaleString()}원

동배즐 앱에서 참가 신청하세요!`;

      const result = await bandAPI.createBandPost(bandKey, content, false);
      return result;
    } catch (error) {
      console.error('밴드 게임 공유 실패:', error);
      throw error;
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      await bandAPI.logout();
      await AsyncStorage.removeItem('selected_band_key');
      dispatch({ type: BAND_ACTIONS.LOGOUT });
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  // 에러 클리어
  const clearError = () => {
    dispatch({ type: BAND_ACTIONS.CLEAR_ERROR });
  };

  // Context 값
  const value = {
    // 상태
    ...state,
    
    // 액션
    loginWithBand,
    logout,
    loadUserBands,
    selectBand,
    syncBandToClub,
    shareGameToBand,
    clearError,
  };

  return (
    <BandContext.Provider value={value}>
      {children}
    </BandContext.Provider>
  );
};

// Band Context 사용을 위한 Hook
export const useBand = () => {
  const context = useContext(BandContext);
  if (!context) {
    throw new Error('useBand must be used within a BandProvider');
  }
  return context;
};

export default BandContext;