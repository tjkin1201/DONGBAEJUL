import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { 
  Text, 
  TextInput,
  Avatar,
  Surface,
  IconButton,
  ActivityIndicator,
  Chip
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { chatAPI } from '../../services/api';
import theme from '../../utils/theme';

const ChatScreen = ({ route, navigation }) => {
  const { roomId, roomName, roomType } = route.params;
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({
      title: roomName || '채팅',
    });

    loadMessages();
    joinChatRoom();

    return () => {
      leaveChatRoom();
    };
  }, [roomId]);

  useEffect(() => {
    if (socket) {
      socket.on('chat:message', handleNewMessage);
      socket.on('chat:user_joined', handleUserJoined);
      socket.on('chat:user_left', handleUserLeft);

      return () => {
        socket.off('chat:message');
        socket.off('chat:user_joined');
        socket.off('chat:user_left');
      };
    }
  }, [socket]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await chatAPI.getMessages(roomId);
      setMessages(response.data.data || []);
    } catch (error) {
      console.error('메시지 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const joinChatRoom = () => {
    if (socket) {
      socket.emit('join_chat_room', { roomId, roomType });
    }
  };

  const leaveChatRoom = () => {
    if (socket) {
      socket.emit('leave_chat_room', { roomId });
    }
  };

  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message]);
    scrollToBottom();
  };

  const handleUserJoined = (data) => {
    const systemMessage = {
      _id: `system_${Date.now()}`,
      type: 'system',
      content: `${data.user.name}님이 입장했습니다.`,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const handleUserLeft = (data) => {
    const systemMessage = {
      _id: `system_${Date.now()}`,
      type: 'system',
      content: `${data.user.name}님이 퇴장했습니다.`,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      const messageData = {
        roomId,
        content: newMessage.trim(),
        type: 'text',
      };

      await chatAPI.sendMessage(messageData);
      setNewMessage('');
    } catch (error) {
      console.error('메시지 전송 오류:', error);
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return '오늘';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === yesterday.toDateString()) {
      return '어제';
    }
    
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
    });
  };

  const renderDateSeparator = (date) => (
    <View style={styles.dateSeparator}>
      <View style={styles.dateLine} />
      <Chip mode="outlined" style={styles.dateChip}>
        {formatDate(date)}
      </Chip>
      <View style={styles.dateLine} />
    </View>
  );

  const renderSystemMessage = (message) => (
    <View style={styles.systemMessageContainer}>
      <Text style={styles.systemMessage}>{message.content}</Text>
    </View>
  );

  const renderUserMessage = (message) => {
    const isMyMessage = message.sender._id === user?.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
      ]}>
        {!isMyMessage && (
          <Avatar.Image
            size={36}
            source={{ uri: message.sender.profileImage || 'https://via.placeholder.com/36' }}
            style={styles.avatar}
          />
        )}
        
        <View style={[
          styles.messageContent,
          isMyMessage ? styles.myMessageContent : styles.otherMessageContent
        ]}>
          {!isMyMessage && (
            <Text style={styles.senderName}>{message.sender.name}</Text>
          )}
          
          <Surface style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
          ]} elevation={1}>
            <Text style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText
            ]}>
              {message.content}
            </Text>
          </Surface>
          
          <Text style={[
            styles.messageTime,
            isMyMessage ? styles.myMessageTime : styles.otherMessageTime
          ]}>
            {formatTime(message.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  const renderMessage = ({ item: message, index }) => {
    const showDateSeparator = index === 0 || 
      new Date(message.createdAt).toDateString() !== 
      new Date(messages[index - 1]?.createdAt).toDateString();

    return (
      <View>
        {showDateSeparator && renderDateSeparator(message.createdAt)}
        
        {message.type === 'system' 
          ? renderSystemMessage(message)
          : renderUserMessage(message)
        }
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>채팅을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderMessage}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={scrollToBottom}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputContainer}>
          <TextInput
            mode="outlined"
            placeholder="메시지를 입력하세요..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
            style={styles.textInput}
            contentStyle={styles.textInputContent}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <IconButton
            icon="send"
            size={24}
            onPress={sendMessage}
            disabled={!newMessage.trim() || isSending}
            style={[
              styles.sendButton,
              (!newMessage.trim() || isSending) && styles.sendButtonDisabled
            ]}
            iconColor={
              !newMessage.trim() || isSending 
                ? theme.colors.outline 
                : theme.colors.surface
            }
          />
        </View>
      </KeyboardAvoidingView>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.outline,
  },
  dateChip: {
    marginHorizontal: theme.spacing.md,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
  },
  systemMessage: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: theme.spacing.xs,
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginRight: theme.spacing.sm,
    alignSelf: 'flex-end',
  },
  messageContent: {
    maxWidth: '75%',
  },
  myMessageContent: {
    alignItems: 'flex-end',
  },
  otherMessageContent: {
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.7,
    marginBottom: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  messageBubble: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.roundness * 2,
    marginBottom: theme.spacing.xs,
  },
  myMessageBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: theme.spacing.xs,
  },
  otherMessageBubble: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: theme.spacing.xs,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: theme.colors.surface,
  },
  otherMessageText: {
    color: theme.colors.text,
  },
  messageTime: {
    fontSize: 11,
    opacity: 0.7,
  },
  myMessageTime: {
    color: theme.colors.text,
    textAlign: 'right',
  },
  otherMessageTime: {
    color: theme.colors.text,
    textAlign: 'left',
    marginLeft: theme.spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    marginRight: theme.spacing.sm,
  },
  textInputContent: {
    paddingTop: theme.spacing.sm,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    margin: 0,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.outline,
  },
});

export default ChatScreen;