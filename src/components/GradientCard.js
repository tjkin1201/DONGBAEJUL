import React from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'expo-linear-gradient';

const GradientCard = ({ 
  children, 
  colors = ['#FF6B35', '#FF4500'], 
  style = {},
  ...props 
}) => {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
      {...props}
    >
      <View style={styles.content}>
        {children}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 1, // For border effect
  },
  content: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
  },
});

export default GradientCard;
