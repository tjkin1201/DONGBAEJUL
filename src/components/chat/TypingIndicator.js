import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Avatar, useTheme } from 'react-native-paper';

const TypingIndicator = ({ typingUsers = [] }) => {
  const theme = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (typingUsers.length > 0) {
      // 타이핑 애니메이션 시작
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // 타이핑 중단 시 애니메이션 정지
      animatedValue.stopAnimation();
      animatedValue.setValue(0);
    }
  }, [typingUsers.length, animatedValue]);

  if (typingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].name}님이 입력 중`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].name}님과 ${typingUsers[1].name}님이 입력 중`;
    } else {
      return `${typingUsers[0].name}님 외 ${typingUsers.length - 1}명이 입력 중`;
    }
  };

  const renderTypingDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map((index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: theme.colors.primary },
              {
                opacity: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
                transform: [
                  {
                    scale: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* 타이핑 중인 첫 번째 사용자의 아바타 */}
        <View style={styles.avatarContainer}>
          {typingUsers[0].avatar ? (
            <Avatar.Image 
              size={24} 
              source={{ uri: typingUsers[0].avatar }}
            />
          ) : (
            <Avatar.Text 
              size={24} 
              label={typingUsers[0].name?.charAt(0) || 'U'}
              style={{ backgroundColor: theme.colors.primary }}
            />
          )}
        </View>

        {/* 타이핑 버블 */}
        <View style={[
          styles.typingBubble,
          { backgroundColor: theme.colors.surface }
        ]}>
          {renderTypingDots()}
        </View>
      </View>

      {/* 타이핑 텍스트 */}
      <Text style={[
        styles.typingText,
        { color: theme.colors.outline }
      ]}>
        {getTypingText()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  avatarContainer: {
    marginRight: 8,
  },
  typingBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    minWidth: 60,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
  },
  typingText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 40,
    fontStyle: 'italic',
  },
});

export default TypingIndicator;
