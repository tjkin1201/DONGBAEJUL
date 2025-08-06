const { chromium } = require('playwright');

async function debugWeb() {
  console.log('🔍 프로토타입 웹 디버깅 시작...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 },
  });
  
  const page = await context.newPage();
  
  // 모든 콘솔 로그 캡처
  page.on('console', msg => {
    console.log(`📟 Console [${msg.type()}]:`, msg.text());
  });
  
  // 네트워크 에러 캡처
  page.on('response', response => {
    if (!response.ok()) {
      console.log(`❌ Network Error: ${response.url()} - ${response.status()}`);
    }
  });
  
  try {
    console.log('🌐 http://localhost:19007 접속 중...');
    
    await page.goto('http://localhost:19007', { 
      waitUntil: 'load',
      timeout: 30000 
    });
    
    console.log('✅ 페이지 로드 완료');
    
    // 페이지 내용 확인
    await page.waitForTimeout(3000);
    
    const title = await page.title();
    console.log(`📄 페이지 타이틀: ${title}`);
    
    // DOM 구조 확인
    const bodyContent = await page.locator('body').innerHTML();
    console.log('📋 페이지 내용 (첫 500자):');
    console.log(bodyContent.substring(0, 500) + '...');
    
    // React/Expo 로딩 상태 확인
    const reactRoot = await page.locator('#root, #app, [data-reactroot]').count();
    console.log(`⚛️ React 루트 요소 개수: ${reactRoot}`);
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: 'debug-screenshot.png',
      fullPage: true 
    });
    console.log('📸 디버그 스크린샷 저장: debug-screenshot.png');
    
    console.log('\n⏳ 30초 동안 페이지를 관찰합니다...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ 디버깅 중 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
}

debugWeb().catch(console.error);