import React from 'react';
import { View, StyleSheet, Animated, Dimensions, Text } from 'react-native';
import LinearGradient from 'expo-linear-gradient';
import newTheme from '../utils/newTheme';

const { width } = Dimensions.get('window');

const FloatingCard = ({ 
  title, 
  subtitle, 
  icon, 
  delay = 0,
  style = {} 
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [fadeAnim, slideAnim, delay]);

  return (
    <Animated.View 
      style={[
        styles.cardContainer,
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
        style={styles.card}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: width * 0.7,
    marginHorizontal: newTheme.spacing.sm,
  },
  card: {
    padding: newTheme.spacing.lg,
    borderRadius: newTheme.borderRadius.lg,
    alignItems: 'center',
    ...newTheme.shadows.md,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: newTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: newTheme.spacing.md,
    ...newTheme.shadows.sm,
  },
  icon: {
    fontSize: 24,
    color: newTheme.colors.text.inverse,
  },
  title: {
    fontSize: newTheme.typography.sizes.h3,
    fontWeight: 'bold',
    color: newTheme.colors.text.primary,
    textAlign: 'center',
    marginBottom: newTheme.spacing.xs,
  },
  subtitle: {
    fontSize: newTheme.typography.sizes.caption,
    color: newTheme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default FloatingCard;
