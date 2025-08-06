# 🎵 NAVER Band API 설정 가이드

## 📋 5단계: 실제 Band API 프로덕션 설정

현재 앱에서 Mock API를 사용하고 있습니다. 실제 Band API를 연동하기 위해 다음 단계를 진행해야 합니다.

---

## 🔧 1. NAVER Developers 설정

### 1.1 NAVER Developers 가입 및 앱 등록
1. **NAVER Developers 접속**: https://developers.naver.com/
2. **로그인** 후 **애플리케이션 등록** 클릭
3. **앱 정보 입력**:
   - 애플리케이션 이름: `동배즐 (Dongbaejul)`
   - 사용 API: `Band API` 선택
   - 서비스 환경: `Android` 선택

### 1.2 앱 설정 정보
```
앱 이름: 동배즐 (Dongbaejul)
패키지 이름: com.dongbaejul.app
Redirect URI: dongbaejul://auth/callback
```

### 1.3 Band API 권한 설정
- **band.read**: Band 정보 읽기
- **band.write**: Band 글 작성
- **band.member**: 멤버 정보 조회

---

## 🔑 2. 클라이언트 키 발급

앱 등록 완료 후 다음 정보를 받게 됩니다:

```
Client ID: [발급받은 클라이언트 ID]
Client Secret: [발급받은 클라이언트 시크릿]
```

---

## ⚙️ 3. .env 파일 업데이트

발급받은 키로 `.env` 파일을 업데이트하세요:

```env
# NAVER Band API Configuration (실제 값으로 교체)
BAND_CLIENT_ID=your_actual_client_id_here
BAND_CLIENT_SECRET=your_actual_client_secret_here
```

---

## 🧪 4. 테스트 방법

### 4.1 개발 환경에서 테스트
```bash
# 앱 재시작
npx expo start
```

### 4.2 실제 Band 로그인 테스트
1. Android 에뮬레이터에서 앱 실행
2. "Band로 시작하기" 버튼 클릭  
3. 실제 NAVER Band 로그인 화면이 표시되는지 확인
4. 로그인 후 앱으로 정상 복귀하는지 확인

---

## 🔍 5. 현재 Mock API 상태

현재 앱은 다음과 같이 Mock API를 사용 중입니다:

```javascript
// src/services/bandAPIConfig.js
shouldUseMockAPI() {
  return this.isDevelopmentMode() || !this.isConfigured;
}
```

실제 키가 설정되면 자동으로 실제 Band API로 전환됩니다.

---

## ⚠️ 6. 주의사항

### 6.1 보안
- `.env` 파일은 절대 Git에 커밋하지 마세요
- 실제 키는 프로덕션 환경에서만 사용하세요

### 6.2 개발 vs 프로덕션
- 개발: Mock API 사용 (현재 상태)
- 프로덕션: 실제 Band API 사용

### 6.3 Redirect URI 확인
앱의 `app.json`에 설정된 scheme과 일치해야 합니다:
```json
{
  "expo": {
    "scheme": "dongbaejul"
  }
}
```

---

## 🎯 다음 단계

실제 Band API 설정이 완료되면:
1. ✅ **Band API 테스트 완료**
2. 🔄 **6단계: 백엔드 API 연동** 진행
3. 🔄 **7단계: 핵심 기능 구현** 진행

---

**💡 도움이 필요하면 언제든 말씀해주세요!**
