# 동배줄 백엔드 API 설계 문서

## 📋 개요
동배줄(Dongbaejul) 배드민턴 동호회 앱을 위한 RESTful API 서버 설계

## 🏗️ 기술 스택
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Real-time**: Socket.IO
- **File Storage**: Local/AWS S3
- **Deployment**: Railway/Render

## 📊 데이터베이스 스키마

### 1. Users (사용자)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  band_user_id VARCHAR(100) UNIQUE NOT NULL,
  username VARCHAR(50) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'MEMBER',
  status user_status NOT NULL DEFAULT 'ACTIVE',
  skill_level INTEGER DEFAULT 1,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 역할 및 상태 ENUM
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'MEMBER');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED', 'PENDING');
```

### 2. Categories (카테고리)
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#1976D2',
  icon VARCHAR(50),
  is_admin_only BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Posts (게시글)
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  tags TEXT[],
  meta_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_category_id ON posts(category_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_pinned ON posts(is_pinned, created_at DESC);
```

### 4. Comments (댓글)
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  is_deleted BOOLEAN DEFAULT false,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_comments_post_id ON comments(post_id, created_at);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
```

### 5. Photos (사진)
```sql
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size BIGINT,
  mime_type VARCHAR(100),
  width INTEGER,
  height INTEGER,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
  tags TEXT[],
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. Albums (앨범)
```sql
CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  cover_photo_id UUID REFERENCES photos(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT true,
  photo_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 7. Chat Rooms (채팅방)
```sql
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  type room_type NOT NULL DEFAULT 'GROUP',
  is_private BOOLEAN DEFAULT false,
  max_members INTEGER DEFAULT 200,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE room_type AS ENUM ('GROUP', 'PRIVATE', 'ANNOUNCEMENT');
```

### 8. Chat Messages (채팅 메시지)
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type message_type DEFAULT 'TEXT',
  reply_to UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  attachments JSONB,
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE message_type AS ENUM ('TEXT', 'IMAGE', 'FILE', 'SYSTEM');
```

### 9. Admin Actions (관리자 작업 로그)
```sql
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🛣️ API 엔드포인트 설계

### 인증 관련
```
POST   /api/auth/login          # 로그인
POST   /api/auth/refresh        # 토큰 갱신
POST   /api/auth/logout         # 로그아웃
GET    /api/auth/me            # 현재 사용자 정보
```

### 사용자 관리
```
GET    /api/users              # 사용자 목록 조회
GET    /api/users/:id          # 특정 사용자 조회
PUT    /api/users/:id          # 사용자 정보 수정
DELETE /api/users/:id          # 사용자 삭제 (관리자)
```

### 게시판
```
GET    /api/posts              # 게시글 목록 (페이징, 필터링)
POST   /api/posts              # 게시글 생성
GET    /api/posts/:id          # 게시글 상세 조회
PUT    /api/posts/:id          # 게시글 수정
DELETE /api/posts/:id          # 게시글 삭제
POST   /api/posts/:id/like     # 게시글 좋아요
DELETE /api/posts/:id/like     # 게시글 좋아요 취소
```

### 댓글
```
GET    /api/posts/:postId/comments     # 댓글 목록 조회
POST   /api/posts/:postId/comments     # 댓글 생성
PUT    /api/comments/:id               # 댓글 수정
DELETE /api/comments/:id               # 댓글 삭제
```

### 카테고리
```
GET    /api/categories         # 카테고리 목록
POST   /api/categories         # 카테고리 생성 (관리자)
PUT    /api/categories/:id     # 카테고리 수정 (관리자)
DELETE /api/categories/:id     # 카테고리 삭제 (관리자)
```

### 사진 갤러리
```
GET    /api/photos             # 사진 목록 조회
POST   /api/photos/upload      # 사진 업로드
GET    /api/photos/:id         # 사진 상세 조회
DELETE /api/photos/:id         # 사진 삭제
GET    /api/albums             # 앨범 목록
POST   /api/albums             # 앨범 생성
```

### 채팅
```
GET    /api/chat/rooms         # 채팅방 목록
POST   /api/chat/rooms         # 채팅방 생성
GET    /api/chat/rooms/:id/messages  # 채팅 메시지 조회
```

### 관리자
```
GET    /api/admin/dashboard     # 관리자 대시보드 데이터
GET    /api/admin/actions       # 관리자 작업 로그
POST   /api/admin/posts/:id/pin # 게시글 고정
DELETE /api/admin/posts/:id     # 게시글 강제 삭제
```

### 검색
```
GET    /api/search/posts        # 게시글 검색
GET    /api/search/users        # 사용자 검색
GET    /api/search/photos       # 사진 검색
```

## 🔒 인증 및 권한

### JWT 토큰 구조
```json
{
  "userId": "uuid",
  "bandUserId": "string",
  "role": "MEMBER|MODERATOR|ADMIN|SUPER_ADMIN",
  "iat": "timestamp",
  "exp": "timestamp"
}
```

### 권한 레벨
1. **MEMBER**: 기본 사용자 권한
2. **MODERATOR**: 게시글/댓글 관리
3. **ADMIN**: 사용자 관리, 카테고리 관리
4. **SUPER_ADMIN**: 모든 권한

## 📦 파일 업로드 정책

### 이미지 업로드
- **허용 형식**: JPEG, PNG, WebP
- **최대 크기**: 10MB
- **썸네일**: 자동 생성 (300x300, 800x600)
- **저장 경로**: `/uploads/images/YYYY/MM/DD/`

## 🚀 배포 환경 변수

```env
# 데이터베이스
DATABASE_URL=postgresql://username:password@localhost:5432/dongbaejul

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# 서버
PORT=3000
NODE_ENV=production

# 파일 업로드
UPLOAD_PATH=/uploads
MAX_FILE_SIZE=10485760

# 외부 API
BAND_CLIENT_ID=your-band-client-id
BAND_CLIENT_SECRET=your-band-client-secret

# 메일
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 📈 성능 최적화

### 데이터베이스 최적화
- 적절한 인덱스 설정
- 쿼리 최적화
- 연결 풀 관리

### 캐싱 전략
- Redis를 활용한 세션 캐싱
- 정적 파일 CDN 활용
- API 응답 캐싱

### 보안 강화
- Rate Limiting
- CORS 설정
- Helmet을 통한 보안 헤더
- 입력값 검증 및 SQL Injection 방지

## 🧪 테스트 전략

### Unit Tests
- 서비스 로직 테스트
- 유틸리티 함수 테스트

### Integration Tests
- API 엔드포인트 테스트
- 데이터베이스 연동 테스트

### E2E Tests
- 전체 워크플로우 테스트
- Socket.IO 실시간 통신 테스트

이제 이 설계를 바탕으로 실제 백엔드 개발을 시작하겠습니다!
