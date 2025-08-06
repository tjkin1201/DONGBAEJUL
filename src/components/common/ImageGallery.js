import { useState } from 'react';
import { 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  Modal,
  Alert 
} from 'react-native';
import { 
  Card, 
  IconButton, 
  Text, 
  Button, 
  ActivityIndicator,
  ProgressBar
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 60) / 3; // 3 columns with margins

const ImageGallery = ({ 
  images = [], 
  onRemoveImage,
  onImagePress,
  editable = true,
  maxHeight = 300,
  showUploadProgress = true
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleImagePress = (image, index) => {
    if (onImagePress) {
      onImagePress(image, index);
    } else {
      setSelectedImageIndex(index);
      setModalVisible(true);
    }
  };

  const handleRemoveImage = (image, index) => {
    Alert.alert(
      '이미지 삭제',
      '이 이미지를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: () => onRemoveImage && onRemoveImage(image, index)
        }
      ]
    );
  };

  const renderUploadProgress = (image) => {
    if (!showUploadProgress || image.uploadStatus !== 'uploading') {
      return null;
    }

    return (
      <View style={styles.progressContainer}>
        <ProgressBar 
          progress={image.uploadProgress / 100} 
          style={styles.progressBar}
        />
        <Text style={styles.progressText}>
          {Math.round(image.uploadProgress)}%
        </Text>
      </View>
    );
  };

  const renderUploadStatus = (image) => {
    switch (image.uploadStatus) {
      case 'uploading':
        return (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="small" color="#fff" />
          </View>
        );
      case 'failed':
        return (
          <View style={[styles.statusContainer, styles.failedStatus]}>
            <MaterialIcons name="error" size={16} color="#fff" />
          </View>
        );
      case 'uploaded':
        return (
          <View style={[styles.statusContainer, styles.successStatus]}>
            <MaterialIcons name="check-circle" size={16} color="#fff" />
          </View>
        );
      default:
        return null;
    }
  };

  const renderImageItem = (image, index) => {
    const imageUri = image.thumbnailUri || image.processedUri || image.originalUri;
    
    return (
      <Card key={image.id || index} style={styles.imageCard}>
        <TouchableOpacity
          onPress={() => handleImagePress(image, index)}
          style={styles.imageContainer}
        >
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
          
          {renderUploadStatus(image)}
          
          {editable && (
            <IconButton
              icon="close"
              size={16}
              iconColor="#fff"
              style={styles.removeButton}
              onPress={() => handleRemoveImage(image, index)}
            />
          )}
        </TouchableOpacity>
        
        {renderUploadProgress(image)}
      </Card>
    );
  };

  const renderImageModal = () => {
    if (selectedImageIndex === null || !images[selectedImageIndex]) {
      return null;
    }

    const selectedImage = images[selectedImageIndex];
    const imageUri = selectedImage.processedUri || selectedImage.originalUri;

    return (
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackground}
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <Image
                source={{ uri: imageUri }}
                style={styles.modalImage}
                resizeMode="contain"
              />
              
              <View style={styles.modalActions}>
                <Button
                  mode="contained"
                  onPress={() => setModalVisible(false)}
                  style={styles.modalButton}
                >
                  닫기
                </Button>
                
                {editable && (
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setModalVisible(false);
                      handleRemoveImage(selectedImage, selectedImageIndex);
                    }}
                    style={styles.modalButton}
                  >
                    삭제
                  </Button>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        style={{ maxHeight }}
      >
        {images.map((image, index) => renderImageItem(image, index))}
      </ScrollView>
      
      {renderImageModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8
  },
  scrollContainer: {
    paddingHorizontal: 8
  },
  imageCard: {
    marginHorizontal: 4,
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    borderRadius: 8,
    overflow: 'hidden'
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12
  },
  statusContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 4
  },
  failedStatus: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)'
  },
  successStatus: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)'
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 4
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)'
  },
  progressText: {
    color: '#fff',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)'
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    maxWidth: '90%',
    maxHeight: '80%'
  },
  modalImage: {
    width: 300,
    height: 300,
    marginBottom: 16
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  modalButton: {
    marginHorizontal: 8
  }
});

export { ImageGallery };
export default ImageGallery;
