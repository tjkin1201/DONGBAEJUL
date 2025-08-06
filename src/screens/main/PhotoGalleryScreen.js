import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  StyleSheet,
  Dimensions
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  FAB,
  Portal,
  Modal,
  Button,
  Searchbar,
  Menu,
  Divider,
  ActivityIndicator
} from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import PhotoService from '../../services/PhotoService';
import LoadingScreen from '../../components/LoadingScreen';
import theme from '../../utils/theme';
import Logger from '../../utils/logger';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 48) / 3; // 3열 그리드, 여백 고려

const PhotoGalleryScreen = ({ navigation, route }) => {
  const [photos, setPhotos] = useState([]);
  const [albums, setAlbums] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [photosData, albumsData] = await Promise.all([
        PhotoService.getAllPhotos(),
        PhotoService.getPhotoAlbums()
      ]);
      
      setPhotos(photosData);
      setAlbums(albumsData);
    } catch (error) {
      Logger.error('사진 갤러리 초기 로드 실패', error);
      Alert.alert('오류', '사진을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 새로고침
  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await PhotoService.clearCache();
      await loadInitialData();
    } catch (error) {
      Logger.error('사진 갤러리 새로고침 실패', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // 사진 필터링
  const getFilteredPhotos = () => {
    let filteredPhotos = photos;

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      filteredPhotos = filteredPhotos.filter(photo => photo.source === selectedCategory);
    }

    // 검색 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredPhotos = filteredPhotos.filter(photo => 
        photo.title?.toLowerCase().includes(query) ||
        photo.description?.toLowerCase().includes(query) ||
        photo.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filteredPhotos;
  };

  // 사진 선택 핸들러
  const handlePhotoPress = (photo, index) => {
    navigation.navigate('PhotoDetail', {
      photo,
      photos: getFilteredPhotos(),
      initialIndex: index
    });
  };

  // 사진 업로드
  const handleUploadPhoto = () => {
    setUploadModalVisible(false);
    
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1920,
      includeBase64: false,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel || response.error) {
        return;
      }

      try {
        const asset = response.assets[0];
        const photoData = {
          uri: asset.uri,
          type: asset.type,
          fileName: asset.fileName || 'photo.jpg',
          fileSize: asset.fileSize
        };

        await PhotoService.uploadPhoto(photoData);
        Alert.alert('성공', '사진이 업로드되었습니다.');
        onRefresh();
      } catch (error) {
        Logger.error('사진 업로드 실패', error);
        Alert.alert('오류', '사진 업로드에 실패했습니다.');
      }
    });
  };

  // 앨범 보기로 이동
  const navigateToAlbums = () => {
    navigation.navigate('PhotoAlbums', { albums });
  };

  // 그리드 아이템 렌더링
  const renderGridItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => handlePhotoPress(item, index)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.thumbnailUrl || item.url }}
        style={styles.gridImage}
        resizeMode="cover"
      />
      {item.source === 'game' && (
        <View style={styles.gameIndicator}>
          <MaterialCommunityIcons
            name="badminton"
            size={16}
            color={theme.colors.primary}
          />
        </View>
      )}
      <View style={styles.photoOverlay}>
        <View style={styles.photoStats}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons
              name="heart"
              size={12}
              color="#fff"
            />
            <Text style={styles.statText}>{item.likes || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons
              name="comment"
              size={12}
              color="#fff"
            />
            <Text style={styles.statText}>{item.comments || 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // 리스트 아이템 렌더링
  const renderListItem = ({ item, index }) => (
    <Card style={styles.listCard}>
      <TouchableOpacity onPress={() => handlePhotoPress(item, index)}>
        <View style={styles.listItem}>
          <Image
            source={{ uri: item.thumbnailUrl || item.url }}
            style={styles.listImage}
            resizeMode="cover"
          />
          <View style={styles.listContent}>
            <Text variant="titleMedium" numberOfLines={1}>
              {item.title}
            </Text>
            <Text variant="bodySmall" style={styles.listDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.listMeta}>
              <Text variant="bodySmall" style={styles.listAuthor}>
                {item.author?.name}
              </Text>
              <Text variant="bodySmall" style={styles.listDate}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.listStats}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons
                  name="heart"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text style={styles.statCount}>{item.likes || 0}</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons
                  name="comment"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text style={styles.statCount}>{item.comments || 0}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  const filteredPhotos = getFilteredPhotos();

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Searchbar
          placeholder="사진 검색..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setMenuVisible(true)}
            >
              <MaterialCommunityIcons
                name="dots-vertical"
                size={24}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
          }
        >
          <Menu.Item
            onPress={() => {
              setViewMode(viewMode === 'grid' ? 'list' : 'grid');
              setMenuVisible(false);
            }}
            title={viewMode === 'grid' ? '리스트 보기' : '그리드 보기'}
            leadingIcon={viewMode === 'grid' ? 'view-list' : 'view-grid'}
          />
          <Menu.Item
            onPress={() => {
              navigateToAlbums();
              setMenuVisible(false);
            }}
            title="앨범 보기"
            leadingIcon="folder-multiple-image"
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              onRefresh();
              setMenuVisible(false);
            }}
            title="새로고침"
            leadingIcon="refresh"
          />
        </Menu>
      </View>

      {/* 카테고리 필터 */}
      <View style={styles.categoryFilter}>
        <FlatList
          data={[
            { key: 'all', label: '전체' },
            { key: 'band', label: '동호회' },
            { key: 'game', label: '경기' }
          ]}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Chip
              mode={selectedCategory === item.key ? 'flat' : 'outlined'}
              selected={selectedCategory === item.key}
              onPress={() => setSelectedCategory(item.key)}
              style={styles.categoryChip}
            >
              {item.label}
            </Chip>
          )}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* 사진 목록 */}
      {filteredPhotos.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="image-off-outline"
            size={64}
            color={theme.colors.outline}
          />
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            사진이 없습니다
          </Text>
          <Text variant="bodyMedium" style={styles.emptyMessage}>
            첫 번째 사진을 업로드해보세요!
          </Text>
          <Button
            mode="contained"
            onPress={() => setUploadModalVisible(true)}
            style={styles.emptyButton}
          >
            사진 업로드
          </Button>
        </View>
      ) : (
        <FlatList
          data={filteredPhotos}
          key={viewMode} // 뷰 모드 변경 시 리렌더링
          renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
          numColumns={viewMode === 'grid' ? 3 : 1}
          columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : null}
          contentContainerStyle={styles.photoList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          getItemLayout={viewMode === 'grid' ? (data, index) => ({
            length: PHOTO_SIZE,
            offset: PHOTO_SIZE * Math.floor(index / 3),
            index,
          }) : undefined}
        />
      )}

      {/* 업로드 FAB */}
      <FAB
        icon="camera-plus"
        onPress={() => setUploadModalVisible(true)}
        style={styles.fab}
      />

      {/* 업로드 모달 */}
      <Portal>
        <Modal
          visible={uploadModalVisible}
          onDismiss={() => setUploadModalVisible(false)}
          contentContainerStyle={styles.uploadModal}
        >
          <Text variant="headlineSmall" style={styles.modalTitle}>
            사진 업로드
          </Text>
          <Text variant="bodyMedium" style={styles.modalMessage}>
            갤러리에서 사진을 선택하여 업로드하시겠습니까?
          </Text>
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setUploadModalVisible(false)}
              style={styles.modalButton}
            >
              취소
            </Button>
            <Button
              mode="contained"
              onPress={handleUploadPhoto}
              style={styles.modalButton}
            >
              선택하기
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    elevation: 2,
  },
  searchbar: {
    flex: 1,
    marginRight: 8,
  },
  menuButton: {
    padding: 8,
  },
  categoryFilter: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 8,
  },
  categoryList: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    marginRight: 8,
  },
  photoList: {
    padding: 16,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  gridItem: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    marginBottom: 4,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gameIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 4,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
  },
  photoStats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    color: '#fff',
    fontSize: 10,
    marginLeft: 2,
  },
  listCard: {
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    padding: 12,
  },
  listImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  listContent: {
    flex: 1,
  },
  listDescription: {
    marginTop: 4,
    color: theme.colors.onSurfaceVariant,
  },
  listMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  listAuthor: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  listDate: {
    color: theme.colors.onSurfaceVariant,
  },
  listStats: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statCount: {
    marginLeft: 4,
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    textAlign: 'center',
    color: theme.colors.onSurfaceVariant,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
  uploadModal: {
    backgroundColor: theme.colors.surface,
    padding: 24,
    margin: 20,
    borderRadius: 16,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  modalMessage: {
    textAlign: 'center',
    marginBottom: 24,
    color: theme.colors.onSurfaceVariant,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default PhotoGalleryScreen;
