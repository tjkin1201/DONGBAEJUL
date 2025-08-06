import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import mockBandAPI from './mockBandAPI';
import { BAND_CLIENT_ID, BAND_CLIENT_SECRET, APP_ENV } from '@env';
import Logger from '../utils/logger';

// WebBrowser 설정
WebBrowser.maybeCompleteAuthSession();

// Band API 설정
const BAND_API_BASE_URL = 'https://openapi.band.us/v2.1';
const CLIENT_ID = BAND_CLIENT_ID || 'your_band_client_id';
const CLIENT_SECRET = BAND_CLIENT_SECRET || 'your_band_client_secret';

// 개발 환경에서는 Mock API 사용
const USE_MOCK_API = APP_ENV === 'development' || !CLIENT_ID || CLIENT_ID === 'your_band_client_id';
const REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: 'dongbaejul',
  path: 'auth/band'
});

class BandAPI {
  constructor() {
    this.accessToken = null;
    this.userInfo = null;
  }

  /**
   * Band OAuth 로그인 시작
   */
  async startBandLogin() {
    // 개발 환경에서는 Mock API 사용
    if (USE_MOCK_API) {
      Logger.info('Mock Band API 사용 중');
      return await mockBandAPI.startBandLogin();
    }

    try {
      const request = new AuthSession.AuthRequest({
        clientId: CLIENT_ID,
        scopes: ['profile', 'band', 'band_write'],
        redirectUri: REDIRECT_URI,
        responseType: AuthSession.ResponseType.Code,
        additionalParameters: {},
        extraParams: {},
      });

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://auth.band.us/oauth2/authorize',
      });

