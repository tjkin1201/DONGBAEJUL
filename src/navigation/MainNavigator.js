import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import theme from '../utils/theme';

// 스크린 임포트 - 동호회 전용
import ClubHomeScreen from '../screens/main/ClubHomeScreen'; // 기존 HomeScreen 대체
import MembersScreen from '../screens/main/MembersScreen'; // 기존 ClubsScreen 대체
import GamesScreen from '../screens/main/GamesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import UserProfileScreen from '../screens/main/UserProfileScreen'; // 새로운 프로필 화면
import InstantMatchScreen from '../screens/main/InstantMatchScreen'; // 새로운 매칭 화면
import NotificationsScreen from '../screens/detail/NotificationsScreen';
import PaymentScreen from '../screens/club/PaymentScreen';
import BoardScreen from '../screens/club/BoardScreen';
import CreatePostScreen from '../screens/club/CreatePostScreen';
import PostDetailScreen from '../screens/club/PostDetailScreen';

// 상세 스크린들
import ClubDetailScreen from '../screens/detail/ClubDetailScreen';
import ClubCreateScreen from '../screens/detail/ClubCreateScreen';
import GameDetailScreen from '../screens/detail/GameDetailScreen';
import GameCreateScreen from '../screens/detail/GameCreateScreen';
import PremiumGameCreateScreen from '../screens/detail/PremiumGameCreateScreen'; // 새로운 게임 생성 화면
import SimpleGameDetailScreen from '../screens/detail/SimpleGameDetailScreen'; // 임시 게임 상세 화면
import ProfileEditScreen from '../screens/detail/ProfileEditScreen';
import StatisticsScreen from '../screens/detail/StatisticsScreen';
import RankingScreen from '../screens/detail/RankingScreen';
import ChatScreen from '../screens/main/ChatScreen';
import PhotoGalleryScreen from '../screens/main/PhotoGalleryScreen';
import PhotoDetailScreen from '../screens/detail/PhotoDetailScreen';
import PhotoAlbumsScreen from '../screens/detail/PhotoAlbumsScreen';
import ConversationsScreen from '../screens/main/ConversationsScreen';
import PrivateChatScreen from '../screens/main/PrivateChatScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 동호회 홈 스택
const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="HomeMain" 
      component={ClubHomeScreen}
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
    <Stack.Screen 
      name="Payment" 
      component={PaymentScreen}
      options={{ 
        title: '모임비 납부',
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
      }}
    />
    <Stack.Screen 
      name="Board" 
      component={BoardScreen}
      options={{ 
        title: '게시판',
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
      }}
    />
    <Stack.Screen 
      name="CreatePost" 
      component={CreatePostScreen}
      options={{ 
        title: '게시글 작성',
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
      }}
    />
    <Stack.Screen 
      name="PostDetail" 
      component={PostDetailScreen}
      options={{ 
        title: '게시글',
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
      }}
    />
  </Stack.Navigator>
);

// 멤버 스택 - 동호회 전용
const MembersStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="MembersMain" 
      component={MembersScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="MemberProfile" 
      component={ProfileScreen} // 임시로 기존 프로필 화면 사용
      options={{ 
        title: '멤버 프로필',
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
    <Stack.Screen 
      name="PremiumGameCreate" 
      component={PremiumGameCreateScreen}
      options={{ 
        title: '프리미엄 게임 만들기',
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
      }}
    />
    <Stack.Screen 
      name="PremiumGameDetail" 
      component={SimpleGameDetailScreen}
      options={{ 
        title: '게임 상세보기',
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
      }}
    />
    <Stack.Screen 
      name="InstantMatch" 
      component={InstantMatchScreen}
      options={{ 
        title: '인스턴트 매칭',
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
      name="UserProfile" 
      component={UserProfileScreen}
      options={{ 
        title: '사용자 프로필',
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
      }}
    />
    <Stack.Screen 
      name="ProfileEdit" 
      component={ProfileEditScreen}
      options={{ 
        title: '프로필 편집',
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
      }}
    />
    <Stack.Screen 
      name="Statistics" 
      component={StatisticsScreen}
      options={{ 
        title: '통계',
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
    <Stack.Screen 
      name="Chat" 
      component={ChatScreen}
      options={{ 
        title: '채팅',
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
      }}
    />
  </Stack.Navigator>
);

// 포토 갤러리 스택
const PhotoStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="PhotoGalleryMain" 
      component={PhotoGalleryScreen}
      options={{ 
        title: '포토 갤러리',
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
      }}
    />
    <Stack.Screen 
      name="PhotoDetail" 
      component={PhotoDetailScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="PhotoAlbums" 
      component={PhotoAlbumsScreen}
      options={{ 
        title: '앨범',
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
      }}
    />
  </Stack.Navigator>
);

// 채팅 스택
const ChatStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ChatMain" 
      component={ChatScreen}
      options={{ headerShown: false }}
      initialParams={{ roomId: 'main', roomName: '전체 채팅', roomType: 'group' }}
    />
    <Stack.Screen 
      name="Conversations" 
      component={ConversationsScreen}
      options={{ 
        title: '개인 채팅',
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
      }}
    />
    <Stack.Screen 
      name="PrivateChat" 
      component={PrivateChatScreen}
      options={{ headerShown: false }}
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
            case 'Members':
              iconName = focused ? 'account-group' : 'account-group-outline';
              break;
            case 'Games':
              iconName = focused ? 'badminton' : 'badminton';
              break;
            case 'Chat':
              iconName = focused ? 'chat' : 'chat-outline';
              break;
            case 'Photos':
              iconName = focused ? 'image-multiple' : 'image-multiple-outline';
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
        name="Members" 
        component={MembersStack}
        options={{ tabBarLabel: '멤버' }}
      />
      <Tab.Screen 
        name="Games" 
        component={GamesStack}
        options={{ tabBarLabel: '게임' }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatStack}
        options={{ tabBarLabel: '채팅' }}
      />
      <Tab.Screen 
        name="Photos" 
        component={PhotoStack}
        options={{ tabBarLabel: '갤러리' }}
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