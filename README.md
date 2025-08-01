# 🏸 동배즐 (Dongbaejul) - 배드민턴 클럽 관리 앱

> 배드민턴 동호회를 위한 올인원 모바일 앱

## 📱 앱 소개

**동배즐**은 배드민턴 클럽 운영과 게임 매칭을 쉽게 만들어주는 React Native 모바일 앱입니다.

### 🎯 주요 기능

- **🏸 게임 매칭**: 실력별 게임 생성 및 참가
- **👥 클럽 관리**: 동호회 생성, 가입, 멤버 관리
- **💬 실시간 채팅**: Socket.IO 기반 실시간 소통
- **🏆 랭킹 시스템**: 개인 실력 평가 및 순위
- **📊 통계 분석**: 게임 기록 및 성과 분석
- **🔔 스마트 알림**: 실시간 푸시 알림

## 🚀 빠른 시작

### 필수 요구사항

- Node.js 18.x 이상
- npm 또는 yarn
- React Native 개발 환경
- Expo CLI

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/your-repo/dongbaejul-frontend.git
cd dongbaejul-frontend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일에서 API 키들을 설정하세요

# 개발 서버 시작
npm start

# 플랫폼별 실행
npm run android  # Android
npm run ios      # iOS
npm run web      # Web
```

### 환경 변수 설정

`.env` 파일을 생성하고 다음 값들을 설정하세요:

```env
API_BASE_URL=http://localhost:3000/api/v1
SOCKET_URL=http://localhost:3000
FIREBASE_API_KEY=your_firebase_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## 🏗️ 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   └── LoadingScreen.js
├── context/             # React Context 상태 관리
│   ├── AuthContext.js   # 인증 상태 관리
│   └── SocketContext.js # 실시간 통신 관리
├── navigation/          # 네비게이션 설정
│   ├── AppNavigator.js  # 메인 네비게이터
│   ├── AuthNavigator.js # 인증 화면 네비게이터
│   └── MainNavigator.js # 앱 내 화면 네비게이터
├── screens/             # 화면 컴포넌트
│   ├── auth/           # 인증 관련 화면
│   ├── main/           # 메인 탭 화면
│   └── detail/         # 상세 화면
├── services/           # API 및 외부 서비스
│   └── api.js         # HTTP 클라이언트
└── utils/             # 유틸리티 함수
    └── theme.js       # 테마 설정
```

## 📱 화면 구성

### 인증 화면
- **WelcomeScreen**: 앱 소개 및 시작 화면
- **LoginScreen**: 로그인
- **SignupScreen**: 회원가입  
- **ForgotPasswordScreen**: 비밀번호 찾기

### 메인 화면 (탭 네비게이션)
- **HomeScreen**: 대시보드 및 활동 요약
- **ClubsScreen**: 클럽 목록 및 검색
- **GamesScreen**: 게임 목록 및 매칭
- **ProfileScreen**: 사용자 프로필

### 상세 화면
- **ClubDetailScreen**: 클럽 상세 정보
- **GameDetailScreen**: 게임 상세 정보
- **ChatScreen**: 실시간 채팅
- **NotificationsScreen**: 알림 관리
- **RankingScreen**: 랭킹 조회
- **StatisticsScreen**: 통계 및 차트

## 🛠️ 기술 스택

### Frontend
- **React Native**: 크로스 플랫폼 모바일 앱 개발
- **Expo**: 개발 도구 및 배포 플랫폼
- **React Navigation**: 네비게이션 라이브러리
- **React Native Paper**: Material Design UI 컴포넌트
- **Socket.IO Client**: 실시간 통신

### 상태 관리
- **React Context API**: 전역 상태 관리
- **React Hook Form**: 폼 상태 관리

### 차트 & 시각화
- **react-native-chart-kit**: 통계 차트
- **react-native-svg**: SVG 그래픽

### 기타
- **Axios**: HTTP 클라이언트
- **Expo Image Picker**: 이미지 선택
- **Expo Secure Store**: 안전한 데이터 저장

## 🔧 개발 스크립트

```bash
# 개발 서버 시작
npm start

# 타입 검사
npm run typecheck

# 코드 린팅
npm run lint

# 테스트 실행
npm run test

# 빌드
npm run build
```

## 🎨 디자인 시스템

### 컬러 팔레트
- **Primary**: #1976D2 (배드민턴 코트 블루)
- **Secondary**: #FF5722 (활동적인 오렌지)
- **레벨별 색상**:
  - 초급: #4CAF50 (초록)
  - 중급: #FF9800 (주황)
  - 고급: #9C27B0 (보라)
  - 전문가: #F44336 (빨강)

### 타이포그래피
- **헤더**: 24px, Bold
- **서브헤더**: 18px, SemiBold
- **본문**: 16px, Regular
- **캡션**: 14px, Regular

## 🔐 보안

- JWT 토큰 기반 인증
- Expo SecureStore를 통한 민감 데이터 저장
- API 요청 시 자동 토큰 추가
- 토큰 만료 시 자동 갱신

## 📊 성능 최적화

- 이미지 지연 로딩
- 리스트 가상화 (FlatList)
- 메모이제이션 활용
- 번들 크기 최적화

## 🤝 기여하기

1. 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙋‍♂️ 지원

문의사항이나 버그 리포트는 [Issues](https://github.com/your-repo/dongbaejul-frontend/issues)에 등록해주세요.

## 📞 연락처

- **개발자**: Claude Code SuperClaude
- **이메일**: support@dongbaejul.com
- **웹사이트**: https://dongbaejul.com

---

⭐ 이 프로젝트가 도움이 되었다면 별표를 눌러주세요!