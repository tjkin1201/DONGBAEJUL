import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Text
} from 'react-native';
import {
  Appbar,
  useTheme,
  Portal,
  Modal,
  Button,
  Divider,
  IconButton,
  Badge
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import MessageBubble from '../../components/chat/MessageBubble';
import TypingIndicator from '../../components/chat/TypingIndicator';
import ChatInput from '../../components/chat/ChatInput';
import ChatService from '../../services/ChatService';
import { useSocket } from '../../context/NewSocketContext';
import { useAuth } from '../../context/SimpleAuthContext';

const { height: screenHeight } = Dimensions.get('window');

const ChatScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isConnected, connectionState } = useSocket();
  
  // Route params
  const { roomId = 'main', roomName = '전체 채팅', roomType = 'group' } = route.params || {};
  
  // State
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Refs
  const flatListRef = useRef(null);
  const keyboardDidShowListener = useRef(null);
  const keyboardDidHideListener = useRef(null);

  // Initialize chat
  useEffect(() => {
    initializeChat();
    return () => {
      cleanup();
    };
  }, [roomId]);

  // Handle connection state
  useEffect(() => {
    if (connectionState === 'connected') {
      setShowConnectionModal(false);
      joinRoom();
    } else if (connectionState === 'failed' || connectionState === 'error') {
      setShowConnectionModal(true);
    }
  }, [connectionState]);

  // Focus effect for marking messages as read
  useFocusEffect(
    useCallback(() => {
      markRoomAsRead();
      return () => {
        // 화면을 떠날 때 타이핑 중단
        ChatService.sendTypingIndicator(roomId, false);
      };
    }, [roomId])
  );

  // Keyboard listeners
  useEffect(() => {
    keyboardDidShowListener.current = Keyboard.addListener(
      'keyboardDidShow',
      scrollToBottom
    );
    keyboardDidHideListener.current = Keyboard.addListener(
      'keyboardDidHide',
      scrollToBottom
    );

    return () => {
      keyboardDidShowListener.current?.remove();
      keyboardDidHideListener.current?.remove();
    };
  }, []);

  const initializeChat = async () => {
    try {
      setLoading(true);
      
      // Initialize ChatService
      await ChatService.initialize();
      
      // Setup listeners
      setupMessageListeners();
      
      // Join room if connected
      if (isConnected) {
        await joinRoom();
      }
      
      // Load existing messages
      loadMessages();
      
    } catch (error) {
      Alert.alert('오류', '채팅을 초기화하는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    try {
      await ChatService.joinRoom(roomId, {
        name: roomName,
        type: roomType,
        userId: user?.id
      });
    } catch (error) {
      Alert.alert('오류', '채팅방에 입장할 수 없습니다.');
    }
  };

  const setupMessageListeners = () => {
    // Message listener
    ChatService.addMessageListener((roomId, message) => {
      if (roomId === roomId) {
        setMessages(prev => {
          // 중복 메시지 방지
          const exists = prev.find(m => m.id === message.id);
          if (exists) {
            return prev.map(m => m.id === message.id ? message : m);
          }
          return [...prev, message];
        });
        scrollToBottom();
      }
    });

    // Typing listener
    ChatService.addTypingListener((data) => {
      if (data.roomId === roomId && data.userId !== user?.id) {
        setTypingUsers(prev => {
          if (data.isTyping) {
            const exists = prev.find(u => u.id === data.userId);
            if (!exists) {
              return [...prev, {
                id: data.userId,
                name: data.userName,
                avatar: data.userAvatar
              }];
            }
          } else {
            return prev.filter(u => u.id !== data.userId);
          }
          return prev;
        });
      }
    });

    // Online users listener
    ChatService.addOnlineUsersListener((data) => {
      if (data.roomId === roomId) {
        setOnlineUsers(data.users || []);
      }
    });
  };

  const loadMessages = () => {
    const roomMessages = ChatService.getRoomMessages(roomId);
    setMessages(roomMessages);
    
    // Update unread count
    const metadata = ChatService.getRoomMetadata(roomId);
    setUnreadCount(ChatService.getUnreadCount(roomId));
    
    setTimeout(scrollToBottom, 100);
  };

  const handleSendMessage = async (messageData) => {
    try {
      await ChatService.sendMessage(
        roomId,
        messageData.content,
        messageData.messageType,
        messageData.attachments || []
      );
      scrollToBottom();
    } catch (error) {
      Alert.alert('오류', '메시지를 전송할 수 없습니다.');
    }
  };

  const handleTyping = (isTyping) => {
    ChatService.sendTypingIndicator(roomId, isTyping);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Load more message history
      const oldestMessage = messages[0];
      const before = oldestMessage?.timestamp;
      
      const olderMessages = await ChatService.requestMessageHistory(
        roomId, 
        before, 
        20
      );
      
      if (olderMessages.length > 0) {
        setMessages(prev => [...olderMessages, ...prev]);
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setRefreshing(false);
    }
  };

  const markRoomAsRead = async () => {
    await ChatService.markRoomAsRead(roomId);
    setUnreadCount(0);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleRetryMessage = async (message) => {
    try {
      await ChatService.retryFailedMessage(roomId, message.id);
    } catch (error) {
      Alert.alert('재전송 실패', '메시지를 다시 전송할 수 없습니다.');
    }
  };

  const handleMessageLongPress = (message) => {
    Alert.alert(
      '메시지 옵션',
      '',
      [
        { text: '취소', style: 'cancel' },
        { text: '복사', onPress: () => copyMessage(message) },
        ...(message.isOwn ? [
          { text: '삭제', onPress: () => deleteMessage(message), style: 'destructive' }
        ] : [])
      ]
    );
  };

  const copyMessage = (message) => {
    // Clipboard implementation
    Alert.alert('알림', '메시지가 복사되었습니다.');
  };

  const deleteMessage = (message) => {
    Alert.alert(
      '메시지 삭제',
      '이 메시지를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', onPress: () => confirmDeleteMessage(message), style: 'destructive' }
      ]
    );
  };

  const confirmDeleteMessage = async (message) => {
    // Delete message implementation
    setMessages(prev => prev.filter(m => m.id !== message.id));
  };

  const cleanup = () => {
    ChatService.removeMessageListener(() => {});
    ChatService.removeTypingListener(() => {});
    ChatService.removeOnlineUsersListener(() => {});
  };

  const renderMessage = ({ item: message, index }) => {
    const isOwn = message.senderId === user?.id || message.isOwn;
    const prevMessage = messages[index - 1];
    const nextMessage = messages[index + 1];
    
    // Show avatar only for first message in a group from same user
    const showAvatar = !prevMessage || 
      prevMessage.senderId !== message.senderId ||
      (new Date(message.timestamp) - new Date(prevMessage.timestamp)) > 300000; // 5 minutes
    
    // Show timestamp only for last message in a group or time difference > 5 minutes
    const showTimestamp = !nextMessage || 
      nextMessage.senderId !== message.senderId ||
      (new Date(nextMessage.timestamp) - new Date(message.timestamp)) > 300000;

    return (
      <MessageBubble
        message={message}
        isOwn={isOwn}
        showAvatar={showAvatar}
        showTimestamp={showTimestamp}
        onRetry={handleRetryMessage}
        onLongPress={handleMessageLongPress}
      />
    );
  };

  // Handle viewable messages for read receipts
  const handleViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (!user?.id) return;

    const unreadMessageIds = viewableItems
      .map(item => item.item)
      .filter(message => 
        message.senderId !== user.id && // Not my message
        message.status !== 'read' && // Not already read
        !message.isOwn // Double check it's not my message
      )
      .map(message => message.id);

    if (unreadMessageIds.length > 0) {
      // Mark messages as read locally
      unreadMessageIds.forEach(messageId => {
        ChatService.markMessageAsRead(roomId, messageId);
      });

      // Send read receipts to server
      ChatService.sendBatchReadReceipts(roomId, unreadMessageIds);
    }
  }, [roomId, user?.id]);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80,
    minimumViewTime: 1000
  };

  const renderConnectionModal = () => (
    <Portal>
      <Modal
        visible={showConnectionModal}
        dismissable={false}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: theme.colors.surface }
        ]}
      >
        <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
          연결 실패
        </Text>
        <Text style={[styles.modalContent, { color: theme.colors.onSurface }]}>
          채팅 서버에 연결할 수 없습니다.
          네트워크 연결을 확인해주세요.
        </Text>
        <Divider style={styles.modalDivider} />
        <View style={styles.modalButtons}>
          <Button mode="outlined" onPress={() => navigation.goBack()}>
            돌아가기
          </Button>
          <Button mode="contained" onPress={() => {}}>
            재연결
          </Button>
        </View>
      </Modal>
    </Portal>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={roomName} />
        <View style={styles.headerRight}>
          {!isConnected && (
            <IconButton
              icon="wifi-off"
              iconColor={theme.colors.error}
              size={20}
            />
          )}
          {onlineUsers.length > 0 && (
            <View style={styles.onlineIndicator}>
              <IconButton
                icon="account-multiple"
                iconColor={theme.colors.primary}
                size={20}
              />
              <Badge size={16} style={styles.onlineBadge}>
                {onlineUsers.length}
              </Badge>
            </View>
          )}
          <IconButton
            icon="message-text-outline"
            iconColor={theme.colors.primary}
            size={20}
            onPress={() => navigation.navigate('Conversations')}
          />
        </View>
      </Appbar.Header>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListFooterComponent={() => (
          <TypingIndicator typingUsers={typingUsers} />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.outline }]}>
              아직 메시지가 없습니다. 첫 메시지를 보내보세요!
            </Text>
          </View>
        )}
        onContentSizeChange={scrollToBottom}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        maxToRenderPerBatch={20}
        windowSize={10}
        removeClippedSubviews={true}
      />

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        disabled={!isConnected}
        placeholder={isConnected ? "메시지를 입력하세요..." : "연결 중..."}
      />

      {/* Connection Modal */}
      {renderConnectionModal()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'relative',
  },
  onlineBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingVertical: 8,
  },
  modalContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  modalDivider: {
    marginVertical: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});

export default ChatScreen;
