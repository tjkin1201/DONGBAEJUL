import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Surface, Checkbox, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../context/SimpleAuthContext';
import theme from '../../utils/theme';
import LoadingScreen from '../../components/LoadingScreen';

const LoginScreen = ({ navigation }) => {
  const { login, isLoading } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await login({
        email: data.email,
        password: data.password,
        rememberMe,
      });
    } catch (error) {
      Alert.alert(
        '로그인 실패',
        error.message || '이메일 또는 비밀번호를 확인해주세요.',
        [{ text: '확인' }]
      );
    }
  };

  if (isLoading) {
    return <LoadingScreen message="로그인 중..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.surface} elevation={2}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.title}>로그인</Text>
            <Text style={styles.subtitle}>동배즐에 오신 것을 환영합니다</Text>
          </View>

          {/* 로그인 폼 */}
          <View style={styles.form}>
            {/* 이메일 입력 */}
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

            {/* 비밀번호 입력 */}
            <Controller
              control={control}
              name="password"
              rules={{
                required: '비밀번호를 입력해주세요',
                minLength: {
                  value: 6,
                  message: '비밀번호는 6자리 이상이어야 합니다',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  label="비밀번호"
                  placeholder="비밀번호를 입력하세요"
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

            {/* 로그인 유지 & 비밀번호 찾기 */}
            <View style={styles.optionsContainer}>
              <View style={styles.rememberContainer}>
                <Checkbox
                  status={rememberMe ? 'checked' : 'unchecked'}
                  onPress={() => setRememberMe(!rememberMe)}
                  color={theme.colors.primary}
                />
                <Text style={styles.rememberText}>로그인 유지</Text>
              </View>
              
              <Button
                mode="text"
                onPress={() => navigation.navigate('ForgotPassword')}
                labelStyle={styles.forgotText}
              >
                비밀번호 찾기
              </Button>
            </View>

            {/* 로그인 버튼 */}
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={styles.loginButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonText}
            >
              로그인
            </Button>

            {/* 구분선 */}
            <View style={styles.dividerContainer}>
              <Divider style={styles.divider} />
              <Text style={styles.dividerText}>또는</Text>
              <Divider style={styles.divider} />
            </View>

            {/* 소셜 로그인 (향후 구현) */}
            <Button
              mode="outlined"
              icon="google"
              onPress={() => {
                Alert.alert('알림', '곧 지원 예정입니다.');
              }}
              style={styles.socialButton}
              contentStyle={styles.buttonContent}
            >
              Google로 로그인
            </Button>

            <Button
              mode="outlined"
              icon="apple"
              onPress={() => {
                Alert.alert('알림', '곧 지원 예정입니다.');
              }}
              style={styles.socialButton}
              contentStyle={styles.buttonContent}
            >
              Apple로 로그인
            </Button>
          </View>

          {/* 회원가입 링크 */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>계정이 없으신가요? </Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Signup')}
              labelStyle={styles.signupLink}
            >
              회원가입
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
    justifyContent: 'center',
    padding: theme.spacing.lg,
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
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
  },
  forgotText: {
    fontSize: 14,
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
  buttonContent: {
    height: 50,
  },
  loginButton: {
    marginVertical: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.text,
  },
  socialButton: {
    marginBottom: theme.spacing.md,
    borderColor: theme.colors.outline,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  signupText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  signupLink: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;