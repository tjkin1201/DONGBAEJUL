import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Text
} from 'react-native';
import {
  Appbar,
  Avatar,
  Badge,
  useTheme,
  Searchbar,
  FAB,
  Portal,
  Modal,
  List,
  Divider,
  IconButton
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { format, isToday, isYesterday } from 'date-fns';
import { ko } from 'date-fns/locale';

import ChatService from '../../services/ChatService';
import { useAuth } from '../../context/SimpleAuthContext';
import { useSocket } from '../../context/NewSocketContext';

const ConversationsScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { isConnected } = useSocket();
  
  // State
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Load conversations on focus
  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [])
  );

  // Filter conversations when search query changes
  useEffect(() => {
    filterConversations();
  }, [searchQuery, conversations]);

  // Filter members when search query changes
  useEffect(() => {
    filterMembers();
  }, [memberSearchQuery, members]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      
      // Get all private conversations
      const allRooms = ChatService.getAllRooms();
      const privateConversations = allRooms.filter(room => 
        room.type === 'private' || room.id.startsWith('private_')
      );

      // Sort by last activity
      privateConversations.sort((a, b) => {
        const aTime = a.lastMessage?.timestamp || a.lastActivity || a.joinedAt;
        const bTime = b.lastMessage?.timestamp || b.lastActivity || b.joinedAt;
        return new Date(bTime) - new Date(aTime);
      });

      setConversations(privateConversations);
    } catch (error) {
      // Handle error gracefully
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      // In a real app, this would fetch from Band API or member service
      // For now, we'll use mock data
      const mockMembers = [
        { id: '1', name: '김철수', avatar: null, isOnline: true },
        { id: '2', name: '이영희', avatar: null, isOnline: false },
        { id: '3', name: '박민수', avatar: null, isOnline: true },
        { id: '4', name: '정수현', avatar: null, isOnline: false },
        { id: '5', name: '홍길동', avatar: null, isOnline: true },
      ].filter(member => member.id !== user?.id); // Exclude current user

      setMembers(mockMembers);
      setFilteredMembers(mockMembers);
    } catch (error) {
      // Handle error gracefully
    }
  };

  const filterConversations = () => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
      return;
    }

    const filtered = conversations.filter(conversation => {
      const participantName = conversation.participantName || conversation.name || '';
      const lastMessageContent = conversation.lastMessage?.content || '';
      
      return (
        participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lastMessageContent.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    setFilteredConversations(filtered);
  };

  const filterMembers = () => {
    if (!memberSearchQuery.trim()) {
      setFilteredMembers(members);
      return;
    }

    const filtered = members.filter(member =>
      member.name.toLowerCase().includes(memberSearchQuery.toLowerCase())
    );

    setFilteredMembers(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const messageDate = new Date(timestamp);
    
    if (isToday(messageDate)) {
      return format(messageDate, 'HH:mm', { locale: ko });
    } else if (isYesterday(messageDate)) {
      return '어제';
    } else {
      return format(messageDate, 'MM/dd', { locale: ko });
    }
  };

  const getPrivateRoomId = (otherUserId) => {
    const userIds = [user?.id, otherUserId].sort();
    return `private_${userIds.join('_')}`;
  };

  const startPrivateChat = async (member) => {
    try {
      const roomId = getPrivateRoomId(member.id);
      
      // Join the private room
      await ChatService.joinRoom(roomId, {
        name: member.name,
        type: 'private',
        participantId: member.id,
        participantName: member.name,
        participantAvatar: member.avatar
      });

      // Close modal and navigate to chat
      setShowNewChatModal(false);
      navigation.navigate('PrivateChat', {
        roomId,
        roomName: member.name,
        roomType: 'private',
        participantId: member.id,
        participantName: member.name,
        participantAvatar: member.avatar
      });
    } catch (error) {
      // Handle error
    }
  };

  const openConversation = (conversation) => {
    navigation.navigate('PrivateChat', {
      roomId: conversation.id,
      roomName: conversation.participantName || conversation.name,
      roomType: 'private',
      participantId: conversation.participantId,
      participantName: conversation.participantName,
      participantAvatar: conversation.participantAvatar
    });
  };

  const deleteConversation = async (conversationId) => {
    // Implement conversation deletion
    const updatedConversations = conversations.filter(c => c.id !== conversationId);
    setConversations(updatedConversations);
  };

  const renderConversation = ({ item: conversation }) => {
    const unreadCount = conversation.unreadCount || 0;
    const lastMessage = conversation.lastMessage;
    
    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          { backgroundColor: theme.colors.surface }
        ]}
        onPress={() => openConversation(conversation)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {conversation.participantAvatar ? (
            <Avatar.Image 
              size={50} 
              source={{ uri: conversation.participantAvatar }}
            />
          ) : (
            <Avatar.Text 
              size={50} 
              label={conversation.participantName?.charAt(0) || 'U'}
              style={{ backgroundColor: theme.colors.primary }}
            />
          )}
          {/* Online indicator would go here */}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text 
              style={[
                styles.participantName,
                { color: theme.colors.onSurface }
              ]}
              numberOfLines={1}
            >
              {conversation.participantName || conversation.name}
            </Text>
            
            <Text 
              style={[
                styles.lastMessageTime,
                { color: theme.colors.outline }
              ]}
            >
              {formatLastMessageTime(lastMessage?.timestamp)}
            </Text>
          </View>

          <View style={styles.lastMessageContainer}>
            <Text 
              style={[
                styles.lastMessage,
                { 
                  color: theme.colors.onSurface,
                  fontWeight: unreadCount > 0 ? '600' : '400'
                }
              ]}
              numberOfLines={1}
            >
              {lastMessage ? (
                lastMessage.messageType === 'image' ? '📷 사진' :
                lastMessage.messageType === 'emoji' ? lastMessage.content :
                lastMessage.content
              ) : '대화를 시작해보세요'}
            </Text>
            
            {unreadCount > 0 && (
              <Badge 
                size={20}
                style={[
                  styles.unreadBadge,
                  { backgroundColor: theme.colors.primary }
                ]}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </View>
        </View>

        <IconButton
          icon="dots-vertical"
          size={20}
          iconColor={theme.colors.outline}
          onPress={() => {
            // Show conversation options
          }}
        />
      </TouchableOpacity>
    );
  };

  const renderMember = ({ item: member }) => (
    <List.Item
      title={member.name}
      description={member.isOnline ? '온라인' : '오프라인'}
      left={(props) => (
        <View style={styles.memberAvatarContainer}>
          {member.avatar ? (
            <Avatar.Image {...props} size={40} source={{ uri: member.avatar }} />
          ) : (
            <Avatar.Text 
              {...props} 
              size={40} 
              label={member.name.charAt(0)}
              style={{ backgroundColor: theme.colors.primary }}
            />
          )}
          {member.isOnline && (
            <View style={[
              styles.onlineIndicator,
              { backgroundColor: theme.colors.primary }
            ]} />
          )}
        </View>
      )}
      onPress={() => startPrivateChat(member)}
    />
  );

  const renderNewChatModal = () => (
    <Portal>
      <Modal
        visible={showNewChatModal}
        onDismiss={() => setShowNewChatModal(false)}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: theme.colors.surface }
        ]}
      >
        <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
          새 채팅 시작
        </Text>
        
        <Searchbar
          placeholder="멤버 검색"
          onChangeText={setMemberSearchQuery}
          value={memberSearchQuery}
          style={styles.memberSearchbar}
        />

        <FlatList
          data={filteredMembers}
          renderItem={renderMember}
          keyExtractor={(item) => item.id}
          style={styles.membersList}
          ItemSeparatorComponent={() => <Divider />}
          showsVerticalScrollIndicator={false}
        />
      </Modal>
    </Portal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="채팅" />
        <Appbar.Action 
          icon="account-multiple-plus" 
          onPress={() => {
            setShowNewChatModal(true);
            loadMembers();
          }}
        />
      </Appbar.Header>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="대화 검색"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        style={styles.conversationsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.outline }]}>
              아직 대화가 없습니다.
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.outline }]}>
              + 버튼을 눌러 새 채팅을 시작해보세요.
            </Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={[
          styles.fab,
          { backgroundColor: theme.colors.primary }
        ]}
        onPress={() => {
          setShowNewChatModal(true);
          loadMembers();
        }}
      />

      {/* New Chat Modal */}
      {renderNewChatModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  avatarContainer: {
    marginRight: 12,
    position: 'relative',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  lastMessageTime: {
    fontSize: 12,
    marginLeft: 8,
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
  },
  unreadBadge: {
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    margin: 20,
    borderRadius: 8,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  memberSearchbar: {
    marginBottom: 16,
    elevation: 0,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  membersList: {
    maxHeight: 300,
  },
  memberAvatarContainer: {
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export default ConversationsScreen;
