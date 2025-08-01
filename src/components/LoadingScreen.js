import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Surface, Text } from 'react-native-paper';
import theme from '../utils/theme';

const LoadingScreen = ({ message = '로딩 중...' }) => {
  return (
    <View style={styles.container}>
      <Surface style={styles.surface} elevation={2}>
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={styles.spinner}
        />
        <Text style={styles.message}>{message}</Text>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  surface: {
    padding: theme.spacing.xl,
    borderRadius: theme.roundness,
    alignItems: 'center',
    minWidth: 200,
  },
  spinner: {
    marginBottom: theme.spacing.md,
  },
  message: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
  },
});

export default LoadingScreen;