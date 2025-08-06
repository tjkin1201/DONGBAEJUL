import AsyncStorage from '@react-native-async-storage/async-storage';
import { bandAPI } from './bandAPI';
import { gameAPI } from './api';
import Logger from '../utils/logger';

/**
 * 사진 갤러리 서비스
 * Band API와 연동하여 사진을 관리하고 로컬 캐싱을 지원합니다.
 */
class PhotoService {
  constructor() {
    this.cacheKey = 'photo_gallery_cache';
    this.albumCacheKey = 'photo_albums_cache';
    this.maxCacheAge = 30 * 60 * 1000; // 30분
  }

  /**
   * Band API에서 사진 목록을 가져옵니다
   */
  async getBandPhotos() {
    try {
      // Band API에서 사진 가져오기 (실제 구현에서는 Band API 연동)
      const bandPhotos = await bandAPI.getBandPhotos();
      
      // 로컬 캐시에 저장
      await this.cachePhotos(bandPhotos);
      
      return bandPhotos;
    } catch (error) {
      Logger.error('Band 사진 조회 실패', error);
      
      // 네트워크 오류 시 캐시된 데이터 반환
      const cachedPhotos = await this.getCachedPhotos();
      if (cachedPhotos) {
        return cachedPhotos;
      }
      
      // 캐시도 없으면 Mock 데이터 반환
      return this.getMockPhotos();
    }
  }

  /**
   * 게임별 사진을 가져옵니다
   */
  async getGamePhotos(gameId) {
    try {
      const gamePhotos = await gameAPI.getGamePhotos(gameId);
      return gamePhotos;
    } catch (error) {
      Logger.error('게임 사진 조회 실패', error);
      return [];
    }
  }

  /**
   * 모든 사진을 카테고리별로 정리하여 반환
   */
  async getAllPhotos() {
    try {
      const [bandPhotos, recentGames] = await Promise.all([
        this.getBandPhotos(),
        gameAPI.getRecentGames({ limit: 10 })
      ]);

      // 게임별 사진들을 병렬로 가져오기
      const gamePhotosPromises = recentGames.data?.map(game => 
        this.getGamePhotos(game.id).then(photos => ({
          gameId: game.id,
          gameTitle: game.title,
          gameDate: game.date,
          photos
        }))
      ) || [];

      const gamePhotosData = await Promise.all(gamePhotosPromises);

      // 전체 사진 목록 생성
      const allPhotos = [
        ...bandPhotos.map(photo => ({
          ...photo,
          category: 'band',
          source: 'band'
        })),
        ...gamePhotosData.flatMap(gameData => 
          gameData.photos.map(photo => ({
            ...photo,
            category: 'game',
            source: 'game',
            gameId: gameData.gameId,
            gameTitle: gameData.gameTitle,
            gameDate: gameData.gameDate
          }))
        )
      ];

      // 날짜순으로 정렬
      allPhotos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return allPhotos;
    } catch (error) {
      Logger.error('전체 사진 조회 실패', error);
      return this.getMockPhotos();
    }
  }

  /**
   * 앨범별로 사진을 분류합니다
   */
  async getPhotoAlbums() {
    try {
      const allPhotos = await this.getAllPhotos();
      
      // 카테고리별 분류
      const albums = {
        recent: {
          id: 'recent',
          title: '최근 사진',
          photos: allPhotos.slice(0, 20),
          count: Math.min(20, allPhotos.length)
        },
        band: {
          id: 'band',
          title: '동호회 활동',
          photos: allPhotos.filter(photo => photo.source === 'band'),
          count: allPhotos.filter(photo => photo.source === 'band').length
        },
        games: {
          id: 'games',
          title: '경기 사진',
          photos: allPhotos.filter(photo => photo.source === 'game'),
          count: allPhotos.filter(photo => photo.source === 'game').length
        }
      };

      // 게임별 앨범 추가
      const gameAlbums = {};
      allPhotos
        .filter(photo => photo.source === 'game')
        .forEach(photo => {
          if (!gameAlbums[photo.gameId]) {
            gameAlbums[photo.gameId] = {
              id: `game_${photo.gameId}`,
              title: photo.gameTitle,
              date: photo.gameDate,
              photos: [],
              count: 0
            };
          }
          gameAlbums[photo.gameId].photos.push(photo);
          gameAlbums[photo.gameId].count++;
        });

      return {
        ...albums,
        gameAlbums: Object.values(gameAlbums)
      };
    } catch (error) {
      Logger.error('앨범 생성 실패', error);
      return this.getMockAlbums();
    }
  }

