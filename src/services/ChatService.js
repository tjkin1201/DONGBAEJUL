import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import SocketService from './SocketService';
import NotificationService from './NotificationService';

class ChatService {
  constructor() {
    this.rooms = new Map(); // room_id -> messages[]
    this.roomMetadata = new Map(); // room_id -> room info
    this.messageListeners = new Set();
    this.typingListeners = new Set();
    this.onlineUsersListeners = new Set();
    this.initialized = false;
    this.offlineMessageQueue = new Map(); // room_id -> queued messages[]
    this.processingQueue = false;
  }

  // Initialize chat service
  async initialize() {
    if (this.initialized) return;

    // Initialize notification service
    await NotificationService.initialize();
    
    // Setup notification tap handler
    NotificationService.setNotificationTapHandler(this.handleNotificationTap.bind(this));

    // Load cached messages from storage
    await this.loadCachedMessages();
    
    // Load offline message queue
    await this.loadOfflineMessageQueue();
    
    // Set up socket event listeners
    this.setupSocketListeners();
    
    this.initialized = true;
  }

  // Load cached messages from AsyncStorage
  async loadCachedMessages() {
    try {
      const cachedRooms = await AsyncStorage.getItem('chat_rooms');
      if (cachedRooms) {
        const rooms = JSON.parse(cachedRooms);
        Object.entries(rooms).forEach(([roomId, messages]) => {
          this.rooms.set(roomId, messages);
        });
      }

      const cachedMetadata = await AsyncStorage.getItem('room_metadata');
      if (cachedMetadata) {
        const metadata = JSON.parse(cachedMetadata);
        Object.entries(metadata).forEach(([roomId, data]) => {
          this.roomMetadata.set(roomId, data);
        });
      }
    } catch {
      // Handle error silently, don't break app initialization
    }
  }

  // Save messages to AsyncStorage
  async saveMessagesToStorage() {
    try {
      const roomsObject = {};
      this.rooms.forEach((messages, roomId) => {
        roomsObject[roomId] = messages;
      });

      const metadataObject = {};
      this.roomMetadata.forEach((data, roomId) => {
        metadataObject[roomId] = data;
      });

      await AsyncStorage.setItem('chat_rooms', JSON.stringify(roomsObject));
      await AsyncStorage.setItem('room_metadata', JSON.stringify(metadataObject));
    } catch {
      // Handle error silently
    }
  }

  // Load offline message queue from AsyncStorage
  async loadOfflineMessageQueue() {
    try {
      const queueData = await AsyncStorage.getItem('offline_message_queue');
      if (queueData) {
        const queueObject = JSON.parse(queueData);
        Object.entries(queueObject).forEach(([roomId, messages]) => {
          this.offlineMessageQueue.set(roomId, messages);
        });
      }
    } catch {
      // Handle error silently
    }
  }

  // Save offline message queue to AsyncStorage
  async saveOfflineMessageQueue() {
    try {
      const queueObject = {};
      this.offlineMessageQueue.forEach((messages, roomId) => {
        queueObject[roomId] = messages;
      });
      await AsyncStorage.setItem('offline_message_queue', JSON.stringify(queueObject));
    } catch {
      // Handle error silently
    }
  }

  // Set up socket event listeners
  setupSocketListeners() {
    // Listen for incoming messages
    SocketService.on('message', this.handleIncomingMessage.bind(this));
    SocketService.on('message_history', this.handleMessageHistory.bind(this));
    SocketService.on('typing', this.handleTypingIndicator.bind(this));
    SocketService.on('user_joined', this.handleUserJoined.bind(this));
    SocketService.on('user_left', this.handleUserLeft.bind(this));
    SocketService.on('online_users', this.handleOnlineUsers.bind(this));
    SocketService.on('message_delivered', this.handleMessageDelivered.bind(this));
    SocketService.on('message_read', this.handleMessageRead.bind(this));
    
    // Listen for connection state changes
    SocketService.onConnectionStateChange((state) => {
      if (state === 'connected') {
        this.processOfflineMessageQueue();
      }
    });
  }

  // Join a chat room
  async joinRoom(roomId, roomInfo = {}) {
    try {
      if (!SocketService.isConnected()) {
        throw new Error('Socket not connected');
      }

      const response = await SocketService.joinRoom(roomId, roomInfo);
      
      // Store room metadata
      this.roomMetadata.set(roomId, {
        ...roomInfo,
        joinedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      });

      await this.saveMessagesToStorage();

      return response;
    } catch (error) {
      throw new Error(`Failed to join room: ${error.message}`);
    }
  }

