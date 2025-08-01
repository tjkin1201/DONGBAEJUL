import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { authAPI } from '../../services/api';
import theme from '../../utils/theme';

const ForgotPasswordScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authAPI.requestPasswordReset(data.email);
      setEmailSent(true);
      Alert.alert(
        '이메일 전송 완료',
        '비밀번호 재설정 링크를 이메일로 전송했습니다. 이메일을 확인해주세요.',
        [{ text: '확인' }]
      );
    } catch (error) {
      Alert.alert(
        '전송 실패',
        error.response?.data?.error?.message || '이메일 전송 중 오류가 발생했습니다.',
        [{ text: '확인' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resendEmail = async () => {
    const email = control._formValues.email;
    if (!email) {
      Alert.alert('알림', '이메일을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.requestPasswordReset(email);
      Alert.alert(
        '재전송 완료',
        '비밀번호 재설정 링크를 다시 전송했습니다.',
        [{ text: '확인' }]
      );
    } catch (error) {
      Alert.alert(
        '재전송 실패',
        error.response?.data?.error?.message || '이메일 재전송 중 오류가 발생했습니다.',
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
            <Text style={styles.title}>비밀번호 찾기</Text>
            <Text style={styles.subtitle}>
              {emailSent
                ? '이메일을 확인해주세요'
                : '가입하신 이메일 주소를 입력하세요'}
            </Text>
          </View>

          {/* 설명 텍스트 */}
          <View style={styles.descriptionContainer}>
            {emailSent ? (
              <View>
                <Text style={styles.description}>
                  비밀번호 재설정 링크를 이메일로 전송했습니다.
                </Text>
                <Text style={styles.subDescription}>
                  • 이메일을 받지 못하셨다면 스팸함을 확인해주세요{'\n'}
                  • 링크는 24시간 동안 유효합니다{'\n'}
                  • 아직도 이메일을 받지 못하셨다면 아래 버튼을 눌러 재전송하세요
                </Text>
              </View>
            ) : (
              <Text style={styles.description}>
                입력하신 이메일 주소로 비밀번호 재설정 링크를 보내드립니다.
              </Text>
            )}
          </View>

          {/* 이메일 입력 폼 */}
          <View style={styles.form}>
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
                  disabled={emailSent}
                  style={styles.input}
                  left={<TextInput.Icon icon="email" />}
                />
              )}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}

            {/* 전송/재전송 버튼 */}
            {emailSent ? (
              <View>
                <Button
                  mode="contained"
                  onPress={resendEmail}
                  loading={isLoading}
                  disabled={isLoading}
                  style={styles.primaryButton}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonText}
                >
                  이메일 재전송
                </Button>
                
                <Button
                  mode="outlined"
                  onPress={() => {
                    setEmailSent(false);
                    navigation.navigate('Login');
                  }}
                  style={styles.secondaryButton}
                  contentStyle={styles.buttonContent}
                >
                  로그인으로 돌아가기
                </Button>
              </View>
            ) : (
              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                disabled={isLoading}
                style={styles.primaryButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonText}
              >
                재설정 링크 전송
              </Button>
            )}
          </View>

          {/* 도움말 */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              문제가 계속 발생한다면 고객센터에 문의해주세요.
            </Text>
            <Button
              mode="text"
              onPress={() => {
                Alert.alert(
                  '고객센터',
                  '이메일: support@dongbaejul.com\n전화: 1588-1234',
                  [{ text: '확인' }]
                );
              }}
              labelStyle={styles.helpLink}
            >
              고객센터 연락하기
            </Button>
          </View>
        </Surface>

        {/* 뒤로가기 버튼 */}
        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          labelStyle={styles.backButtonText}
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
  descriptionContainer: {
    marginBottom: theme.spacing.xl,
  },
  description: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  subDescription: {
    fontSize: 14,
    color: theme.colors.text,
    textAlign: 'left',
    lineHeight: 20,
    marginTop: theme.spacing.md,
    opacity: 0.8,
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
  buttonContent: {
    height: 50,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  secondaryButton: {
    borderColor: theme.colors.outline,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  helpContainer: {
    alignItems: 'center',
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  helpText: {
    fontSize: 14,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  helpLink: {
    fontSize: 14,
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
  backButton: {
    marginTop: theme.spacing.lg,
    alignSelf: 'center',
  },
  backButtonText: {
    fontSize: 14,
    color: theme.colors.primary,
  },
});

export default ForgotPasswordScreen;