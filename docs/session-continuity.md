# 세션 연속성 가이드 (Session Continuity Guide)

## 📋 현재 세션 상태

### 🎯 프로젝트 위치
**경로**: `C:\Users\taejo\dongbaejul-frontend\`
**Git 저장소**: 초기화되지 않음 (필요시 git init)

### ✅ 완료된 작업 현황
```
┌─ Backend (100% 완료)
│  ├─ 클럽 관리 시스템 ✅
│  ├─ 실시간 알림 시스템 (Socket.IO) ✅
│  ├─ 배드민턴 실력 평가 시스템 ✅
│  ├─ FCM 컨트롤러 및 라우트 ✅
│  ├─ 랭킹 및 통계 시스템 ✅
│  └─ 이미지 업로드 및 관리 시스템 ✅
│
└─ Frontend (70% 완료)
   ├─ React Native 프로젝트 초기 설정 ✅
   ├─ API 서비스 및 테마 설정 ✅
   ├─ 인증 컨텍스트 구현 ✅
   ├─ 소켓 컨텍스트 구현 ✅
   ├─ LoadingScreen 컴포넌트 ✅
   ├─ 로그인/회원가입 화면 ✅
   ├─ 홈 화면 및 대시보드 ✅
   ├─ 클럽 검색 및 상세 화면 (목록만) ✅
   └─ 게임 생성 및 관리 화면 (목록만) ✅
```

### 🚧 다음 작업 대기열
```
┌─ 우선순위 높음 (내일 작업)
│  ├─ ClubDetailScreen 구현
│  ├─ GameDetailScreen 구현
│  ├─ GameCreateScreen 구현
│  └─ ProfileEditScreen 구현
│
├─ 우선순위 중간
│  ├─ 이미지 업로드 기능 (react-native-image-picker)
│  ├─ 지도 연동 (react-native-maps)
│  ├─ 채팅 시스템
│  └─ 푸시 알림 설정 화면
│
└─ 우선순위 낮음
   ├─ 성능 최적화
   ├─ 테스팅 구현
   └─ 앱 스토어 배포 준비
```

## 🔄 세션 재개 절차

### 1. 환경 확인
```bash
# 현재 디렉토리 확인
cd C:\Users\taejo\dongbaejul-frontend

# 프로젝트 파일 구조 확인
dir

# 의존성 상태 확인
npm list
```

### 2. 개발 서버 시작
```bash
# Expo 개발 서버 시작
npm start

# 또는 특정 플랫폼
npm run ios     # iOS 시뮬레이터
npm run android # Android 에뮬레이터
npm run web     # 웹 브라우저
```

### 3. 백엔드 서버 확인
```bash
# 백엔드 서버 위치로 이동
cd D:\project\dongbaejul\backend

# 백엔드 서버 시작
npm run dev
```

### 4. 작업 상태 확인
```bash
# 현재 작업 브랜치 확인 (Git 초기화된 경우)
git status

# 최근 변경사항 확인
git log --oneline -5
```

## 📁 핵심 파일 위치

### 🏗️ 아키텍처 파일
```
src/
├── context/
│   ├── AuthContext.js       # 인증 상태 관리
│   └── SocketContext.js     # 실시간 통신
├── services/
│   └── api.js              # API 클라이언트
├── utils/
│   └── theme.js            # 디자인 시스템
└── navigation/
    ├── AppNavigator.js     # 루트 네비게이터
    ├── AuthNavigator.js    # 인증 플로우
    └── MainNavigator.js    # 메인 탭 네비게이션
```

### 📱 화면 파일
```
src/screens/
├── auth/                   # 인증 관련 화면 (완료)
│   ├── WelcomeScreen.js
│   ├── LoginScreen.js
│   ├── SignupScreen.js
│   ├── ForgotPasswordScreen.js
│   └── ResetPasswordScreen.js
└── main/                   # 메인 화면 (부분 완료)
    ├── HomeScreen.js       # ✅ 완료
    ├── ClubsScreen.js      # ✅ 완료 (목록만)
    ├── GamesScreen.js      # ✅ 완료 (목록만)
    └── ProfileScreen.js    # ✅ 완료
