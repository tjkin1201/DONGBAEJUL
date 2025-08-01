import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { 
  Text, 
  Card, 
  Avatar, 
  Button, 
  Surface,
  IconButton,
  ActivityIndicator,
  Menu,
  Chip
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { notificationAPI } from '../../services/api';
import theme from '../../utils/theme';

const NotificationsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { notifications: socketNotifications } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [filter, setFilter] = useState('all');

  const filterOptions = [
    { value: 'all', label: '전체' },
    { value: 'unread', label: '읽지 않음' },
    { value: 'game', label: '게임' },
    { value: 'club', label: '클럽' },
    { value: 'chat', label: '채팅' },
  ];

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  useEffect(() => {
    // 실시간 알림이 있으면 목록에 추가
    if (socketNotifications.length > 0) {
      setNotifications(prev => {
        const newNotifications = socketNotifications.filter(
          socketNotif => !prev.some(notif => notif._id === socketNotif._id)
        );
        return [...newNotifications, ...prev];
      });
    }
  }, [socketNotifications]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const params = filter !== 'all' ? { type: filter } : {};
      const response = await notificationAPI.getNotifications(params);
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error('알림 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (error) {
      console.error('알림 읽음 처리 오류:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('전체 알림 읽음 처리 오류:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      setNotifications(prev =>
        prev.filter(notif => notif._id !== notificationId)
      );
    } catch (error) {
      console.error('알림 삭제 오류:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'game':
        return 'badminton';
      case 'club':
        return 'account-group';
      case 'chat':
        return 'message-text';
      case 'ranking':
        return 'trophy';
      case 'friend':
        return 'account-plus';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'game':
        return theme.colors.primary;
      case 'club':
        return theme.colors.secondary;
      case 'chat':
        return theme.colors.level.intermediate;
      case 'ranking':
        return theme.colors.level.expert;
      case 'friend':
        return theme.colors.level.beginner;
      default:
        return theme.colors.outline;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}일 전`;
    }
  };

  const handleNotificationPress = async (notification) => {
    // 읽지 않은 알림이면 읽음 처리
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    // 알림 타입에 따라 해당 화면으로 이동
    switch (notification.type) {
      case 'game':
        if (notification.data?.gameId) {
          navigation.navigate('GameDetail', { gameId: notification.data.gameId });
        }
        break;
      case 'club':
        if (notification.data?.clubId) {
          navigation.navigate('ClubDetail', { clubId: notification.data.clubId });
        }
        break;
      case 'chat':
        if (notification.data?.roomId) {
          navigation.navigate('Chat', {
            roomId: notification.data.roomId,
            roomName: notification.data.roomName,
            roomType: notification.data.roomType
          });
        }
        break;
      case 'ranking':
        navigation.navigate('Ranking');
        break;
      default:
        break;
    }
  };

  const renderNotificationItem = ({ item: notification }) => (
    <Surface 
      style={[
        styles.notificationItem,
        !notification.isRead && styles.unreadNotification
      ]} 
      elevation={1}
    >
      <View style={styles.notificationContent}>
        <Avatar.Icon
          size={48}
          icon={getNotificationIcon(notification.type)}
          style={[
            styles.notificationIcon,
            { backgroundColor: `${getNotificationColor(notification.type)}20` }
          ]}
          color={getNotificationColor(notification.type)}
        />
        
        <View style={styles.notificationBody}>
          <View style={styles.notificationHeader}>
            <Text 
              style={[
                styles.notificationTitle,
                !notification.isRead && styles.unreadTitle
              ]}
              numberOfLines={1}
            >
              {notification.title}
            </Text>
            <Text style={styles.notificationTime}>
              {formatTime(notification.createdAt)}
            </Text>
          </View>
          
          <Text 
            style={styles.notificationMessage}
            numberOfLines={2}
          >
            {notification.message}
          </Text>
          
          <View style={styles.notificationMeta}>
            <Chip
              mode="outlined"
              compact
              style={styles.typeChip}
              textStyle={styles.typeChipText}
            >
              {filterOptions.find(opt => opt.value === notification.type)?.label || '알림'}
            </Chip>
            
            {!notification.isRead && (
              <View style={styles.unreadDot} />
            )}
          </View>
        </View>
        
        <View style={styles.notificationActions}>
          <IconButton
            icon="eye"
            size={20}
            onPress={() => markAsRead(notification._id)}
            disabled={notification.isRead}
            style={styles.actionButton}
          />
          <IconButton
            icon="delete"
            size={20}
            onPress={() => deleteNotification(notification._id)}
            iconColor={theme.colors.error}
            style={styles.actionButton}
          />
        </View>
      </View>
      
      {/* 클릭 가능한 영역 */}
      <View 
        style={styles.clickableArea}
        onTouchEnd={() => handleNotificationPress(notification)}
      />
    </Surface>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>알림을 불러오는 중...</Text>
      </View>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>알림</Text>
          {unreadCount > 0 && (
            <Chip
              mode="flat"
              compact
              style={styles.unreadChip}
              textStyle={styles.unreadChipText}
            >
              {unreadCount}개
            </Chip>
          )}
        </View>
        
        <View style={styles.headerActions}>
          <Menu
            visible={filterMenuVisible}
            onDismiss={() => setFilterMenuVisible(false)}
            anchor={
              <IconButton
                icon="filter"
                size={24}
                onPress={() => setFilterMenuVisible(true)}
              />
            }
          >
            {filterOptions.map(option => (
              <Menu.Item
                key={option.value}
                onPress={() => {
                  setFilter(option.value);
                  setFilterMenuVisible(false);
                }}
                title={option.label}
                leadingIcon={filter === option.value ? 'check' : ''}
              />
            ))}
          </Menu>
          
          {unreadCount > 0 && (
            <IconButton
              icon="email-mark-as-unread"
              size={24}
              onPress={markAllAsRead}
              tooltip="모두 읽음"
            />
          )}
        </View>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {filter === 'all' 
                ? '알림이 없습니다' 
                : `${filterOptions.find(opt => opt.value === filter)?.label} 알림이 없습니다`
              }
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginRight: theme.spacing.md,
  },
  unreadChip: {
    backgroundColor: theme.colors.error,
  },
  unreadChipText: {
    color: theme.colors.onError,
    fontSize: 12,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listContainer: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  notificationItem: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.roundness,
    overflow: 'hidden',
    position: 'relative',
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: theme.spacing.md,
  },
  notificationIcon: {
    marginRight: theme.spacing.md,
  },
  notificationBody: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  notificationTime: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.7,
  },
  notificationMessage: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  notificationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeChip: {
    height: 24,
  },
  typeChipText: {
    fontSize: 10,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  notificationActions: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  actionButton: {
    margin: 0,
    marginLeft: theme.spacing.xs,
  },
  clickableArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 60, // 액션 버튼 영역 제외
    bottom: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default NotificationsScreen;