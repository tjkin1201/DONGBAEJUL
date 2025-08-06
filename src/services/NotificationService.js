import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
    this.isInitialized = false;
    
    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      }),
    });
  }

  /**
   * Initialize notification service
   */
  async initialize() {
    try {
      if (this.isInitialized) {
        return this.expoPushToken;
      }

      // Request permissions
      const permission = await this.requestPermissions();
      if (!permission.granted) {
        console.warn('Push notification permission not granted');
        return null;
      }

      // Get push token
      this.expoPushToken = await this.registerForPushNotificationsAsync();
      
      // Store token locally
      if (this.expoPushToken) {
        await AsyncStorage.setItem('pushToken', this.expoPushToken);
      }

      // Setup listeners
      this.setupNotificationListeners();

      this.isInitialized = true;
      return this.expoPushToken;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return null;
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return {
        granted: finalStatus === 'granted',
        status: finalStatus
      };
    } catch (error) {
      console.error('Failed to request permissions:', error);
      return { granted: false, status: 'denied' };
    }
  }

  /**
   * Register for push notifications and get token
   */
  async registerForPushNotificationsAsync() {
    try {
      let token;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('chat-messages', {
          name: '채팅 메시지',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('chat-mentions', {
          name: '채팅 멘션',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
      }

      if (Constants.isDevice) {
        const { data: token } = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });
        return token;
      } else {
        console.warn('Must use physical device for Push Notifications');
        return null;
      }
    } catch (error) {
      console.error('Failed to get push token:', error);
      return null;
    }
  }

  /**
   * Setup notification listeners
   */
  setupNotificationListeners() {
    // Listener for notifications received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(
      this.handleNotificationReceived.bind(this)
    );

    // Listener for when a user taps on a notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      this.handleNotificationResponse.bind(this)
    );
  }

  /**
   * Handle notification received while app is running
   */
  handleNotificationReceived(notification) {
    const { request } = notification;
    const { content, trigger } = request;

    console.log('Notification received:', {
      title: content.title,
      body: content.body,
      data: content.data,
      trigger
    });

    // Update badge count
    this.updateBadgeCount();
  }

  /**
   * Handle notification tap/response
   */
  handleNotificationResponse(response) {
    const { notification, actionIdentifier } = response;
    const { request } = notification;
    const data = request.content.data;

    console.log('Notification response:', {
      actionIdentifier,
      data
    });

    // Navigate based on notification data
    this.handleNotificationNavigation(data);
  }

  /**
   * Handle navigation when notification is tapped
   */
  handleNotificationNavigation(data) {
    if (!data) return;

    // This would typically use navigation service
    // For now, we'll emit an event that components can listen to
    if (this.onNotificationTap) {
      this.onNotificationTap(data);
    }
  }

  /**
   * Set notification tap handler
   */
  setNotificationTapHandler(handler) {
    this.onNotificationTap = handler;
  }

  /**
   * Send local notification for testing
   */
  async sendLocalNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Failed to send local notification:', error);
    }
  }

  /**
   * Schedule a chat message notification
   */
  async scheduleChatNotification({
    title,
    body,
    roomId,
    messageId,
    senderId,
    senderName,
    roomType = 'group',
    isMention = false
  }) {
    try {
      const channelId = isMention ? 'chat-mentions' : 'chat-messages';
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title || (roomType === 'private' ? senderName : `${senderName} in ${title}`),
          body,
          data: {
            type: 'chat',
            roomId,
            messageId,
            senderId,
            senderName,
            roomType,
            isMention,
            timestamp: new Date().toISOString()
          },
          sound: 'default',
          categoryIdentifier: 'chat',
        },
        trigger: null,
        ...(Platform.OS === 'android' && { 
          identifier: `chat_${messageId}`,
          content: {
            channelId
          }
        })
      });
    } catch (error) {
      console.error('Failed to schedule chat notification:', error);
    }
  }

  /**
   * Cancel specific notification
   */
  async cancelNotification(identifier) {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  /**
   * Update app badge count
   */
  async updateBadgeCount(count) {
    try {
      if (count !== undefined) {
        await Notifications.setBadgeCountAsync(count);
      } else {
        // Auto-calculate badge count from unread messages
        // This would typically come from ChatService
        const unreadCount = await this.getUnreadMessageCount();
        await Notifications.setBadgeCountAsync(unreadCount);
      }
    } catch (error) {
      console.error('Failed to update badge count:', error);
    }
  }

  /**
   * Get unread message count (placeholder)
   */
  async getUnreadMessageCount() {
    try {
      // This should integrate with ChatService
      const unreadData = await AsyncStorage.getItem('unreadMessageCount');
      return unreadData ? parseInt(unreadData, 10) : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Set unread message count
   */
  async setUnreadMessageCount(count) {
    try {
      await AsyncStorage.setItem('unreadMessageCount', count.toString());
      await this.updateBadgeCount(count);
    } catch (error) {
      console.error('Failed to set unread count:', error);
    }
  }

  /**
   * Clear badge count
   */
  async clearBadgeCount() {
    try {
      await Notifications.setBadgeCountAsync(0);
      await AsyncStorage.setItem('unreadMessageCount', '0');
    } catch (error) {
      console.error('Failed to clear badge count:', error);
    }
  }

  /**
   * Get current push token
   */
  getPushToken() {
    return this.expoPushToken;
  }

  /**
   * Refresh push token
   */
  async refreshPushToken() {
    try {
      this.expoPushToken = await this.registerForPushNotificationsAsync();
      if (this.expoPushToken) {
        await AsyncStorage.setItem('pushToken', this.expoPushToken);
      }
      return this.expoPushToken;
    } catch (error) {
      console.error('Failed to refresh push token:', error);
      return null;
    }
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled() {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      return false;
    }
  }

  /**
   * Cleanup listeners
   */
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }

    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
    }

    this.isInitialized = false;
  }

  /**
   * Get notification categories for interactive notifications
   */
  async setupNotificationCategories() {
    try {
      await Notifications.setNotificationCategoryAsync('chat', [
        {
          identifier: 'reply',
          buttonTitle: '답장',
          options: {
            opensAppToForeground: true,
          },
        },
        {
          identifier: 'mark_read',
          buttonTitle: '읽음',
          options: {
            opensAppToForeground: false,
          },
        },
      ]);
    } catch (error) {
      console.error('Failed to setup notification categories:', error);
    }
  }
}

// Singleton instance
const notificationService = new NotificationService();

export default notificationService;
