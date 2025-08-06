// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { View, FlatList, StyleSheet } from 'react-native';
// eslint-disable-next-line no-unused-vars
import { Card, Title, Paragraph, Button, FAB, Chip, Text } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import boardService from '../../services/BoardService';
import adminService from '../../services/AdminService';

const BoardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      await boardService.initialize();
      const result = await boardService.getPosts({ page: 1, limit: 20 });
      setPosts(result.posts);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      // 로드 실패 시 빈 배열 유지
    } finally {
      setLoading(false);
    }
  };

  const navigateToPost = (post) => {
    navigation.navigate('PostDetail', { postId: post.id });
  };

  const renderPost = ({ item }) => (
    <Card style={styles.card} onPress={() => navigateToPost(item)}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Title style={styles.title}>{item.title}</Title>
            {item.isPinned && <Chip mode="outlined" compact>공지</Chip>}
          </View>
          <Text style={styles.author}>{item.authorName}</Text>
        </View>
        
        <Paragraph numberOfLines={2} style={styles.content}>
          {item.content}
        </Paragraph>
        
        <View style={styles.stats}>
          <Text style={styles.statText}>조회 {item.stats?.views || 0}</Text>
          <Text style={styles.statText}>좋아요 {item.stats?.likes || 0}</Text>
          <Text style={styles.statText}>댓글 {item.stats?.comments || 0}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* 관리자 버튼 */}
      {adminService.isAdmin(user?.role) && (
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('AdminDashboard')}
          style={styles.adminButton}
          icon="shield-account"
        >
          관리자 메뉴
        </Button>
      )}

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CreatePost')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  adminButton: {
    margin: 16,
    marginBottom: 8,
  },
  list: {
    padding: 16,
    paddingTop: 8,
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
    flex: 1,
  },
  author: {
    fontSize: 12,
    color: '#666',
  },
  content: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    fontSize: 12,
    color: '#888',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976d2',
  },
});

export default BoardScreen;
