import { Platform } from 'react-native';

// 웹 호환 스토리지
const Storage = {
  async setItem(key, value) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      // React Native에서는 AsyncStorage 사용
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(key, value);
    }
  },

  async getItem(key) {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem(key);
    }
  },

  async removeItem(key) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem(key);
    }
  }
};

// 웹 호환 메시지 표시
const showMessage = (config) => {
  if (Platform.OS === 'web') {
    const { message, description, type } = config;
    const fullMessage = description ? `${message}: ${description}` : message;
    
    if (type === 'danger' || type === 'error') {
      console.error('❌', fullMessage);
      alert(`오류: ${fullMessage}`);
    } else if (type === 'success') {
      console.log('✅', fullMessage);
      // 웹에서는 성공 메시지를 조용히 처리
    } else {
      console.log('ℹ️', fullMessage);
    }
  }
};

/**
 * 웹 호환 Band API 클래스
 */
class WebCompatibleBandAPI {
  constructor() {
    this.baseURL = 'https://openapi.band.us';
    this.clientId = 'YOUR_BAND_CLIENT_ID'; // 실제 클라이언트 ID로 교체 필요
    this.redirectUri = Platform.OS === 'web' 
      ? 'http://localhost:8081/auth/callback' 
      : 'dongbaejul://auth/callback';
    this.accessToken = null;
    this.userInfo = null;
  }

