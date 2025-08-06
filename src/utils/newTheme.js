// 새로운 테마와 색상 시스템
export const newTheme = {
  colors: {
    primary: '#FF6B35',
    primaryDark: '#FF4500',
    secondary: '#20B2AA',
    secondaryDark: '#17A2B8',
    accent: '#FFD700',
    success: '#28A745',
    background: {
      light: '#F8F9FA',
      dark: '#1A1A1A',
    },
    surface: {
      light: '#FFFFFF',
      dark: '#2D2D2D',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#6C757D',
      inverse: '#FFFFFF',
    },
    gradient: {
      primary: ['#FF6B35', '#FF4500'],
      secondary: ['#20B2AA', '#17A2B8'],
      sunset: ['#FF6B35', '#FFD700'],
      ocean: ['#17A2B8', '#20B2AA'],
    },
  },
  typography: {
    fontFamily: {
      regular: 'Inter-Regular',
      medium: 'Inter-Medium',
      bold: 'Inter-Bold',
    },
    sizes: {
      h1: 32,
      h2: 24,
      h3: 20,
      body: 16,
      caption: 14,
      small: 12,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
  },
  shadows: {
    sm: {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

export default newTheme;
