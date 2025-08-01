import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import FlashMessage from 'react-native-flash-message';

import { AuthProvider } from './src/context/AuthContext';
import { SocketProvider } from './src/context/SocketContext';
import { theme } from './src/utils/theme';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <SocketProvider>
            <NavigationContainer>
              <StatusBar style="auto" />
              <AppNavigator />
              <FlashMessage position="top" />
            </NavigationContainer>
          </SocketProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}