```

### 🚧 다음 구현 파일들
```
src/screens/detail/         # 생성 필요
├── ClubDetailScreen.js     # 🚧 다음 작업
├── GameDetailScreen.js     # 🚧 다음 작업
├── GameCreateScreen.js     # 🚧 다음 작업
└── ProfileEditScreen.js    # 🚧 다음 작업
```

## 💻 개발 환경 설정

### 필수 도구
- **Node.js**: 18+ (현재 설치됨)
- **Expo CLI**: `npm install -g @expo/cli`
- **Android Studio** (Android 개발용)
- **Xcode** (iOS 개발용, macOS만)

### 환경 변수
```bash
# .env 파일 (프로젝트 루트)
API_BASE_URL=http://localhost:3000/api/v1
SOCKET_URL=http://localhost:3000
```

### 패키지 상태
```json
{
  "expo": "~51.0.28",
  "@react-navigation/native": "^6.1.18",
  "react-native-paper": "^5.12.3",
  "socket.io-client": "^4.7.5",
  "axios": "^1.6.2",
  "react-hook-form": "^7.48.2"
}
```

## 🔧 작업 재개 체크리스트

### [ ] 환경 준비
- [ ] 프로젝트 디렉토리 이동
- [ ] 의존성 설치 상태 확인
- [ ] 백엔드 서버 실행
- [ ] 프론트엔드 개발 서버 실행

### [ ] 코드 상태 확인
- [ ] 최근 변경사항 검토
- [ ] 에러 없이 빌드 되는지 확인
- [ ] 인증 플로우 동작 확인
- [ ] API 연결 상태 확인

### [ ] 다음 작업 준비
- [ ] ClubDetailScreen 설계 검토
- [ ] API 엔드포인트 확인
- [ ] UI 컴포넌트 계획 수립

## 🎯 내일 작업 목표

### 1단계: ClubDetailScreen (2-3시간)
```javascript
// 구현할 주요 기능
- 클럽 상세 정보 표시
- 멤버 목록 및 역할 표시
- 가입/탈퇴 기능
- 클럽 게임 목록
- 클럽 이미지 갤러리
```

### 2단계: GameDetailScreen (2-3시간)
```javascript
// 구현할 주요 기능
- 게임 상세 정보
- 참가자 목록
- 게임 참가/취소
- 게임 결과 표시
- 댓글 시스템 (간단)
```

### 3단계: GameCreateScreen (1-2시간)
```javascript
// 구현할 주요 기능
- 게임 생성 폼
- 날짜/시간 선택
- 위치 입력 (지도 연동 준비)
- 참가비 설정
- 레벨 제한 설정
```

### 4단계: ProfileEditScreen (1시간)
```javascript
// 구현할 주요 기능
- 프로필 정보 수정
- 이미지 업로드 (준비)
- 비밀번호 변경
- 알림 설정
```

## 📚 참고 자료

### 코드 스타일 가이드
```javascript
// 컴포넌트 구조 예시
const ScreenName = ({ navigation, route }) => {
  const [state, setState] = useState(initialState);
  
  useEffect(() => {
    // 초기 데이터 로드
  }, []);
  
  const handleAction = async () => {
    try {
      // API 호출
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* UI 컴포넌트 */}
    </SafeAreaView>
  );
};
```

### 스타일 가이드
```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  // theme.spacing 사용
  // theme.colors 사용
  // 일관된 네이밍
});
```

## 🔍 디버깅 가이드

### 자주 발생하는 문제들

#### 1. Metro bundler 오류
```bash
# 캐시 클리어
npx expo start --clear

# 또는
npm start -- --reset-cache
```

#### 2. 의존성 문제
```bash
# node_modules 재설치
rm -rf node_modules
npm install
```

#### 3. Android 빌드 오류
```bash
# Android 캐시 클리어
cd android
./gradlew clean
cd ..
npx expo run:android
```

#### 4. API 연결 오류
- 백엔드 서버 실행 상태 확인
- API_BASE_URL 환경변수 확인
- 네트워크 연결 확인

## 📞 도움 요청 방법

### 정보 수집
1. **오류 메시지** 전체 복사
2. **재현 단계** 상세 기록
3. **환경 정보** (OS, Node.js 버전 등)
4. **변경사항** 최근 수정한 파일들

### 질문 형식
```
🐛 문제 상황:
- 어떤 작업을 하다가 발생했는지
- 예상했던 결과 vs 실제 결과

🔍 시도해본 해결책:
- 어떤 방법들을 시도했는지

📋 환경 정보:
- OS, Node.js 버전, Expo 버전

📎 관련 파일:
- 수정한 파일들의 경로
```

## 🚀 다음 세션 준비

### 작업 완료 시 해야 할 일
1. **진행상황 업데이트**: development-log.md 업데이트
2. **변경사항 정리**: 새로 추가된 파일들 목록
3. **발견된 이슈**: 해결된 문제와 미해결 문제 정리
4. **다음 목표 설정**: 구체적인 다음 단계 계획

### 세션 종료 전 체크리스트
- [ ] 모든 파일 저장
- [ ] 개발 서버 정상 동작 확인
- [ ] 에러 없이 빌드 되는지 확인
- [ ] 주요 변경사항 문서화
- [ ] 다음 작업 계획 업데이트

---

**📧 연락처**: 작업 중 문제가 생기면 언제든 도움을 요청하세요!
**⏰ 예상 소요시간**: 다음 작업들로 6-8시간 분량
**🎯 목표**: 상세 화면들 완성으로 앱의 핵심 기능 완성