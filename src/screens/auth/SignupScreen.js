import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Surface, Checkbox, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import theme from '../../utils/theme';
import LoadingScreen from '../../components/LoadingScreen';

const SignupScreen = ({ navigation }) => {
  const { signup, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      level: 'beginner',
      preferredLocation: '',
    },
  });

  const password = watch('password');

  const levelOptions = [
    { value: 'beginner', label: '초급' },
    { value: 'intermediate', label: '중급' },
    { value: 'advanced', label: '고급' },
  ];

  const onSubmit = async (data) => {
    if (!agreeTerms || !agreePrivacy) {
      Alert.alert('약관 동의', '서비스 이용약관과 개인정보처리방침에 동의해주세요.');
      return;
    }

    try {
      const signupData = {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        level: data.level,
        preferredLocation: data.preferredLocation,
      };

      await signup(signupData);
      
      Alert.alert(
        '회원가입 완료',
        '동배즐에 가입해주셔서 감사합니다!',
        [{ text: '확인', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert(
        '회원가입 실패',
        error.message || '회원가입 중 오류가 발생했습니다.',
        [{ text: '확인' }]
      );
    }
  };

  if (isLoading) {
    return <LoadingScreen message="회원가입 중..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.surface} elevation={2}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.title}>회원가입</Text>
            <Text style={styles.subtitle}>동배즐과 함께 배드민턴을 즐겨보세요</Text>
          </View>

          {/* 회원가입 폼 */}
          <View style={styles.form}>
            {/* 이름 */}
            <Controller
              control={control}
              name="name"
              rules={{
                required: '이름을 입력해주세요',
                minLength: {
                  value: 2,
                  message: '이름은 2자리 이상이어야 합니다',
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

            {/* 이메일 */}
            <Controller
              control={control}
              name="email"
              rules={{
                required: '이메일을 입력해주세요',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: '올바른 이메일 형식을 입력해주세요',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  label="이메일"
                  placeholder="your@email.com"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={!!errors.email}
                  style={styles.input}
                  left={<TextInput.Icon icon="email" />}
                />
              )}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}

            {/* 전화번호 */}
            <Controller
              control={control}
              name="phone"
              rules={{
                required: '전화번호를 입력해주세요',
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

            {/* 비밀번호 */}
            <Controller
              control={control}
              name="password"
              rules={{
                required: '비밀번호를 입력해주세요',
                minLength: {
                  value: 8,
                  message: '비밀번호는 8자리 이상이어야 합니다',
                },
                pattern: {
                  value: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                  message: '영문, 숫자, 특수문자를 포함해야 합니다',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  label="비밀번호"
                  placeholder="영문, 숫자, 특수문자 포함 8자리 이상"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  secureTextEntry={!showPassword}
                  error={!!errors.password}
                  style={styles.input}
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                />
              )}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}

            {/* 비밀번호 확인 */}
            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                required: '비밀번호를 다시 입력해주세요',
                validate: (value) => value === password || '비밀번호가 일치하지 않습니다',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  label="비밀번호 확인"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  secureTextEntry={!showConfirmPassword}
                  error={!!errors.confirmPassword}
                  style={styles.input}
                  left={<TextInput.Icon icon="lock-check" />}
                  right={
                    <TextInput.Icon
                      icon={showConfirmPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  }
                />
              )}
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
            )}

            {/* 실력 수준 */}
            <View style={styles.levelContainer}>
              <Text style={styles.levelLabel}>배드민턴 실력 수준</Text>
              <Controller
                control={control}
                name="level"
                render={({ field: { onChange, value } }) => (
                  <SegmentedButtons
                    value={value}
                    onValueChange={onChange}
                    buttons={levelOptions}
                    style={styles.levelButtons}
                  />
                )}
              />
            </View>

            {/* 선호 지역 */}
            <Controller
              control={control}
              name="preferredLocation"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  label="선호 지역 (선택사항)"
                  placeholder="예: 강남구, 서초구"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  style={styles.input}
                  left={<TextInput.Icon icon="map-marker" />}
                />
              )}
            />

            {/* 약관 동의 */}
            <View style={styles.agreementContainer}>
              <View style={styles.checkboxContainer}>
                <Checkbox
                  status={agreeTerms ? 'checked' : 'unchecked'}
                  onPress={() => setAgreeTerms(!agreeTerms)}
                  color={theme.colors.primary}
                />
                <Text style={styles.agreementText}>
                  서비스 이용약관에 동의합니다 
                  <Text style={styles.requiredText}>(필수)</Text>
                </Text>
              </View>

              <View style={styles.checkboxContainer}>
                <Checkbox
                  status={agreePrivacy ? 'checked' : 'unchecked'}
                  onPress={() => setAgreePrivacy(!agreePrivacy)}
                  color={theme.colors.primary}
                />
                <Text style={styles.agreementText}>
                  개인정보처리방침에 동의합니다 
                  <Text style={styles.requiredText}>(필수)</Text>
                </Text>
              </View>
            </View>

            {/* 회원가입 버튼 */}
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={styles.signupButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonText}
            >
              회원가입
            </Button>
          </View>

          {/* 로그인 링크 */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>이미 계정이 있으신가요? </Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              labelStyle={styles.loginLink}
            >
              로그인
            </Button>
          </View>
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  surface: {
    padding: theme.spacing.xl,
    borderRadius: theme.roundness,
    backgroundColor: theme.colors.surface,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
  },
  form: {
    marginBottom: theme.spacing.lg,
  },
  input: {
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  levelContainer: {
    marginVertical: theme.spacing.md,
  },
  levelLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  levelButtons: {
    marginBottom: theme.spacing.md,
  },
  agreementContainer: {
    marginVertical: theme.spacing.lg,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  agreementText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
    flex: 1,
  },
  requiredText: {
    color: theme.colors.error,
    fontWeight: '600',
  },
  buttonContent: {
    height: 50,
  },
  signupButton: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  loginText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  loginLink: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default SignupScreen;