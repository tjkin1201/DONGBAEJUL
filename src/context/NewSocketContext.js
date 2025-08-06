import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import SocketService from '../services/SocketService';
import { useAuth } from './SimpleAuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [connectionState, setConnectionState] = useState('disconnected');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      SocketService.initialize(user.id);
    } else {
      SocketService.disconnect();
    }

    return () => {
      SocketService.cleanup();
    };
  }, [isAuthenticated, user?.id]);

  // Listen to connection state changes
  useEffect(() => {
    const handleConnectionStateChange = (state) => {
      setConnectionState(state);
      setIsConnected(state === 'connected');
      
      if (state === 'error' || state === 'failed') {
        setError('Connection failed');
      } else {
        setError(null);
      }
    };

    const handleError = (err) => {
      setError(err.message || 'Socket error occurred');
    };

    SocketService.onConnectionStateChange(handleConnectionStateChange);
    
    // Add error handling
    const originalCallback = handleConnectionStateChange;
    originalCallback.onError = handleError;

    return () => {
      SocketService.offConnectionStateChange(handleConnectionStateChange);
    };
  }, []);

  // Emit events
  const emit = useCallback((event, data, callback) => {
    SocketService.emit(event, data, callback);
  }, []);

  // Add event listeners
  const on = useCallback((event, callback) => {
    SocketService.on(event, callback);
  }, []);

  // Remove event listeners
  const off = useCallback((event, callback) => {
    SocketService.off(event, callback);
  }, []);

  // Manual reconnection
  const reconnect = useCallback(() => {
    setError(null);
    SocketService.reconnect();
  }, []);

  // Join room
  const joinRoom = useCallback((roomId) => {
    SocketService.joinRoom(roomId);
  }, []);

  // Leave room
  const leaveRoom = useCallback((roomId) => {
    SocketService.leaveRoom(roomId);
  }, []);

  // Send message
  const sendMessage = useCallback((roomId, message) => {
    return SocketService.sendMessage(roomId, message);
  }, []);

  // Send typing indicator
  const sendTyping = useCallback((roomId, isTyping = true) => {
    SocketService.sendTyping(roomId, isTyping);
  }, []);

  const value = {
    // Connection state
    connectionState,
    isConnected,
    error,

    // Core methods
    emit,
    on,
    off,
    reconnect,

    // Chat methods
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTyping,

    // Utility
    getConnectionState: () => SocketService.getConnectionState(),
    isSocketConnected: () => SocketService.isConnected(),
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
