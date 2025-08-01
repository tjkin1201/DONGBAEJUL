# 동배즐 (Dongbaejul) - 배드민턴 클럽 관리 앱

## 📋 프로젝트 개요

동배즐(Dongbaejul)은 배드민턴을 사랑하는 사람들을 위한 종합 클럽 관리 및 게임 매칭 앱입니다.
"함께하는 배드민턴의 즐거움"을 모토로 클럽 가입부터 경기 참가, 실력 향상까지 모든 것을 한 곳에서 관리할 수 있습니다.

## 🏗️ 아키텍처

### Frontend (React Native)
- **Framework**: React Native + Expo
- **UI Library**: React Native Paper (Material Design)
- **Navigation**: React Navigation 6 (Stack + Tab)
- **State Management**: Context API + useReducer
- **Real-time**: Socket.IO Client

### Backend (Node.js)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + Refresh Token
- **Real-time**: Socket.IO
- **File Upload**: Multer + Sharp (이미지 처리)
- **Push Notifications**: Firebase FCM

## 📱 주요 기능

### 1. 사용자 관리
- ✅ 회원가입/로그인 (JWT 인증)
- ✅ 프로필 관리 및 이미지 업로드
- ✅ 실력 레벨 시스템 (초급/중급/고급/전문가)
- ✅ 비밀번호 재설정

### 2. 클럽 관리
- ✅ 클럽 생성/가입/탈퇴
- ✅ 클럽 멤버 관리 (역할별 권한)
- ✅ 클럽 검색 및 필터링
- ✅ 클럽 이미지 및 정보 관리

### 3. 게임 관리
- ✅ 게임 생성/참가/취소
- ✅ 게임 결과 입력 및 통계
- ✅ 게임 이미지 업로드 (최대 5장)
- ✅ 실시간 참가자 상태 업데이트

### 4. 실시간 알림
- ✅ Socket.IO 기반 실시간 통신
- ✅ FCM 푸시 알림
- ✅ 개인/그룹 알림 시스템
- ✅ 알림 설정 관리

### 5. 통계 및 랭킹
- ✅ 개인 게임 통계 (승률, 랭킹 포인트)
- ✅ 월별 활동 분석
- ✅ 레벨별 랭킹 시스템
- ✅ 성취 시스템

### 6. 이미지 관리
- ✅ 다중 크기 이미지 생성 (썸네일, 중간, 대형)
- ✅ WebP 포맷 최적화
- ✅ 임시 파일 자동 정리
- ✅ 이미지 압축 및 워터마크

## 📂 프로젝트 구조

```
dongbaejul-frontend/
├── App.js                          # 루트 컴포넌트
├── app.json                        # Expo 설정
├── package.json                    # 의존성 관리
├── babel.config.js                 # Babel 설정
├── assets/                         # 정적 리소스
│   ├── logo.png                    # 앱 로고
│   └── badminton-bg.jpg           # 배경 이미지
├── src/
│   ├── components/                 # 재사용 컴포넌트
│   │   └── LoadingScreen.js        # 로딩 화면
│   ├── context/                    # React Context
│   │   ├── AuthContext.js          # 인증 상태 관리
│   │   └── SocketContext.js        # 소켓 연결 관리
│   ├── navigation/                 # 네비게이션 설정
│   │   ├── AppNavigator.js         # 루트 네비게이터
│   │   ├── AuthNavigator.js        # 인증 플로우
│   │   └── MainNavigator.js        # 메인 탭 네비게이션
│   ├── screens/                    # 화면 컴포넌트
│   │   ├── auth/                   # 인증 관련 화면
│   │   │   ├── WelcomeScreen.js    # 환영 화면
│   │   │   ├── LoginScreen.js      # 로그인
│   │   │   ├── SignupScreen.js     # 회원가입
│   │   │   ├── ForgotPasswordScreen.js # 비밀번호 찾기
│   │   │   └── ResetPasswordScreen.js  # 비밀번호 재설정
│   │   └── main/                   # 메인 화면
│   │       ├── HomeScreen.js       # 홈 대시보드
│   │       ├── ClubsScreen.js      # 클럽 목록
│   │       ├── GamesScreen.js      # 게임 목록
│   │       └── ProfileScreen.js    # 프로필
│   ├── services/                   # API 서비스
│   │   └── api.js                  # HTTP 클라이언트
│   └── utils/                      # 유틸리티
│       └── theme.js                # 테마 설정
└── docs/                           # 문서화
    ├── README.md                   # 프로젝트 개요
    ├── development-log.md          # 개발 로그
    ├── api-documentation.md        # API 문서
    └── session-continuity.md       # 세션 연속성 가이드
```

## 🎨 디자인 시스템

### 색상 팔레트
```javascript
colors: {
  primary: '#1976D2',           // 배드민턴 코트 블루
  secondary: '#FF5722',         // 활동적인 오렌지
  success: '#4CAF50',           // 성공 초록
  warning: '#FF9800',           // 경고 주황
  error: '#F44336',             // 오류 빨강
  level: {
    beginner: '#4CAF50',        // 초급 - 초록
    intermediate: '#FF9800',    // 중급 - 주황
    advanced: '#9C27B0',        // 고급 - 보라
    expert: '#F44336',          // 전문가 - 빨강
  }
}
```

### 타이포그래피
- **제목**: 24-28px, Bold
- **부제목**: 18-20px, SemiBold
- **본문**: 14-16px, Regular
- **캡션**: 12px, Regular

### 간격 시스템
```javascript
spacing: {
  xs: 4,    sm: 8,    md: 16,
  lg: 24,   xl: 32,   xxl: 48
}
```

## 📊 현재 개발 상태

### ✅ 완료된 작업
1. **백엔드 시스템 (100%)**
   - 모든 API 엔드포인트 구현
   - 실시간 알림 시스템
   - 이미지 업로드 및 처리
   - 통계 및 랭킹 시스템

2. **프론트엔드 기반 구조 (100%)**
   - 프로젝트 설정 및 의존성
   - 테마 시스템 구현
   - API 서비스 레이어
   - 네비게이션 구조

3. **인증 시스템 (100%)**
   - 모든 인증 화면 구현
   - JWT 토큰 관리
   - 자동 로그인 유지

4. **메인 화면 (100%)**
   - 홈 대시보드
   - 클럽 목록 화면
   - 게임 목록 화면
   - 프로필 화면

### 🚧 다음 작업 계획
1. **상세 화면 구현**
   - ClubDetailScreen
   - GameDetailScreen
   - GameCreateScreen
   - ProfileEditScreen

2. **고급 기능**
   - 채팅 시스템
   - 지도 연동
   - 푸시 알림 설정
   - 오프라인 지원

3. **성능 최적화**
   - 이미지 캐싱
   - 리스트 가상화
   - 번들 크기 최적화

4. **테스팅**
   - 유닛 테스트
   - 통합 테스트
   - E2E 테스트

## 🔧 개발 환경 설정

### 필수 요구사항
- Node.js 18+
- React Native CLI
- Expo CLI
- Android Studio / Xcode

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm start

# iOS 시뮬레이터
npm run ios

# Android 에뮬레이터
npm run android
```

### 환경 변수
```bash
# .env 파일 생성
API_BASE_URL=http://localhost:3000/api/v1
SOCKET_URL=http://localhost:3000
```

## 📚 참고 문서
- [개발 로그](./development-log.md)
- [API 문서](./api-documentation.md)
- [세션 연속성 가이드](./session-continuity.md)