// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { View, FlatList, Alert, StyleSheet } from 'react-native';
// eslint-disable-next-line no-unused-vars
import { Card, Title, Paragraph, Button, IconButton, Chip, Switch } from 'react-native-paper';
import adminService from '../../services/AdminService';
import boardService from '../../services/BoardService';
import { useAuth } from '../../context/AuthContext';

const PostManagement = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      await adminService.initialize();
      await boardService.initialize();
      
      const result = await boardService.getPosts({ page: 1, limit: 50 });
      setPosts(result.posts);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      Alert.alert('오류', '게시글 로드 실패');
    } finally {
      setLoading(false);
    }
  };

  const togglePin = async (postId, currentPinned) => {
    try {
      await adminService.togglePostPin(postId, user, boardService);
      loadPosts();
      Alert.alert('성공', currentPinned ? '핀 해제됨' : '핀 고정됨');
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      Alert.alert('오류', '핀 상태 변경 실패');
    }
  };

  const deletePost = async (postId, title) => {
    Alert.alert(
      '게시글 삭제',
      `"${title}" 게시글을 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.forceDeletePost(postId, '관리자 삭제', user, boardService);
              loadPosts();
              Alert.alert('성공', '게시글이 삭제되었습니다');
            // eslint-disable-next-line no-unused-vars
            } catch (error) {
              Alert.alert('오류', '게시글 삭제 실패');
            }
          }
        }
      ]
    );
  };

  const renderPost = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Title style={styles.title}>{item.title}</Title>
            {item.isPinned && <Chip mode="outlined">고정</Chip>}
          </View>
          <IconButton
            icon="delete"
            size={20}
            onPress={() => deletePost(item.id, item.title)}
          />
        </View>
        
        <Paragraph numberOfLines={2}>{item.content}</Paragraph>
        
        <View style={styles.controls}>
          <View style={styles.pinControl}>
            <Paragraph>핀 고정</Paragraph>
            <Switch
              value={item.isPinned}
              onValueChange={() => togglePin(item.id, item.isPinned)}
            />
          </View>
          <Paragraph style={styles.author}>작성자: {item.authorName}</Paragraph>
        </View>
      </Card.Content>
    </Card>
  );

  if (!adminService.isAdmin(user?.role)) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>접근 권한 없음</Title>
            <Paragraph>관리자 권한이 필요합니다.</Paragraph>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  pinControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  author: {
    fontSize: 12,
    color: '#666',
  },
});

export default PostManagement;
