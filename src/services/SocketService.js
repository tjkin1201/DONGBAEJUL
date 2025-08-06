import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocketService {
  constructor() {
    this.socket = null;
    this.connectionState = 'disconnected';
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000; // Start with 1 second
    this.maxReconnectDelay = 30000; // Max 30 seconds
    this.listeners = new Map();
    this.connectionListeners = new Set();
    this.userId = null;
    this.serverUrl = __DEV__ 
      ? 'http://localhost:3001' 
      : 'https://your-production-server.com';
  }

  // Initialize connection with user authentication
  async initialize(userId) {
    if (this.socket && this.socket.connected) {
      console.log('Socket already connected');
      return;
    }

    this.userId = userId;
    await this.connect();
  }

  // Connect to Socket.IO server
  async connect() {
    try {
      this.connectionState = 'connecting';
      this.notifyConnectionStateChange();

      // Get authentication token from storage
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const socketOptions = {
        transports: ['websocket'],
        timeout: 20000,
        auth: {
          token: token,
          userId: this.userId
        },
        reconnection: false, // We'll handle reconnection manually
        forceNew: true
      };

      this.socket = io(this.serverUrl, socketOptions);

      // Connection event handlers
      this.socket.on('connect', this.handleConnect.bind(this));
      this.socket.on('disconnect', this.handleDisconnect.bind(this));
      this.socket.on('connect_error', this.handleConnectError.bind(this));
      this.socket.on('error', this.handleError.bind(this));

      // Chat-specific event handlers
      this.socket.on('message', this.handleMessage.bind(this));
      this.socket.on('typing', this.handleTyping.bind(this));
      this.socket.on('user_joined', this.handleUserJoined.bind(this));
      this.socket.on('user_left', this.handleUserLeft.bind(this));

      console.log('Socket connection attempt initiated');

    } catch (error) {
      console.error('Socket connection error:', error);
      this.connectionState = 'error';
      this.notifyConnectionStateChange();
      this.scheduleReconnect();
    }
  }

  // Handle successful connection
  handleConnect() {
    console.log('Socket connected successfully');
    this.connectionState = 'connected';
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000; // Reset delay
    this.notifyConnectionStateChange();

    // Join user-specific room
    if (this.userId) {
      this.socket.emit('join_user_room', { userId: this.userId });
    }
  }

  // Handle disconnection
  handleDisconnect(reason) {
    console.log('Socket disconnected:', reason);
    this.connectionState = 'disconnected';
    this.notifyConnectionStateChange();

    // Only attempt reconnection for certain disconnect reasons
    if (reason === 'io server disconnect') {
      // Server initiated disconnect, don't reconnect automatically
      console.log('Server initiated disconnect');
    } else {
      // Client or network issue, attempt reconnection
      this.scheduleReconnect();
    }
  }

  // Handle connection errors
  handleConnectError(error) {
    console.error('Socket connection error:', error);
    this.connectionState = 'error';
    this.notifyConnectionStateChange();
    this.scheduleReconnect();
  }

  // Handle general errors
  handleError(error) {
    console.error('Socket error:', error);
    this.notifyError(error);
  }

  // Schedule reconnection with exponential backoff
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      this.connectionState = 'failed';
      this.notifyConnectionStateChange();
      return;
    }

    this.reconnectAttempts++;
    this.connectionState = 'reconnecting';
    this.notifyConnectionStateChange();

    console.log(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${this.reconnectDelay}ms`);

    setTimeout(() => {
      if (this.connectionState === 'reconnecting') {
        this.connect();
      }
    }, this.reconnectDelay);

    // Exponential backoff with jitter
    this.reconnectDelay = Math.min(
      this.reconnectDelay * 2 + Math.random() * 1000,
      this.maxReconnectDelay
    );
  }

  // Manual reconnection
  async reconnect() {
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
    await this.connect();
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionState = 'disconnected';
    this.notifyConnectionStateChange();
  }

  // Send message with acknowledgment
  emit(event, data, callback) {
    if (!this.isConnected()) {
      console.warn('Socket not connected, cannot emit event:', event);
      if (callback) callback({ error: 'Socket not connected' });
      return;
    }

    if (callback) {
      this.socket.emit(event, data, callback);
    } else {
      this.socket.emit(event, data);
    }
  }

  // Add event listener
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // If socket is already connected, add listener directly
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Add connection state listener
  onConnectionStateChange(callback) {
    this.connectionListeners.add(callback);
    // Immediately call with current state
    callback(this.connectionState);
  }

  // Remove connection state listener
  offConnectionStateChange(callback) {
    this.connectionListeners.delete(callback);
  }

  // Notify connection state changes
  notifyConnectionStateChange() {
    this.connectionListeners.forEach(callback => {
      callback(this.connectionState);
    });
  }

  // Notify errors
  notifyError(error) {
    this.connectionListeners.forEach(callback => {
      if (callback.onError) {
        callback.onError(error);
      }
    });
  }

  // Check connection status
  isConnected() {
    return this.socket && this.socket.connected;
  }

  // Get connection state
  getConnectionState() {
    return this.connectionState;
  }

  // Join a chat room
  joinRoom(roomId) {
    this.emit('join_room', { roomId });
  }

  // Leave a chat room
  leaveRoom(roomId) {
    this.emit('leave_room', { roomId });
  }

  // Send a chat message
  sendMessage(roomId, message) {
    return new Promise((resolve, reject) => {
      this.emit('send_message', { roomId, message }, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  // Send typing indicator
  sendTyping(roomId, isTyping = true) {
    this.emit('typing', { roomId, isTyping });
  }

  // Message handlers
  handleMessage(data) {
    console.log('Received message:', data);
    // This will be handled by listeners in components
  }

  handleTyping(data) {
    console.log('User typing:', data);
    // This will be handled by listeners in components
  }

  handleUserJoined(data) {
    console.log('User joined:', data);
    // This will be handled by listeners in components
  }

  handleUserLeft(data) {
    console.log('User left:', data);
    // This will be handled by listeners in components
  }

  // Send read receipt for a message
  async sendReadReceipt(roomId, messageId) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected()) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('message_read', {
        roomId,
        messageId,
        readAt: new Date().toISOString()
      }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || 'Failed to send read receipt'));
        }
      });
    });
  }

  // Send batch read receipts for multiple messages
  async sendBatchReadReceipts(roomId, messageIds) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected()) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('batch_read_receipts', {
        roomId,
        messageIds,
        readAt: new Date().toISOString()
      }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || 'Failed to send batch read receipts'));
        }
      });
    });
  }

  // Request delivery confirmation for a message
  async requestDeliveryConfirmation(roomId, messageId) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected()) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('request_delivery_confirmation', {
        roomId,
        messageId
      }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || 'Failed to request delivery confirmation'));
        }
      });
    });
  }

  // Get message status
  async getMessageStatus(roomId, messageId) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected()) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('get_message_status', {
        roomId,
        messageId
      }, (response) => {
        if (response.success) {
          resolve(response.status);
        } else {
          reject(new Error(response.error || 'Failed to get message status'));
        }
      });
    });
  }

  // Clean up
  cleanup() {
    this.disconnect();
    this.listeners.clear();
    this.connectionListeners.clear();
  }
}

// Create and export singleton instance
export default new SocketService();
