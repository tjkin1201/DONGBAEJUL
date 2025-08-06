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
   * M  import AsyncStorage from '@react-native-async-storage/async-storage';

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
      const [token, userInfoStr] = await Promise.all([
        AsyncStorage.getItem('band_access_token'),
        AsyncStorage.getItem('band_user_info')
      ]);

      if (token && userInfoStr) {
        this.accessToken = token;
        this.userInfo = JSON.parse(userInfoStr);
        return { accessToken: token, userInfo: this.userInfo };
      }

      return null;
    } catch (error) {
      console.error('Mock Band 세션 복원 오류:', error);
      return null;
    }
  }

  /**
   * 사용자 프로필 조회
   */
  async getUserProfile() {
    try {
      return this.userInfo || {
        user_key: 'demo_user',
        name: '데모 사용자',
        profile_image: 'https://via.placeholder.com/100x100?text=USER',
        message: '배드민턴을 좋아하는 사용자입니다',
      };
    } catch (error) {
      console.error('Mock Band 프로필 조회 오류:', error);
      throw new Error('사용자 프로필을 가져올 수 없습니다.');
    }
  }

  /**
   * 사용자가 가입한 밴드 목록 조회
   */
  async getUserBands() {
    try {
      const mockBands = [
        {
          band_key: 'band_001',
          name: '서울 배드민턴 동호회',
          description: '매주 주말 배드민턴을 즐기는 동호회입니다.',
          cover: null,
          member_count: 25,
          created_at: '2024-01-01T00:00:00Z',
          is_public: true,
          tags: ['배드민턴', '동호회', '서울'],
          role: 'member'
        }
      ];

      return mockBands;
    } catch (error) {
      console.error('Mock Band 목록 조회 오류:', error);
      return [];
    }
  }

  /**
   * 특정 밴드 정보 조회
   */
  async getBandInfo(bandKey) {
    try {
      const mockBandInfo = {
        band_key: bandKey,
        name: '서울 배드민턴 동호회',
        description: '매주 주말 배드민턴을 즐기는 동호회입니다.',
        cover: null,
        member_count: 25,
        created_at: '2024-01-01T00:00:00Z',
        is_public: true,
        tags: ['배드민턴', '동호회', '서울']
      };

      return mockBandInfo;
    } catch (error) {
      console.error('Mock Band 정보 조회 오류:', error);
      throw new Error('밴드 정보를 가져올 수 없습니다.');
    }
  }

  /**
   * 밴드 멤버 목록 조회
   */
  async getBandMembers(bandKey) {
    try {
      const mockMembers = [
        {
          user_key: 'member_001',
          name: '김철수',
          profile_image: 'https://via.placeholder.com/80x80?text=KIM',
          message: '배드민턴 초보입니다!',
          role: 'admin',
          joined_at: '2024-01-01T00:00:00Z'
        },
        {
          user_key: 'member_002',
          name: '이영희',
          profile_image: 'https://via.placeholder.com/80x80?text=LEE',
          message: '즐겁게 운동해요~',
          role: 'member',
          joined_at: '2024-01-15T00:00:00Z'
        }
      ];

      return mockMembers;
    } catch (error) {
      console.error('Mock Band 멤버 조회 오류:', error);
      return [];
    }
  }

  /**
   * 밴드 게시물 목록 조회
   */
  async getBandPosts(bandKey, after = null, limit = 20) {
    try {
      const mockPosts = [
        {
          post_key: 'post_001',
          content: '오늘 경기 정말 재미있었어요!',
          author: {
            user_key: 'member_001',
            name: '김철수',
            profile_image: 'https://via.placeholder.com/50x50?text=KIM',
          },
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          emotion_count: 5,
          comment_count: 3,
          type: 'text'
        }
      ];

      return { items: mockPosts };
    } catch (error) {
      console.error('Mock Band 게시물 조회 오류:', error);
      return { items: [] };
    }
  }

  /**
   * 밴드에 게시물 작성
   */
  async createBandPost(bandKey, content, doNotificationAll = false) {
    try {
      const mockPost = {
        post_key: 'post_' + Date.now(),
        content: content,
        author: this.userInfo || {
          user_key: 'demo_user',
          name: '데모 사용자',
          profile_image: 'https://via.placeholder.com/50x50?text=ME'
        },
        created_at: new Date().toISOString(),
        emotion_count: 0,
        comment_count: 0,
        type: 'text'
      };

      return mockPost;
    } catch (error) {
      console.error('Mock Band 게시물 작성 오류:', error);
      throw new Error('게시물 작성에 실패했습니다.');
    }
  }

  /**
   * 로그아웃
   */
  async logout() {
    try {
      await AsyncStorage.multiRemove(['band_access_token', 'band_user_info']);
      this.accessToken = null;
      this.userInfo = null;
      return true;
    } catch (error) {
      console.error('Mock Band 로그아웃 오류:', error);
      return false;
    }
  }

  /**
   * 배드민턴 관련 밴드 검색
   */
  async findBadmintonBands() {
    try {
      const mockBands = [
        {
          band_key: 'search_001',
          name: '서울 배드민턴 동호회',
          description: '매주 주말 배드민턴을 즐기는 동호회입니다.',
          member_count: 45,
          is_public: true,
          tags: ['배드민턴', '동호회', '서울']
        }
      ];

      return mockBands;
    } catch (error) {
      console.error('Mock 배드민턴 밴드 검색 오류:', error);
      return [];
    }
  }

  /**
   * 사용자 데이터를 앱 형식으로 변환
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

  /**
   * Mock Band 포토 목록 조회
   */
  async getBandPhotos() {
    try {
      const mockPhotos = [
        {
          id: 'photo_1',
          url: 'https://picsum.photos/800/600?random=1',
          thumbnailUrl: 'https://picsum.photos/200/150?random=1',
          title: '동호회 정기모임',
          description: '월례 정기 모임에서 찍은 단체 사진입니다.',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          author: {
            id: 'user1',
            name: '김철수',
            profileImage: 'https://via.placeholder.com/50x50?text=김'
          },
          likes: 15,
          comments: 3,
          tags: ['정기모임', '단체사진'],
          location: '서울 배드민턴장',
          bandPostKey: 'post_1'
        },
        {
          id: 'photo_2',
          url: 'https://picsum.photos/800/600?random=2',
          thumbnailUrl: 'https://picsum.photos/200/150?random=2',
          title: '경기 하이라이트',
          description: '어제 경기에서의 멋진 스매시 장면',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          author: {
            id: 'user2',
            name: '이영희',
            profileImage: 'https://via.placeholder.com/50x50?text=이'
          },
          likes: 23,
          comments: 7,
          tags: ['경기', '스매시', '액션'],
          location: '강남 배드민턴장',
          bandPostKey: 'post_2'
        }
      ];

      return mockPhotos;
    } catch (error) {
      console.error('Mock Band 포토 조회 오류:', error);
      return [];
    }
  }

  /**
   * Mock Band 포토 업로드
   */
  async uploadPhoto(photoData) {
    try {
      const mockResponse = {
        photo_key: 'photo_' + Date.now(),
        url: photoData.uri || 'https://picsum.photos/800/600?random=' + Date.now(),
        thumbnail_url: photoData.uri || 'https://picsum.photos/200/150?random=' + Date.now(),
        created_at: new Date().toISOString()
      };

      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockResponse;
    } catch (error) {
      console.error('Mock Band 포토 업로드 오류:', error);
      throw new Error('포토 업로드에 실패했습니다.');
    }
  }

  /**
   * Mock Band 포토 삭제
   */
  async deletePhoto(photoId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    } catch (error) {
      console.error('Mock Band 포토 삭제 오류:', error);
      throw new Error('포토 삭제에 실패했습니다.');
    }
  }

  /**
   * Mock Band 포토 메타데이터 업데이트
   */
  async updatePhotoMetadata(photoId, metadata) {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        photo_key: photoId,
        updated_at: new Date().toISOString(),
        ...metadata
      };
    } catch (error) {
      console.error('Mock Band 포토 메타데이터 업데이트 오류:', error);
      throw new Error('포토 메타데이터 업데이트에 실패했습니다.');
    }
  }
}

