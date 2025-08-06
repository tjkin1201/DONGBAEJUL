import { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { Button, IconButton, Menu, ActivityIndicator, Text } from 'react-native-paper';
import imageService from '../../services/ImageService';

const ImagePickerComponent = ({ 
  onImageSelected, 
  multiple = false, 
  disabled = false,
  style,
  buttonMode = 'contained',
  buttonIcon = 'camera-alt',
  buttonText = '이미지 선택'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleImageSelection = async (images) => {
    if (images) {
      if (Array.isArray(images)) {
        onImageSelected(images);
      } else {
        onImageSelected([images]);
      }
    }
  };

  const openCamera = async () => {
    setMenuVisible(false);
    setIsLoading(true);

    try {
      await imageService.initialize();
      const permissions = await imageService.requestPermissions();
      
      if (!permissions.camera) {
        Alert.alert(
          '권한 필요',
          '카메라를 사용하려면 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
          [{ text: '확인' }]
        );
        return;
      }

      const image = await imageService.takePhotoWithCamera({
        allowsEditing: true,
        aspect: [4, 3]
      });

      if (image) {
        await handleImageSelection(image);
      }
    } catch (error) {
      Alert.alert('오류', error.message || '사진 촬영 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const openGallery = async () => {
    setMenuVisible(false);
    setIsLoading(true);

    try {
      await imageService.initialize();
      const permissions = await imageService.requestPermissions();
      
      if (!permissions.mediaLibrary) {
        Alert.alert(
          '권한 필요',
          '갤러리에 접근하려면 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
          [{ text: '확인' }]
        );
        return;
      }

      const images = await imageService.pickImageFromGallery({
        allowsMultipleSelection: multiple,
        allowsEditing: !multiple,
        aspect: [4, 3]
      });

      if (images) {
        await handleImageSelection(images);
      }
    } catch (error) {
      Alert.alert('오류', error.message || '이미지 선택 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const showOptions = () => {
    Alert.alert(
      '이미지 선택',
      '이미지를 가져올 방법을 선택하세요.',
      [
        {
          text: '카메라',
          onPress: openCamera
        },
        {
          text: '갤러리',
          onPress: openGallery
        },
        {
          text: '취소',
          style: 'cancel'
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, style]}>
        <ActivityIndicator size="small" />
        <Text style={styles.loadingText}>이미지 처리 중...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Button
            mode={buttonMode}
            icon={buttonIcon}
            onPress={buttonMode === 'menu' ? () => setMenuVisible(true) : showOptions}
            disabled={disabled}
            style={styles.button}
          >
            {buttonText}
          </Button>
        }
      >
        <Menu.Item
          onPress={openCamera}
          title="카메라"
          leadingIcon="camera"
        />
        <Menu.Item
          onPress={openGallery}
          title="갤러리"
          leadingIcon="image"
        />
      </Menu>
    </View>
  );
};

const ImagePickerButton = ({ 
  onPress, 
  disabled = false, 
  style,
  size = 'medium',
  variant = 'outlined'
}) => {
  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
  
  return (
    <IconButton
      icon="camera-plus"
      size={iconSize}
      mode={variant}
      onPress={onPress}
      disabled={disabled}
      style={[styles.iconButton, style]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  button: {
    marginHorizontal: 4
  },
  iconButton: {
    marginHorizontal: 2
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
    opacity: 0.7
  }
});

export { ImagePickerComponent, ImagePickerButton };
export default ImagePickerComponent;
