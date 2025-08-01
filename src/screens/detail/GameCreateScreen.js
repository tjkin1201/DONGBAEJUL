import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  TextInput, 
  Button, 
  SegmentedButtons,
  Checkbox,
  Surface,
  IconButton,
  Menu,
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import { gameAPI } from '../../services/api';
import theme from '../../utils/theme';

const GameCreateScreen = ({ route, navigation }) => {
  const { clubId } = route.params || {};
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [gameTypeMenuVisible, setGameTypeMenuVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  const gameTypes = [
    { value: '단식', label: '단식 (1vs1)' },
    { value: '복식', label: '복식 (2vs2)' },
    { value: '혼합복식', label: '혼합복식' },
    { value: '자유매칭', label: '자유매칭' },
  ];

  const levelOptions = [
    { value: 'beginner', label: '초급' },
    { value: 'intermediate', label: '중급' },
    { value: 'advanced', label: '고급' },
    { value: 'expert', label: '전문가' },
  ];

  const durationOptions = [
    { value: '60', label: '1시간' },
    { value: '90', label: '1시간 30분' },
    { value: '120', label: '2시간' },
    { value: '150', label: '2시간 30분' },
    { value: '180', label: '3시간' },
  ];

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      gameType: '복식',
      level: 'intermediate',
      maxParticipants: 8,
      fee: 10000,
      duration: '120',
      location: {
        name: '',
        address: '',
        coordinates: [0, 0]
      },
      isPublic: true,
      allowWaitingList: true,
      autoConfirm: false,
      requireApproval: false,
    },
  });

  const watchGameType = watch('gameType');
  const watchLevel = watch('level');
  const watchDuration = watch('duration');

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      // 날짜와 시간 합치기
      const gameDateTime = new Date(selectedDate);
      gameDateTime.setHours(selectedTime.getHours());
      gameDateTime.setMinutes(selectedTime.getMinutes());

      // 현재 시간보다 이전인지 확인
      if (gameDateTime <= new Date()) {
        Alert.alert('날짜 오류', '게임 시간은 현재 시간보다 이후여야 합니다.');
        return;
      }

      const gameData = {
        ...data,
        gameDate: gameDateTime.toISOString(),
        clubId: clubId || null,
        createdBy: user.id,
      };

      const response = await gameAPI.createGame(gameData);
      const createdGame = response.data.data;

      Alert.alert(
        '게임 생성 완료',
        '새로운 게임이 성공적으로 생성되었습니다!',
        [
          {
            text: '확인',
            onPress: () => {
              navigation.replace('GameDetail', { gameId: createdGame._id });
            }
          }
        ]
      );
    } catch (error) {
      console.error('게임 생성 오류:', error);
      Alert.alert(
        '게임 생성 실패',
        error.response?.data?.error?.message || '게임 생성 중 오류가 발생했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const onTimeChange = (event, time) => {
    setShowTimePicker(false);
    if (time) {
      setSelectedTime(time);
    }
  };

  const getMaxParticipantsByType = (gameType) => {
    switch (gameType) {
      case '단식': return 2;
      case '복식': return 4;
      case '혼합복식': return 4;
      case '자유매칭': return 16;
      default: return 8;
    }
  };

  const renderBasicInfo = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>기본 정보</Text>

        {/* 게임 제목 */}
        <Controller
          control={control}
          name="title"
          rules={{
            required: '게임 제목을 입력해주세요',
            minLength: {
              value: 2,
              message: '제목은 2자 이상이어야 합니다',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              label="게임 제목"
              placeholder="주말 즐거운 복식 게임"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={!!errors.title}
              style={styles.input}
            />
          )}
        />
        {errors.title && (
          <Text style={styles.errorText}>{errors.title.message}</Text>
        )}

        {/* 게임 설명 */}
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              label="게임 설명 (선택사항)"
              placeholder="게임에 대한 간단한 설명을 입력하세요"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          )}
        />

        {/* 게임 유형 */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>게임 유형</Text>
          <Menu
            visible={gameTypeMenuVisible}
            onDismiss={() => setGameTypeMenuVisible(false)}
            anchor={
              <Surface
                style={styles.menuButton}
                elevation={1}
                onTouchEnd={() => setGameTypeMenuVisible(true)}
              >
                <Text style={styles.menuButtonText}>{watchGameType}</Text>
                <IconButton icon="chevron-down" size={20} />
              </Surface>
            }
          >
            {gameTypes.map((type) => (
              <Menu.Item
                key={type.value}
                onPress={() => {
                  setValue('gameType', type.value);
                  setValue('maxParticipants', getMaxParticipantsByType(type.value));
                  setGameTypeMenuVisible(false);
                }}
                title={type.label}
              />
            ))}
          </Menu>
        </View>

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
        </View>
      </Card.Content>
    </Card>
  );

  const renderDateTime = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>날짜 및 시간</Text>

        {/* 날짜 선택 */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>게임 날짜</Text>
          <Surface
            style={styles.dateTimeButton}
            elevation={1}
            onTouchEnd={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateTimeText}>
              📅 {selectedDate.toLocaleDateString('ko-KR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </Surface>
        </View>

        {/* 시간 선택 */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>게임 시간</Text>
          <Surface
            style={styles.dateTimeButton}
            elevation={1}
            onTouchEnd={() => setShowTimePicker(true)}
          >
            <Text style={styles.dateTimeText}>
              🕐 {selectedTime.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </Surface>
        </View>

        {/* 소요 시간 */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>예상 소요시간</Text>
          <Controller
            control={control}
            name="duration"
            render={({ field: { onChange, value } }) => (
              <SegmentedButtons
                value={value}
                onValueChange={onChange}
                buttons={durationOptions}
                style={styles.segmentedButtons}
              />
            )}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderLocation = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>장소 정보</Text>

        {/* 장소명 */}
        <Controller
          control={control}
          name="location.name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              label="장소명"
              placeholder="강남 배드민턴 센터"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              style={styles.input}
            />
          )}
        />

        {/* 주소 */}
        <Controller
          control={control}
          name="location.address"
          rules={{
            required: '주소를 입력해주세요',
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              label="주소"
              placeholder="서울시 강남구 테헤란로 123"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={!!errors.location?.address}
              style={styles.input}
              right={
                <TextInput.Icon
                  icon="map-search"
                  onPress={() => {
                    // 지도에서 장소 검색 (추후 구현)
                    Alert.alert('알림', '지도 검색 기능은 곧 추가될 예정입니다.');
                  }}
                />
              }
            />
          )}
        />
        {errors.location?.address && (
          <Text style={styles.errorText}>{errors.location.address.message}</Text>
        )}
      </Card.Content>
    </Card>
  );

  const renderParticipants = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>참가자 설정</Text>

        {/* 최대 참가자 수 */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>최대 참가자 수</Text>
          <Controller
            control={control}
            name="maxParticipants"
            rules={{
              required: '최대 참가자 수를 입력해주세요',
              min: {
                value: 2,
                message: '최소 2명 이상이어야 합니다',
              },
              max: {
                value: 20,
                message: '최대 20명까지 가능합니다',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.participantContainer}>
                <IconButton
                  icon="minus"
                  size={20}
                  onPress={() => onChange(Math.max(2, value - 1))}
                  style={styles.participantButton}
                />
                <TextInput
                  mode="outlined"
                  value={value?.toString()}
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(parseInt(text) || 2)}
                  keyboardType="number-pad"
                  style={styles.participantInput}
                  contentStyle={styles.participantInputContent}
                />
                <IconButton
                  icon="plus"
                  size={20}
                  onPress={() => onChange(Math.min(20, value + 1))}
                  style={styles.participantButton}
                />
              </View>
            )}
          />
          {errors.maxParticipants && (
            <Text style={styles.errorText}>{errors.maxParticipants.message}</Text>
          )}
        </View>

        {/* 참가비 */}
        <Controller
          control={control}
          name="fee"
          rules={{
            required: '참가비를 입력해주세요',
            min: {
              value: 0,
              message: '참가비는 0원 이상이어야 합니다',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              label="참가비 (원)"
              placeholder="10000"
              value={value?.toString()}
              onBlur={onBlur}
              onChangeText={(text) => onChange(parseInt(text.replace(/[^0-9]/g, '')) || 0)}
              keyboardType="number-pad"
              error={!!errors.fee}
              style={styles.input}
              left={<TextInput.Icon icon="currency-krw" />}
            />
          )}
        />
        {errors.fee && (
          <Text style={styles.errorText}>{errors.fee.message}</Text>
        )}
      </Card.Content>
    </Card>
  );

  const renderSettings = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>게임 설정</Text>

        {/* 공개 설정 */}
        <Controller
          control={control}
          name="isPublic"
          render={({ field: { onChange, value } }) => (
            <View style={styles.checkboxContainer}>
              <Checkbox
                status={value ? 'checked' : 'unchecked'}
                onPress={() => onChange(!value)}
                color={theme.colors.primary}
              />
              <View style={styles.checkboxContent}>
                <Text style={styles.checkboxLabel}>공개 게임</Text>
                <Text style={styles.checkboxDescription}>
                  모든 사용자가 이 게임을 볼 수 있습니다
                </Text>
              </View>
            </View>
          )}
        />

        <Divider style={styles.divider} />

        {/* 대기 목록 허용 */}
        <Controller
          control={control}
          name="allowWaitingList"
          render={({ field: { onChange, value } }) => (
            <View style={styles.checkboxContainer}>
              <Checkbox
                status={value ? 'checked' : 'unchecked'}
                onPress={() => onChange(!value)}
                color={theme.colors.primary}
              />
              <View style={styles.checkboxContent}>
                <Text style={styles.checkboxLabel}>대기 목록 허용</Text>
                <Text style={styles.checkboxDescription}>
                  정원이 찰 경우 대기 목록을 운영합니다
                </Text>
              </View>
            </View>
          )}
        />

        <Divider style={styles.divider} />

        {/* 자동 확정 */}
        <Controller
          control={control}
          name="autoConfirm"
          render={({ field: { onChange, value } }) => (
            <View style={styles.checkboxContainer}>
              <Checkbox
                status={value ? 'checked' : 'unchecked'}
                onPress={() => onChange(!value)}
                color={theme.colors.primary}
              />
              <View style={styles.checkboxContent}>
                <Text style={styles.checkboxLabel}>자동 참가 확정</Text>
                <Text style={styles.checkboxDescription}>
                  참가 신청 시 즉시 확정됩니다
                </Text>
              </View>
            </View>
          )}
        />

        <Divider style={styles.divider} />

        {/* 승인 필요 */}
        <Controller
          control={control}
          name="requireApproval"
          render={({ field: { onChange, value } }) => (
            <View style={styles.checkboxContainer}>
              <Checkbox
                status={value ? 'checked' : 'unchecked'}
                onPress={() => onChange(!value)}
                color={theme.colors.primary}
              />
              <View style={styles.checkboxContent}>
                <Text style={styles.checkboxLabel}>참가 승인 필요</Text>
                <Text style={styles.checkboxDescription}>
                  참가 신청 시 관리자 승인이 필요합니다
                </Text>
              </View>
            </View>
          )}
        />
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderBasicInfo()}
        {renderDateTime()}
        {renderLocation()}
        {renderParticipants()}
        {renderSettings()}

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
            게임 생성하기
          </Button>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* 날짜 선택기 */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={onDateChange}
        />
      )}

      {/* 시간 선택기 */}
      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}
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
  sectionCard: {
    margin: theme.spacing.lg,
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
  fieldContainer: {
    marginBottom: theme.spacing.lg,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  menuButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.roundness,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  menuButtonText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  segmentedButtons: {
    marginBottom: theme.spacing.sm,
  },
  dateTimeButton: {
    padding: theme.spacing.lg,
    borderRadius: theme.roundness,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  dateTimeText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  participantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantButton: {
    margin: 0,
    backgroundColor: theme.colors.primaryContainer,
  },
  participantInput: {
    width: 100,
    marginHorizontal: theme.spacing.md,
  },
  participantInputContent: {
    textAlign: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.sm,
  },
  checkboxContent: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  checkboxDescription: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
    lineHeight: 20,
  },
  divider: {
    marginVertical: theme.spacing.md,
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

export default GameCreateScreen;