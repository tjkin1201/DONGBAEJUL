import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * NAVER Band API Mock 서비스
 * 실제 Band API 없이도 테스트할 수 있는 Mock 구현
 */
class MockBandAPI {
  constructor() {
    this.accessToken = null;
    this.userInfo = null;
    this.isDemo = true;
  }

  /**
   * Mock Band OAuth 로그인 시작
   */
  async startBandLogin() {
    try {
      // Mock 사용자 데이터
      const mockUserInfo = {
        user_key: 'demo_user_' + Date.now(),
        name: '데모 사용자',
        profile_image: 'https://via.placeholder.com/100x100?text=USER',
        message: '배드민턴을 좋아하는 사용자입니다',
      };

      const mockAccessToken = 'demo_token_' + Date.now();

      // Mock 데이터 저장
      await AsyncStorage.setItem('band_access_token', mockAccessToken);
      await AsyncStorage.setItem('band_user_info', JSON.stringify(mockUserInfo));

      this.accessToken = mockAccessToken;
      this.userInfo = mockUserInfo;

      return { 
        accessToken: mockAccessToken, 
        userInfo: mockUserInfo 
      };
    } catch (error) {
      console.error('Mock Band 로그인 오류:', error);
      throw new Error('Mock Band 로그인 처리 중 오류가 발생했습니다.');
    }
  }

  /**
   * 저장된 토큰으로 로그인 상태 복원
   */
  async restoreSession() {
    try {
      const accessToken = await AsyncStorage.getItem('band_access_token');
      const userInfoStr = await AsyncStorage.getItem('band_user_info');
      
      if (accessToken && userInfoStr) {
        this.accessToken = accessToken;
        this.userInfo = JSON.parse(userInfoStr);
        return { accessToken, userInfo: this.userInfo };
      }
      return null;
    } catch (error) {
      console.error('세션 복원 오류:', error);
      return null;
    }
  }

  /**
   * Mock 사용자 프로필 정보 가져오기
   */
  async getUserProfile() {
    if (!this.userInfo) {
      throw new Error('로그인이 필요합니다');
    }
    return this.userInfo;
  }

  /**
   * Mock 사용자가 가입한 밴드 목록 가져오기
   */
  async getUserBands() {
    const mockBands = [
      {
        band_key: 'demo_badminton_club_1',
        name: '서울 배드민턴 클럽',
        description: '서울 지역 배드민턴 동호회입니다. 매주 토요일 모임!',
        cover: 'https://via.placeholder.com/300x200?text=BADMINTON+CLUB',
        member_count: 45,
        created_at: '2023-01-15T09:00:00Z',
      },
      {
        band_key: 'demo_badminton_club_2', 
        name: '강남 셔틀콕 동호회',
        description: '강남 지역 배드민턴 동호회 - 초급자부터 고급자까지!',
        cover: 'https://via.placeholder.com/300x200?text=SHUTTLECOCK+CLUB',
        member_count: 32,
        created_at: '2023-03-20T14:30:00Z',
      },
      {
        band_key: 'demo_badminton_club_3',
        name: '동배즐 테스트 클럽',
        description: '동배즐 앱 테스트용 배드민턴 클럽입니다.',
        cover: 'https://via.placeholder.com/300x200?text=TEST+CLUB',
        member_count: 18,
        created_at: '2024-01-01T10:00:00Z',
      },
    ];

    return mockBands;
  }

  /**
   * Mock 특정 밴드 정보 가져오기
   */
  async getBandInfo(bandKey) {
    const bands = await this.getUserBands();
    const band = bands.find(b => b.band_key === bandKey);
    
    if (!band) {
      throw new Error('밴드를 찾을 수 없습니다');
    }

    return band;
  }

  /**
   * Mock 밴드 멤버 목록 가져오기
   */
  async getBandMembers(bandKey) {
    const mockMembers = [
      {
        user_key: 'demo_member_1',
        name: '김배드',
        profile_image: 'https://via.placeholder.com/80x80?text=KIM',
        role: 'leader',
        joined_at: '2023-01-15T09:00:00Z',
      },
      {
        user_key: 'demo_member_2',
        name: '이민턴',
        profile_image: 'https://via.placeholder.com/80x80?text=LEE',
        role: 'member',
        joined_at: '2023-02-10T15:30:00Z',
      },
      {
        user_key: 'demo_member_3',
        name: '박셔틀',
        profile_image: 'https://via.placeholder.com/80x80?text=PARK',
        role: 'member',
        joined_at: '2023-03-05T11:20:00Z',
      },
      // 현재 사용자도 포함
      {
        user_key: this.userInfo?.user_key || 'demo_current_user',
        name: this.userInfo?.name || '데모 사용자',
        profile_image: this.userInfo?.profile_image || 'https://via.placeholder.com/80x80?text=ME',
        role: 'member',
        joined_at: new Date().toISOString(),
      },
    ];

    return mockMembers;
  }