  /**
   * 사진을 업로드합니다
   */
  async uploadPhoto(photoData, category = 'band') {
    try {
      let uploadResult;

      if (category === 'band') {
        // Band API로 업로드
        uploadResult = await bandAPI.uploadPhoto(photoData);
      } else if (category === 'game' && photoData.gameId) {
        // 게임 사진으로 업로드
        uploadResult = await gameAPI.uploadGameImages(photoData.gameId, [photoData]);
      }

      // 캐시 무효화
      await this.clearCache();

      return uploadResult;
    } catch (error) {
      Logger.error('사진 업로드 실패', error);
      throw error;
    }
  }

  /**
   * 사진을 삭제합니다
   */
  async deletePhoto(photoId, category = 'band') {
    try {
      if (category === 'band') {
        await bandAPI.deletePhoto(photoId);
      } else if (category === 'game') {
        await gameAPI.deleteGameImage(photoId);
      }

      // 캐시 무효화
      await this.clearCache();

      return true;
    } catch (error) {
      Logger.error('사진 삭제 실패', error);
      throw error;
    }
  }

  /**
   * 사진 메타데이터를 업데이트합니다
   */
  async updatePhotoMetadata(photoId, metadata) {
    try {
      const updateResult = await bandAPI.updatePhotoMetadata(photoId, metadata);
      
      // 캐시 무효화
      await this.clearCache();

      return updateResult;
    } catch (error) {
      Logger.error('사진 메타데이터 업데이트 실패', error);
      throw error;
    }
  }

  /**
   * 캐시된 사진을 저장합니다
   */
  async cachePhotos(photos) {
    try {
      const cacheData = {
        photos,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      Logger.error('사진 캐시 저장 실패', error);
    }
  }

  /**
   * 캐시된 사진을 가져옵니다
   */
  async getCachedPhotos() {
    try {
      const cachedData = await AsyncStorage.getItem(this.cacheKey);
      if (!cachedData) return null;

      const { photos, timestamp } = JSON.parse(cachedData);
      
      // 캐시 만료 확인
      if (Date.now() - timestamp > this.maxCacheAge) {
        await AsyncStorage.removeItem(this.cacheKey);
        return null;
      }

      return photos;
    } catch (error) {
      Logger.error('사진 캐시 조회 실패', error);
      return null;
    }
  }

  /**
   * 캐시를 지웁니다
   */
  async clearCache() {
    try {
      await AsyncStorage.multiRemove([this.cacheKey, this.albumCacheKey]);
    } catch (error) {
      Logger.error('캐시 삭제 실패', error);
    }
  }

  /**
   * Mock 사진 데이터를 반환합니다
   */
  getMockPhotos() {
    return [
      {
        id: '1',
        url: 'https://picsum.photos/800/600?random=1',
        thumbnailUrl: 'https://picsum.photos/200/150?random=1',
        title: '동호회 정기모임',
        description: '월례 정기 모임에서 찍은 단체 사진',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        author: {
          id: 'user1',
          name: '김철수',
          profileImage: 'https://via.placeholder.com/50x50?text=김'
        },
        likes: 15,
        comments: 3,
        tags: ['정기모임', '단체사진'],
        location: '서울 배드민턴장'
      },
      {
        id: '2',
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
        location: '강남 배드민턴장'
      },
      {
        id: '3',
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
        location: '체육관'
      },
      {
        id: '4',
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
        location: '동네 체육관'
      },
      {
        id: '5',
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
        location: '회식장소'
      }
    ];
  }

  /**
   * Mock 앨범 데이터를 반환합니다
   */
  getMockAlbums() {
    const mockPhotos = this.getMockPhotos();
    return {
      recent: {
        id: 'recent',
        title: '최근 사진',
        photos: mockPhotos.slice(0, 3),
        count: 3
      },
      band: {
        id: 'band',
        title: '동호회 활동',
        photos: mockPhotos,
        count: mockPhotos.length
      },
      games: {
        id: 'games',
        title: '경기 사진',
        photos: mockPhotos.filter(photo => photo.tags?.includes('경기')),
        count: mockPhotos.filter(photo => photo.tags?.includes('경기')).length
      },
      gameAlbums: [
        {
          id: 'game_1',
          title: '월간 토너먼트',
          date: '2024-01-15',
          photos: mockPhotos.slice(0, 2),
          count: 2
        }
      ]
    };
  }
}

export default new PhotoService();