export default new MockBandAPI();

  /**
   * Mock Band 포토 목록 조회
   */
  async getBandPhotos() {
    try {
      // Mock 포토 데이터
      const mockPhotos = [
        {
          id: 'photo_1',
          url: 'https://picsum.photos/800/600?random=1',
          thumbnailUrl: 'https://picsum.photos/200/150?random=1',
          title: '동호회 정기모임',
          description: '월례 정기 모임에서 찍은 단체 사진입니다.',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          author: {
            id: 'user1',
            name: '김철수',
            profileImage: 'https://via.placeholder.com/50x50?text=김'
          },
          likes: 15,
          comments: 3,
          tags: ['정기모임', '단체사진'],
          location: '서울 배드민턴장',
          bandPostKey: 'post_1'
        },
        {
          id: 'photo_2',
          url: 'https://picsum.photos/800/600?random=2',
          thumbnailUrl: 'https://picsum.photos/200/150?random=2',
          title: '경기 하이라이트',
          description: '어제 경기에서의 멋진 스매시 장면',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          author: {
            id: 'user2',
            name: '이영희',
            profileImage: 'https://via.placeholder.com/50x50?text=이'
          },
          likes: 23,
          comments: 7,
          tags: ['경기', '스매시', '액션'],
          location: '강남 배드민턴장',
          bandPostKey: 'post_2'
        },
        {
          id: 'photo_3',
          url: 'https://picsum.photos/800/600?random=3',
          thumbnailUrl: 'https://picsum.photos/200/150?random=3',
          title: '시상식',
          description: '월간 토너먼트 시상식 사진',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          author: {
            id: 'user3',
            name: '박민수',
            profileImage: 'https://via.placeholder.com/50x50?text=박'
          },
          likes: 31,
          comments: 12,
          tags: ['시상식', '토너먼트', '축하'],
          location: '체육관',
          bandPostKey: 'post_3'
        },
        {
          id: 'photo_4',
          url: 'https://picsum.photos/800/600?random=4',
          thumbnailUrl: 'https://picsum.photos/200/150?random=4',
          title: '훈련 모습',
          description: '주말 기술 훈련 시간',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          author: {
            id: 'user4',
            name: '최수진',
            profileImage: 'https://via.placeholder.com/50x50?text=최'
          },
          likes: 18,
          comments: 5,
          tags: ['훈련', '기술연습'],
          location: '동네 체육관',
          bandPostKey: 'post_4'
        },
        {
          id: 'photo_5',
          url: 'https://picsum.photos/800/600?random=5',
          thumbnailUrl: 'https://picsum.photos/200/150?random=5',
          title: '팀 빌딩',
          description: '신입 회원 환영회',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          author: {
            id: 'user5',
            name: '정다은',
            profileImage: 'https://via.placeholder.com/50x50?text=정'
          },
          likes: 25,
          comments: 9,
          tags: ['환영회', '신입회원', '팀빌딩'],
          location: '회식장소',
          bandPostKey: 'post_5'
        }
      ];

      return mockPhotos;
    } catch (error) {
      console.error('Mock Band 포토 조회 오류:', error);
      return [];
    }
  }

  /**
   * Mock Band 포토 업로드
   */
  async uploadPhoto(photoData) {
    try {
      // Mock 업로드 응답
      const mockResponse = {
        photo_key: 'photo_' + Date.now(),
        url: photoData.uri || 'https://picsum.photos/800/600?random=' + Date.now(),
        thumbnail_url: photoData.uri || 'https://picsum.photos/200/150?random=' + Date.now(),
        created_at: new Date().toISOString()
      };

      // 시뮬레이션 딜레이
      await new Promise(resolve => setTimeout(resolve, 1000));

      return mockResponse;
    } catch (error) {
      console.error('Mock Band 포토 업로드 오류:', error);
      throw new Error('포토 업로드에 실패했습니다.');
    }
  }

  /**
   * Mock Band 포토 삭제
   */
  async deletePhoto(photoId) {
    try {
      // 시뮬레이션 딜레이
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true };
    } catch (error) {
      console.error('Mock Band 포토 삭제 오류:', error);
      throw new Error('포토 삭제에 실패했습니다.');
    }
  }

  /**
   * Mock Band 포토 메타데이터 업데이트
   */
  async updatePhotoMetadata(photoId, metadata) {
    try {
      // 시뮬레이션 딜레이
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        photo_key: photoId,
        updated_at: new Date().toISOString(),
        ...metadata
      };
    } catch (error) {
      console.error('Mock Band 포토 메타데이터 업데이트 오류:', error);
      throw new Error('포토 메타데이터 업데이트에 실패했습니다.');
    }
  }
} 시작
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