  /**
   * Mock 밴드 게시물 목록 가져오기
   */
  async getBandPosts(bandKey, after = null, limit = 20) {
    const mockPosts = [
      {
        post_key: 'demo_post_1',
        content: '🏸 이번 주 토요일 정기 모임 있습니다! 참석 가능하신 분들 댓글 부탁드려요~',
        author: {
          name: '김배드',
          profile_image: 'https://via.placeholder.com/50x50?text=KIM',
        },
        created_at: '2024-01-30T09:00:00Z',
        comment_count: 12,
        like_count: 8,
      },
      {
        post_key: 'demo_post_2',
        content: '새로운 멤버들 환영합니다! 동배즐 앱으로도 소통해요 📱',
        author: {
          name: '이민턴',
          profile_image: 'https://via.placeholder.com/50x50?text=LEE',
        },
        created_at: '2024-01-29T14:20:00Z',
        comment_count: 6,
        like_count: 15,
      },
    ];

    return {
      posts: mockPosts,
      paging: {
        next: null,
      },
    };
  }

  /**
   * Mock 밴드에 게시물 작성
   */
  async createBandPost(bandKey, content, doNotificationAll = false) {
    const mockPost = {
      post_key: 'demo_post_' + Date.now(),
      content: content,
      author: {
        name: this.userInfo?.name || '데모 사용자',
        profile_image: this.userInfo?.profile_image || 'https://via.placeholder.com/50x50?text=ME',
      },
      created_at: new Date().toISOString(),
      comment_count: 0,
      like_count: 0,
    };

    console.log('📝 Mock Band 게시물 작성:', mockPost);
    return mockPost;
  }

  /**
   * Mock 로그아웃
   */
  async logout() {
    try {
      await AsyncStorage.removeItem('band_access_token');
      await AsyncStorage.removeItem('band_user_info');
      this.accessToken = null;
      this.userInfo = null;
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  }

  /**
   * Mock 배드민턴 동호회 밴드 찾기
   */
  async findBadmintonBands() {
    try {
      const userBands = await this.getUserBands();
      // Mock에서는 모든 밴드가 배드민턴 관련
      return userBands;
    } catch (error) {
      console.error('배드민턴 밴드 검색 오류:', error);
      return [];
    }
  }

  /**
   * 밴드 데이터를 동배즐 앱 형식으로 변환
   */
  convertBandToClub(bandData, members = []) {
    return {
      id: bandData.band_key,
      name: bandData.name,
      description: bandData.description || '',
      clubImage: bandData.cover || null,
      location: '밴드에서 동기화',
      level: 'intermediate',
      activityScore: bandData.member_count || 0,
      weeklyGames: Math.floor(Math.random() * 5) + 1, // Mock 데이터
      monthlyGames: Math.floor(Math.random() * 20) + 5,
      createdAt: bandData.created_at,
      members: members.map(member => ({
        user: {
          _id: member.user_key,
          name: member.name,
          profileImage: member.profile_image,
          level: 'intermediate',
        },
        role: member.role === 'leader' ? 'admin' : 'member',
        joinedAt: member.joined_at,
      })),
      source: 'band',
      bandKey: bandData.band_key,
    };
  }

  /**
   * 밴드 멤버 데이터를 동배즐 사용자 형식으로 변환
   */
  convertBandUserToAppUser(bandUser) {
    return {
      id: bandUser.user_key,
      name: bandUser.name,
      email: `${bandUser.user_key}@band.demo`,
      profileImage: bandUser.profile_image,
      phone: '',
      level: 'intermediate',
      preferredLocation: '',
      bio: bandUser.message || '',
      source: 'band',
      bandUserKey: bandUser.user_key,
    };
  }
}

export default new MockBandAPI();