import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class BoardService {
  constructor() {
    this.posts = new Map();
    this.comments = new Map();
    this.categories = new Map();
    this.initialized = false;
    this.listeners = new Set();
    
    this.POST_STATUS = {
      DRAFT: 'draft',
      PUBLISHED: 'published',
      DELETED: 'deleted',
      PINNED: 'pinned'
    };
    
    this.POST_CATEGORIES = {
      ANNOUNCEMENT: 'announcement',
      GENERAL: 'general',
      FREE_BOARD: 'free_board',
      NOTICE: 'notice'
    };
    
    this.USER_ROLES = {
      ADMIN: 'admin',
      MODERATOR: 'moderator',
      MEMBER: 'member'
    };
  }

  async initialize() {
    if (this.initialized) return;

    await this.loadCachedData();
    await this.initializeCategories();
    await this.initializeDemoData();
    
    this.initialized = true;
  }

  async loadCachedData() {
    try {
      const cachedPosts = await AsyncStorage.getItem('board_posts');
      if (cachedPosts) {
        const posts = JSON.parse(cachedPosts);
        Object.entries(posts).forEach(([postId, postData]) => {
          this.posts.set(postId, postData);
        });
      }

      const cachedComments = await AsyncStorage.getItem('board_comments');
      if (cachedComments) {
        const comments = JSON.parse(cachedComments);
        Object.entries(comments).forEach(([postId, commentList]) => {
          this.comments.set(postId, commentList);
        });
      }

      const cachedCategories = await AsyncStorage.getItem('board_categories');
      if (cachedCategories) {
        const categories = JSON.parse(cachedCategories);
        Object.entries(categories).forEach(([categoryId, categoryData]) => {
          this.categories.set(categoryId, categoryData);
        });
      }
    } catch {
      // Handle load error silently
    }
  }

  async saveDataToStorage() {
    try {
      const postsObject = {};
      this.posts.forEach((postData, postId) => {
        postsObject[postId] = postData;
      });
      await AsyncStorage.setItem('board_posts', JSON.stringify(postsObject));

      const commentsObject = {};
      this.comments.forEach((commentList, postId) => {
        commentsObject[postId] = commentList;
      });
      await AsyncStorage.setItem('board_comments', JSON.stringify(commentsObject));

      const categoriesObject = {};
      this.categories.forEach((categoryData, categoryId) => {
        categoriesObject[categoryId] = categoryData;
      });
      await AsyncStorage.setItem('board_categories', JSON.stringify(categoriesObject));
    } catch {
      // Handle save error silently
    }
  }

  async initializeCategories() {
    if (this.categories.size === 0) {
      const defaultCategories = [
        {
          id: this.POST_CATEGORIES.ANNOUNCEMENT,
          name: '공지사항',
          description: '중요한 공지사항',
          adminOnly: true,
          icon: 'bullhorn',
          color: '#e74c3c',
          order: 1
        },
        {
          id: this.POST_CATEGORIES.NOTICE,
          name: '알림',
          description: '일반 알림사항',
          adminOnly: true,
          icon: 'bell',
          color: '#f39c12',
          order: 2
        },
        {
          id: this.POST_CATEGORIES.GENERAL,
          name: '일반',
          description: '일반 게시글',
          adminOnly: false,
          icon: 'file-text',
          color: '#3498db',
          order: 3
        },
        {
          id: this.POST_CATEGORIES.FREE_BOARD,
          name: '자유게시판',
          description: '자유로운 소통 공간',
          adminOnly: false,
          icon: 'comments',
          color: '#27ae60',
          order: 4
        }
      ];

      defaultCategories.forEach(category => {
        this.categories.set(category.id, {
          ...category,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });

      await this.saveDataToStorage();
    }
  }

  async initializeDemoData() {
    // 데모 데이터가 이미 있는지 확인
    if (this.posts.size > 0) return;

    const demoUser = {
      id: 'demo_user_1',
      name: '동호회 관리자',
      avatar: null,
      role: 'admin'
    };

    const demoUser2 = {
      id: 'demo_user_2',
      name: '김배드민턴',
      avatar: null,
      role: 'member'
    };

    const demoUser3 = {
      id: 'demo_user_3',
      name: '이셔틀콕',
      avatar: null,
      role: 'member'
    };

    const demoPosts = [
      {
        title: '동백줄 배드민턴 동호회에 오신 것을 환영합니다!',
        content: '안녕하세요! 동백줄 배드민턴 동호회의 게시판에 오신 것을 환영합니다.\n\n이곳에서 동호회 관련 공지사항, 게임 일정, 그리고 자유로운 소통을 할 수 있습니다.\n\n앞으로 즐거운 배드민턴 라이프 되시길 바랍니다!',
        categoryId: this.POST_CATEGORIES.ANNOUNCEMENT,
        isPinned: true,
        tags: ['환영', '공지']
      },
      {
        title: '이번 주 정기 모임 안내 (토요일 2시)',
        content: '이번 토요일 오후 2시에 정기 모임이 있습니다.\n\n장소: 동백 체육관\n참가비: 1만원\n준비물: 라켓, 운동복, 셔틀콕\n\n많은 참여 부탁드립니다!',
        categoryId: this.POST_CATEGORIES.NOTICE,
        tags: ['정기모임', '토요일']
      },
      {
        title: '신입 회원 모집합니다',
        content: '동백줄 배드민턴 동호회에서 신입 회원을 모집합니다.\n\n초보자부터 고수까지 누구나 환영합니다.\n매주 토요일 정기 모임을 갖고 있으며, 친목도모와 실력 향상을 목적으로 하고 있습니다.\n\n관심 있으신 분은 댓글 또는 개인 메시지 주세요!',
        categoryId: this.POST_CATEGORIES.GENERAL,
        tags: ['신입모집', '환영']
      },
      {
        title: '오늘 게임 정말 재밌었네요!',
        content: '오늘 게임 참가하신 모든 분들 수고하셨습니다.\n특히 복식 경기가 정말 치열했어요.\n\n다음에 또 이런 재밌는 경기 기대합니다.\n모두들 실력이 많이 늘었네요! 👏',
        categoryId: this.POST_CATEGORIES.FREE_BOARD,
        tags: ['후기', '감사']
      }
    ];

    for (const postData of demoPosts) {
      try {
        const post = await this.createPost(postData, demoUser);
        
        // 댓글 데모 데이터 추가
        if (post.id) {
          await this.createComment(post.id, {
            content: '환영합니다! 저도 신입회원입니다. 잘 부탁드려요!'
          }, demoUser2);
          
          await this.createComment(post.id, {
            content: '좋은 정보 감사합니다. 다음 모임에 참석하겠습니다.'
          }, demoUser3);
          
          // 대댓글 추가
          const comments = this.comments.get(post.id) || [];
          if (comments.length > 0) {
            await this.createComment(post.id, {
              content: '반갑습니다! 함께 열심히 해봐요 ^^',
              parentCommentId: comments[0].id
            }, demoUser);
          }
        }
      } catch {
        // 데모 데이터 생성 실패시 무시
      }
    }
  }

  async createPost(postData, userInfo) {
    if (!userInfo || !userInfo.id) {
      throw new Error('User information is required');
    }

    const category = this.categories.get(postData.categoryId);
    if (category && category.adminOnly && userInfo.role !== this.USER_ROLES.ADMIN) {
      throw new Error('Admin privileges required for this category');
    }

    const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    const newPost = {
      id: postId,
      title: postData.title,
      content: postData.content,
      categoryId: postData.categoryId || this.POST_CATEGORIES.GENERAL,
      authorId: userInfo.id,
      authorName: userInfo.name,
      authorAvatar: userInfo.avatar,
      status: postData.status || this.POST_STATUS.PUBLISHED,
      isPinned: postData.isPinned || false,
      tags: postData.tags || [],
      attachments: postData.attachments || [],
      metadata: {
        platform: Platform.OS,
        version: '1.0.0',
        ...postData.metadata
      },
      stats: {
        views: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        shares: 0
      },
      createdAt: timestamp,
      updatedAt: timestamp,
      publishedAt: postData.status === this.POST_STATUS.PUBLISHED ? timestamp : null
    };

    this.posts.set(postId, newPost);
    this.comments.set(postId, []);

    await this.saveDataToStorage();
    this.notifyListeners('post_created', { post: newPost });

    return newPost;
  }

  async getPost(postId, userId = null) {
    const post = this.posts.get(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    if (userId && userId !== post.authorId) {
      post.stats.views += 1;
      post.viewedBy = post.viewedBy || new Set();
      if (!post.viewedBy.has(userId)) {
        post.viewedBy.add(userId);
        this.posts.set(postId, post);
        await this.saveDataToStorage();
      }
    }

    return post;
  }

  async getPosts(options = {}) {
    const {
      categoryId = null,
      status = this.POST_STATUS.PUBLISHED,
      authorId = null,
      tags = [],
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
      includePinned = true
    } = options;

    const allPosts = Array.from(this.posts.values());

    const filteredPosts = allPosts.filter(post => {
      if (status && post.status !== status) return false;
      if (categoryId && post.categoryId !== categoryId) return false;
      if (authorId && post.authorId !== authorId) return false;
      
      if (tags.length > 0) {
        const postTags = post.tags || [];
        const hasMatchingTag = tags.some(tag => postTags.includes(tag));
        if (!hasMatchingTag) return false;
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        const titleMatch = post.title.toLowerCase().includes(searchLower);
        const contentMatch = post.content.toLowerCase().includes(searchLower);
        const authorMatch = post.authorName.toLowerCase().includes(searchLower);
        if (!titleMatch && !contentMatch && !authorMatch) return false;
      }
      
      return true;
    });

    let pinnedPosts = [];
    let regularPosts = [];

    if (includePinned) {
      pinnedPosts = filteredPosts.filter(post => post.isPinned);
      regularPosts = filteredPosts.filter(post => !post.isPinned);
    } else {
      regularPosts = filteredPosts;
    }

    const sortFunction = (a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    };

    pinnedPosts.sort(sortFunction);
    regularPosts.sort(sortFunction);

    const sortedPosts = [...pinnedPosts, ...regularPosts];

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = sortedPosts.slice(startIndex, endIndex);

    return {
      posts: paginatedPosts,
      pagination: {
        page,
        limit,
        total: sortedPosts.length,
        totalPages: Math.ceil(sortedPosts.length / limit),
        hasNext: endIndex < sortedPosts.length,
        hasPrev: page > 1
      },
      stats: {
        total: allPosts.length,
        filtered: filteredPosts.length,
        pinned: pinnedPosts.length
      }
    };
  }

  async updatePost(postId, updateData, userInfo) {
    const post = this.posts.get(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    const canEdit = userInfo.id === post.authorId || 
                   userInfo.role === this.USER_ROLES.ADMIN ||
                   userInfo.role === this.USER_ROLES.MODERATOR;
    
    if (!canEdit) {
      throw new Error('Permission denied');
    }

    if (updateData.categoryId && updateData.categoryId !== post.categoryId) {
      const newCategory = this.categories.get(updateData.categoryId);
      if (newCategory && newCategory.adminOnly && userInfo.role !== this.USER_ROLES.ADMIN) {
        throw new Error('Admin privileges required for this category');
      }
    }

    const updatedPost = {
      ...post,
      ...updateData,
      updatedAt: new Date().toISOString(),
      editedBy: userInfo.id !== post.authorId ? userInfo.id : undefined
    };

    this.posts.set(postId, updatedPost);
    await this.saveDataToStorage();

    this.notifyListeners('post_updated', { post: updatedPost, oldPost: post });

    return updatedPost;
  }

  async deletePost(postId, userInfo) {
    const post = this.posts.get(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    const canDelete = userInfo.id === post.authorId || 
                     userInfo.role === this.USER_ROLES.ADMIN ||
                     userInfo.role === this.USER_ROLES.MODERATOR;
    
    if (!canDelete) {
      throw new Error('Permission denied');
    }

    const deletedPost = {
      ...post,
      status: this.POST_STATUS.DELETED,
      deletedAt: new Date().toISOString(),
      deletedBy: userInfo.id
    };

    this.posts.set(postId, deletedPost);
    await this.saveDataToStorage();

    this.notifyListeners('post_deleted', { post: deletedPost });

    return deletedPost;
  }

  async createComment(postId, commentData, userInfo) {
    if (!userInfo || !userInfo.id) {
      throw new Error('User information is required');
    }

    const post = this.posts.get(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    const newComment = {
      id: commentId,
      postId,
      content: commentData.content,
      parentCommentId: commentData.parentCommentId || null,
      authorId: userInfo.id,
      authorName: userInfo.name,
      authorAvatar: userInfo.avatar,
      attachments: commentData.attachments || [],
      metadata: {
        platform: Platform.OS,
        version: '1.0.0',
        ...commentData.metadata
      },
      stats: {
        likes: 0,
        dislikes: 0,
        replies: 0
      },
      createdAt: timestamp,
      updatedAt: timestamp
    };

    const comments = this.comments.get(postId) || [];
    comments.push(newComment);
    this.comments.set(postId, comments);

    post.stats.comments += 1;
    this.posts.set(postId, post);

    if (commentData.parentCommentId) {
      const parentComment = comments.find(c => c.id === commentData.parentCommentId);
      if (parentComment) {
        parentComment.stats.replies += 1;
      }
    }

    await this.saveDataToStorage();
    this.notifyListeners('comment_created', { comment: newComment, post });

    return newComment;
  }

  async getComments(postId, options = {}) {
    const {
      parentCommentId = null,
      sortBy = 'createdAt',
      sortOrder = 'asc',
      page = 1,
      limit = 50
    } = options;

    const allComments = this.comments.get(postId) || [];
    
    const filteredComments = allComments.filter(comment => {
      if (parentCommentId === null) {
        return comment.parentCommentId === null;
      }
      return comment.parentCommentId === parentCommentId;
    });

    filteredComments.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedComments = filteredComments.slice(startIndex, endIndex);

    const commentsWithReplies = paginatedComments.map(comment => ({
      ...comment,
      replyCount: allComments.filter(c => c.parentCommentId === comment.id).length
    }));

    return {
      comments: commentsWithReplies,
      pagination: {
        page,
        limit,
        total: filteredComments.length,
        totalPages: Math.ceil(filteredComments.length / limit),
        hasNext: endIndex < filteredComments.length,
        hasPrev: page > 1
      }
    };
  }

  async updateComment(commentId, updateData, userInfo) {
    let commentFound = null;
    let postId = null;
    let comments = null;

    for (const [pId, commentList] of this.comments) {
      const comment = commentList.find(c => c.id === commentId);
      if (comment) {
        commentFound = comment;
        postId = pId;
        comments = commentList;
        break;
      }
    }

    if (!commentFound) {
      throw new Error('Comment not found');
    }

    const canEdit = userInfo.id === commentFound.authorId || 
                   userInfo.role === this.USER_ROLES.ADMIN ||
                   userInfo.role === this.USER_ROLES.MODERATOR;
    
    if (!canEdit) {
      throw new Error('Permission denied');
    }

    const updatedComment = {
      ...commentFound,
      ...updateData,
      updatedAt: new Date().toISOString(),
      editedBy: userInfo.id !== commentFound.authorId ? userInfo.id : undefined
    };

    const commentIndex = comments.findIndex(c => c.id === commentId);
    comments[commentIndex] = updatedComment;
    this.comments.set(postId, comments);

    await this.saveDataToStorage();
    this.notifyListeners('comment_updated', { comment: updatedComment, oldComment: commentFound });

    return updatedComment;
  }

  async deleteComment(commentId, userInfo) {
    let commentFound = null;
    let postId = null;
    let comments = null;

    for (const [pId, commentList] of this.comments) {
      const comment = commentList.find(c => c.id === commentId);
      if (comment) {
        commentFound = comment;
        postId = pId;
        comments = commentList;
        break;
      }
    }

    if (!commentFound) {
      throw new Error('Comment not found');
    }

    const canDelete = userInfo.id === commentFound.authorId || 
                     userInfo.role === this.USER_ROLES.ADMIN ||
                     userInfo.role === this.USER_ROLES.MODERATOR;
    
    if (!canDelete) {
      throw new Error('Permission denied');
    }

    const commentIndex = comments.findIndex(c => c.id === commentId);
    comments.splice(commentIndex, 1);
    this.comments.set(postId, comments);

    const post = this.posts.get(postId);
    if (post) {
      post.stats.comments = Math.max(0, post.stats.comments - 1);
      this.posts.set(postId, post);
    }

    if (commentFound.parentCommentId) {
      const parentComment = comments.find(c => c.id === commentFound.parentCommentId);
      if (parentComment) {
        parentComment.stats.replies = Math.max(0, parentComment.stats.replies - 1);
      }
    }

    await this.saveDataToStorage();
    this.notifyListeners('comment_deleted', { comment: commentFound, postId });

    return true;
  }

  getCategories() {
    return Array.from(this.categories.values()).sort((a, b) => a.order - b.order);
  }

  getCategory(categoryId) {
    return this.categories.get(categoryId);
  }

  async togglePinPost(postId, userInfo) {
    if (userInfo.role !== this.USER_ROLES.ADMIN) {
      throw new Error('Admin privileges required');
    }

    const post = this.posts.get(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    const updatedPost = {
      ...post,
      isPinned: !post.isPinned,
      updatedAt: new Date().toISOString(),
      pinnedBy: !post.isPinned ? userInfo.id : null,
      pinnedAt: !post.isPinned ? new Date().toISOString() : null
    };

    this.posts.set(postId, updatedPost);
    await this.saveDataToStorage();

    this.notifyListeners('post_pinned', { post: updatedPost });

    return updatedPost;
  }

  async togglePostLike(postId, userInfo) {
    const post = this.posts.get(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    post.likedBy = post.likedBy || new Set();
    post.dislikedBy = post.dislikedBy || new Set();

    const wasLiked = post.likedBy.has(userInfo.id);
    const wasDisliked = post.dislikedBy.has(userInfo.id);

    if (wasLiked) {
      post.likedBy.delete(userInfo.id);
      post.stats.likes = Math.max(0, post.stats.likes - 1);
    } else {
      post.likedBy.add(userInfo.id);
      post.stats.likes += 1;
      
      if (wasDisliked) {
        post.dislikedBy.delete(userInfo.id);
        post.stats.dislikes = Math.max(0, post.stats.dislikes - 1);
      }
    }

    this.posts.set(postId, post);
    await this.saveDataToStorage();

    this.notifyListeners('post_liked', { post, userId: userInfo.id, liked: !wasLiked });

    return { liked: !wasLiked, likesCount: post.stats.likes };
  }

  async togglePostDislike(postId, userInfo) {
    const post = this.posts.get(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    post.likedBy = post.likedBy || new Set();
    post.dislikedBy = post.dislikedBy || new Set();

    const wasLiked = post.likedBy.has(userInfo.id);
    const wasDisliked = post.dislikedBy.has(userInfo.id);

    if (wasDisliked) {
      post.dislikedBy.delete(userInfo.id);
      post.stats.dislikes = Math.max(0, post.stats.dislikes - 1);
    } else {
      post.dislikedBy.add(userInfo.id);
      post.stats.dislikes += 1;
      
      if (wasLiked) {
        post.likedBy.delete(userInfo.id);
        post.stats.likes = Math.max(0, post.stats.likes - 1);
      }
    }

    this.posts.set(postId, post);
    await this.saveDataToStorage();

    this.notifyListeners('post_disliked', { post, userId: userInfo.id, disliked: !wasDisliked });

    return { disliked: !wasDisliked, dislikesCount: post.stats.dislikes };
  }

  async toggleCommentLike(commentId, userInfo) {
    let commentFound = null;
    let postId = null;
    let comments = null;

    for (const [pId, commentList] of this.comments) {
      const comment = commentList.find(c => c.id === commentId);
      if (comment) {
        commentFound = comment;
        postId = pId;
        comments = commentList;
        break;
      }
    }

    if (!commentFound) {
      throw new Error('Comment not found');
    }

    commentFound.likedBy = commentFound.likedBy || new Set();
    commentFound.dislikedBy = commentFound.dislikedBy || new Set();

    const wasLiked = commentFound.likedBy.has(userInfo.id);
    const wasDisliked = commentFound.dislikedBy.has(userInfo.id);

    if (wasLiked) {
      commentFound.likedBy.delete(userInfo.id);
      commentFound.stats.likes = Math.max(0, commentFound.stats.likes - 1);
    } else {
      commentFound.likedBy.add(userInfo.id);
      commentFound.stats.likes += 1;
      
      if (wasDisliked) {
        commentFound.dislikedBy.delete(userInfo.id);
        commentFound.stats.dislikes = Math.max(0, commentFound.stats.dislikes - 1);
      }
    }

    this.comments.set(postId, comments);
    await this.saveDataToStorage();

    this.notifyListeners('comment_liked', { comment: commentFound, userId: userInfo.id, liked: !wasLiked });

    return { liked: !wasLiked, likesCount: commentFound.stats.likes };
  }

  async searchPosts(query, options = {}) {
    const {
      categoryId = null,
      authorId = null,
      tags = [],
      dateFrom = null,
      dateTo = null,
      sortBy = 'relevance',
      page = 1,
      limit = 20
    } = options;

    if (!query || query.trim().length === 0) {
      return this.getPosts({ categoryId, authorId, tags, page, limit });
    }

    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    const allPosts = Array.from(this.posts.values());

    const scoredPosts = allPosts.map(post => {
      let score = 0;

      if (post.status !== this.POST_STATUS.PUBLISHED) return null;
      if (categoryId && post.categoryId !== categoryId) return null;
      if (authorId && post.authorId !== authorId) return null;
      if (tags.length > 0) {
        const hasMatchingTag = tags.some(tag => (post.tags || []).includes(tag));
        if (!hasMatchingTag) return null;
      }

      if (dateFrom && new Date(post.createdAt) < new Date(dateFrom)) return null;
      if (dateTo && new Date(post.createdAt) > new Date(dateTo)) return null;

      const title = post.title.toLowerCase();
      const content = post.content.toLowerCase();
      const author = post.authorName.toLowerCase();

      searchTerms.forEach(term => {
        if (title.includes(term)) {
          score += title === term ? 100 : 50;
        }
        
        if (content.includes(term)) {
          score += 10;
        }
        
        if (author.includes(term)) {
          score += 5;
        }
        
        (post.tags || []).forEach(tag => {
          if (tag.toLowerCase().includes(term)) {
            score += 20;
          }
        });
      });

      return score > 0 ? { post, score } : null;
    }).filter(Boolean);

    if (sortBy === 'relevance') {
      scoredPosts.sort((a, b) => b.score - a.score);
    } else {
      scoredPosts.sort((a, b) => {
        const aValue = new Date(a.post[sortBy] || a.post.createdAt);
        const bValue = new Date(b.post[sortBy] || b.post.createdAt);
        return bValue - aValue;
      });
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = scoredPosts.slice(startIndex, endIndex);

    return {
      posts: paginatedResults.map(result => result.post),
      pagination: {
        page,
        limit,
        total: scoredPosts.length,
        totalPages: Math.ceil(scoredPosts.length / limit),
        hasNext: endIndex < scoredPosts.length,
        hasPrev: page > 1
      },
      searchInfo: {
        query,
        terms: searchTerms,
        resultsFound: scoredPosts.length
      }
    };
  }

  getBoardStatistics() {
    const posts = Array.from(this.posts.values());
    const categories = Array.from(this.categories.values());
    
    let totalComments = 0;
    this.comments.forEach(commentList => {
      totalComments += commentList.length;
    });

    const stats = {
      totalPosts: posts.length,
      publishedPosts: posts.filter(p => p.status === this.POST_STATUS.PUBLISHED).length,
      pinnedPosts: posts.filter(p => p.isPinned).length,
      totalComments,
      totalViews: posts.reduce((sum, p) => sum + (p.stats.views || 0), 0),
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        postCount: posts.filter(p => p.categoryId === cat.id).length
      })),
      recentActivity: posts
        .filter(p => p.status === this.POST_STATUS.PUBLISHED)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          title: p.title,
          authorName: p.authorName,
          createdAt: p.createdAt,
          categoryId: p.categoryId
        }))
    };

    return stats;
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }

  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch {
        // Handle listener error silently
      }
    });
  }

  cleanup() {
    this.listeners.clear();
    this.initialized = false;
  }
}

const boardService = new BoardService();

export default boardService;
