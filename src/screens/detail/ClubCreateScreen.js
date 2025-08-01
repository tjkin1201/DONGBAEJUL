import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  TextInput, 
  Button, 
  SegmentedButtons,
  Switch,
  Surface,
  Avatar,
  IconButton,
  ActivityIndicator
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { clubAPI } from '../../services/api';
import theme from '../../utils/theme';

const ClubCreateScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [clubImage, setClubImage] = useState(null);

  const levelOptions = [
    { value: 'beginner', label: '초급' },
    { value: 'intermediate', label: '중급' },
    { value: 'advanced', label: '고급' },
    { value: 'expert', label: '전문가' },
  ];

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      level: 'intermediate',
      location: '',
      mainVenue: '',
      adminContact: user?.phone || '',
      activityTime: '',
      maxMembers: 20,
      isPublic: true,
      requireApproval: true,
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      
      const clubData = {
        ...data,
        clubImage: clubImage,
        createdBy: user.id,
      };

      const response = await clubAPI.createClub(clubData);
      const createdClub = response.data.data;

      Alert.alert(
        '클럽 생성 완료',
        '새로운 클럽이 성공적으로 생성되었습니다!',
        [
          {
            text: '확인',
            onPress: () => {
              navigation.replace('ClubDetail', { clubId: createdClub._id });
            }
          }
        ]
      );
    } catch (error) {
      console.error('클럽 생성 오류:', error);
      Alert.alert(
        '클럽 생성 실패',
        error.response?.data?.error?.message || '클럽 생성 중 오류가 발생했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePicker = () => {
    Alert.alert(
      '클럽 이미지 선택',
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
        await uploadClubImage(result.assets[0]);
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
        await uploadClubImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('오류', '카메라 사용 중 오류가 발생했습니다.');
    }
  };

  const uploadClubImage = async (imageAsset) => {
    try {
      setIsImageUploading(true);

      const imageData = {
        uri: imageAsset.uri,
        type: 'image/jpeg',
        fileName: 'club.jpg',
      };

      const response = await clubAPI.uploadClubImage(imageData);
      const imageUrl = response.data.data.imageUrl;

      setClubImage(imageUrl);
      Alert.alert('성공', '클럽 이미지가 업로드되었습니다.');
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      Alert.alert('업로드 실패', '이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsImageUploading(false);
    }
  };

  const renderClubImage = () => (
    <Card style={styles.imageCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>클럽 이미지</Text>
        <View style={styles.imageContainer}>
          <View style={styles.avatarContainer}>
            <Avatar.Image
              size={120}
              source={{ uri: clubImage || 'https://via.placeholder.com/120' }}
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
            클럽을 대표하는 이미지를 선택해주세요
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderBasicInfo = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>기본 정보</Text>

        {/* 클럽명 */}
        <Controller
          control={control}
          name="name"
          rules={{
            required: '클럽명을 입력해주세요',
            minLength: {
              value: 2,
              message: '클럽명은 2자 이상이어야 합니다',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              label="클럽명"
              placeholder="배드민턴 동호회"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={!!errors.name}
              style={styles.input}
              left={<TextInput.Icon icon="account-group" />}
            />
          )}
        />
        {errors.name && (
          <Text style={styles.errorText}>{errors.name.message}</Text>
        )}

        {/* 클럽 소개 */}
        <Controller
          control={control}
          name="description"
          rules={{
            required: '클럽 소개를 입력해주세요',
            minLength: {
              value: 10,
              message: '클럽 소개는 10자 이상이어야 합니다',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              label="클럽 소개"
              placeholder="우리 클럽을 소개해주세요"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              multiline
              numberOfLines={4}
              error={!!errors.description}
              style={styles.input}
              left={<TextInput.Icon icon="text" />}
            />
          )}
        />
        {errors.description && (
          <Text style={styles.errorText}>{errors.description.message}</Text>
        )}

        {/* 실력 레벨 */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>클럽 실력 레벨</Text>
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
            클럽의 주요 실력 수준을 선택해주세요
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderLocationInfo = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>위치 정보</Text>

        {/* 주요 활동 지역 */}
        <Controller
          control={control}
          name="location"
          rules={{
            required: '주요 활동 지역을 입력해주세요',
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              label="주요 활동 지역"
              placeholder="서울시 강남구"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={!!errors.location}
              style={styles.input}
              left={<TextInput.Icon icon="map-marker" />}
            />
          )}
        />
        {errors.location && (
          <Text style={styles.errorText}>{errors.location.message}</Text>
        )}

        {/* 주요 활동 장소 */}
        <Controller
          control={control}
          name="mainVenue"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              label="주요 활동 장소 (선택사항)"
              placeholder="강남 배드민턴 센터"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              style={styles.input}
              left={<TextInput.Icon icon="home-variant" />}
            />
          )}
        />
      </Card.Content>
    </Card>
  );

  const renderContactInfo = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>연락 정보</Text>

        {/* 관리자 연락처 */}
        <Controller
          control={control}
          name="adminContact"
          rules={{
            pattern: {
              value: /^010-\d{4}-\d{4}$/,
              message: '전화번호 형식: 010-1234-5678',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              label="관리자 연락처"
              placeholder="010-1234-5678"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              keyboardType="phone-pad"
              error={!!errors.adminContact}
              style={styles.input}
              left={<TextInput.Icon icon="phone" />}
            />
          )}
        />
        {errors.adminContact && (
          <Text style={styles.errorText}>{errors.adminContact.message}</Text>
        )}

        {/* 활동 시간 */}
        <Controller
          control={control}
          name="activityTime"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              label="주요 활동 시간 (선택사항)"
              placeholder="매주 토요일 오후 2시-6시"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              style={styles.input}
              left={<TextInput.Icon icon="clock" />}
            />
          )}
        />
      </Card.Content>
    </Card>
  );

  const renderClubSettings = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>클럽 설정</Text>

        {/* 최대 멤버 수 */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>최대 멤버 수</Text>
          <Controller
            control={control}
            name="maxMembers"
            rules={{
              required: '최대 멤버 수를 입력해주세요',
              min: { value: 5, message: '최소 5명 이상이어야 합니다' },
              max: { value: 100, message: '최대 100명까지 가능합니다' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.memberContainer}>
                <IconButton
                  icon="minus"
                  size={20}
                  onPress={() => onChange(Math.max(5, value - 1))}
                  style={styles.memberButton}
                />
                <TextInput
                  mode="outlined"
                  value={value?.toString()}
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(parseInt(text) || 5)}
                  keyboardType="number-pad"
                  style={styles.memberInput}
                  contentStyle={styles.memberInputContent}
                />
                <IconButton
                  icon="plus"
                  size={20}
                  onPress={() => onChange(Math.min(100, value + 1))}
                  style={styles.memberButton}
                />
              </View>
            )}
          />
          {errors.maxMembers && (
            <Text style={styles.errorText}>{errors.maxMembers.message}</Text>
          )}
        </View>

        {/* 공개 클럽 설정 */}
        <Controller
          control={control}
          name="isPublic"
          render={({ field: { onChange, value } }) => (
            <View style={styles.switchContainer}>
              <View style={styles.switchContent}>
                <Text style={styles.switchLabel}>공개 클럽</Text>
                <Text style={styles.switchDescription}>
                  모든 사용자가 이 클럽을 찾을 수 있습니다
                </Text>
              </View>
              <Switch
                value={value}
                onValueChange={onChange}
                color={theme.colors.primary}
              />
            </View>
          )}
        />

        {/* 가입 승인 필요 */}
        <Controller
          control={control}
          name="requireApproval"
          render={({ field: { onChange, value } }) => (
            <View style={styles.switchContainer}>
              <View style={styles.switchContent}>
                <Text style={styles.switchLabel}>가입 승인 필요</Text>
                <Text style={styles.switchDescription}>
                  신규 멤버 가입 시 관리자 승인이 필요합니다
                </Text>
              </View>
              <Switch
                value={value}
                onValueChange={onChange}
                color={theme.colors.primary}
              />
            </View>
          )}
        />
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderClubImage()}
        {renderBasicInfo()}
        {renderLocationInfo()}
        {renderContactInfo()}
        {renderClubSettings()}

        {/* 생성 버튼 */}
        <View style={styles.createButtonContainer}>
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
            style={styles.createButton}
            labelStyle={styles.createButtonText}
          >
            클럽 생성하기
          </Button>
        </View>

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
    alignItems: 'center',
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
    marginBottom: theme.spacing.md,
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
  memberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberButton: {
    margin: 0,
    backgroundColor: theme.colors.primaryContainer,
  },
  memberInput: {
    width: 100,
    marginHorizontal: theme.spacing.md,
  },
  memberInputContent: {
    textAlign: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  switchContent: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  switchDescription: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
    lineHeight: 20,
  },
  createButtonContainer: {
    margin: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: theme.spacing.xl,
  },
});

export default ClubCreateScreen;