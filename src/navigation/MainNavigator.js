import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import theme from '../utils/theme';

// 스크린 임포트
import HomeScreen from '../screens/main/HomeScreen';
import ClubsScreen from '../screens/main/ClubsScreen';
import GamesScreen from '../screens/main/GamesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import NotificationsScreen from '../screens/detail/NotificationsScreen';

// 상세 스크린들
import ClubDetailScreen from '../screens/detail/ClubDetailScreen';
import ClubCreateScreen from '../screens/detail/ClubCreateScreen';
import GameDetailScreen from '../screens/detail/GameDetailScreen';
import GameCreateScreen from '../screens/detail/GameCreateScreen';
import ProfileEditScreen from '../screens/detail/ProfileEditScreen';
import StatisticsScreen from '../screens/detail/StatisticsScreen';
import RankingScreen from '../screens/detail/RankingScreen';
import ChatScreen from '../screens/detail/ChatScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 홈 스택
const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="HomeMain" 
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Notifications" 
      component={NotificationsScreen}
      options={{ 
        title: '알림',
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
      }}
    />
  </Stack.Navigator>
);

// 클럽 스택
const ClubsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ClubsMain" 
      component={ClubsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="ClubDetail" 
      component={ClubDetailScreen}
      options={{ 
        title: '클럽 상세',
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
      }}
    />
    <Stack.Screen 
      name="ClubCreate" 
      component={ClubCreateScreen}
      options={{ 
        title: '클럽 만들기',
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
      }}
    />
    <Stack.Screen 
      name="Chat" 
      component={ChatScreen}
      options={({ route }) => ({ 
        title: route.params?.title || '채팅',
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
      })}
    />
  </Stack.Navigator>
);

// 게임 스택
const GamesStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="GamesMain" 
      component={GamesScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="GameDetail" 
      component={GameDetailScreen}
      options={{ 
        title: '게임 상세',
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
      }}
    />
    <Stack.Screen 
      name="GameCreate" 
      component={GameCreateScreen}
      options={{ 
        title: '게임 만들기',
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
      }}
    />
  </Stack.Navigator>
);

// 프로필 스택
const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ProfileMain" 
      component={ProfileScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="ProfileEdit" 
      component={ProfileEditScreen}
      options={{ 
        title: '프로필 수정',
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
      }}
    />
    <Stack.Screen 
      name="Statistics" 
      component={StatisticsScreen}
      options={{ 
        title: '내 통계',
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
      }}
    />
    <Stack.Screen 
      name="Ranking" 
      component={RankingScreen}
      options={{ 
        title: '랭킹',
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
      }}
    />
  </Stack.Navigator>
);

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Clubs':
              iconName = focused ? 'account-group' : 'account-group-outline';
              break;
            case 'Games':
              iconName = focused ? 'badminton' : 'badminton';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.placeholder,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{ tabBarLabel: '홈' }}
      />
      <Tab.Screen 
        name="Clubs" 
        component={ClubsStack}
        options={{ tabBarLabel: '클럽' }}
      />
      <Tab.Screen 
        name="Games" 
        component={GamesStack}
        options={{ tabBarLabel: '게임' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{ tabBarLabel: '프로필' }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;