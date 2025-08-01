import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Avatar, 
  TextInput, 
  Button, 
  SegmentedButtons,
  Surface,
  IconButton,
  ActivityIndicator,
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import theme from '../../utils/theme';

const ProfileEditScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);

  const levelOptions = [
    { value: 'beginner', label: '초급' },
    { value: 'intermediate', label: '중급' },
    { value: 'advanced', label: '고급' },
    { value: 'expert', label: '전문가' },
  ];

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      level: user?.level || 'beginner',
      preferredLocation: user?.preferredLocation || '',
      bio: user?.bio || '',
    },
  });

  useEffect(() => {
    // 권한 요청
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '프로필 이미지 변경을 위해 갤러리 접근 권한이 필요합니다.');
      }
    })();
  }, []);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      
      const updateData = {
        name: data.name,
        phone: data.phone,
        level: data.level,
        preferredLocation: data.preferredLocation,
        bio: data.bio,
      };

      const response = await userAPI.updateProfile(updateData);
      const updatedUser = response.data.data;

      // AuthContext의 사용자 정보 업데이트
      await updateUser(updatedUser);

      Alert.alert(
        '프로필 수정 완료',
        '프로필이 성공적으로 수정되었습니다.',
        [
          {
            text: '확인',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('프로필 수정 오류:', error);
      Alert.alert(
        '수정 실패',
        error.response?.data?.error?.message || '프로필 수정 중 오류가 발생했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePicker = () => {
    Alert.alert(
      '프로필 이미지 변경',
      '이미지를 선택하는 방법을 선택해주세요.',
      [
        { text: '취소', style: 'cancel' },
        { text: '갤러리에서 선택', onPress: pickImageFromGallery },
        { text: '카메라로 촬영', onPress: pickImageFromCamera }
      ]
    );
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadProfileImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('오류', '이미지 선택 중 오류가 발생했습니다.');
    }
  };

  const pickImageFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '카메라 사용을 위해 권한이 필요합니다.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadProfileImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('오류', '카메라 사용 중 오류가 발생했습니다.');
    }
  };

  const uploadProfileImage = async (imageAsset) => {
    try {
      setIsImageUploading(true);

      const imageData = {
        uri: imageAsset.uri,
        type: 'image/jpeg',
        fileName: 'profile.jpg',
      };

      const response = await userAPI.uploadProfileImage(imageData);
      const imageUrl = response.data.data.imageUrl;

      setProfileImage(imageUrl);
      
      // 사용자 정보 업데이트
      const updatedUser = { ...user, profileImage: imageUrl };
      await updateUser(updatedUser);

      Alert.alert('성공', '프로필 이미지가 변경되었습니다.');
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      Alert.alert('업로드 실패', '이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsImageUploading(false);
    }
  };

  const getLevelText = (level) => {
    switch (level) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
      case 'expert': return '전문가';
      default: return '초급';
    }
  };

  const renderProfileImage = () => (
    <Card style={styles.imageCard}>
      <Card.Content>
        <View style={styles.imageContainer}>
          <View style={styles.avatarContainer}>
            <Avatar.Image
              size={120}
              source={{ uri: profileImage || 'https://via.placeholder.com/120' }}
              style={styles.avatar}
            />
            {isImageUploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color={theme.colors.surface} />
              </View>
            )}
            <IconButton
              icon="camera"
              size={24}
              onPress={handleImagePicker}
              disabled={isImageUploading}
              style={styles.cameraButton}
              iconColor={theme.colors.surface}
            />
          </View>
          <Text style={styles.imageDescription}>
            프로필 사진을 터치하여 변경하세요
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderBasicInfo = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>기본 정보</Text>

        {/* 이름 */}
        <Controller
          control={control}
          name="name"
          rules={{
            required: '이름을 입력해주세요',
            minLength: {
              value: 2,
              message: '이름은 2자 이상이어야 합니다',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              label="이름"
              placeholder="홍길동"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={!!errors.name}
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
            />
          )}
        />
        {errors.name && (
          <Text style={styles.errorText}>{errors.name.message}</Text>
        )}

        {/* 이메일 (읽기 전용) */}
        <Controller
          control={control}
          name="email"
          render={({ field: { value } }) => (
            <TextInput
              mode="outlined"
              label="이메일"
              value={value}
              editable={false}
              style={[styles.input, styles.disabledInput]}
              left={<TextInput.Icon icon="email" />}
              right={<TextInput.Icon icon="lock" />}
            />
          )}
        />
        <Text style={styles.helperText}>이메일은 변경할 수 없습니다</Text>

        {/* 전화번호 */}
        <Controller
          control={control}
          name="phone"
          rules={{
            pattern: {
              value: /^010-\d{4}-\d{4}$/,
              message: '전화번호 형식: 010-1234-5678',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              label="전화번호"
              placeholder="010-1234-5678"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              keyboardType="phone-pad"
              error={!!errors.phone}
              style={styles.input}
              left={<TextInput.Icon icon="phone" />}
            />
          )}
        />
        {errors.phone && (
          <Text style={styles.errorText}>{errors.phone.message}</Text>
        )}
      </Card.Content>
    </Card>
  );

  const renderGameInfo = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>게임 정보</Text>

        {/* 실력 레벨 */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>실력 레벨</Text>
          <Controller
            control={control}
            name="level"
            render={({ field: { onChange, value } }) => (
              <SegmentedButtons
                value={value}
                onValueChange={onChange}
                buttons={levelOptions}
                style={styles.segmentedButtons}
              />
            )}
          />
          <Text style={styles.helperText}>
            현재 레벨: {getLevelText(user?.level)}
          </Text>
        </View>

        {/* 선호 지역 */}
        <Controller
          control={control}
          name="preferredLocation"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              label="선호 지역"
              placeholder="강남구, 서초구 등"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              style={styles.input}
              left={<TextInput.Icon icon="map-marker" />}
            />
          )}
        />

        {/* 자기소개 */}
        <Controller
          control={control}
          name="bio"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              label="자기소개"
              placeholder="간단한 자기소개를 작성해주세요"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              multiline
              numberOfLines={4}
              style={styles.input}
              left={<TextInput.Icon icon="text" />}
            />
          )}
        />
        <Text style={styles.helperText}>
          자기소개는 다른 사용자들에게 공개됩니다 (선택사항)
        </Text>
      </Card.Content>
    </Card>
  );

  const renderPasswordSection = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>보안</Text>
        
        <Surface style={styles.passwordSection} elevation={1}>
          <View style={styles.passwordInfo}>
            <Text style={styles.passwordTitle}>비밀번호 변경</Text>
            <Text style={styles.passwordDescription}>
              보안을 위해 정기적으로 비밀번호를 변경하세요
            </Text>
          </View>
          <Button
            mode="outlined"
            onPress={() => {
              Alert.alert('알림', '비밀번호 변경 기능은 곧 추가될 예정입니다.');
            }}
            style={styles.passwordButton}
          >
            변경하기
          </Button>
        </Surface>
      </Card.Content>
    </Card>
  );

  const renderActionButtons = () => (
    <View style={styles.actionContainer}>
      <Button
        mode="outlined"
        onPress={() => navigation.goBack()}
        style={styles.cancelButton}
        labelStyle={styles.cancelButtonText}
      >
        취소
      </Button>
      
      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
        disabled={isLoading || !isDirty}
        style={[
          styles.saveButton,
          (!isDirty || isLoading) && styles.disabledButton
        ]}
        labelStyle={styles.saveButtonText}
      >
        저장하기
      </Button>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderProfileImage()}
        {renderBasicInfo()}
        {renderGameInfo()}
        {renderPasswordSection()}
        {renderActionButtons()}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  imageCard: {
    margin: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  imageContainer: {
    alignInfo: 'center',
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    alignSelf: 'center',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: theme.colors.primary,
  },
  imageDescription: {
    fontSize: 14,
    color: theme.colors.text,
    textAlign: 'center',
    opacity: 0.7,
  },
  sectionCard: {
    margin: theme.spacing.lg,
    marginTop: 0,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  input: {
    marginBottom: theme.spacing.sm,
  },
  disabledInput: {
    opacity: 0.6,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.7,
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.sm,
  },
  fieldContainer: {
    marginBottom: theme.spacing.lg,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  segmentedButtons: {
    marginBottom: theme.spacing.sm,
  },
  passwordSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.roundness,
  },
  passwordInfo: {
    flex: 1,
  },
  passwordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  passwordDescription: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
  },
  passwordButton: {
    borderColor: theme.colors.primary,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    marginRight: theme.spacing.md,
    borderColor: theme.colors.outline,
  },
  cancelButtonText: {
    color: theme.colors.text,
  },
  saveButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  bottomSpacing: {
    height: theme.spacing.xl,
  },
});

export default ProfileEditScreen;