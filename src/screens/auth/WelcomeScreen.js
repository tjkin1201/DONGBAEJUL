import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/SimpleAuthContext';
import theme from '../../utils/theme';

const WelcomeScreen = ({ navigation }) => {
  const { loginWithBand } = useAuth();
  const [isBandLoading, setIsBandLoading] = useState(false);

  const handleBandLogin = async () => {
    try {
      setIsBandLoading(true);
      const result = await loginWithBand();
      
      if (result.success) {
        // Band 로그인 성공 시 동호회 선택 화면으로 이동하거나 메인으로 이동
        navigation.navigate('BandClubSelection');
      }
    } catch (error) {
      Alert.alert(
        'Band 로그인 실패',
        error.message || '네이버 밴드 로그인 중 오류가 발생했습니다.',
        [{ text: '확인' }]
      );
    } finally {
      setIsBandLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#1976D2', '#42A5F5', '#64B5F6']}
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* 로고 영역 */}
          <View style={styles.logoContainer}>
            <Surface style={styles.logoSurface} elevation={4}>
              <Text style={styles.logoIcon}>🏸</Text>
            </Surface>
            <Text style={styles.title}>동배즐</Text>
            <Text style={styles.subtitle}>함께하는 배드민턴의 즐거움</Text>
          </View>

          {/* 설명 텍스트 */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              배드민턴을 사랑하는 사람들이 모이는 곳
            </Text>
            <Text style={styles.subDescription}>
              클럽 가입부터 경기까지, 모든 것이 한 곳에
            </Text>
          </View>

          {/* 버튼 영역 */}
          <View style={styles.buttonContainer}>
            {/* Band 로그인 버튼 (메인) */}
            <Button
              mode="contained"
              onPress={handleBandLogin}
              loading={isBandLoading}
              disabled={isBandLoading}
              style={styles.bandButton}
              labelStyle={styles.bandButtonText}
              contentStyle={styles.buttonContent}
              icon="account-group"
            >
              네이버 밴드로 시작하기
            </Button>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>또는</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Login')}
              style={styles.loginButton}
              labelStyle={styles.loginButtonText}
              contentStyle={styles.buttonContent}
            >
              일반 로그인
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Signup')}
              style={styles.signupButton}
              labelStyle={styles.signupButtonText}
              contentStyle={styles.buttonContent}
            >
              회원가입
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotButton}
              labelStyle={styles.forgotButtonText}
            >
              비밀번호를 잊으셨나요?
            </Button>

            <Text style={styles.bandDescription}>
              📱 네이버 밴드 동호회 회원이시면{'\n'}별도 가입 없이 바로 사용하세요!
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
  },
  logoSurface: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.lg,
  },
  logoIcon: {
    fontSize: 60,
    color: theme.colors.primary,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.surface,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.surface,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  descriptionContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  description: {
    fontSize: 20,
    color: theme.colors.surface,
    textAlign: 'center',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subDescription: {
    fontSize: 16,
    color: theme.colors.surface,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonContainer: {
    marginBottom: theme.spacing.lg,
  },
  buttonContent: {
    height: 50,
  },
  bandButton: {
    marginBottom: theme.spacing.lg,
    backgroundColor: '#00C73C', // 네이버 브랜드 컬러
    elevation: 4,
  },
  bandButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.surface,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    fontSize: 14,
    color: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    opacity: 0.8,
  },
  loginButton: {
    marginBottom: theme.spacing.md,
    borderColor: theme.colors.surface,
    borderWidth: 2,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.surface,
  },
  signupButton: {
    marginBottom: theme.spacing.md,
    borderColor: theme.colors.surface,
    borderWidth: 2,
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.surface,
  },
  forgotButton: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  forgotButtonText: {
    fontSize: 14,
    color: theme.colors.surface,
    textDecorationLine: 'underline',
  },
  bandDescription: {
    fontSize: 13,
    color: theme.colors.surface,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 18,
    fontWeight: '500',
  },
});

export default WelcomeScreen;