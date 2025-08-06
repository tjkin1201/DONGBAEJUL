import React from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { Card } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import theme from '../../utils/theme';

/**
 * 프리미엄 그래디언트 카드 컴포넌트
 * - 부드러운 그래디언트 배경
 * - 마이크로 인터랙션
 * - 프리미엄 그림자 효과
 */
const GradientCard = ({
  children,
  gradient = 'primary',
  onPress,
  style,
  elevated = true,
  animated = true,
  ...props
}) => {
  const scaleValue = new Animated.Value(1);
  const opacityValue = new Animated.Value(1);

  const handlePressIn = () => {
    if (animated && onPress) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 0.98,
          useNativeDriver: true,
          speed: 20,
          bounciness: 4,
        }),
        Animated.timing(opacityValue, {
          toValue: 0.8,
          duration: theme.animation.timing.fast,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePressOut = () => {
    if (animated && onPress) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 4,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: theme.animation.timing.fast,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const gradientColors = theme.colors.gradients[gradient] || theme.colors.gradients.primary;

  const cardContent = (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        {
          borderRadius: theme.borderRadius.card,
          overflow: 'hidden',
        },
        elevated && theme.shadows.card,
        style,
      ]}
    >
      <View style={{ padding: theme.spacing.md }}>
        {children}
      </View>
    </LinearGradient>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        {...props}
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleValue }],
            opacity: opacityValue,
          }}
        >
          {cardContent}
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={style} {...props}>
      {cardContent}
    </View>
  );
};

export default GradientCard;