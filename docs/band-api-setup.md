# 🎵 네이버 밴드 API 연동 가이드

## 📋 Band API 토큰 생성 단계

### 1. 네이버 밴드 개발자 계정 생성

1. **네이버 밴드 개발자 사이트 접속**
   - URL: https://developers.band.us
   - 네이버 계정으로 로그인

2. **개발자 등록**
   - "개발자 등록" 버튼 클릭
   - 약관 동의 및 정보 입력
   - 휴대폰 인증 완료

### 2. 애플리케이션 등록

1. **새 앱 생성**
   ```
   앱 이름: 동배즐 (DongBaeJul)
   앱 설명: 배드민턴 동호회 관리 및 게임 매칭 앱
   카테고리: 스포츠/레저
   ```

2. **앱 정보 설정**
   ```
   - 앱 아이콘: 배드민턴 관련 이미지
   - 앱 설명: 상세 설명 입력
   - 개발자 연락처: 이메일 주소
   ```

3. **플랫폼 설정**
   ```
   ✅ Android
   ✅ iOS
   ✅ Web
   ```

### 3. OAuth 설정

1. **Redirect URI 설정**
   ```
   Production: dongbaejul://auth/band
   Development: exp://127.0.0.1:19000/--/auth/band
   Web: http://localhost:8081/auth/band
   ```

2. **권한(Scope) 설정**
   ```
   ✅ profile - 사용자 프로필 조회
   ✅ band - 밴드 목록 조회
   ✅ band_write - 밴드 게시물 작성
   ```

### 4. API 키 발급

앱 등록 완료 후 받게 되는 정보:

```env
BAND_CLIENT_ID=발급받은_클라이언트_ID
BAND_CLIENT_SECRET=발급받은_클라이언트_시크릿
```

### 5. 환경 변수 설정

`.env` 파일에 발급받은 키 입력:
```env
# NAVER Band API Configuration
BAND_CLIENT_ID=실제_발급받은_클라이언트_ID
BAND_CLIENT_SECRET=실제_발급받은_클라이언트_시크릿
```

### 6. 테스트 계정 설정

1. **테스트 사용자 등록**
   - 개발자 콘솔에서 테스트 계정 추가
   - 본인 네이버 계정을 테스트 계정으로 등록

2. **밴드 생성**
   - 네이버 밴드 앱에서 테스트용 배드민턴 동호회 생성
   - 몇 개의 게시물과 멤버 추가

## 🔧 개발 환경에서 테스트

### Mock API 비활성화
개발 중에는 Mock API가 사용되고 있습니다. 실제 API 테스트를 위해:

```javascript
// src/services/bandAPI.js
const USE_MOCK_API = false; // Mock API 비활성화
```

### 로그인 플로우 테스트
1. 앱에서 "밴드 로그인" 버튼 클릭
2. 네이버 밴드 OAuth 페이지로 이동
3. 로그인 후 권한 승인
4. 앱으로 돌아와서 토큰 확인

## 📱 실제 사용 시나리오

### 1. 사용자 로그인
```javascript
const result = await bandAPI.startBandLogin();
console.log('로그인 성공:', result.userInfo);
```

### 2. 사용자 밴드 목록 조회
```javascript
const bands = await bandAPI.getUserBands();
console.log('가입한 밴드 수:', bands.length);
```

### 3. 배드민턴 관련 밴드 찾기
```javascript
const badmintonBands = await bandAPI.findBadmintonBands();
console.log('배드민턴 밴드:', badmintonBands);
```

### 4. 동배즐 클럽으로 변환
```javascript
const clubs = badmintonBands.map(band => 
  bandAPI.convertBandToClub(band)
);
```

## ⚠️ 주의사항

1. **개발자 심사**
   - 앱이 공개되기 전 네이버 심사 필요
   - 심사 기간: 약 1-2주

2. **API 제한**
   - 일일 API 호출 제한 있음
   - 과도한 호출 시 일시 제한

3. **사용자 동의**
   - 밴드 데이터 접근 시 사용자 명시적 동의 필요
   - 개인정보 처리방침 필수

## 🔄 API 연동 플로우

```
1. 사용자가 "밴드로 로그인" 선택
   ↓
2. 네이버 밴드 OAuth 페이지로 이동
   ↓
3. 사용자 로그인 및 권한 승인
   ↓
4. 인증 코드를 액세스 토큰으로 교환
   ↓
5. 토큰으로 사용자 정보 및 밴드 목록 조회
   ↓
6. 배드민턴 관련 밴드 필터링
   ↓
7. 동배즐 클럽 데이터로 변환 및 저장
```

## 📞 지원

- **네이버 밴드 개발자 문서**: https://developers.band.us/develop/guide/
- **API 레퍼런스**: https://developers.band.us/develop/reference/
- **개발자 포럼**: https://developers.band.us/community/
