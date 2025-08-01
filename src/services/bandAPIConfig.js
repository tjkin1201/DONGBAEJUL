/**
 * Band API 설정 및 토큰 관리
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BAND_CLIENT_ID, BAND_CLIENT_SECRET, APP_ENV } from '@env';

export class BandAPIConfig {
  constructor() {
    this.isConfigured = false;
    this.checkConfiguration();
  }

  /**
   * Band API 설정 상태 확인
   */
  checkConfiguration() {
    this.isConfigured = !!(
      BAND_CLIENT_ID && 
      BAND_CLIENT_SECRET && 
      BAND_CLIENT_ID !== 'your_band_client_id_here' &&
      BAND_CLIENT_SECRET !== 'your_band_client_secret_here'
    );

    console.log('🎵 Band API 설정 상태:', {
      configured: this.isConfigured,
      clientIdExists: !!BAND_CLIENT_ID,
      clientSecretExists: !!BAND_CLIENT_SECRET,
      environment: APP_ENV || 'development',
    });
  }

  /**
   * 개발 모드인지 확인
   */
  isDevelopmentMode() {
    return APP_ENV === 'development' || !this.isConfigured;
  }

  /**
   * Mock API 사용 여부 결정
   */
  shouldUseMockAPI() {
    return this.isDevelopmentMode() || !this.isConfigured;
  }

  /**
   * Band API 자격 증명 정보
   */
  getCredentials() {
    return {
      clientId: BAND_CLIENT_ID,
      clientSecret: BAND_CLIENT_SECRET,
      redirectUri: this.getRedirectUri(),
    };
  }

  /**
   * Redirect URI 생성
   */
  getRedirectUri() {
    if (APP_ENV === 'production') {
      return 'dongbaejul://auth/band';
    } else {
      return 'exp://127.0.0.1:8081/--/auth/band';
    }
  }

  /**
   * 토큰 저장
   */
  async saveTokens(accessToken, refreshToken = null) {
    try {
      await AsyncStorage.setItem('band_access_token', accessToken);
      if (refreshToken) {
        await AsyncStorage.setItem('band_refresh_token', refreshToken);
      }
      console.log('✅ Band API 토큰 저장 완료');
    } catch (error) {
      console.error('❌ Band API 토큰 저장 실패:', error);
    }
  }

  /**
   * 토큰 불러오기
   */
  async loadTokens() {
    try {
      const accessToken = await AsyncStorage.getItem('band_access_token');
      const refreshToken = await AsyncStorage.getItem('band_refresh_token');
      
      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error('❌ Band API 토큰 불러오기 실패:', error);
      return { accessToken: null, refreshToken: null };
    }
  }

  /**
   * 토큰 삭제
   */
  async clearTokens() {
    try {
      await AsyncStorage.removeItem('band_access_token');
      await AsyncStorage.removeItem('band_refresh_token');
      console.log('✅ Band API 토큰 삭제 완료');
    } catch (error) {
      console.error('❌ Band API 토큰 삭제 실패:', error);
    }
  }

  /**
   * API 설정 가이드 출력
   */
  printSetupGuide() {
    if (this.isConfigured) {
      console.log('✅ Band API 설정이 완료되었습니다.');
      return;
    }

    console.log(`
🎵 네이버 밴드 API 설정이 필요합니다!

📋 설정 단계:
1. https://developers.band.us 접속
2. 개발자 등록 및 앱 생성
3. OAuth 설정:
   - Redirect URI: ${this.getRedirectUri()}
   - Scope: profile, band, band_write
4. .env 파일에 키 설정:
   BAND_CLIENT_ID=발급받은_클라이언트_ID
   BAND_CLIENT_SECRET=발급받은_클라이언트_시크릿

📖 자세한 가이드: docs/band-api-setup.md
    `);
  }
}

export default new BandAPIConfig();
