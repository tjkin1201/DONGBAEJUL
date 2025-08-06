import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { colors } from '../utils/theme';

// 화면들
import HomeScreen from '../screens/HomeScreen';
import GameBoardScreen from '../screens/GameBoardScreen';
import CheckInScreen from '../screens/CheckInScreen';
import ScoreInputScreen from '../screens/ScoreInputScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let icon;

          if (route.name === 'Home') {
            icon = '🏠';
          } else if (route.name === 'CheckIn') {
            icon = '📱';
          } else if (route.name === 'GameBoard') {
            icon = '🎮';
          } else if (route.name === 'ScoreInput') {
            icon = '⚡';
          }

          return <Text style={{ fontSize: size * 0.8, color }}>{icon}</Text>;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: '홈',
          headerTitle: '🏸 동배즐'
        }} 
      />
      <Tab.Screen 
        name="CheckIn" 
        component={CheckInScreen} 
        options={{ 
          title: '체크인',
          headerTitle: '체육관 도착'
        }} 
      />
      <Tab.Screen 
        name="GameBoard" 
        component={GameBoardScreen} 
        options={{ 
          title: '게임현황',
          headerTitle: '실시간 게임 현황'
        }} 
      />
      <Tab.Screen 
        name="ScoreInput" 
        component={ScoreInputScreen} 
        options={{ 
          title: '점수입력',
          headerTitle: '게임 결과 입력'
        }} 
      />
    </Tab.Navigator>
  );
}