  // Leave a chat room
  async leaveRoom(roomId) {
    try {
      if (SocketService.isConnected()) {
        SocketService.leaveRoom(roomId);
      }

      // Update room metadata
      const metadata = this.roomMetadata.get(roomId);
      if (metadata) {
        this.roomMetadata.set(roomId, {
          ...metadata,
          leftAt: new Date().toISOString()
        });
      }

      await this.saveMessagesToStorage();
      return true;
    } catch (error) {
      throw new Error(`Failed to leave room: ${error.message}`);
    }
  }

  // Send a message (with offline queue support)
  async sendMessage(roomId, content, messageType = 'text', attachments = []) {
    try {
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date().toISOString();

      // Create message object
      const messageData = {
        id: tempId,
        content,
        messageType,
        attachments,
        timestamp,
        status: 'sending',
        roomId,
        isTemporary: true
      };

      // Add temporary message to local state
      this.addMessageToRoom(roomId, messageData);

      if (SocketService.isConnected()) {
        try {
          // Send message via socket
          const response = await SocketService.sendMessage(roomId, {
            content,
            messageType,
            attachments,
            tempId
          });

          // Replace temporary message with confirmed message
          this.replaceTemporaryMessage(roomId, tempId, {
            ...response.message,
            status: 'sent'
          });

          // Update room activity
          this.updateRoomActivity(roomId);

          return response.message;
        } catch (error) {
          // Mark temporary message as failed
          this.updateMessageStatus(roomId, tempId, 'failed');
          throw error;
        }
      } else {
        // Add to offline queue
        await this.addToOfflineQueue(roomId, messageData);
        
        // Update message status to queued
        this.updateMessageStatus(roomId, tempId, 'queued');
        
        return messageData;
      }
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  // Add message to offline queue
  async addToOfflineQueue(roomId, messageData) {
    const queuedMessages = this.offlineMessageQueue.get(roomId) || [];
    queuedMessages.push({
      ...messageData,
      queuedAt: new Date().toISOString(),
      retryCount: 0
    });
    this.offlineMessageQueue.set(roomId, queuedMessages);
    await this.saveOfflineMessageQueue();
  }

  // Process offline message queue when connection is restored
  async processOfflineMessageQueue() {
    if (this.processingQueue) return;
    
    this.processingQueue = true;
    
    try {
      for (const [roomId, queuedMessages] of this.offlineMessageQueue) {
        const messagesToRetry = [...queuedMessages];
        
        for (const queuedMessage of messagesToRetry) {
          try {
            // Attempt to send queued message
            const response = await SocketService.sendMessage(roomId, {
              content: queuedMessage.content,
              messageType: queuedMessage.messageType,
              attachments: queuedMessage.attachments,
              tempId: queuedMessage.id
            });

            // Replace temporary message with confirmed message
            this.replaceTemporaryMessage(roomId, queuedMessage.id, {
              ...response.message,
              status: 'sent'
            });

            // Remove from queue
            const updatedQueue = this.offlineMessageQueue.get(roomId) || [];
            const index = updatedQueue.findIndex(msg => msg.id === queuedMessage.id);
            if (index !== -1) {
              updatedQueue.splice(index, 1);
              this.offlineMessageQueue.set(roomId, updatedQueue);
            }

          } catch {
            // Increment retry count
            queuedMessage.retryCount = (queuedMessage.retryCount || 0) + 1;
            
            if (queuedMessage.retryCount >= 3) {
              // Mark as failed after 3 retries
              this.updateMessageStatus(roomId, queuedMessage.id, 'failed');
              
              // Remove from queue
              const updatedQueue = this.offlineMessageQueue.get(roomId) || [];
              const index = updatedQueue.findIndex(msg => msg.id === queuedMessage.id);
              if (index !== -1) {
                updatedQueue.splice(index, 1);
                this.offlineMessageQueue.set(roomId, updatedQueue);
              }
            }
          }
        }
      }
      
      // Save updated queue
      await this.saveOfflineMessageQueue();
      
    } finally {
      this.processingQueue = false;
    }
  }

  // Retry failed message
  async retryFailedMessage(roomId, messageId) {
    try {
      const messages = this.rooms.get(roomId);
      if (!messages) return;

      const message = messages.find(msg => msg.id === messageId);
      if (!message || message.status !== 'failed') return;

      // Update status to sending
      this.updateMessageStatus(roomId, messageId, 'sending');

      if (SocketService.isConnected()) {
        try {
          const response = await SocketService.sendMessage(roomId, {
            content: message.content,
            messageType: message.messageType,
            attachments: message.attachments,
            tempId: messageId
          });

          // Update with confirmed message
          this.updateMessageStatus(roomId, messageId, 'sent', {
            id: response.message.id,
            timestamp: response.message.timestamp
          });

        } catch (error) {
          this.updateMessageStatus(roomId, messageId, 'failed');
          throw error;
        }
      } else {
        // Add back to offline queue
        await this.addToOfflineQueue(roomId, message);
        this.updateMessageStatus(roomId, messageId, 'queued');
      }
    } catch (error) {
      throw new Error(`Failed to retry message: ${error.message}`);
    }
  }

  // Get queued messages count
  getQueuedMessagesCount(roomId = null) {
    if (roomId) {
      const queuedMessages = this.offlineMessageQueue.get(roomId) || [];
      return queuedMessages.length;
    }
    
    let totalCount = 0;
    for (const queuedMessages of this.offlineMessageQueue.values()) {
      totalCount += queuedMessages.length;
    }
    return totalCount;
  }

  // Clear offline queue for a room
  async clearOfflineQueue(roomId) {
    this.offlineMessageQueue.delete(roomId);
    await this.saveOfflineMessageQueue();
  }

  // Add message to room
  addMessageToRoom(roomId, message) {
    const messages = this.rooms.get(roomId) || [];
    
    messages.push({
      ...message,
      timestamp: message.timestamp || new Date().toISOString()
    });

    // Keep only last 500 messages in memory
    if (messages.length > 500) {
      messages.splice(0, messages.length - 500);
    }

    this.rooms.set(roomId, messages);
    this.notifyMessageListeners(roomId, message);
    this.saveMessagesToStorage();
  }

  // Replace temporary message with confirmed message
  replaceTemporaryMessage(roomId, tempId, confirmedMessage) {
    const messages = this.rooms.get(roomId);
    if (messages) {
      const index = messages.findIndex(msg => msg.id === tempId);
      if (index !== -1) {
        messages[index] = {
          ...confirmedMessage,
          isTemporary: false
        };
        this.rooms.set(roomId, messages);
        this.notifyMessageListeners(roomId, messages[index]);
        this.saveMessagesToStorage();
      }
    }
  }

  // Update message status
  updateMessageStatus(roomId, messageId, status, additionalData = {}) {
    const messages = this.rooms.get(roomId);
    if (messages) {
      const message = messages.find(msg => msg.id === messageId);
      if (message) {
        const updatedMessage = {
          ...message,
          status,
          ...additionalData
        };
        
        // Update the message in the array
        const index = messages.findIndex(msg => msg.id === messageId);
        if (index !== -1) {
          messages[index] = updatedMessage;
          this.rooms.set(roomId, messages);
          this.notifyMessageListeners(roomId, updatedMessage);
          this.saveMessagesToStorage();
        }
      }
    }
  }

  // Mark message as delivered
  markMessageAsDelivered(roomId, messageId, deliveredAt = null) {
    this.updateMessageStatus(roomId, messageId, 'delivered', {
      deliveredAt: deliveredAt || new Date().toISOString()
    });
  }

  // Mark message as read
  markMessageAsRead(roomId, messageId, readAt = null) {
    this.updateMessageStatus(roomId, messageId, 'read', {
      readAt: readAt || new Date().toISOString()
    });
  }

  // Mark multiple messages as read
  markMessagesAsRead(roomId, messageIds) {
    const readAt = new Date().toISOString();
    messageIds.forEach(messageId => {
      this.markMessageAsRead(roomId, messageId, readAt);
    });
  }

  // Get message delivery status
  getMessageStatus(roomId, messageId) {
    const messages = this.rooms.get(roomId);
    if (messages) {
      const message = messages.find(msg => msg.id === messageId);
      return message ? {
        status: message.status,
        sentAt: message.timestamp,
        deliveredAt: message.deliveredAt,
        readAt: message.readAt
      } : null;
    }
    return null;
  }

  // Send read receipt
  async sendReadReceipt(roomId, messageId) {
    try {
      if (SocketService.isConnected()) {
        await SocketService.sendReadReceipt(roomId, messageId);
      }
    } catch {
      // Handle error silently
    }
  }

  // Batch send read receipts for multiple messages
  async sendBatchReadReceipts(roomId, messageIds) {
    try {
      if (SocketService.isConnected() && messageIds.length > 0) {
        await SocketService.sendBatchReadReceipts(roomId, messageIds);
      }
    } catch {
      // Handle error silently
    }
  }

  // Update room activity timestamp
  updateRoomActivity(roomId) {
    const metadata = this.roomMetadata.get(roomId);
    if (metadata) {
      this.roomMetadata.set(roomId, {
        ...metadata,
        lastActivity: new Date().toISOString()
      });
    }
  }

  // Get unread message count for a room
  getUnreadCount(roomId) {
    const metadata = this.roomMetadata.get(roomId);
    const messages = this.rooms.get(roomId) || [];
    
    if (!metadata?.lastReadAt) {
      return messages.length;
    }

    const lastReadTime = new Date(metadata.lastReadAt);
    return messages.filter(msg => 
      new Date(msg.timestamp) > lastReadTime && 
      !msg.isOwn
    ).length;
  }

  // Mark room as read
  async markRoomAsRead(roomId) {
    const metadata = this.roomMetadata.get(roomId) || {};
    this.roomMetadata.set(roomId, {
      ...metadata,
      lastReadAt: new Date().toISOString()
    });
    
    // Update badge count
    await this.updateUnreadCount();
    
    // Save to storage
    await this.saveMessagesToStorage();
  }

  // Socket event handlers
  handleIncomingMessage(data) {
    const { roomId, message } = data;
    this.addMessageToRoom(roomId, {
      ...message,
      isOwn: false
    });
    this.updateRoomActivity(roomId);
    
    // Send notification for new message
    this.sendChatNotification(roomId, message);
  }

  handleMessageHistory(data) {
    const { roomId, messages } = data;
    if (messages && messages.length > 0) {
      // Prepend historical messages
      const existingMessages = this.rooms.get(roomId) || [];
      const allMessages = [...messages, ...existingMessages];
      
      // Remove duplicates based on message ID
      const uniqueMessages = allMessages.filter((message, index, self) =>
        index === self.findIndex(m => m.id === message.id)
      );
      
      this.rooms.set(roomId, uniqueMessages);
      this.saveMessagesToStorage();
    }
  }

  handleTypingIndicator(data) {
    this.notifyTypingListeners(data);
  }

  handleUserJoined(_data) {
    // Handle user joined event
  }

  handleUserLeft(_data) {
    // Handle user left event
  }

  handleOnlineUsers(data) {
    this.notifyOnlineUsersListeners(data);
  }

  handleMessageDelivered(data) {
    const { roomId, messageId } = data;
    this.updateMessageStatus(roomId, messageId, 'delivered');
  }

  handleMessageRead(data) {
    const { roomId, messageId } = data;
    this.updateMessageStatus(roomId, messageId, 'read');
  }

  // Listener management
  addMessageListener(callback) {
    this.messageListeners.add(callback);
    return () => this.messageListeners.delete(callback);
  }

  removeMessageListener(callback) {
    this.messageListeners.delete(callback);
  }

  addTypingListener(callback) {
    this.typingListeners.add(callback);
    return () => this.typingListeners.delete(callback);
  }

  removeTypingListener(callback) {
    this.typingListeners.delete(callback);
  }

  addOnlineUsersListener(callback) {
    this.onlineUsersListeners.add(callback);
    return () => this.onlineUsersListeners.delete(callback);
  }

  removeOnlineUsersListener(callback) {
    this.onlineUsersListeners.delete(callback);
  }

  // Notify listeners
  notifyMessageListeners(roomId, message) {
    this.messageListeners.forEach(callback => {
      try {
        callback(roomId, message);
      } catch {
        // Handle error silently
      }
    });
  }

  notifyTypingListeners(data) {
    this.typingListeners.forEach(callback => {
      try {
        callback(data);
      } catch {
        // Handle error silently
      }
    });
  }

  notifyOnlineUsersListeners(data) {
    this.onlineUsersListeners.forEach(callback => {
      try {
        callback(data);
      } catch {
        // Handle error silently
      }
    });
  }

  // Send typing indicator
  sendTypingIndicator(roomId, isTyping) {
    try {
      if (SocketService.isConnected()) {
        SocketService.sendTypingIndicator(roomId, isTyping);
      }
    } catch {
      // Handle error silently
    }
  }

  // Get room messages
  getRoomMessages(roomId) {
    return this.rooms.get(roomId) || [];
  }

  // Get all rooms
  getAllRooms() {
    return Array.from(this.roomMetadata.entries()).map(([roomId, metadata]) => ({
      id: roomId,
      ...metadata,
      lastMessage: this.getLastMessage(roomId)
    }));
  }

  // Get last message for a room
  getLastMessage(roomId) {
    const messages = this.rooms.get(roomId) || [];
    return messages.length > 0 ? messages[messages.length - 1] : null;
  }

  // Request message history
  async requestMessageHistory(roomId, before = null, limit = 50) {
    try {
      if (SocketService.isConnected()) {
        return await SocketService.requestMessageHistory(roomId, before, limit);
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  // Get chat statistics
  getChatStatistics() {
    const totalRooms = this.rooms.size;
    let totalMessages = 0;
    let totalUnread = 0;

    this.rooms.forEach((messages, roomId) => {
      totalMessages += messages.length;
      totalUnread += this.getUnreadCount(roomId);
    });

    return {
      totalRooms,
      totalMessages,
      totalUnread,
      averageMessagesPerRoom: totalRooms > 0 ? Math.round(totalMessages / totalRooms) : 0
    };
  }

  // Cleanup
  cleanup() {
    this.messageListeners.clear();
    this.typingListeners.clear();
    this.onlineUsersListeners.clear();
    this.offlineMessageQueue.clear();
    NotificationService.cleanup();
    this.initialized = false;
  }

  // Send chat notification
  async sendChatNotification(roomId, message) {
    try {
      // Check if app is in background
      const isAppInBackground = AppState.currentState === 'background' || 
                               AppState.currentState === 'inactive';
      
      // Only send notifications when app is in background or for private messages
      const roomMetadata = this.roomMetadata.get(roomId) || {};
      const isPrivateMessage = roomMetadata.type === 'private' || roomId.startsWith('private_');
      const isMention = message.content?.includes('@') || false; // Simple mention detection
      
      if (isAppInBackground || isPrivateMessage || isMention) {
        let title;
        if (isPrivateMessage) {
          title = message.senderName || '개인 메시지';
        } else {
          title = roomMetadata.name || '동백줄 채팅';
        }

        await NotificationService.scheduleChatNotification({
          title,
          body: message.content,
          roomId,
          messageId: message.id,
          senderId: message.senderId,
          senderName: message.senderName,
          roomType: isPrivateMessage ? 'private' : 'group',
          isMention
        });

        // Update unread count
        await this.updateUnreadCount();
      }
    } catch {
      // Handle error silently
    }
  }

  // Handle notification tap
  handleNotificationTap(data) {
    if (data.type === 'chat' && data.roomId) {
      // This would typically navigate to the chat screen
      // For now, we'll just store the navigation intent
      AsyncStorage.setItem('pendingNavigation', JSON.stringify({
        screen: 'Chat',
        params: {
          roomId: data.roomId,
          roomType: data.roomType
        }
      }));
    }
  }

  // Update total unread count
  async updateUnreadCount() {
    try {
      let totalUnread = 0;
      
      for (const [roomId] of this.rooms) {
        totalUnread += this.getUnreadCount(roomId);
      }
      
      await NotificationService.setUnreadMessageCount(totalUnread);
    } catch {
      // Handle error silently
    }
  }

  // Get notification settings
  async getNotificationSettings() {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      return settings ? JSON.parse(settings) : {
        enabled: true,
        sound: true,
        vibration: true,
        mentions: true,
        privateMessages: true,
        groupMessages: false // Only notify for mentions in group chats
      };
    } catch (error) {
      return {
        enabled: true,
        sound: true,
        vibration: true,
        mentions: true,
        privateMessages: true,
        groupMessages: false
      };
    }
  }

  // Update notification settings
  async updateNotificationSettings(settings) {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
    } catch {
      // Handle error silently
    }
  }
}

// Singleton instance
const chatService = new ChatService();

export default chatService;
