import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import LoginScreen from '../../screens/auth/LoginScreen';

// Mock context providers
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
    loading: false,
    error: null,
  }),
}));

describe('LoginScreen Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('로그인 화면이 정상적으로 렌더링되는지 확인', () => {
    render(<LoginScreen />);
    
    // 기본 요소들이 렌더링되는지 확인
    expect(screen.getByText('로그인')).toBeTruthy();
    expect(screen.getByPlaceholderText('이메일')).toBeTruthy();
    expect(screen.getByPlaceholderText('비밀번호')).toBeTruthy();
  });

  it('이메일과 비밀번호 입력이 정상적으로 작동하는지 확인', () => {
    render(<LoginScreen />);
    
    const emailInput = screen.getByPlaceholderText('이메일');
    const passwordInput = screen.getByPlaceholderText('비밀번호');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    
    expect(emailInput.props.value).toBe('test@example.com');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('로그인 버튼 클릭시 올바른 함수가 호출되는지 확인', () => {
    const mockLogin = jest.fn();
    jest.doMock('../../context/AuthContext', () => ({
      useAuth: () => ({
        login: mockLogin,
        loading: false,
        error: null,
      }),
    }));

    render(<LoginScreen />);
    
    const loginButton = screen.getByText('로그인');
    fireEvent.press(loginButton);
    
    // 로그인 함수가 호출되었는지 확인
    expect(mockLogin).toHaveBeenCalled();
  });
});
