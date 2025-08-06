import { useState } from 'react';
import {
  View,
  ScrollView,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Surface,
  Snackbar
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import boardService from '../../services/BoardService';
import imageService from '../../services/ImageService';
import ImagePickerComponent from '../../components/common/ImagePickerComponent';
import ImageGallery from '../../components/common/ImageGallery';

const CreatePostScreen = ({ route, navigation }) => {
  const { user } = useAuth();
  const { categoryId = 'general', onPostCreated } = route.params || {};
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachedImages, setAttachedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleImageSelected = async (images) => {
    try {
      setLoading(true);
      const newImages = Array.isArray(images) ? images : [images];
      
      // 이미지 업로드 시뮬레이션
      for (const image of newImages) {
        await imageService.simulateUpload(image.id);
      }
      
      setAttachedImages(prev => [...prev, ...newImages]);
      showSnackbar(`${newImages.length}개의 이미지가 추가되었습니다.`);
    } catch (error) {
      showSnackbar(error.message || '이미지 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async (image, index) => {
    try {
      await imageService.removeImage(image.id);
      setAttachedImages(prev => prev.filter((_, i) => i !== index));
      showSnackbar('이미지가 삭제되었습니다.');
    } catch (error) {
      showSnackbar(error.message || '이미지 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      showSnackbar('제목을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      showSnackbar('내용을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const postData = {
        title: title.trim(),
        content: content.trim(),
        categoryId: categoryId,
        status: boardService.POST_STATUS.PUBLISHED,
        attachments: attachedImages.map(img => ({
          id: img.id,
          type: 'image',
          uri: img.processedUri || img.originalUri,
          thumbnailUri: img.thumbnailUri,
          filename: img.filename,
          size: img.size
        }))
      };

      const post = await boardService.createPost(postData, user);
      
      // 이미지를 게시글에 첨부
      if (attachedImages.length > 0) {
        const imageIds = attachedImages.map(img => img.id);
        await imageService.attachImagesToPost(post.id, imageIds);
      }
      
      if (onPostCreated) {
        onPostCreated();
      }
      
      navigation.goBack();
    } catch {
      showSnackbar('게시글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <Surface style={{ margin: 16, padding: 16, borderRadius: 8 }}>
          <Text variant="titleMedium" style={{ marginBottom: 16 }}>
            게시글 작성
          </Text>

          {/* 제목 입력 */}
          <TextInput
            label="제목"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={{ marginBottom: 16 }}
            maxLength={100}
          />

          {/* 내용 입력 */}
          <TextInput
            label="내용"
            value={content}
            onChangeText={setContent}
            mode="outlined"
            multiline
            numberOfLines={10}
            style={{ marginBottom: 16 }}
            maxLength={2000}
          />

          {/* 이미지 첨부 */}
          <View style={{ marginBottom: 16 }}>
            <Text variant="labelLarge" style={{ marginBottom: 8 }}>
              이미지 첨부 (최대 5개)
            </Text>
            
            <ImagePickerComponent
              onImageSelected={handleImageSelected}
              multiple={true}
              disabled={loading || attachedImages.length >= 5}
              buttonText={attachedImages.length >= 5 ? '최대 5개까지 가능' : '이미지 추가'}
            />
            
            {attachedImages.length > 0 && (
              <ImageGallery
                images={attachedImages}
                onRemoveImage={handleRemoveImage}
                editable={true}
                showUploadProgress={true}
                maxHeight={200}
                style={{ marginTop: 8 }}
              />
            )}
          </View>

          {/* 작성 버튼 */}
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading || !title.trim() || !content.trim()}
            style={{ marginTop: 16 }}
          >
            게시글 작성
          </Button>
        </Surface>
      </ScrollView>

      {/* 스낵바 */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ marginBottom: Platform.OS === 'ios' ? 34 : 0 }}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

export default CreatePostScreen;
