import React from 'react';
import { render, screen } from '@testing-library/react-native';
import App from '../../App';

// Mock Expo modules
jest.mock('expo-font');
jest.mock('expo-splash-screen', () => ({
  hideAsync: jest.fn(),
  preventAutoHideAsync: jest.fn(),
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

describe('App Component', () => {
  it('앱이 정상적으로 렌더링되는지 확인', () => {
    render(<App />);
    // 기본적인 렌더링 테스트
    expect(screen).toBeDefined();
  });

  it('스플래시 스크린이 숨겨지는지 확인', async () => {
    const { SplashScreen } = require('expo-splash-screen');
    render(<App />);
    
    // SplashScreen.hideAsync가 호출되었는지 확인
    expect(SplashScreen.hideAsync).toHaveBeenCalled();
  });
});
