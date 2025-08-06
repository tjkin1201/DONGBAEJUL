import React, { useRef } from 'react';
import { Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import { colors } from '../utils/theme';

// 체육관 환경 최적화 대형 터치 버튼
export default function LargeTouchButton({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'large',
  hapticFeedback = true,
  style,
  ...props 
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress && onPress();
  };

  const getButtonStyle = () => {
    const baseStyle = styles.button;
    const sizeStyle = styles[size];
    const variantStyle = styles[variant];
    
    return [baseStyle, sizeStyle, variantStyle, style];
  };

  const getTextStyle = () => {
    return [
      styles.text,
      styles[`text_${variant}`],
      styles[`text_${size}`]
    ];
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={getButtonStyle()}
        activeOpacity={1}
        {...props}
      >
        <Text style={getTextStyle()}>
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  
  // 크기별 스타일
  normal: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 56,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 24,
    minHeight: 80,
  },
  xl: {
    paddingHorizontal: 40,
    paddingVertical: 32,
    minHeight: 100,
  },
  
  // 변형별 스타일
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  success: {
    backgroundColor: colors.success,
  },
  warning: {
    backgroundColor: colors.warning,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  
  // 텍스트 스타일
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  text_primary: {
    color: '#FFFFFF',
  },
  text_secondary: {
    color: '#FFFFFF',
  },
  text_success: {
    color: '#FFFFFF',
  },
  text_warning: {
    color: '#FFFFFF',
  },
  text_outline: {
    color: colors.primary,
  },
  text_normal: {
    fontSize: 16,
  },
  text_large: {
    fontSize: 20,
  },
  text_xl: {
    fontSize: 24,
  },
});