  /**
   * Mock 로그인 (개발용)
   */
  async mockBandLogin() {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const mockUserInfo = {
          user_key: 'mock_user_123',
          name: '테스트 사용자',
          email: 'test@band.com',
          profile_image_url: 'https://via.placeholder.com/100',
          bands: [
            {
              band_key: 'mock_band_456',
              name: '동백배드민턴클럽',
              cover: 'https://via.placeholder.com/300x200',
              member_count: 25
            }
          ]
        };

        const mockToken = 'mock_band_access_token_' + Date.now();
        this.accessToken = mockToken;
        this.userInfo = mockUserInfo;

        // 토큰 저장
        await Storage.setItem('bandAccessToken', mockToken);
        await Storage.setItem('bandUserInfo', JSON.stringify(mockUserInfo));

        showMessage({
          message: 'Band 로그인 성공',
          description: `${mockUserInfo.name}님, 환영합니다!`,
          type: 'success'
        });

        resolve({
          success: true,
          accessToken: mockToken,
          userInfo: mockUserInfo
        });
      }, 1500); // 1.5초 딜레이로 실제 API 호출 시뮬레이션
    });
  }

  /**
   * 실제 Band 로그인
   */
  async realBandLogin() {
    try {
      // 실제 Band OAuth URL 생성
      const authUrl = `${this.baseURL}/v2/oauth/authorize` +
        `?client_id=${this.clientId}` +
        `&redirect_uri=${encodeURIComponent(this.redirectUri)}` +
        `&response_type=code` +
        `&scope=band.read`;

      if (Platform.OS === 'web') {
        // 웹에서는 새 창으로 OAuth 진행
        const authWindow = window.open(authUrl, 'bandAuth', 'width=500,height=600');
        
        return new Promise((resolve, reject) => {
          const checkClosed = setInterval(() => {
            if (authWindow.closed) {
              clearInterval(checkClosed);
              reject(new Error('사용자가 로그인을 취소했습니다.'));
            }
          }, 1000);

          // 메시지 리스너 (콜백에서 전달받을 때)
          const messageListener = async (event) => {
            if (event.origin !== window.location.origin) return;
            
            if (event.data.type === 'BAND_AUTH_SUCCESS') {
              clearInterval(checkClosed);
              window.removeEventListener('message', messageListener);
              authWindow.close();
              
              const tokenResult = await this.exchangeCodeForToken(event.data.code);
              resolve(tokenResult);
            } else if (event.data.type === 'BAND_AUTH_ERROR') {
              clearInterval(checkClosed);
              window.removeEventListener('message', messageListener);
              authWindow.close();
              reject(new Error(event.data.error));
            }
          };
          
          window.addEventListener('message', messageListener);
        });
      } else {
        // React Native에서는 Linking 사용
        const { Linking } = require('react-native');
        await Linking.openURL(authUrl);
        return new Promise((resolve) => {
          // Deep link 리스너 설정 필요
          resolve({ success: false, error: 'Native implementation needed' });
        });
      }
    } catch (error) {
      showMessage({
        message: 'Band 로그인 실패',
        description: error.message,
        type: 'error'
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * 코드를 액세스 토큰으로 교환
   */
  async exchangeCodeForToken(code) {
    try {
      const response = await fetch(`${this.baseURL}/v2/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=authorization_code&client_id=${this.clientId}&code=${code}&redirect_uri=${encodeURIComponent(this.redirectUri)}`
      });

      const data = await response.json();
      
      if (data.access_token) {
        this.accessToken = data.access_token;
        
        // 사용자 정보 가져오기
        const userInfo = await this.fetchUserInfo();
        if (userInfo.success) {
          await Storage.setItem('bandAccessToken', data.access_token);
          await Storage.setItem('bandUserInfo', JSON.stringify(userInfo.data));
          
          return {
            success: true,
            accessToken: data.access_token,
            userInfo: userInfo.data
          };
        } else {
          return { success: false, error: 'Failed to fetch user info' };
        }
      } else {
        return { success: false, error: data.error_description || 'Token exchange failed' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 사용자 정보 가져오기
   */
  async fetchUserInfo() {
    try {
      const response = await fetch(`${this.baseURL}/v2/profile`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      const data = await response.json();
      
      if (data.result_code === 1) {
        this.userInfo = data.result_data;
        return { success: true, data: data.result_data };
      } else {
        return { success: false, error: data.result_data?.error_description };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Band 로그인 시작 (환경에 따라 Mock 또는 실제 로그인)
   */
  async startBandLogin() {
    if (Platform.OS === 'web') {
      // 웹에서는 개발용 Mock 로그인 사용
      return await this.mockBandLogin();
    } else {
      // 실제 환경에서는 진짜 Band API 사용
      return await this.realBandLogin();
    }
  }

  /**
   * 자동 로그인 시도
   */
  async tryAutoLogin() {
    try {
      // 저장된 액세스 토큰 확인
      const accessToken = await Storage.getItem('bandAccessToken');
      if (!accessToken) {
        return { success: false, error: 'No stored token' };
      }

      // 웹 환경에서는 저장된 토큰으로 Mock 데이터 반환
      if (Platform.OS === 'web') {
        const storedUserInfo = await Storage.getItem('bandUserInfo');
        if (storedUserInfo) {
          const userInfo = JSON.parse(storedUserInfo);
          this.accessToken = accessToken;
          this.userInfo = userInfo;
          
          return {
            success: true,
            accessToken,
            userInfo
          };
        }
      }

      // 실제 환경에서는 토큰 유효성 검증
      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`${this.baseURL}/v2/profile`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        // 토큰이 만료되었거나 유효하지 않으면 삭제
        await Storage.removeItem('bandAccessToken');
        await Storage.removeItem('bandUserInfo');
        return { success: false, error: 'Token validation failed' };
      }

      const data = await response.json();
      
      if (data.result_code === 1) {
        this.accessToken = accessToken;
        this.userInfo = data.result_data;
        
        return {
          success: true,
          accessToken,
          userInfo: data.result_data
        };
      } else {
        await Storage.removeItem('bandAccessToken');
        await Storage.removeItem('bandUserInfo');
        return { success: false, error: data.result_data?.error_description || 'API error' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 로그아웃
   */
  async logout() {
    try {
      await Storage.removeItem('bandAccessToken');
      await Storage.removeItem('bandUserInfo');
      this.accessToken = null;
      this.userInfo = null;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 인증 상태 확인
   */
  isAuthenticated() {
    return !!this.accessToken;
  }

  /**
   * 현재 사용자 정보 반환
   */
  getCurrentUser() {
    return this.userInfo;
  }
}

// 싱글톤 인스턴스
const webCompatibleBandAPI = new WebCompatibleBandAPI();

export default webCompatibleBandAPI;
