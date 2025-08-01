import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { authAPI } from '../../services/api';
import theme from '../../utils/theme';

const ResetPasswordScreen = ({ route, navigation }) => {
  const { token } = route.params; // 이메일 링크에서 전달받은 토큰
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authAPI.resetPassword({
        token,
        password: data.password,
      });

      Alert.alert(
        '비밀번호 변경 완료',
        '새로운 비밀번호로 변경되었습니다. 다시 로그인해주세요.',
        [
          {
            text: '확인',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        '비밀번호 변경 실패',
        error.response?.data?.error?.message || '비밀번호 변경 중 오류가 발생했습니다.',
        [{ text: '확인' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Surface style={styles.surface} elevation={2}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.title}>새 비밀번호 설정</Text>
            <Text style={styles.subtitle}>
              안전한 새 비밀번호를 입력해주세요
            </Text>
          </View>

          {/* 비밀번호 조건 안내 */}
          <View style={styles.guideContainer}>
            <Text style={styles.guideTitle}>비밀번호 조건</Text>
            <Text style={styles.guideText}>
              • 8자리 이상{'\n'}
              • 영문, 숫자, 특수문자 포함{'\n'}
              • 이전에 사용한 비밀번호와 달라야 함
            </Text>
          </View>

          {/* 비밀번호 입력 폼 */}
          <View style={styles.form}>
            {/* 새 비밀번호 */}
            <Controller
              control={control}
              name="password"
              rules={{
                required: '새 비밀번호를 입력해주세요',
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
                  label="새 비밀번호"
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
                  placeholder="새 비밀번호를 다시 입력하세요"
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

            {/* 비밀번호 강도 표시 */}
            <View style={styles.strengthContainer}>
              <Text style={styles.strengthLabel}>비밀번호 강도:</Text>
              <View style={styles.strengthBar}>
                <View
                  style={[
                    styles.strengthFill,
                    {
                      width: password ? 
                        password.length >= 8 && 
                        /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password) 
                          ? '100%' : '60%' : '0%',
                      backgroundColor: password ? 
                        password.length >= 8 && 
                        /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password) 
                          ? theme.colors.success : theme.colors.warning : theme.colors.outline,
                    },
                  ]}
                />
              </View>
              <Text style={styles.strengthText}>
                {password ? 
                  password.length >= 8 && 
                  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password) 
                    ? '강함' : '보통' : '없음'}
              </Text>
            </View>

            {/* 변경 버튼 */}
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
              style={styles.submitButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonText}
            >
              비밀번호 변경
            </Button>
          </View>

          {/* 보안 안내 */}
          <View style={styles.securityContainer}>
            <Text style={styles.securityTitle}>보안 안내</Text>
            <Text style={styles.securityText}>
              • 정기적으로 비밀번호를 변경하세요{'\n'}
              • 다른 사이트와 동일한 비밀번호 사용을 피하세요{'\n'}
              • 비밀번호를 다른 사람과 공유하지 마세요
            </Text>
          </View>
        </Surface>

        {/* 취소 버튼 */}
        <Button
          mode="text"
          onPress={() => navigation.navigate('Login')}
          style={styles.cancelButton}
          labelStyle={styles.cancelButtonText}
        >
          로그인 화면으로 돌아가기
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
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
  guideContainer: {
    backgroundColor: theme.colors.primaryContainer,
    padding: theme.spacing.md,
    borderRadius: theme.roundness,
    marginBottom: theme.spacing.lg,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onPrimaryContainer,
    marginBottom: theme.spacing.sm,
  },
  guideText: {
    fontSize: 14,
    color: theme.colors.onPrimaryContainer,
    lineHeight: 20,
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
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  strengthLabel: {
    fontSize: 14,
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.outline,
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: theme.spacing.sm,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    color: theme.colors.text,
    minWidth: 30,
  },
  buttonContent: {
    height: 50,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    marginTop: theme.spacing.lg,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  securityContainer: {
    backgroundColor: theme.colors.secondaryContainer,
    padding: theme.spacing.md,
    borderRadius: theme.roundness,
    marginTop: theme.spacing.md,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSecondaryContainer,
    marginBottom: theme.spacing.sm,
  },
  securityText: {
    fontSize: 14,
    color: theme.colors.onSecondaryContainer,
    lineHeight: 20,
  },
  cancelButton: {
    marginTop: theme.spacing.lg,
    alignSelf: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: theme.colors.primary,
  },
});

export default ResetPasswordScreen;