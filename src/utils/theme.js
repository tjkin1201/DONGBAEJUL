import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1976D2',      // 배드민턴 코트 블루
    secondary: '#FF5722',    // 활동적인 오렌지
    accent: '#4CAF50',       // 성공/승리 그린
    background: '#F5F5F5',   // 연한 회색 배경
    surface: '#FFFFFF',      // 카드/모달 배경
    text: '#212121',         // 기본 텍스트
    placeholder: '#757575',  // 플레이스홀더
    disabled: '#BDBDBD',     // 비활성화
    error: '#F44336',        // 에러 빨강
    warning: '#FF9800',      // 경고 주황
    info: '#2196F3',         // 정보 파랑
    success: '#4CAF50',      // 성공 초록
    
    // 커스텀 색상
    badminton: {
      court: '#1976D2',      // 코트 색상
      shuttlecock: '#FFFFFF', // 셔틀콕 흰색
      net: '#424242',        // 네트 진회색
      racket: '#8D6E63',     // 라켓 갈색
    },
    
    // 레벨별 색상
    level: {
      beginner: '#4CAF50',   // 초급 - 초록
      intermediate: '#FF9800', // 중급 - 주황  
      advanced: '#9C27B0',   // 고급 - 보라
      expert: '#F44336',     // 전문가 - 빨강
    },
    
    // 그라데이션
    gradient: {
      primary: ['#1976D2', '#42A5F5'],
      secondary: ['#FF5722', '#FF8A65'],
      success: ['#4CAF50', '#81C784'],
      warning: ['#FF9800', '#FFB74D'],
    }
  },
  
  // 폰트 크기
  fonts: {
    ...DefaultTheme.fonts,
    small: { fontSize: 12 },
    medium: { fontSize: 14 },
    regular: { fontSize: 16 },
    large: { fontSize: 18 },
    title: { fontSize: 20, fontWeight: 'bold' },
    heading: { fontSize: 24, fontWeight: 'bold' },
    display: { fontSize: 32, fontWeight: 'bold' },
  },
  
  // 스페이싱
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // 둥근 모서리
  roundness: 8,
  
  // 그림자
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

export default theme;