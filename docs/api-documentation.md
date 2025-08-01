# API 문서 (API Documentation)

## 🌐 기본 정보

**Base URL**: `http://localhost:3000/api/v1`
**인증 방식**: JWT Bearer Token
**Content-Type**: `application/json`

## 🔐 인증 (Authentication)

### 1. 회원가입
```http
POST /auth/signup
Content-Type: application/json

{
  "name": "홍길동",
  "email": "hong@example.com",
  "password": "password123!",
  "phone": "010-1234-5678",
  "level": "beginner",
  "preferredLocation": "강남구"
}
```

**응답**:
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다.",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "홍길동",
      "email": "hong@example.com",
      "level": "beginner"
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

### 2. 로그인
```http
POST /auth/login
Content-Type: application/json

{
  "email": "hong@example.com",
  "password": "password123!"
}
```

### 3. 토큰 갱신
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "jwt_refresh_token"
}
```

### 4. 비밀번호 재설정 요청
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "hong@example.com"
}
```

### 5. 비밀번호 재설정
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset_token",
  "password": "new_password123!"
}
```

## 👤 사용자 관리 (Users)

### 1. 내 프로필 조회
```http
GET /users/me
Authorization: Bearer {access_token}
```

### 2. 프로필 수정
```http
PUT /users/me
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "김배드",
  "level": "intermediate",
  "preferredLocation": "서초구"
}
```

### 3. 프로필 이미지 업로드
```http
POST /upload/profile
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

image: [File]
```

### 4. 사용자 검색
```http
GET /users/search?q=홍길동
Authorization: Bearer {access_token}
```

## 🏸 클럽 관리 (Clubs)

### 1. 클럽 목록 조회
```http
GET /clubs?page=1&limit=10&level=beginner&location=강남구
Authorization: Bearer {access_token}
```

### 2. 내가 가입한 클럽 목록
```http
GET /clubs/my-clubs
Authorization: Bearer {access_token}
```

### 3. 클럽 상세 정보
```http
GET /clubs/{clubId}
Authorization: Bearer {access_token}
```

### 4. 클럽 생성
```http
POST /clubs
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "강남 배드민턴 클럽",
  "description": "강남에서 활동하는 배드민턴 클럽입니다.",
  "location": "강남구",
  "level": "beginner",
  "maxMembers": 50,
  "weeklyGames": 2
}
```

### 5. 클럽 가입
```http
POST /clubs/{clubId}/join
Authorization: Bearer {access_token}
```

### 6. 클럽 탈퇴
```http
POST /clubs/{clubId}/leave
Authorization: Bearer {access_token}
```

### 7. 클럽 이미지 업로드
```http
POST /upload/clubs/{clubId}
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

image: [File]
```

## 🎮 게임 관리 (Games)

### 1. 게임 목록 조회
```http
GET /games?page=1&limit=10&status=upcoming&level=beginner
Authorization: Bearer {access_token}
```

### 2. 다가오는 게임 목록
```http
GET /games/upcoming?limit=3
Authorization: Bearer {access_token}
```

### 3. 최근 게임 목록 (내가 참가한)
```http
GET /games/recent?limit=5
Authorization: Bearer {access_token}
```

### 4. 게임 상세 정보
```http
GET /games/{gameId}
Authorization: Bearer {access_token}
```

### 5. 게임 생성
```http
POST /games
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "주말 복식 게임",
  "description": "즐거운 주말 복식 경기입니다.",
  "gameType": "복식",
  "level": "intermediate",
  "gameDate": "2024-02-03T10:00:00.000Z",
  "location": {
    "address": "서울시 강남구 테헤란로 123",
    "coordinates": [127.0276, 37.4979]
  },
  "maxParticipants": 8,
  "fee": 10000,
  "duration": 120
}
```

### 6. 게임 참가
```http
POST /games/{gameId}/join
Authorization: Bearer {access_token}
```

### 7. 게임 탈퇴
```http
POST /games/{gameId}/leave
Authorization: Bearer {access_token}
```

### 8. 게임 결과 입력
```http
POST /games/{gameId}/results
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "matches": [
    {
      "team1": ["user_id_1", "user_id_2"],
      "team2": ["user_id_3", "user_id_4"],
      "sets": [
        {"team1Score": 21, "team2Score": 19},
        {"team1Score": 18, "team2Score": 21},
        {"team1Score": 21, "team2Score": 16}
      ],
      "winner": "team1"
    }
  ],
  "isCompleted": true
}
```

### 9. 게임 이미지 업로드
```http
POST /upload/games/{gameId}
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

