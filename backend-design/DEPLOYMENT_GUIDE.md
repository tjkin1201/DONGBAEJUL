# 🚀 동배줄 백엔드 배포 가이드

## 📋 배포 준비 체크리스트

### 1. 환경 설정
- [ ] PostgreSQL 데이터베이스 준비
- [ ] 환경변수 설정 (.env 파일)
- [ ] JWT Secret 키 생성
- [ ] Band API 클라이언트 정보 설정

### 2. 의존성 패키지 설치
```bash
npm install
```

### 3. 데이터베이스 마이그레이션
```bash
# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션 실행
npx prisma migrate deploy

# 시드 데이터 삽입 (선택사항)
npm run db:seed
```

## 🌐 배포 옵션

### Option 1: Railway 배포 (추천)

1. **Railway 계정 생성**: https://railway.app

2. **프로젝트 생성**:
   ```bash
   # Railway CLI 설치
   npm install -g @railway/cli

   # 로그인
   railway login

   # 프로젝트 생성
   railway init
   ```

3. **환경변수 설정**:
   ```bash
   # PostgreSQL 추가
   railway add postgresql

   # 환경변수 설정
   railway variables set NODE_ENV=production
   railway variables set JWT_SECRET=your-jwt-secret-key
   railway variables set FRONTEND_URL=https://your-frontend-domain.com
   ```

4. **배포 실행**:
   ```bash
   railway up
   ```

### Option 2: Render 배포

1. **Render 계정 생성**: https://render.com

2. **Web Service 생성**:
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `npm start`

3. **PostgreSQL 데이터베이스 추가**:
   - 새 PostgreSQL 서비스 생성
   - 연결 정보를 환경변수에 추가

4. **환경변수 설정**:
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://username:password@host:port/database
   JWT_SECRET=your-jwt-secret-key
   FRONTEND_URL=https://your-frontend-domain.com
   ```

### Option 3: Docker + VPS 배포

1. **Docker 이미지 빌드**:
   ```bash
   docker build -t dongbaejul-backend .
   ```

2. **Docker Compose 설정**:
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
         - DATABASE_URL=postgresql://postgres:password@db:5432/dongbaejul
       depends_on:
         - db
     
     db:
       image: postgres:15
       environment:
         - POSTGRES_DB=dongbaejul
         - POSTGRES_USER=postgres
         - POSTGRES_PASSWORD=password
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
   volumes:
     postgres_data:
   ```

3. **실행**:
   ```bash
   docker-compose up -d
   ```

## 🗄️ 데이터베이스 설정

### PostgreSQL 설정 (로컬 개발용)

1. **PostgreSQL 설치**:
   ```bash
   # Windows (Chocolatey)
   choco install postgresql

   # macOS (Homebrew)
   brew install postgresql

   # Ubuntu
   sudo apt-get install postgresql postgresql-contrib
   ```

2. **데이터베이스 생성**:
   ```sql
   CREATE DATABASE dongbaejul;
   CREATE USER dongbaejul_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE dongbaejul TO dongbaejul_user;
   ```

3. **환경변수 설정**:
   ```env
   DATABASE_URL="postgresql://dongbaejul_user:your_password@localhost:5432/dongbaejul?schema=public"
   ```

### 클라우드 PostgreSQL 옵션

#### Supabase (무료 티어 제공)
1. https://supabase.com 가입
2. 새 프로젝트 생성
3. Database 탭에서 연결 정보 확인
4. CONNECTION POOLING URL 사용 권장

#### PlanetScale (MySQL 호환)
1. https://planetscale.com 가입
2. 새 데이터베이스 생성
3. 연결 문자열 복사

#### Neon (PostgreSQL)
1. https://neon.tech 가입
2. 새 프로젝트 생성
3. 연결 정보 복사

## 🔐 보안 설정

### JWT Secret 생성
```bash
# 강력한 JWT Secret 생성
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### CORS 설정
프론트엔드 도메인을 정확히 설정:
```javascript
app.use(cors({
  origin: [
    'http://localhost:19006',      // 개발용
    'https://your-app-domain.com'  // 운영용
  ],
  credentials: true
}));
```

### Rate Limiting
API 남용 방지:
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100 // IP당 최대 100개 요청
});
```

## 📊 모니터링 및 로깅

### 로그 설정
```javascript
// Winston 로거 사용 예시
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 헬스체크 엔드포인트
```
GET /health
```
응답:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

## 🔄 CI/CD 파이프라인

### GitHub Actions 예시
```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Deploy to Railway
        uses: railway-app/railway-deploy@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
```

## 📈 성능 최적화

### 1. 데이터베이스 최적화
- 적절한 인덱스 설정
- 쿼리 최적화
- 연결 풀 관리

### 2. 캐싱 전략
```javascript
// Redis 캐싱 예시
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// 캐시 미들웨어
const cache = (duration) => {
  return async (req, res, next) => {
    const key = req.originalUrl;
    const cached = await client.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      client.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };
    
    next();
  };
};
```

### 3. 이미지 최적화
- Sharp를 사용한 이미지 리사이징
- WebP 형식 지원
- CDN 활용

## 🔧 트러블슈팅

### 일반적인 문제들

1. **데이터베이스 연결 실패**
   - DATABASE_URL 확인
   - 방화벽 설정 확인
   - 네트워크 연결 상태 확인

2. **JWT 토큰 오류**
   - JWT_SECRET 설정 확인
   - 토큰 만료 시간 확인
   - 토큰 형식 검증

3. **CORS 오류**
   - 프론트엔드 도메인 화이트리스트 확인
   - credentials 설정 확인

4. **파일 업로드 실패**
   - 파일 크기 제한 확인
   - 업로드 디렉토리 권한 확인
   - MIME 타입 검증

### 로그 확인 명령어
```bash
# Railway 로그 확인
railway logs

# Docker 로그 확인
docker logs <container-id>

# PM2 로그 확인 (VPS)
pm2 logs
```

## 📞 지원 및 문의

개발팀 연락처:
- 이메일: dev@dongbaejul.com
- Slack: #dongbaejul-dev
- GitHub Issues: https://github.com/dongbaejul/backend/issues

## 🔄 업데이트 절차

1. **개발 환경에서 테스트**
2. **스테이징 환경 배포**
3. **운영 환경 배포**
4. **모니터링 및 롤백 준비**

### 데이터베이스 마이그레이션
```bash
# 마이그레이션 생성
npx prisma migrate dev --name "description"

# 운영 환경 마이그레이션
npx prisma migrate deploy
```

배포 완료 후 프론트엔드에서 API 테스트를 진행해주세요! 🚀