      if (result.type === 'success') {
        const { code } = result.params;
        return await this.exchangeCodeForToken(code);
      } else {
        throw new Error('Band 로그인이 취소되었습니다.');
      }
    } catch (error) {
      console.error('Band 로그인 오류:', error);
      throw error;
    }
  }

  /**
   * 인증 코드를 액세스 토큰으로 교환
   */
  async exchangeCodeForToken(code) {
    try {
      const response = await axios.post('https://auth.band.us/oauth2/token', {
        grant_type: 'authorization_code',
        client_id: BAND_CLIENT_ID,
        client_secret: BAND_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token, refresh_token } = response.data;
      
      // 토큰 저장
      await AsyncStorage.setItem('band_access_token', access_token);
      if (refresh_token) {
        await AsyncStorage.setItem('band_refresh_token', refresh_token);
      }

      this.accessToken = access_token;
      
      // 사용자 정보 가져오기
      const userInfo = await this.getUserProfile();
      return { accessToken: access_token, userInfo };
    } catch (error) {
      console.error('토큰 교환 오류:', error);
      throw new Error('Band 인증 처리 중 오류가 발생했습니다.');
    }
  }

  /**
   * 저장된 토큰으로 로그인 상태 복원
   */
  async restoreSession() {
    if (USE_MOCK_API) {
      return await mockBandAPI.restoreSession();
    }

    try {
      const accessToken = await AsyncStorage.getItem('band_access_token');
      if (accessToken) {
        this.accessToken = accessToken;
        const userInfo = await this.getUserProfile();
        return { accessToken, userInfo };
      }
      return null;
    } catch (error) {
      console.error('세션 복원 오류:', error);
      return null;
    }
  }

  /**
   * 사용자 프로필 정보 가져오기
   */
  async getUserProfile() {
    try {
      const response = await axios.get(`${BAND_API_BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      this.userInfo = response.data.result_data;
      return this.userInfo;
    } catch (error) {
      console.error('사용자 프로필 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 사용자가 가입한 밴드 목록 가져오기
   */
  async getUserBands() {
    if (USE_MOCK_API) {
      return await mockBandAPI.getUserBands();
    }

    try {
      const response = await axios.get(`${BAND_API_BASE_URL}/bands`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      return response.data.result_data.bands || [];
    } catch (error) {
      console.error('밴드 목록 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 특정 밴드 정보 가져오기
   */
  async getBandInfo(bandKey) {
    try {
      const response = await axios.get(`${BAND_API_BASE_URL}/band`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
        params: {
          band_key: bandKey,
        },
      });

      return response.data.result_data;
    } catch (error) {
      console.error('밴드 정보 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 밴드 멤버 목록 가져오기
   */
  async getBandMembers(bandKey) {
    try {
      const response = await axios.get(`${BAND_API_BASE_URL}/band/members`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
        params: {
          band_key: bandKey,
        },
      });

      return response.data.result_data.members || [];
    } catch (error) {
      console.error('밴드 멤버 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 밴드 게시물 목록 가져오기
   */
  async getBandPosts(bandKey, after = null, limit = 20) {
    try {
      const params = {
        band_key: bandKey,
        limit: limit,
      };

      if (after) {
        params.after = after;
      }

      const response = await axios.get(`${BAND_API_BASE_URL}/band/posts`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
        params: params,
      });

      return response.data.result_data;
    } catch (error) {
      console.error('밴드 게시물 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 밴드에 게시물 작성
   */
  async createBandPost(bandKey, content, doNotificationAll = false) {
    try {
      const response = await axios.post(`${BAND_API_BASE_URL}/band/post/create`, {
        band_key: bandKey,
        content: content,
        do_notification_all: doNotificationAll,
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data.result_data;
    } catch (error) {
      console.error('밴드 게시물 작성 오류:', error);
      throw error;
    }
  }

  /**
   * 로그아웃
   */
  async logout() {
    try {
      await AsyncStorage.removeItem('band_access_token');
      await AsyncStorage.removeItem('band_refresh_token');
      this.accessToken = null;
      this.userInfo = null;
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  }

  /**
   * 배드민턴 동호회 밴드 찾기 (키워드 검색)
   */
  async findBadmintonBands() {
    if (USE_MOCK_API) {
      return await mockBandAPI.findBadmintonBands();
    }

    try {
      const userBands = await this.getUserBands();
      const badmintonKeywords = ['배드민턴', '배민', '셔틀콕', '동배즐', 'badminton'];
      
      return userBands.filter(band => {
        const bandName = band.name.toLowerCase();
        const bandDescription = (band.description || '').toLowerCase();
        
        return badmintonKeywords.some(keyword => 
          bandName.includes(keyword) || bandDescription.includes(keyword)
        );
      });
    } catch (error) {
      console.error('배드민턴 밴드 검색 오류:', error);
      return [];
    }
  }

  /**
   * 밴드 데이터를 동배즐 앱 형식으로 변환
   */
  convertBandToClub(bandData, members = []) {
    if (USE_MOCK_API) {
      return mockBandAPI.convertBandToClub(bandData, members);
    }

    return {
      id: bandData.band_key,
      name: bandData.name,
      description: bandData.description || '',
      clubImage: bandData.cover || null,
      location: '밴드에서 동기화',
      level: 'intermediate', // 기본값
      activityScore: bandData.member_count || 0,
      weeklyGames: 0, // 추후 게시물 분석으로 계산
      monthlyGames: 0,
      createdAt: bandData.created_at,
      members: members.map(member => ({
        user: {
          _id: member.user_key,
          name: member.name,
          profileImage: member.profile_image,
          level: 'intermediate', // 기본값
        },
        role: member.role === 'leader' ? 'admin' : 'member',
        joinedAt: member.joined_at,
      })),
      source: 'band', // 밴드에서 동기화된 클럽임을 표시
      bandKey: bandData.band_key,
    };
  }

  /**
   * 밴드 멤버 데이터를 동배즐 사용자 형식으로 변환
   */
  convertBandUserToAppUser(bandUser) {
    if (USE_MOCK_API) {
      return mockBandAPI.convertBandUserToAppUser(bandUser);
    }

    return {
      id: bandUser.user_key,
      name: bandUser.name,
      email: `${bandUser.user_key}@band.sync`, // 임시 이메일
      profileImage: bandUser.profile_image,
      phone: '', // 밴드에서 제공하지 않음
      level: 'intermediate', // 기본값
      preferredLocation: '',
      bio: '',
      source: 'band',
      bandUserKey: bandUser.user_key,
    };
  }

  /**
   * Band 포토 목록 조회
   */
  async getBandPhotos() {
    if (USE_MOCK_API) {
      return await mockBandAPI.getBandPhotos();
    }

    try {
      if (!this.accessToken) {
        throw new Error('Band 로그인이 필요합니다');
      }

      // Band API에서 포토 조회 (실제 API 구현)
      const response = await axios.get(`${BAND_API_BASE_URL}/band/posts`, {
        params: {
          access_token: this.accessToken,
          band_key: this.currentBandKey,
          locale: 'ko_KR'
        }
      });

      // 포토가 있는 포스트만 필터링
      const photoPosts = response.data.result_data.items.filter(post => 
        post.type === 'photo' && post.photos && post.photos.length > 0
      );

      return photoPosts.flatMap(post => 
        post.photos.map(photo => ({
          id: photo.photo_key,
          url: photo.url,
          thumbnailUrl: photo.thumbnail_url,
          title: post.content || '제목 없음',
          description: post.content,
          createdAt: new Date(post.created_at).toISOString(),
          author: {
            id: post.author.user_key,
            name: post.author.name,
            profileImage: post.author.profile_image
          },
          likes: post.emotion_count || 0,
          comments: post.comment_count || 0,
          tags: [],
          location: '',
          bandPostKey: post.post_key
        }))
      );
    } catch (error) {
      Logger.error('Band 포토 조회 실패', error);
      // 실패 시 Mock 데이터 사용
      return await mockBandAPI.getBandPhotos();
    }
  }

  /**
   * Band에 포토 업로드
   */
  async uploadPhoto(photoData) {
    if (USE_MOCK_API) {
      return await mockBandAPI.uploadPhoto(photoData);
    }

    try {
      if (!this.accessToken) {
        throw new Error('Band 로그인이 필요합니다');
      }

      // 실제 Band API 포토 업로드 구현
      const formData = new FormData();
      formData.append('access_token', this.accessToken);
      formData.append('band_key', this.currentBandKey);
      formData.append('content', photoData.title || '');
      
      // 파일 업로드
      formData.append('photo', {
        uri: photoData.uri,
        type: photoData.type,
        name: photoData.fileName || 'photo.jpg'
      });

      const response = await axios.post(`${BAND_API_BASE_URL}/band/post/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      return response.data;
    } catch (error) {
      Logger.error('Band 포토 업로드 실패', error);
      // 실패 시 Mock API 사용
      return await mockBandAPI.uploadPhoto(photoData);
    }
  }

  /**
   * Band 포토 삭제
   */
  async deletePhoto(photoId) {
    if (USE_MOCK_API) {
      return await mockBandAPI.deletePhoto(photoId);
    }

    try {
      if (!this.accessToken) {
        throw new Error('Band 로그인이 필요합니다');
      }

      // 실제 Band API 포토 삭제 구현
      const response = await axios.delete(`${BAND_API_BASE_URL}/band/post/remove`, {
        params: {
          access_token: this.accessToken,
          band_key: this.currentBandKey,
          post_key: photoId
        }
      });

      return response.data;
    } catch (error) {
      Logger.error('Band 포토 삭제 실패', error);
      throw error;
    }
  }

  /**
   * Band 포토 메타데이터 업데이트
   */
  async updatePhotoMetadata(photoId, metadata) {
    if (USE_MOCK_API) {
      return await mockBandAPI.updatePhotoMetadata(photoId, metadata);
    }

    try {
      if (!this.accessToken) {
        throw new Error('Band 로그인이 필요합니다');
      }

      // 실제 Band API 포토 메타데이터 업데이트 구현
      const response = await axios.put(`${BAND_API_BASE_URL}/band/post/update`, {
        access_token: this.accessToken,
        band_key: this.currentBandKey,
        post_key: photoId,
        content: metadata.title || metadata.description || ''
      });

      return response.data;
    } catch (error) {
      Logger.error('Band 포토 메타데이터 업데이트 실패', error);
      throw error;
    }
  }
}

export default new BandAPI();