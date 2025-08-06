import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert, 
  Dimensions, 
  ScrollView, 
  Animated,
  StatusBar,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'expo-linear-gradient';
import { useAuth } from '../../context/SimpleAuthContext';
import newTheme from '../../utils/newTheme';
import FloatingCard from '../../components/FloatingCard';

const { width, height } = Dimensions.get('window');

const PremiumWelcomeScreen = ({ navigation }) => {
  const { loginWithBand } = useAuth();
  const [isBandLoading, setIsBandLoading] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  
  // 애니메이션 refs
  const logoAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;

  const features = [
    {
      icon: '⚡',
      title: '즉석 매칭',
      subtitle: '실력별 빠른 상대 찾기\n1분 내 매칭 완료'
    },
    {
      icon: '📊',
      title: '실력 분석',
      subtitle: '개인 통계 및 성장 추적\n데이터 기반 향상'
    },
    {
      icon: '👥',
      title: '커뮤니티',
      subtitle: '동호회 관리 및 소통\n함께하는 배드민턴'
    }
  ];

  useEffect(() => {
    // 순차적 애니메이션 실행
    Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(statsAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // 기능 카드 자동 슬라이드
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleBandLogin = async () => {
    try {
      setIsBandLoading(true);
      const result = await loginWithBand();
      
      if (result.success) {
        // Band 로그인 성공 - MainNavigator로 자동 이동됨
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

  const handleEmailLogin = () => {
    navigation.navigate('Login');
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <View style={styles.container} testID="welcome-screen">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* 메인 그라디언트 배경 */}
      <LinearGradient
        colors={['#FF6B35', '#FF4500', '#20B2AA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 로고 섹션 */}
            <Animated.View 
              style={[
                styles.logoSection,
                {
                  opacity: logoAnim,
                  transform: [{
                    scale: logoAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  }],
                },
              ]}
            >
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  style={styles.logoCircle}
                >
                  <Text style={styles.logoIcon}>🏸</Text>
                </LinearGradient>
                <View style={styles.logoBadge}>
                  <Text style={styles.badgeText}>Premium</Text>
                </View>
              </View>
              
              <Animated.View
                style={{
                  opacity: titleAnim,
                  transform: [{
                    translateY: titleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  }],
                }}
              >
                <Text style={styles.appTitle}>동배즐</Text>
                <Text style={styles.appSubtitle}>Premium Badminton Experience</Text>
              </Animated.View>
            </Animated.View>

            {/* 통계 섹션 */}
            <Animated.View 
              style={[
                styles.statsSection,
                {
                  opacity: statsAnim,
                  transform: [{
                    translateY: statsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  }],
                },
              ]}
            >
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>10K+</Text>
                  <Text style={styles.statLabel}>활성 사용자</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>95%</Text>
                  <Text style={styles.statLabel}>매칭 성공률</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>4.9★</Text>
                  <Text style={styles.statLabel}>평점</Text>
                </View>
              </View>
            </Animated.View>

            {/* 기능 소개 섹션 */}
            <View style={styles.featuresSection}>
              <Text style={styles.featuresTitle}>왜 동배즐인가요?</Text>
              
              <View style={styles.featureCardsContainer}>
                {features.map((feature, index) => (
                  <FloatingCard
                    key={index}
                    title={feature.title}
                    subtitle={feature.subtitle}
                    icon={feature.icon}
                    delay={index * 200}
                    style={{
                      opacity: currentFeature === index ? 1 : 0.7,
                      transform: [
                        { 
                          scale: currentFeature === index ? 1 : 0.95 
                        }
                      ],
                    }}
                  />
                ))}
              </View>
              
              {/* 페이지 인디케이터 */}
              <View style={styles.pageIndicator}>
                {features.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      currentFeature === index && styles.activeDot
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* 액션 버튼 섹션 */}
            <Animated.View 
              style={[
                styles.buttonSection,
                {
                  opacity: buttonAnim,
                  transform: [{
                    translateY: buttonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0],
                    }),
                  }],
                },
              ]}
            >
              {/* 메인 CTA 버튼 */}
              <LinearGradient
                colors={['#FF6B35', '#FF4500']}
                style={styles.primaryButtonGradient}
              >
                <Button
                  mode="contained"
                  onPress={handleBandLogin}
                  loading={isBandLoading}
                  disabled={isBandLoading}
                  style={styles.primaryButton}
                  labelStyle={styles.primaryButtonText}
                  icon="account-group"
                  testID="band-login-button"
                >
                  Band로 빠른 시작
                </Button>
              </LinearGradient>

              {/* 서브 버튼들 */}
              <View style={styles.secondaryButtons}>
                <Button
                  mode="outlined"
                  onPress={handleEmailLogin}
                  style={styles.secondaryButton}
                  labelStyle={styles.secondaryButtonText}
                  icon="email"
                >
                  이메일 로그인
                </Button>

                <Button
                  mode="text"
                  onPress={handleSignup}
                  style={styles.tertiaryButton}
                  labelStyle={styles.tertiaryButtonText}
                >
                  새 계정 만들기
                </Button>
              </View>

              {/* 신뢰 배지 */}
              <View style={styles.trustBadges}>
                <Text style={styles.trustText}>
                  🔒 안전한 로그인 • 🎯 100% 무료 • ⚡ 즉시 시작
                </Text>
              </View>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    minHeight: height,
    paddingHorizontal: newTheme.spacing.lg,
  },
  
  // 로고 섹션
  logoSection: {
    alignItems: 'center',
    paddingTop: newTheme.spacing.xxl,
    paddingBottom: newTheme.spacing.xl,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: newTheme.spacing.lg,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    ...newTheme.shadows.lg,
  },
  logoIcon: {
    fontSize: 60,
  },
  logoBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: newTheme.colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    ...newTheme.shadows.sm,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: newTheme.colors.text.primary,
  },
  appTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: newTheme.colors.text.inverse,
    textAlign: 'center',
    marginBottom: newTheme.spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // 통계 섹션
  statsSection: {
    marginBottom: newTheme.spacing.xl,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: newTheme.borderRadius.lg,
    padding: newTheme.spacing.lg,
    justifyContent: 'space-around',
    backdropFilter: 'blur(10px)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: newTheme.colors.text.inverse,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: newTheme.spacing.sm,
  },

  // 기능 섹션
  featuresSection: {
    marginBottom: newTheme.spacing.xl,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: newTheme.colors.text.inverse,
    textAlign: 'center',
    marginBottom: newTheme.spacing.lg,
  },
  featureCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: newTheme.spacing.md,
  },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: newTheme.colors.accent,
    width: 24,
  },

  // 버튼 섹션
  buttonSection: {
    paddingBottom: newTheme.spacing.xl,
  },
  primaryButtonGradient: {
    borderRadius: newTheme.borderRadius.lg,
    marginBottom: newTheme.spacing.md,
    ...newTheme.shadows.lg,
  },
  primaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: newTheme.spacing.sm,
    borderRadius: newTheme.borderRadius.lg,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: newTheme.colors.text.inverse,
  },
  secondaryButtons: {
    gap: newTheme.spacing.sm,
    marginBottom: newTheme.spacing.lg,
  },
  secondaryButton: {
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: newTheme.spacing.xs,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: newTheme.colors.text.inverse,
    fontWeight: '600',
  },
  tertiaryButton: {
    paddingVertical: newTheme.spacing.xs,
  },
  tertiaryButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textDecorationLine: 'underline',
  },
  trustBadges: {
    alignItems: 'center',
  },
  trustText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});

export default PremiumWelcomeScreen;
