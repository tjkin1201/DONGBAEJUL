import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Share,
  Alert,
  StyleSheet
} from 'react-native';
import {
  Text,
  Button,
  Portal,
  Modal,
  TextInput,
  Card,
  Avatar,
  Chip,
  ActivityIndicator
} from 'react-native-paper';
import { PanGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  runOnJS,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Swiper from 'react-native-swiper';

import PhotoService from '../../services/PhotoService';
import theme from '../../utils/theme';
import Logger from '../../utils/logger';

const { width, height } = Dimensions.get('window');

const PhotoDetailScreen = ({ navigation, route }) => {
  const { photo: initialPhoto, photos = [], initialIndex = 0 } = route.params;
  
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [currentPhoto, setCurrentPhoto] = useState(initialPhoto);
  const [showUI, setShowUI] = useState(true);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(currentPhoto?.likes || 0);

  const swiperRef = useRef(null);
  const hideUITimeout = useRef(null);

  // 애니메이션 값들
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    StatusBar.setHidden(true);
    return () => StatusBar.setHidden(false);
  }, []);

  useEffect(() => {
    if (photos[currentIndex]) {
      setCurrentPhoto(photos[currentIndex]);
      setLikeCount(photos[currentIndex].likes || 0);
    }
  }, [currentIndex, photos]);

  // UI 자동 숨김
  const resetHideUITimer = () => {
    if (hideUITimeout.current) {
      clearTimeout(hideUITimeout.current);
    }
    setShowUI(true);
    hideUITimeout.current = setTimeout(() => {
      setShowUI(false);
    }, 3000);
  };

  useEffect(() => {
    resetHideUITimer();
    return () => {
      if (hideUITimeout.current) {
        clearTimeout(hideUITimeout.current);
      }
    };
  }, []);

  // 제스처 핸들러들
  const panGestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      runOnJS(resetHideUITimer)();
    },
    onActive: (event) => {
      if (scale.value === 1) {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
        
        // 드래그 거리에 따른 투명도 변경
        const distance = Math.sqrt(
          Math.pow(event.translationX, 2) + Math.pow(event.translationY, 2)
        );
        opacity.value = Math.max(0.3, 1 - distance / 300);
      }
    },
    onEnd: (event) => {
      const distance = Math.sqrt(
        Math.pow(event.translationX, 2) + Math.pow(event.translationY, 2)
      );
      
      if (distance > 150) {
        // 화면을 닫기
        runOnJS(navigation.goBack)();
      } else {
        // 원래 위치로 돌아가기
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        opacity.value = withTiming(1);
      }
    },
  });

  const pinchGestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      runOnJS(resetHideUITimer)();
    },
    onActive: (event) => {
      scale.value = Math.max(0.8, Math.min(3, event.scale));
    },
    onEnd: () => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
      } else if (scale.value > 2.5) {
        scale.value = withSpring(2.5);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  // 좋아요 토글
  const toggleLike = async () => {
    try {
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
      
      // API 호출 (실제 구현에서는 Band API 연동)
      // await PhotoService.toggleLike(currentPhoto.id);
    } catch (error) {
      Logger.error('좋아요 토글 실패', error);
      // 실패 시 원래 상태로 복원
      setLiked(liked);
      setLikeCount(currentPhoto.likes || 0);
    }
  };

  // 댓글 추가
  const addComment = async () => {
    if (!commentText.trim()) return;

    try {
      setLoading(true);
      // API 호출 (실제 구현에서는 Band API 연동)
      // await PhotoService.addComment(currentPhoto.id, commentText);
      
      setCommentText('');
      setCommentModalVisible(false);
      Alert.alert('성공', '댓글이 추가되었습니다.');
    } catch (error) {
      Logger.error('댓글 추가 실패', error);
      Alert.alert('오류', '댓글 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 사진 공유
  const sharePhoto = async () => {
    try {
      await Share.share({
        message: `${currentPhoto.title}\n\n${currentPhoto.description}`,
        url: currentPhoto.url,
        title: currentPhoto.title
      });
    } catch (error) {
      Logger.error('사진 공유 실패', error);
    }
  };

  // 사진 다운로드 (실제로는 로컬 저장)
  const downloadPhoto = () => {
    Alert.alert('알림', '사진이 갤러리에 저장되었습니다.');
  };

  // 사진 삭제
  const deletePhoto = () => {
    Alert.alert(
      '사진 삭제',
      '이 사진을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await PhotoService.deletePhoto(currentPhoto.id, currentPhoto.source);
              Alert.alert('성공', '사진이 삭제되었습니다.');
              navigation.goBack();
            } catch (error) {
              Logger.error('사진 삭제 실패', error);
              Alert.alert('오류', '사진 삭제에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  const renderPhoto = (photo, index) => (
    <View key={index} style={styles.photoContainer}>
      <PinchGestureHandler onGestureEvent={pinchGestureHandler}>
        <Animated.View style={styles.imageWrapper}>
          <PanGestureHandler
            onGestureEvent={panGestureHandler}
            shouldCancelWhenOutside={false}
          >
            <Animated.Image
              source={{ uri: photo.url }}
              style={[styles.photo, animatedStyle]}
              resizeMode="contain"
            />
          </PanGestureHandler>
        </Animated.View>
      </PinchGestureHandler>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 사진 영역 */}
      <TouchableOpacity
        style={styles.photoArea}
        activeOpacity={1}
        onPress={() => setShowUI(!showUI)}
      >
        <Swiper
          ref={swiperRef}
          index={currentIndex}
          onIndexChanged={setCurrentIndex}
          showsPagination={false}
          loop={false}
        >
          {photos.map((photo, index) => renderPhoto(photo, index))}
        </Swiper>
      </TouchableOpacity>

      {/* 상단 UI */}
      {showUI && (
        <Animated.View
          style={[styles.topBar, { opacity: opacity.value }]}
          entering="fadeIn"
          exiting="fadeOut"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
          
          <View style={styles.topBarRight}>
            <TouchableOpacity
              style={styles.topBarButton}
              onPress={sharePhoto}
            >
              <MaterialCommunityIcons
                name="share"
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.topBarButton}
              onPress={downloadPhoto}
            >
              <MaterialCommunityIcons
                name="download"
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.topBarButton}
              onPress={deletePhoto}
            >
              <MaterialCommunityIcons
                name="delete"
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* 하단 UI */}
      {showUI && (
        <Animated.View
          style={[styles.bottomBar, { opacity: opacity.value }]}
          entering="fadeIn"
          exiting="fadeOut"
        >
          <Card style={styles.infoCard}>
            <View style={styles.photoInfo}>
              <View style={styles.authorInfo}>
                <Avatar.Image
                  size={32}
                  source={{ uri: currentPhoto.author?.profileImage }}
                />
                <View style={styles.authorText}>
                  <Text variant="titleSmall">{currentPhoto.title}</Text>
                  <Text variant="bodySmall" style={styles.authorName}>
                    {currentPhoto.author?.name}
                  </Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={toggleLike}
                >
                  <MaterialCommunityIcons
                    name={liked ? "heart" : "heart-outline"}
                    size={24}
                    color={liked ? theme.colors.error : theme.colors.onSurface}
                  />
                  <Text style={styles.actionText}>{likeCount}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setCommentModalVisible(true)}
                >
                  <MaterialCommunityIcons
                    name="comment-outline"
                    size={24}
                    color={theme.colors.onSurface}
                  />
                  <Text style={styles.actionText}>{currentPhoto.comments || 0}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {currentPhoto.description && (
              <Text variant="bodyMedium" style={styles.description}>
                {currentPhoto.description}
              </Text>
            )}

            {currentPhoto.tags && currentPhoto.tags.length > 0 && (
              <View style={styles.tags}>
                {currentPhoto.tags.map((tag, index) => (
                  <Chip key={index} mode="outlined" style={styles.tag}>
                    {tag}
                  </Chip>
                ))}
              </View>
            )}

            <Text variant="bodySmall" style={styles.dateText}>
              {new Date(currentPhoto.createdAt).toLocaleString()}
            </Text>
          </Card>
        </Animated.View>
      )}

      {/* 댓글 모달 */}
      <Portal>
        <Modal
          visible={commentModalVisible}
          onDismiss={() => setCommentModalVisible(false)}
          contentContainerStyle={styles.commentModal}
        >
          <Text variant="headlineSmall" style={styles.modalTitle}>
            댓글 추가
          </Text>
          <TextInput
            mode="outlined"
            placeholder="댓글을 입력하세요..."
            value={commentText}
            onChangeText={setCommentText}
            multiline
            numberOfLines={4}
            style={styles.commentInput}
          />
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setCommentModalVisible(false)}
              style={styles.modalButton}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              mode="contained"
              onPress={addComment}
              style={styles.modalButton}
              loading={loading}
              disabled={loading || !commentText.trim()}
            >
              등록
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
    backgroundColor: '#000',
  },
  photoArea: {
    flex: 1,
  },
  photoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: width,
    height: height,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backButton: {
    padding: 8,
  },
  topBarRight: {
    flexDirection: 'row',
  },
  topBarButton: {
    padding: 8,
    marginLeft: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  infoCard: {
    padding: 16,
    backgroundColor: theme.colors.surface,
  },
  photoInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorText: {
    marginLeft: 12,
    flex: 1,
  },
  authorName: {
    color: theme.colors.primary,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  description: {
    marginBottom: 12,
    lineHeight: 20,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    marginRight: 8,
    marginBottom: 4,
  },
  dateText: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'right',
  },
  commentModal: {
    backgroundColor: theme.colors.surface,
    padding: 24,
    margin: 20,
    borderRadius: 16,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  commentInput: {
    marginBottom: 24,
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

export default PhotoDetailScreen;
