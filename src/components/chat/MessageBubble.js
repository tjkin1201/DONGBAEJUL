import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Avatar, IconButton, useTheme } from 'react-native-paper';
import { format, isToday, isYesterday } from 'date-fns';
import { ko } from 'date-fns/locale';

const MessageBubble = ({ 
  message, 
  isOwn, 
  showAvatar = true, 
  showTimestamp = true,
  onRetry,
  onLongPress 
}) => {
  const theme = useTheme();

  const formatMessageTime = (timestamp) => {
    const messageDate = new Date(timestamp);
    
    if (isToday(messageDate)) {
      return format(messageDate, 'HH:mm', { locale: ko });
    } else if (isYesterday(messageDate)) {
      return `어제 ${format(messageDate, 'HH:mm', { locale: ko })}`;
    } else {
      return format(messageDate, 'MM/dd HH:mm', { locale: ko });
    }
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return 'clock-outline';
      case 'sent':
        return 'check';
      case 'delivered':
        return 'check-all';
      case 'read':
        return 'check-all';
      case 'failed':
        return 'alert-circle-outline';
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (message.status) {
      case 'sending':
        return theme.colors.outline;
      case 'sent':
        return theme.colors.outline;
      case 'delivered':
        return theme.colors.primary;
      case 'read':
        return theme.colors.primary;
      case 'failed':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const renderMessageContent = () => {
    switch (message.messageType) {
      case 'text':
        return (
          <Text style={[
            styles.messageText,
            { color: isOwn ? '#FFFFFF' : theme.colors.onSurface }
          ]}>
            {message.content}
          </Text>
        );
      
      case 'image':
        return (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: message.content }} 
              style={styles.messageImage}
              resizeMode="cover"
            />
            {message.caption && (
              <Text style={[
                styles.imageCaption,
                { color: isOwn ? '#FFFFFF' : theme.colors.onSurface }
              ]}>
                {message.caption}
              </Text>
            )}
          </View>
        );
      
      case 'emoji':
        return (
          <Text style={styles.emojiMessage}>
            {message.content}
          </Text>
        );
      
      default:
        return (
          <Text style={[
            styles.messageText,
            { color: isOwn ? '#FFFFFF' : theme.colors.onSurface }
          ]}>
            {message.content}
          </Text>
        );
    }
  };

  return (
    <View style={[
      styles.messageContainer,
      isOwn ? styles.ownMessageContainer : styles.otherMessageContainer
    ]}>
      {/* 상대방 메시지일 때 아바타 표시 */}
      {!isOwn && showAvatar && (
        <View style={styles.avatarContainer}>
          {message.senderAvatar ? (
            <Avatar.Image 
              size={32} 
              source={{ uri: message.senderAvatar }}
            />
          ) : (
            <Avatar.Text 
              size={32} 
              label={message.senderName?.charAt(0) || 'U'}
              style={{ backgroundColor: theme.colors.primary }}
            />
          )}
        </View>
      )}

      <View style={[
        styles.messageBubble,
        isOwn ? [styles.ownBubble, { backgroundColor: theme.colors.primary }] : 
                [styles.otherBubble, { backgroundColor: theme.colors.surface }]
      ]}>
        {/* 상대방 메시지일 때 발신자 이름 */}
        {!isOwn && message.senderName && (
          <Text style={[
            styles.senderName,
            { color: theme.colors.primary }
          ]}>
            {message.senderName}
          </Text>
        )}

        {/* 메시지 내용 */}
        <TouchableOpacity
          onLongPress={() => onLongPress && onLongPress(message)}
          activeOpacity={0.8}
        >
          {renderMessageContent()}
        </TouchableOpacity>

        {/* 타임스탬프와 상태 */}
        <View style={[
          styles.messageFooter,
          isOwn ? styles.ownMessageFooter : styles.otherMessageFooter
        ]}>
          {showTimestamp && (
            <Text style={[
              styles.timestamp,
              { color: isOwn ? 'rgba(255,255,255,0.7)' : theme.colors.outline }
            ]}>
              {formatMessageTime(message.timestamp)}
            </Text>
          )}
          
          {/* 내 메시지일 때 상태 아이콘 */}
          {isOwn && getStatusIcon() && (
            <View style={styles.statusContainer}>
              {message.status === 'failed' ? (
                <TouchableOpacity onPress={() => onRetry && onRetry(message)}>
                  <IconButton
                    icon={getStatusIcon()}
                    size={14}
                    iconColor={getStatusColor()}
                    style={styles.statusIcon}
                  />
                </TouchableOpacity>
              ) : (
                <IconButton
                  icon={getStatusIcon()}
                  size={14}
                  iconColor={getStatusColor()}
                  style={styles.statusIcon}
                />
              )}
              {/* Read indicator for read messages */}
              {message.status === 'read' && (
                <View style={styles.readIndicator}>
                  <Text style={[styles.readText, { color: theme.colors.primary }]}>
                    읽음
                  </Text>
                </View>
              )}
              {/* Delivery time for delivered/read messages */}
              {(message.status === 'delivered' || message.status === 'read') && message.deliveredAt && (
                <Text style={[styles.deliveryTime, { color: theme.colors.outline }]}>
                  {format(new Date(message.deliveredAt), 'HH:mm', { locale: ko })}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 2,
    paddingHorizontal: 16,
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  ownBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  imageContainer: {
    minWidth: 200,
  },
  messageImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  imageCaption: {
    fontSize: 14,
    marginTop: 8,
  },
  emojiMessage: {
    fontSize: 32,
    textAlign: 'center',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ownMessageFooter: {
    justifyContent: 'flex-end',
  },
  otherMessageFooter: {
    justifyContent: 'flex-start',
  },
  timestamp: {
    fontSize: 11,
    fontWeight: '400',
  },
  statusContainer: {
    marginLeft: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statusIcon: {
    margin: 0,
    padding: 0,
  },
  readIndicator: {
    marginLeft: 2,
  },
  readText: {
    fontSize: 9,
    fontWeight: '500',
  },
  deliveryTime: {
    fontSize: 9,
    marginLeft: 2,
  },
});

export default MessageBubble;
