import { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Text,
} from 'react-native';
import { 
  Card, 
  Button, 
  TextInput, 
  Chip, 
  RadioButton, 
  Switch,
  SegmentedButtons 
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/SimpleAuthContext';
import newTheme from '../../utils/newTheme';

const PremiumGameCreateScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [gameType, setGameType] = useState('casual');
  const [gameFormat, setGameFormat] = useState('doubles');
  const [skillLevel, setSkillLevel] = useState('all');
  const [isRanked, setIsRanked] = useState(false);
  const [gameDate, setGameDate] = useState(new Date());
  const [gameTime, setGameTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [location, setLocation] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('4');
  const [gameDescription, setGameDescription] = useState('');
  const [courtFee, setCourtFee] = useState('');
  const [duration, setDuration] = useState('60');

  const gameTypeOptions = [
    { value: 'casual', label: '캐주얼 게임' },
    { value: 'tournament', label: '토너먼트' },
    { value: 'training', label: '연습 게임' },
  ];

  const skillLevelOptions = [
    { value: 'all', label: '모든 레벨', icon: '🏸' },
    { value: 'beginner', label: '초급자', icon: '🥉' },
    { value: 'intermediate', label: '중급자', icon: '🥈' },
    { value: 'advanced', label: '고급자', icon: '🥇' },
  ];

  const formatDate = (date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setGameDate(selectedDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setGameTime(selectedTime);
    }
  };

  const validateForm = () => {
    if (!location.trim()) {
      Alert.alert('오류', '게임 장소를 입력해주세요.');
      return false;
    }
    
    if (gameDate < new Date()) {
      Alert.alert('오류', '게임 날짜는 현재 시간 이후여야 합니다.');
      return false;
    }

    return true;
  };

  const handleCreateGame = () => {
    if (!validateForm()) {
      return;
    }

    // 게임 데이터 구성
    const _gameData = {
      type: gameType,
      format: gameFormat,
      skillLevel,
      isRanked,
      date: gameDate,
      time: gameTime,
      location: location.trim(),
      maxPlayers: parseInt(maxPlayers),
      description: gameDescription.trim(),
      courtFee: courtFee ? parseInt(courtFee) : 0,
      duration: parseInt(duration),
      creator: user?.name || '사용자',
      createdAt: new Date(),
    };

    // TODO: 실제 API 호출로 게임 생성
    // gameAPI.createGame(_gameData);

    Alert.alert(
      '게임 생성 완료',
      `${formatDate(gameDate)} ${formatTime(gameTime)}에 ${location}에서 게임이 생성되었습니다.`,
      [
        {
          text: '확인',
          onPress: () => {
            navigation.goBack();
            // 실제로는 게임 데이터를 서버에 저장하고 게임 목록으로 이동
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[newTheme.colors.primary, newTheme.colors.secondary]}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>게임 만들기</Text>
            <Text style={styles.headerSubtitle}>새로운 배드민턴 게임을 생성하세요</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 게임 유형 */}
        <Card style={styles.sectionCard}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.sectionTitle}>게임 유형</Text>
            <SegmentedButtons
              value={gameType}
              onValueChange={setGameType}
              buttons={gameTypeOptions}
              style={styles.segmentedButtons}
            />
          </Card.Content>
        </Card>

        {/* 게임 형식 */}
        <Card style={styles.sectionCard}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.sectionTitle}>게임 형식</Text>
            <View style={styles.radioGroup}>
              <View style={styles.radioItem}>
                <RadioButton
                  value="singles"
                  status={gameFormat === 'singles' ? 'checked' : 'unchecked'}
                  onPress={() => setGameFormat('singles')}
                />
                <Text style={styles.radioLabel}>단식 (1 vs 1)</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton
                  value="doubles"
                  status={gameFormat === 'doubles' ? 'checked' : 'unchecked'}
                  onPress={() => setGameFormat('doubles')}
                />
                <Text style={styles.radioLabel}>복식 (2 vs 2)</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton
                  value="mixed"
                  status={gameFormat === 'mixed' ? 'checked' : 'unchecked'}
                  onPress={() => setGameFormat('mixed')}
                />
                <Text style={styles.radioLabel}>혼합복식</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* 실력 레벨 */}
        <Card style={styles.sectionCard}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.sectionTitle}>실력 레벨</Text>
            <View style={styles.chipContainer}>
              {skillLevelOptions.map((option) => (
                <Chip
                  key={option.value}
                  selected={skillLevel === option.value}
                  onPress={() => setSkillLevel(option.value)}
                  style={[
                    styles.skillChip,
                    skillLevel === option.value && styles.selectedChip
                  ]}
                  textStyle={styles.chipText}
                  icon={() => <Text style={styles.chipIcon}>{option.icon}</Text>}
                >
                  {option.label}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* 랭크 게임 설정 */}
        <Card style={styles.sectionCard}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchTitle}>랭크 게임</Text>
                <Text style={styles.switchDescription}>
                  레이팅 점수에 영향을 주는 경쟁 게임
                </Text>
              </View>
              <Switch
                value={isRanked}
                onValueChange={setIsRanked}
                color={newTheme.colors.primary}
              />
            </View>
          </Card.Content>
        </Card>

        {/* 날짜 및 시간 */}
        <Card style={styles.sectionCard}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.sectionTitle}>게임 일정</Text>
            
            <View style={styles.dateTimeContainer}>
              <View style={styles.dateTimeItem}>
                <Text style={styles.inputLabel}>날짜</Text>
                <Button
                  mode="outlined"
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateTimeButton}
                  labelStyle={styles.dateTimeButtonText}
                  icon="calendar"
                >
                  {formatDate(gameDate)}
                </Button>
              </View>
              
              <View style={styles.dateTimeItem}>
                <Text style={styles.inputLabel}>시간</Text>
                <Button
                  mode="outlined"
                  onPress={() => setShowTimePicker(true)}
                  style={styles.dateTimeButton}
                  labelStyle={styles.dateTimeButtonText}
                  icon="clock"
                >
                  {formatTime(gameTime)}
                </Button>
              </View>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={gameDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={gameTime}
                mode="time"
                display="default"
                onChange={onTimeChange}
              />
            )}
          </Card.Content>
        </Card>

        {/* 게임 상세 정보 */}
        <Card style={styles.sectionCard}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.sectionTitle}>게임 상세 정보</Text>
            
            <TextInput
              label="게임 장소"
              value={location}
              onChangeText={setLocation}
              mode="outlined"
              style={styles.textInput}
              placeholder="예: 서울배드민턴센터"
              left={<TextInput.Icon icon="map-marker" />}
            />

            <View style={styles.inputRow}>
              <TextInput
                label="최대 인원"
                value={maxPlayers}
                onChangeText={setMaxPlayers}
                mode="outlined"
                style={[styles.textInput, styles.halfInput]}
                keyboardType="numeric"
                left={<TextInput.Icon icon="account-group" />}
              />
              
              <TextInput
                label="게임 시간 (분)"
                value={duration}
                onChangeText={setDuration}
                mode="outlined"
                style={[styles.textInput, styles.halfInput]}
                keyboardType="numeric"
                left={<TextInput.Icon icon="timer" />}
              />
            </View>

            <TextInput
              label="코트 비용 (원)"
              value={courtFee}
              onChangeText={setCourtFee}
              mode="outlined"
              style={styles.textInput}
              keyboardType="numeric"
              placeholder="선택사항"
              left={<TextInput.Icon icon="currency-krw" />}
            />

            <TextInput
              label="게임 설명"
              value={gameDescription}
              onChangeText={setGameDescription}
              mode="outlined"
              style={styles.textInput}
              multiline
              numberOfLines={3}
              placeholder="게임에 대한 추가 정보를 입력하세요"
              left={<TextInput.Icon icon="text" />}
            />
          </Card.Content>
        </Card>

        {/* 생성 버튼 */}
        <View style={styles.createButtonContainer}>
          <Button
            mode="contained"
            onPress={handleCreateGame}
            style={styles.createButton}
            labelStyle={styles.createButtonText}
            icon="plus"
          >
            게임 생성하기
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: newTheme.colors.background.light,
  },
  
  // 헤더
  header: {
    paddingBottom: newTheme.spacing.xl,
  },
  headerContent: {
    paddingHorizontal: newTheme.spacing.lg,
    paddingTop: newTheme.spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: newTheme.colors.text.inverse,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },

  // 컨텐츠
  content: {
    flex: 1,
    padding: newTheme.spacing.lg,
  },

  // 섹션 카드
  sectionCard: {
    marginBottom: newTheme.spacing.lg,
    ...newTheme.shadows.sm,
  },
  cardContent: {
    padding: newTheme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: newTheme.colors.text.primary,
    marginBottom: newTheme.spacing.md,
  },

  // 세그먼트 버튼
  segmentedButtons: {
    marginVertical: newTheme.spacing.sm,
  },

  // 라디오 그룹
  radioGroup: {
    gap: newTheme.spacing.sm,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioLabel: {
    fontSize: 16,
    color: newTheme.colors.text.primary,
    marginLeft: newTheme.spacing.sm,
  },

  // 칩 컨테이너
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: newTheme.spacing.sm,
  },
  skillChip: {
    backgroundColor: newTheme.colors.surface.light,
  },
  selectedChip: {
    backgroundColor: newTheme.colors.primary,
  },
  chipText: {
    fontSize: 14,
  },
  chipIcon: {
    fontSize: 16,
    marginRight: 4,
  },

  // 스위치 행
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchInfo: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: newTheme.colors.text.primary,
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: newTheme.colors.text.secondary,
  },

  // 날짜/시간 선택
  dateTimeContainer: {
    flexDirection: 'row',
    gap: newTheme.spacing.md,
  },
  dateTimeItem: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: newTheme.colors.text.primary,
    marginBottom: newTheme.spacing.sm,
    fontWeight: '600',
  },
  dateTimeButton: {
    borderColor: newTheme.colors.primary,
  },
  dateTimeButtonText: {
    color: newTheme.colors.text.primary,
    fontSize: 14,
  },

  // 텍스트 입력
  textInput: {
    marginBottom: newTheme.spacing.md,
    backgroundColor: newTheme.colors.surface.light,
  },
  inputRow: {
    flexDirection: 'row',
    gap: newTheme.spacing.md,
  },
  halfInput: {
    flex: 1,
  },

  // 생성 버튼
  createButtonContainer: {
    paddingVertical: newTheme.spacing.xl,
  },
  createButton: {
    backgroundColor: newTheme.colors.primary,
    paddingVertical: newTheme.spacing.sm,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: newTheme.colors.text.inverse,
  },
});

export default PremiumGameCreateScreen;
