import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import io from 'socket.io-client';
import { SOCKET_URL } from '@env';
import { useAuth } from './AuthContext';
import { showMessage } from 'react-native-flash-message';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, token, user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // 소켓 연결
  const connectSocket = () => {
    if (!isAuthenticated || !token || socketRef.current?.connected) {
      return;
    }

    console.log('🔌 소켓 연결 시도...');

    socketRef.current = io(SOCKET_URL || 'http://localhost:3000', {
      auth: {
        token: token,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 5000,
    });

    // 연결 성공
    socketRef.current.on('connect', () => {
      console.log('✅ 소켓 연결 성공');
      setIsConnected(true);
      
      // 사용자 온라인 상태 설정
      socketRef.current.emit('user:online', {
        userId: user?.id,
        userInfo: {
          name: user?.name,
          level: user?.level,
          profileImage: user?.profileImage,
        },
      });
    });

    // 연결 끊김
    socketRef.current.on('disconnect', (reason) => {
      console.log('❌ 소켓 연결 끊김:', reason);
      setIsConnected(false);
      setOnlineUsers([]);
    });

    // 연결 오류
    socketRef.current.on('connect_error', (error) => {
      console.error('🚫 소켓 연결 오류:', error);
      setIsConnected(false);
    });

    // 재연결 시도
    socketRef.current.on('reconnect', (attemptNumber) => {
      console.log(`🔄 소켓 재연결 성공 (${attemptNumber}번째 시도)`);
    });

    // 온라인 사용자 목록 업데이트
    socketRef.current.on('users:online', (users) => {
      setOnlineUsers(users);
    });

    // 사용자 온라인 상태 변경
    socketRef.current.on('user:joined', (userData) => {
      setOnlineUsers(prev => [...prev.filter(u => u.id !== userData.id), userData]);
    });

    socketRef.current.on('user:left', (userId) => {
      setOnlineUsers(prev => prev.filter(u => u.id !== userId));
    });

    // 개인 알림 수신
    socketRef.current.on('notification:personal', (notification) => {
      console.log('📧 개인 알림 수신:', notification);
      
      setNotifications(prev => [notification, ...prev.slice(0, 49)]); // 최근 50개만 유지
      setUnreadCount(prev => prev + 1);

      // 앱이 포그라운드에 있을 때만 팝업 표시
      if (AppState.currentState === 'active') {
        showMessage({
          message: notification.title,
          description: notification.message,
          type: notification.priority === 'high' ? 'warning' : 'info',
          duration: 4000,
        });
      }
    });

    // 게임 관련 알림
    socketRef.current.on('game:notification', (data) => {
      console.log('🏸 게임 알림 수신:', data);
      
      if (AppState.currentState === 'active') {
        showMessage({
          message: '게임 알림',
          description: data.message || '새로운 게임 업데이트가 있습니다.',
          type: 'info',
        });
      }
    });

    // 클럽 관련 알림
    socketRef.current.on('club:notification', (data) => {
      console.log('🏢 클럽 알림 수신:', data);
      
      if (AppState.currentState === 'active') {
        showMessage({
          message: '클럽 알림',
          description: data.message || '새로운 클럽 업데이트가 있습니다.',
          type: 'info',
        });
      }
    });

    // 시스템 공지
    socketRef.current.on('system:announcement', (announcement) => {
      console.log('📢 시스템 공지 수신:', announcement);
      
      showMessage({
        message: announcement.title || '시스템 공지',
        description: announcement.message,
        type: announcement.priority === 'urgent' ? 'danger' : 'warning',
        duration: 6000,
      });
    });

    // 채팅 메시지 수신 (게임룸, 클럽룸)
    socketRef.current.on('chat:message', (message) => {
      console.log('💬 채팅 메시지 수신:', message);
      // 채팅 화면에서 별도 처리
    });

    // 에러 처리
    socketRef.current.on('error', (error) => {
      console.error('⚠️ 소켓 에러:', error);
      
      showMessage({
        message: '연결 오류',
        description: error.message || '서버와의 연결에 문제가 발생했습니다.',
        type: 'danger',
      });
    });
  };

  // 소켓 연결 해제
  const disconnectSocket = () => {
    if (socketRef.current) {
      console.log('🔌 소켓 연결 해제');
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setOnlineUsers([]);
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  // 인증 상태 변경 시 소켓 연결/해제
  useEffect(() => {
    if (isAuthenticated && token) {
      // 약간의 지연 후 연결 (인증 정보 안정화)
      reconnectTimeoutRef.current = setTimeout(() => {
        connectSocket();
      }, 1000);
    } else {
      disconnectSocket();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isAuthenticated, token]);

  // 앱 상태 변경 시 소켓 관리
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active' && isAuthenticated && !isConnected) {
        // 앱이 포그라운드로 돌아왔을 때 재연결
        connectSocket();
      } else if (nextAppState === 'background') {
        // 백그라운드로 갈 때는 연결 유지 (알림 수신 위해)
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isAuthenticated, isConnected]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  // 게임룸 입장
  const joinGameRoom = (gameId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('game:join', { gameId });
      console.log(`🏸 게임룸 입장: ${gameId}`);
    }
  };

  // 게임룸 퇴장
  const leaveGameRoom = (gameId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('game:leave', { gameId });
      console.log(`🏸 게임룸 퇴장: ${gameId}`);
    }
  };

  // 클럽룸 입장
  const joinClubRoom = (clubId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('club:join', { clubId });
      console.log(`🏢 클럽룸 입장: ${clubId}`);
    }
  };

  // 클럽룸 퇴장
  const leaveClubRoom = (clubId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('club:leave', { clubId });
      console.log(`🏢 클럽룸 퇴장: ${clubId}`);
    }
  };

  // 채팅 메시지 전송
  const sendChatMessage = (roomType, roomId, message) => {
    if (socketRef.current?.connected) {
      const chatData = {
        roomType, // 'game' or 'club'
        roomId,
        message,
        timestamp: new Date().toISOString(),
      };

      socketRef.current.emit('chat:send', chatData);
      console.log(`💬 채팅 메시지 전송 (${roomType}:${roomId}):`, message);
      return true;
    }
    return false;
  };

  // 온라인 상태 업데이트
  const updateOnlineStatus = (status = 'online') => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('user:status', { status });
    }
  };

  // 알림 읽음 처리
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // 모든 알림 읽음 처리
  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  // 알림 삭제
  const removeNotification = (notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  };

  // 이벤트 리스너 등록
  const addEventListener = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
      return () => socketRef.current?.off(event, callback);
    }
    return () => {};
  };

  // 이벤트 리스너 제거
  const removeEventListener = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  const value = {
    // 상태
    isConnected,
    onlineUsers,
    notifications,
    unreadCount,
    
    // 연결 관리
    connectSocket,
    disconnectSocket,
    
    // 룸 관리
    joinGameRoom,
    leaveGameRoom,
    joinClubRoom,
    leaveClubRoom,
    
    // 채팅
    sendChatMessage,
    
    // 상태 관리
    updateOnlineStatus,
    
    // 알림 관리
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    
    // 이벤트 관리
    addEventListener,
    removeEventListener,
    
    // 소켓 인스턴스 (고급 사용)
    socket: socketRef.current,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// 소켓 컨텍스트 사용 훅
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;