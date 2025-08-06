import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { AppState } from 'react-native';
import NotificationService from '../services/NotificationService';

const NotificationContext = createContext({});

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [pushToken, setPushToken] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    initializeNotifications();
    setupAppStateListener();
  }, []);

  const initializeNotifications = async () => {
    try {
      const token = await NotificationService.initialize();
      setPushToken(token);
      setIsInitialized(true);

      // Setup notification categories
      await NotificationService.setupNotificationCategories();
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  };

  const setupAppStateListener = () => {
    const handleAppStateChange = (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to foreground, clear badge
        NotificationService.clearBadgeCount();
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  };

  const requestPermissions = async () => {
    return await NotificationService.requestPermissions();
  };

  const sendLocalNotification = async (title, body, data = {}) => {
    return await NotificationService.sendLocalNotification(title, body, data);
  };

  const scheduleChatNotification = async (notificationData) => {
    return await NotificationService.scheduleChatNotification(notificationData);
  };

  const updateBadgeCount = async (count) => {
    return await NotificationService.updateBadgeCount(count);
  };

  const clearBadgeCount = async () => {
    return await NotificationService.clearBadgeCount();
  };

  const areNotificationsEnabled = async () => {
    return await NotificationService.areNotificationsEnabled();
  };

  const value = {
    isInitialized,
    pushToken,
    notifications,
    appState,
    requestPermissions,
    sendLocalNotification,
    scheduleChatNotification,
    updateBadgeCount,
    clearBadgeCount,
    areNotificationsEnabled,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
