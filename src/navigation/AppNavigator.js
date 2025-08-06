import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/SimpleAuthContext';

import AuthNavigator from './AuthNavigator';
import SimpleMainNavigator2 from './SimpleMainNavigator2';
import LoadingScreen from '../components/LoadingScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={SimpleMainNavigator2} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;