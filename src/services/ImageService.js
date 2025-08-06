import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class ImageService {
  constructor() {
    this.images = new Map();
    this.initialized = false;
    this.listeners = new Set();
    
    this.IMAGE_QUALITY = {
      HIGH: 1.0,
      MEDIUM: 0.7,
      LOW: 0.5,
      THUMBNAIL: 0.3
    };
    
    this.MAX_IMAGE_SIZE = {
      WIDTH: 1200,
      HEIGHT: 1200,
      THUMBNAIL_WIDTH: 300,
      THUMBNAIL_HEIGHT: 300
    };
    
    this.ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  }

  async initialize() {
    if (this.initialized) return;

    await this.loadCachedImages();
    await this.requestPermissions();
    
    this.initialized = true;
  }

  async requestPermissions() {
    try {
      // 카메라 권한 요청
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      
      // 미디어 라이브러리 권한 요청
      const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      return {
        camera: cameraPermission.status === 'granted',
        mediaLibrary: mediaPermission.status === 'granted'
      };
    } catch {
      return { camera: false, mediaLibrary: false };
    }
  }

  async loadCachedImages() {
    try {
      const cachedImages = await AsyncStorage.getItem('board_images');
      if (cachedImages) {
        const images = JSON.parse(cachedImages);
        Object.entries(images).forEach(([imageId, imageData]) => {
          this.images.set(imageId, imageData);
        });
      }
    } catch {
      // Handle load error silently
    }
  }

  async saveImagesToStorage() {
    try {
      const imagesObject = {};
      this.images.forEach((imageData, imageId) => {
        imagesObject[imageId] = imageData;
      });
      await AsyncStorage.setItem('board_images', JSON.stringify(imagesObject));
    } catch {
      // Handle save error silently
    }
  }

  async pickImageFromGallery(options = {}) {
    const {
      allowsMultipleSelection = false,
      quality = this.IMAGE_QUALITY.MEDIUM,
      allowsEditing = true,
      aspect = [4, 3]
    } = options;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing,
        aspect,
        quality,
        allowsMultipleSelection,
        selectionLimit: allowsMultipleSelection ? 5 : 1
      });

      if (!result.canceled && result.assets) {
        const processedImages = await Promise.all(
          result.assets.map(asset => this.processImage(asset))
        );
        return allowsMultipleSelection ? processedImages : processedImages[0];
      }

      return null;
    } catch {
      throw new Error('이미지 선택 중 오류가 발생했습니다.');
    }
  }

  async takePhotoWithCamera(options = {}) {
    const {
      quality = this.IMAGE_QUALITY.MEDIUM,
      allowsEditing = true,
      aspect = [4, 3]
    } = options;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing,
        aspect,
        quality
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        return await this.processImage(result.assets[0]);
      }

      return null;
    } catch {
      throw new Error('사진 촬영 중 오류가 발생했습니다.');
    }
  }

  async processImage(imageAsset, options = {}) {
    const {
      maxWidth = this.MAX_IMAGE_SIZE.WIDTH,
      maxHeight = this.MAX_IMAGE_SIZE.HEIGHT,
      quality = this.IMAGE_QUALITY.MEDIUM,
      createThumbnail = true
    } = options;

    try {
      // 이미지 리사이징 및 압축
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageAsset.uri,
        [
          {
            resize: {
              width: Math.min(imageAsset.width || maxWidth, maxWidth),
              height: Math.min(imageAsset.height || maxHeight, maxHeight)
            }
          }
        ],
        {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: false
        }
      );

      // 썸네일 생성
      let thumbnail = null;
      if (createThumbnail) {
        thumbnail = await ImageManipulator.manipulateAsync(
          imageAsset.uri,
          [
            {
              resize: {
                width: this.MAX_IMAGE_SIZE.THUMBNAIL_WIDTH,
                height: this.MAX_IMAGE_SIZE.THUMBNAIL_HEIGHT
              }
            }
          ],
          {
            compress: this.IMAGE_QUALITY.THUMBNAIL,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: false
          }
        );
      }

      const imageId = this.generateImageId();
      const timestamp = new Date().toISOString();

      const processedImageData = {
        id: imageId,
        originalUri: imageAsset.uri,
        processedUri: manipulatedImage.uri,
        thumbnailUri: thumbnail?.uri,
        filename: imageAsset.fileName || `image_${Date.now()}.jpg`,
        mimeType: imageAsset.mimeType || 'image/jpeg',
        size: imageAsset.fileSize || 0,
        dimensions: {
          original: {
            width: imageAsset.width,
            height: imageAsset.height
          },
          processed: {
            width: manipulatedImage.width,
            height: manipulatedImage.height
          },
          thumbnail: thumbnail ? {
            width: thumbnail.width,
            height: thumbnail.height
          } : null
        },
        metadata: {
          platform: Platform.OS,
          processed: true,
          quality,
          createdAt: timestamp
        },
        uploadStatus: 'local', // local, uploading, uploaded, failed
        uploadProgress: 0
      };

      this.images.set(imageId, processedImageData);
      await this.saveImagesToStorage();

      this.notifyListeners('image_processed', { image: processedImageData });

      return processedImageData;
    } catch {
      throw new Error('이미지 처리 중 오류가 발생했습니다.');
    }
  }

  async attachImagesToPost(postId, imageIds) {
    try {
      const attachedImages = [];
      
      for (const imageId of imageIds) {
        const image = this.images.get(imageId);
        if (image) {
          const attachmentData = {
            ...image,
            attachedTo: postId,
            attachedAt: new Date().toISOString()
          };
          
          this.images.set(imageId, attachmentData);
          attachedImages.push(attachmentData);
        }
      }

      await this.saveImagesToStorage();
      this.notifyListeners('images_attached', { postId, images: attachedImages });

      return attachedImages;
    } catch {
      throw new Error('이미지 첨부 중 오류가 발생했습니다.');
    }
  }

  async getImagesByPostId(postId) {
    const postImages = [];
    
    this.images.forEach(image => {
      if (image.attachedTo === postId) {
        postImages.push(image);
      }
    });

    return postImages.sort((a, b) => 
      new Date(a.attachedAt) - new Date(b.attachedAt)
    );
  }

  async removeImage(imageId) {
    try {
      const image = this.images.get(imageId);
      if (!image) {
        throw new Error('Image not found');
      }

      this.images.delete(imageId);
      await this.saveImagesToStorage();

      this.notifyListeners('image_removed', { imageId, image });

      return true;
    } catch {
      throw new Error('이미지 삭제 중 오류가 발생했습니다.');
    }
  }

  async getImage(imageId) {
    return this.images.get(imageId);
  }

  async getAllImages() {
    return Array.from(this.images.values()).sort((a, b) => 
      new Date(b.metadata.createdAt) - new Date(a.metadata.createdAt)
    );
  }

  generateImageId() {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async simulateUpload(imageId, progressCallback) {
    const image = this.images.get(imageId);
    if (!image) {
      throw new Error('Image not found');
    }

    try {
      // 업로드 상태로 변경
      image.uploadStatus = 'uploading';
      image.uploadProgress = 0;
      this.images.set(imageId, image);

      // 업로드 진행률 시뮬레이션
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        image.uploadProgress = progress;
        this.images.set(imageId, image);
        
        if (progressCallback) {
          progressCallback(progress);
        }
        
        this.notifyListeners('upload_progress', { 
          imageId, 
          progress,
          image 
        });
      }

      // 업로드 완료
      image.uploadStatus = 'uploaded';
      image.uploadedAt = new Date().toISOString();
      this.images.set(imageId, image);

      await this.saveImagesToStorage();
      this.notifyListeners('upload_completed', { imageId, image });

      return image;
    } catch (error) {
      // 업로드 실패
      image.uploadStatus = 'failed';
      image.uploadError = error.message;
      this.images.set(imageId, image);

      await this.saveImagesToStorage();
      this.notifyListeners('upload_failed', { imageId, image, error });

      throw error;
    }
  }

  async retryUpload(imageId) {
    const image = this.images.get(imageId);
    if (!image) {
      throw new Error('Image not found');
    }

    if (image.uploadStatus !== 'failed') {
      throw new Error('Image is not in failed state');
    }

    return await this.simulateUpload(imageId);
  }

  getImageStats() {
    const images = Array.from(this.images.values());
    
    return {
      total: images.length,
      uploaded: images.filter(img => img.uploadStatus === 'uploaded').length,
      uploading: images.filter(img => img.uploadStatus === 'uploading').length,
      failed: images.filter(img => img.uploadStatus === 'failed').length,
      local: images.filter(img => img.uploadStatus === 'local').length,
      totalSize: images.reduce((sum, img) => sum + (img.size || 0), 0)
    };
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }

  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch {
        // Handle listener error silently
      }
    });
  }

  cleanup() {
    this.listeners.clear();
    this.initialized = false;
  }
}

const imageService = new ImageService();

export default imageService;