images: [File, File, File]  // 최대 5개
```

## 📊 통계 (Statistics)

### 1. 내 통계 조회
```http
GET /statistics/me
Authorization: Bearer {access_token}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "gamesPlayed": 25,
    "gamesWon": 15,
    "winRate": 60,
    "currentRank": 42,
    "rankingPoints": 1250,
    "totalClubs": 3,
    "longestWinStreak": 5,
    "monthlyActivity": [
      {"year": 2024, "month": 1, "gamesPlayed": 8, "gamesWon": 5}
    ]
  }
}
```

### 2. 사용자 통계 조회
```http
GET /statistics/users/{userId}
Authorization: Bearer {access_token}
```

### 3. 랭킹 조회
```http
GET /statistics/rankings?page=1&limit=20&level=all
Authorization: Bearer {access_token}
```

### 4. 레벨별 랭킹
```http
GET /statistics/rankings/intermediate?page=1&limit=20
Authorization: Bearer {access_token}
```

### 5. 상위 플레이어
```http
GET /statistics/top-players?limit=10
Authorization: Bearer {access_token}
```

### 6. 통계 대시보드
```http
GET /statistics/dashboard
Authorization: Bearer {access_token}
```

## 🔔 알림 (Notifications)

### 1. 알림 목록 조회
```http
GET /notifications?page=1&limit=20&unread=true
Authorization: Bearer {access_token}
```

### 2. 읽지 않은 알림 수
```http
GET /notifications/unread-count
Authorization: Bearer {access_token}
```

### 3. 알림 읽음 처리
```http
PATCH /notifications/{notificationId}/read
Authorization: Bearer {access_token}
```

### 4. 모든 알림 읽음 처리
```http
PATCH /notifications/mark-all-read
Authorization: Bearer {access_token}
```

### 5. 알림 설정 조회
```http
GET /notifications/settings
Authorization: Bearer {access_token}
```

### 6. 알림 설정 업데이트
```http
PUT /notifications/settings
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "gameInvitation": true,
  "gameReminder": true,
  "clubNews": false,
  "rankingUpdate": true
}
```

## 🔥 FCM 푸시 알림 (FCM)

### 1. FCM 토큰 등록
```http
POST /fcm/tokens
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "fcmToken": "fcm_device_token",
  "deviceInfo": {
    "platform": "ios",
    "model": "iPhone 13",
    "osVersion": "17.0"
  }
}
```

### 2. 토픽 구독
```http
POST /fcm/topics/subscribe
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "topic": "club_news"
}
```

### 3. FCM 설정 업데이트
```http
PUT /fcm/settings
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "notificationSettings": {
    "sound": true,
    "vibration": true,
    "badge": true
  }
}
```

## 📁 이미지 업로드 (Upload)

### 1. 이미지 정보 조회
```http
GET /upload/info?imagePath=/uploads/profiles/profile-123.webp
Authorization: Bearer {access_token}
```

### 2. 이미지 삭제
```http
DELETE /upload/{type}/{id?}/{imageIndex?}
Authorization: Bearer {access_token}

# 예시:
# DELETE /upload/profile
# DELETE /upload/game/game_id/0
# DELETE /upload/club/club_id
```

### 3. 이미지 압축 (관리자만)
```http
POST /upload/compress
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "imagePath": "/uploads/games/game-123.jpg",
  "quality": 80
}
```

## ❌ 에러 응답 형식

모든 API는 다음과 같은 일관된 에러 형식을 사용합니다:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자 친화적 에러 메시지",
    "details": ["상세 에러 정보"]
  }
}
```

### 주요 에러 코드

| 코드 | 설명 |
|------|------|
| `VALIDATION_ERROR` | 입력 데이터 검증 실패 |
| `UNAUTHORIZED` | 인증 토큰 없음 또는 무효 |
| `FORBIDDEN` | 권한 없음 |
| `NOT_FOUND` | 리소스를 찾을 수 없음 |
| `CONFLICT` | 데이터 충돌 (중복 가입 등) |
| `RATE_LIMIT_EXCEEDED` | 요청 제한 초과 |
| `SERVER_ERROR` | 서버 내부 오류 |

## 🔄 실시간 이벤트 (Socket.IO)

### 연결
```javascript
const socket = io('http://localhost:3000', {
  auth: { token: 'jwt_access_token' },
  transports: ['websocket']
});
```

### 이벤트 목록

#### 개인 알림
```javascript
socket.on('notification:personal', (data) => {
  // data: { type, title, message, data, timestamp }
});
```

#### 게임 업데이트
```javascript
socket.on('game:participant_joined', (data) => {
  // data: { gameId, participant, currentCount }
});

socket.on('game:participant_left', (data) => {
  // data: { gameId, participant, currentCount }
});
```

#### 클럽 이벤트
```javascript
socket.on('club:member_joined', (data) => {
  // data: { clubId, member }
});

socket.on('club:game_created', (data) => {
  // data: { clubId, game }
});
```

#### 방 참가/나가기
```javascript
// 게임 방 참가
socket.emit('join_game_room', { gameId: 'game_id' });

// 클럽 방 참가
socket.emit('join_club_room', { clubId: 'club_id' });

// 방 나가기
socket.emit('leave_room', { roomId: 'room_id' });
```

## 📋 요청/응답 예시

### 성공적인 응답
```json
{
  "success": true,
  "message": "작업이 성공적으로 완료되었습니다.",
  "data": {
    // 응답 데이터
  }
}
```

### 페이지네이션 응답
```json
{
  "success": true,
  "data": [
    // 데이터 배열
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## 🚀 성능 최적화

### 캐싱 헤더
- `Cache-Control: max-age=3600` (1시간 캐시)
- `ETag` 지원으로 조건부 요청

### 압축
- gzip 압축 지원
- 이미지 WebP 포맷 자동 변환

### 요청 제한
- 일반 API: 100요청/15분
- 인증 API: 5요청/15분 (로그인 시도)
- 업로드 API: 10요청/시간