import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import {
  Text,
  Card,
  Avatar,
  Button,
  Divider,
  Snackbar,
  TextInput,
  IconButton,
  Menu,
  Chip,
  Surface,
  ActivityIndicator
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import boardService from '../../services/BoardService';
import imageService from '../../services/ImageService';
import ImageGallery from '../../components/common/ImageGallery';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

const PostDetailScreen = ({ route, navigation }) => {
  const { user } = useAuth();
  const { postId, onPostUpdated, onPostDeleted } = route.params || {};
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [commentSortOrder, setCommentSortOrder] = useState('asc');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [postLiked, setPostLiked] = useState(false);
  const [postDisliked, setPostDisliked] = useState(false);
  const [postImages, setPostImages] = useState([]);

  useEffect(() => {
    loadPost();
    loadComments();
  }, [postId]);

  useEffect(() => {
    if (post) {
      loadPostImages();
    }
  }, [post]);

  useEffect(() => {
    if (post && user) {
      const likedBy = post.likedBy || new Set();
      const dislikedBy = post.dislikedBy || new Set();
      setPostLiked(likedBy.has(user.id));
      setPostDisliked(dislikedBy.has(user.id));
    }
  }, [post, user]);

  const loadPostImages = async () => {
    if (!post?.id) return;
    
    try {
      await imageService.initialize();
      const images = await imageService.getImagesByPostId(post.id);
      setPostImages(images);
    } catch {
      // 이미지 로드 실패는 무시
    }
  };

  const loadPost = async () => {
    try {
      await boardService.initialize();
      const postData = await boardService.getPost(postId, user?.id);
      setPost(postData);
    } catch {
      showSnackbar('게시글을 불러오는데 실패했습니다.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const loadComments = useCallback(async () => {
    try {
      const result = await boardService.getComments(postId, {
        sortOrder: commentSortOrder
      });
      setComments(result.comments);
    } catch {
      // 댓글 로드 실패는 무시
    }
  }, [postId, commentSortOrder]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleDelete = async () => {
    Alert.alert(
      '게시글 삭제',
      '정말로 이 게시글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await boardService.deletePost(postId, user);
              showSnackbar('게시글이 삭제되었습니다.');
              if (onPostDeleted) {
                onPostDeleted();
              }
              navigation.goBack();
            } catch {
              showSnackbar('게시글 삭제에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  const handlePostLike = async () => {
    try {
      const result = await boardService.togglePostLike(postId, user);
      setPostLiked(result.liked);
      setPost(prev => ({
        ...prev,
        stats: { ...prev.stats, likes: result.likesCount }
      }));
      if (postDisliked) {
        setPostDisliked(false);
      }
    } catch {
      showSnackbar('좋아요 처리에 실패했습니다.');
    }
  };

  const handlePostDislike = async () => {
    try {
      const result = await boardService.togglePostDislike(postId, user);
      setPostDisliked(result.disliked);
      setPost(prev => ({
        ...prev,
        stats: { ...prev.stats, dislikes: result.dislikesCount }
      }));
      if (postLiked) {
        setPostLiked(false);
      }
    } catch {
      showSnackbar('싫어요 처리에 실패했습니다.');
    }
  };

  const handleCommentLike = async (commentId) => {
    try {
      const result = await boardService.toggleCommentLike(commentId, user);
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, stats: { ...comment.stats, likes: result.likesCount } }
          : comment
      ));
    } catch {
      showSnackbar('댓글 좋아요 처리에 실패했습니다.');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      showSnackbar('댓글 내용을 입력해주세요.');
      return;
    }

    setCommenting(true);

    try {
      const commentData = {
        content: newComment.trim(),
        parentCommentId: replyingTo?.id || null
      };

      await boardService.createComment(postId, commentData, user);
      setNewComment('');
      setReplyingTo(null);
      await loadComments();
      
      // 게시글 댓글 수 업데이트
      setPost(prev => ({
        ...prev,
        stats: { ...prev.stats, comments: prev.stats.comments + 1 }
      }));
      
      showSnackbar('댓글이 작성되었습니다.');
    } catch {
      showSnackbar('댓글 작성에 실패했습니다.');
    } finally {
      setCommenting(false);
    }
  };

  const handleReply = (comment) => {
    setReplyingTo(comment);
    setNewComment(`@${comment.authorName} `);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setNewComment('');
  };

  // 댓글을 계층구조로 정리
  const organizedComments = useMemo(() => {
    const rootComments = comments.filter(c => !c.parentCommentId);
    const childComments = comments.filter(c => c.parentCommentId);
    
    return rootComments.map(rootComment => ({
      ...rootComment,
      replies: childComments.filter(c => c.parentCommentId === rootComment.id)
    }));
  }, [comments]);

  const renderComment = (comment, isReply = false) => {
    const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
      addSuffix: true,
      locale: ko
    });

    const commentLiked = comment.likedBy?.has?.(user?.id) || false;

    return (
      <View key={comment.id} style={{ 
        marginLeft: isReply ? 20 : 0, 
        marginVertical: 8,
        paddingLeft: isReply ? 12 : 0,
        borderLeftWidth: isReply ? 2 : 0,
        borderLeftColor: isReply ? '#e0e0e0' : 'transparent'
      }}>
        <View style={{ flexDirection: 'row' }}>
          <Avatar.Text
            size={isReply ? 28 : 32}
            label={comment.authorName?.[0] || 'U'}
            style={{ marginRight: 8 }}
          />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Text variant="bodyMedium" style={{ fontWeight: '500', marginRight: 8 }}>
                {comment.authorName}
              </Text>
              <Text variant="bodySmall" style={{ color: '#666' }}>
                {timeAgo}
              </Text>
            </View>
            
            <Text variant="bodyMedium" style={{ lineHeight: 20, marginBottom: 8 }}>
              {comment.content}
            </Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconButton
                icon={commentLiked ? "heart" : "heart-outline"}
                iconColor={commentLiked ? "#e74c3c" : "#666"}
                size={16}
                style={{ margin: 0 }}
                onPress={() => handleCommentLike(comment.id)}
              />
              <Text style={{ fontSize: 12, color: '#666', marginRight: 12 }}>
                {comment.stats.likes}
              </Text>
              
              {!isReply && (
                <Button
                  mode="text"
                  compact
                  onPress={() => handleReply(comment)}
                  textColor="#666"
                  style={{ height: 24 }}
                >
                  답글
                </Button>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>로딩 중...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>게시글을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: ko
  });

  const canDelete = user && (user.id === post.authorId || user.role === 'admin');
  const category = boardService.getCategory(post.categoryId);

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        {/* 게시글 내용 */}
        <Card style={{ margin: 16 }}>
          <Card.Content style={{ padding: 16 }}>
            {/* 카테고리 */}
            {category && (
              <Chip
                mode="outlined"
                compact
                style={{
                  backgroundColor: category.color + '20',
                  borderColor: category.color,
                  marginBottom: 12,
                  alignSelf: 'flex-start'
                }}
                textStyle={{ color: category.color, fontSize: 11 }}
              >
                {category.name}
              </Chip>
            )}

            {/* 제목 */}
            <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginBottom: 12 }}>
              {post.title}
            </Text>

            {/* 작성자 정보 */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Avatar.Text
                size={40}
                label={post.authorName?.[0] || 'U'}
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
                  {post.authorName}
                </Text>
                <Text variant="bodySmall" style={{ color: '#666' }}>
                  {timeAgo} · 조회 {post.stats.views}
                </Text>
              </View>
            </View>

            <Divider style={{ marginBottom: 16 }} />

            {/* 내용 */}
            <Text variant="bodyMedium" style={{ lineHeight: 22, marginBottom: 16 }}>
              {post.content}
            </Text>

            {/* 첨부 이미지 */}
            {postImages.length > 0 && (
              <ImageGallery
                images={postImages}
                editable={false}
                showUploadProgress={false}
                maxHeight={300}
                style={{ marginBottom: 16 }}
              />
            )}

            {/* 태그 */}
            {post.tags && post.tags.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
                {post.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    mode="outlined"
                    compact
                    style={{ margin: 2 }}
                    textStyle={{ fontSize: 10 }}
                  >
                    #{tag}
                  </Chip>
                ))}
              </View>
            )}

            {/* 좋아요/싫어요 버튼 */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: '#f0f0f0'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <IconButton
                  icon={postLiked ? "thumb-up" : "thumb-up-outline"}
                  iconColor={postLiked ? "#2196f3" : "#666"}
                  onPress={handlePostLike}
                />
                <Text style={{ fontSize: 14, marginRight: 16 }}>
                  {post.stats.likes}
                </Text>
                
                <IconButton
                  icon={postDisliked ? "thumb-down" : "thumb-down-outline"}
                  iconColor={postDisliked ? "#f44336" : "#666"}
                  onPress={handlePostDislike}
                />
                <Text style={{ fontSize: 14, marginRight: 16 }}>
                  {post.stats.dislikes}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="comment" size={16} color="#666" />
                  <Text style={{ fontSize: 12, color: '#666', marginLeft: 4 }}>
                    {post.stats.comments}
                  </Text>
                </View>
              </View>
              
              {canDelete && (
                <Button
                  mode="text"
                  onPress={handleDelete}
                  textColor="#e74c3c"
                  compact
                >
                  삭제
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* 댓글 섹션 */}
        <Card style={{ margin: 16, marginTop: 0 }}>
          <Card.Content style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text variant="titleMedium">
                댓글 ({comments.length})
              </Text>
              
              <Menu
                visible={sortMenuVisible}
                onDismiss={() => setSortMenuVisible(false)}
                anchor={
                  <IconButton
                    icon="sort"
                    onPress={() => setSortMenuVisible(true)}
                    iconColor="#666"
                  />
                }
              >
                <Menu.Item
                  onPress={() => {
                    setCommentSortOrder('asc');
                    setSortMenuVisible(false);
                  }}
                  title="오래된 순"
                  leadingIcon={commentSortOrder === 'asc' ? "check" : undefined}
                />
                <Menu.Item
                  onPress={() => {
                    setCommentSortOrder('desc');
                    setSortMenuVisible(false);
                  }}
                  title="최신 순"
                  leadingIcon={commentSortOrder === 'desc' ? "check" : undefined}
                />
              </Menu>
            </View>

            {/* 댓글 입력 */}
            <Surface style={{ padding: 12, borderRadius: 8, marginBottom: 16 }}>
              {replyingTo && (
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  marginBottom: 8,
                  padding: 8,
                  backgroundColor: '#f0f0f0',
                  borderRadius: 4
                }}>
                  <Text style={{ flex: 1, fontSize: 12, color: '#666' }}>
                    {replyingTo.authorName}님에게 답글 작성 중
                  </Text>
                  <IconButton
                    icon="close"
                    size={16}
                    onPress={handleCancelReply}
                  />
                </View>
              )}
              
              <TextInput
                placeholder="댓글을 작성해주세요..."
                value={newComment}
                onChangeText={setNewComment}
                multiline
                mode="outlined"
                style={{ marginBottom: 8 }}
                disabled={commenting}
              />
              
              <Button
                mode="contained"
                onPress={handleAddComment}
                disabled={commenting || !newComment.trim()}
                loading={commenting}
                compact
              >
                {replyingTo ? '답글 작성' : '댓글 작성'}
              </Button>
            </Surface>

            {/* 댓글 목록 */}
            {organizedComments.map((comment) => (
              <View key={comment.id}>
                {renderComment(comment)}
                {comment.replies && comment.replies.map((reply) => 
                  renderComment(reply, true)
                )}
                {comment !== organizedComments[organizedComments.length - 1] && (
                  <Divider style={{ marginVertical: 8 }} />
                )}
              </View>
            ))}

            {comments.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <Icon name="comment-outline" size={48} color="#ccc" />
                <Text style={{ marginTop: 8, color: '#666' }}>
                  첫 번째 댓글을 작성해보세요!
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* 스낵바 */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ marginBottom: Platform.OS === 'ios' ? 34 : 0 }}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

export default PostDetailScreen;
