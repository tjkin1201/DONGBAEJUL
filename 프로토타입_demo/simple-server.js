const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, 'web-prototype.html');
  
  // 기본 경로 처리
  if (req.url === '/' || req.url === '/index.html') {
    filePath = path.join(__dirname, 'web-prototype.html');
  }

  // Content-Type 설정
  const ext = path.extname(filePath);
  let contentType = 'text/html';
  
  if (ext === '.js') contentType = 'application/javascript';
  else if (ext === '.css') contentType = 'text/css';

  // 파일 읽기 및 응답
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404 - 페이지를 찾을 수 없습니다</h1>');
      return;
    }
    
    res.writeHead(200, { 
      'Content-Type': contentType + '; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 프로토타입 서버가 실행 중입니다:`);
  console.log(`   📱 http://localhost:${PORT}`);
  console.log(`   🌐 브라우저에서 접속하세요`);
  console.log(`   📱 모바일에서 테스트하려면 개발자도구로 모바일 모드 활성화`);
});

process.on('SIGINT', () => {
  console.log('\n👋 서버를 종료합니다...');
  process.exit(0);
});