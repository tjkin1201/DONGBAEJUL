import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    // 프리미엄 메인 컬러 팔레트
    primary: '#0052CC',      // 딥 블루 (고급스러운 코발트)
    primaryLight: '#4A90E2', // 라이트 블루
    primaryDark: '#003A8A',  // 다크 블루
    secondary: '#FF6B35',    // 에너지틱 오렌지
    tertiary: '#00C896',     // 프레시 민트
    accent: '#7B68EE',       // 엘레간트 퍼플
    
    // 뉴트럴 컬러 (고급 그레이 스케일)
    background: '#FAFBFC',   // 아이보리 화이트
    surface: '#FFFFFF',      // 퓨어 화이트
    surfaceVariant: '#F8F9FA', // 소프트 그레이
    outline: '#E1E5E9',      // 라이트 보더
    onSurface: '#1A202C',    // 다크 텍스트
    onSurfaceVariant: '#4A5568', // 미디엄 그레이
    
    // 시맨틱 컬러
    error: '#E53E3E',        // 모던 레드
    warning: '#F6AD55',      // 소프트 옐로우
    info: '#4299E1',         // 인포 블루
    success: '#38A169',      // 네이처 그린
    
    // 배드민턴 테마 컬러
    badminton: {
      court: '#0052CC',      // 코트 딥 블루
      courtLines: '#FFFFFF', // 코트 라인 화이트
      shuttlecock: '#F7FAFC', // 셔틀콕 오프화이트
      net: '#2D3748',        // 네트 다크 그레이
      racket: '#C05621',     // 라켓 브론즈
      racketString: '#E2E8F0', // 라켓 스트링
      victory: '#38A169',    // 승리 그린
      defeat: '#E53E3E',     // 패배 레드
    },
    
    // 스킬 레벨별 컬러 (프리미엄 그래디언트)
    skillLevel: {
      beginner: '#68D391',   // 프레시 그린
      intermediate: '#F6AD55', // 골든 옐로우
      advanced: '#9F7AEA',   // 로얄 퍼플
      expert: '#FC8181',     // 체리 레드
      pro: '#1A202C',        // 블랙 다이아몬드
    },
    
    // 프리미엄 그라데이션
    gradients: {
      primary: ['#0052CC', '#4A90E2', '#87CEEB'],
      secondary: ['#FF6B35', '#FF8E53', '#FFB366'],
      success: ['#00C896', '#48BB78', '#68D391'],
      warm: ['#FF6B35', '#FF8E53', '#F6AD55'],
      cool: ['#0052CC', '#4299E1', '#63B3ED'],
      elegant: ['#7B68EE', '#9F7AEA', '#B794F6'],
      sunset: ['#FF6B35', '#FF8E53', '#F6AD55', '#ECC94B'],
      ocean: ['#0052CC', '#2B6CB0', '#2C5282', '#2A4365'],
    },
    
    // 컨텍스트별 컬러
    game: {
      scheduled: '#4299E1',  // 예정된 게임
      ongoing: '#38A169',    // 진행중
      completed: '#A0AEC0',  // 완료
      cancelled: '#E53E3E',  // 취소
    },
    
    // 인터랙션 컬러
    interaction: {
      hover: '#EDF2F7',      // 호버 상태
      pressed: '#E2E8F0',    // 프레스 상태
      focus: '#BEE3F8',      // 포커스 상태
      disabled: '#F7FAFC',   // 비활성화
    }
  },
  
  // 프리미엄 타이포그래피 시스템
  fonts: {
    ...DefaultTheme.fonts,
    // 기본 사이즈
    xs: { fontSize: 10, lineHeight: 14 },
    sm: { fontSize: 12, lineHeight: 16 },
    base: { fontSize: 14, lineHeight: 20 },
    md: { fontSize: 16, lineHeight: 24 },
    lg: { fontSize: 18, lineHeight: 28 },
    xl: { fontSize: 20, lineHeight: 28 },
    
    // 헤딩 사이즈
    h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
    h2: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
    h3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
    h4: { fontSize: 18, fontWeight: '600', lineHeight: 25 },
    h5: { fontSize: 16, fontWeight: '600', lineHeight: 22 },
    h6: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
    
    // 컨텍스트별 폰트
    display: { fontSize: 36, fontWeight: '800', lineHeight: 44 },
    title: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
    subtitle: { fontSize: 18, fontWeight: '500', lineHeight: 25 },
    body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
    caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
    overline: { fontSize: 10, fontWeight: '500', lineHeight: 14, letterSpacing: 1.5 },
    
    // 특수 폰트
    mono: { fontFamily: 'Menlo, Monaco, Consolas, monospace' },
    badge: { fontSize: 11, fontWeight: '600', lineHeight: 14 },
    button: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  },
  
  // 정교한 스페이싱 시스템
  spacing: {
    px: 1,
    0.5: 2,
    1: 4,
    1.5: 6,
    2: 8,
    2.5: 10,
    3: 12,
    3.5: 14,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    12: 48,
    14: 56,
    16: 64,
    20: 80,
    24: 96,
    28: 112,
    32: 128,
    
    // 시맨틱 스페이싱
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  // 현대적인 라운드 시스템
  borderRadius: {
    none: 0,
    xs: 2,
    sm: 4,
    base: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
    
    // 컴포넌트별 라운드
    button: 8,
    card: 12,
    modal: 16,
    input: 8,
    badge: 12,
    avatar: 9999,
  },
  roundness: 12, // 기본값 증가
  
  // 프리미엄 그림자 시스템
  shadows: {
    // 기본 그림자
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    xs: {
      shadowColor: '#1A202C',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: '#1A202C',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    base: {
      shadowColor: '#1A202C',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    md: {
      shadowColor: '#1A202C',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: '#1A202C',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 8,
    },
    xl: {
      shadowColor: '#1A202C',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 12,
    },
    xxl: {
      shadowColor: '#1A202C',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 16,
    },
    
    // 컨텍스트별 그림자
    card: {
      shadowColor: '#1A202C',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    modal: {
      shadowColor: '#1A202C',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.25,
      shadowRadius: 25,
      elevation: 20,
    },
    fab: {
      shadowColor: '#1A202C',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
    },
  },
  
  // 애니메이션 및 트랜지션
  animation: {
    timing: {
      fast: 150,
      base: 200,
      slow: 300,
      slower: 500,
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
  
  // 인터랙션 피드백
  haptics: {
    light: 'light',
    medium: 'medium',
    heavy: 'heavy',
    selection: 'selection',
    impact: 'impact',
  },
};

export default theme;