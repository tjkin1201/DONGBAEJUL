import { MD3LightTheme } from 'react-native-paper';

// 체육관 환경 최적화 색상 팔레트
export const colors = {
  // 주요 색상 (높은 가시성)
  primary: '#FF6B35',      // 주황 - 활기차고 잘 보임
  primaryLight: '#FF8A65',
  primaryDark: '#E64A19',
  
  // 보조 색상
  secondary: '#2196F3',    // 파랑 - 신뢰감, 차분함
  secondaryLight: '#64B5F6',
  secondaryDark: '#1976D2',
  
  // 상태 색상
  success: '#4CAF50',      // 초록 - 완료, 성공
  warning: '#FF9800',      // 주황 - 주의, 대기
  error: '#F44336',        // 빨강 - 오류, 긴급
  
  // 체육관 환경 고대비
  background: '#FFFFFF',   // 순백색
  surface: '#F5F5F5',     // 연회색
  text: '#000000',        // 순검정
  textSecondary: '#666666',
  border: '#E0E0E0',
  
  // 감정별 색상
  excitement: '#FF6B35',   // 설렘, 기대
  focus: '#2196F3',       // 집중, 몰입
  satisfaction: '#4CAF50', // 만족, 성취
  rest: '#9E9E9E',        // 휴식, 대기
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryLight,
    surface: colors.surface,
    background: colors.background,
    error: colors.error,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: colors.text,
    onBackground: colors.text,
  },
  fonts: {
    ...MD3LightTheme.fonts,
    // 체육관에서 읽기 쉬운 굵은 폰트
    headlineLarge: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 40,
    },
    headlineMedium: {
      fontSize: 24,
      fontWeight: 'bold',
      lineHeight: 32,
    },
    titleLarge: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    bodyLarge: {
      fontSize: 18,
      fontWeight: '400',
      lineHeight: 24,
    },
  },
};