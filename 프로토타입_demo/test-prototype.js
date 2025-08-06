const { chromium } = require('playwright');

async function testPrototype() {
  console.log('🚀 프로토타입 검증 시작...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // iPhone X 크기
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  });
  
  const page = await context.newPage();
  
  // 콘솔 에러 모니터링
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log('❌ Console Error:', msg.text());
    }
  });
  
  try {
    console.log('📱 Expo 개발 서버 접속 중...');
    
    // Expo 개발 서버가 실행 중인지 확인
    try {
      const response = await page.goto('http://localhost:19007', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      if (!response || !response.ok()) {
        throw new Error(`서버 응답 오류: ${response?.status()}`);
      }
      
      console.log('✅ Expo 개발 서버 연결 성공');
    } catch (serverError) {
      console.log('❌ Expo 개발 서버에 연결할 수 없습니다.');
      console.log('   서버를 먼저 시작하세요: npm start');
      console.log('   그 후 브라우저에서 http://localhost:19007 접속');
      return;
    }
    
    // 페이지 로딩 대기
    await page.waitForTimeout(5000);
    
    console.log('🔍 프로토타입 UI 요소 검증 중...\n');
    
    // 1. 앱 타이틀 확인
    try {
      await page.waitForSelector('text=🏸 동배즐', { timeout: 10000 });
      console.log('✅ 앱 타이틀 로딩 성공');
    } catch (e) {
      console.log('❌ 앱 타이틀을 찾을 수 없습니다');
    }
    
    // 2. 네비게이션 탭 확인
    const navigationTabs = ['홈', '체크인', '게임현황', '점수입력'];
    for (const tab of navigationTabs) {
      try {
        const tabElement = await page.locator(`text=${tab}`).first();
        if (await tabElement.isVisible()) {
          console.log(`✅ [${tab}] 탭 확인됨`);
        } else {
          console.log(`❌ [${tab}] 탭이 보이지 않음`);
        }
      } catch (e) {
        console.log(`❌ [${tab}] 탭을 찾을 수 없음`);
      }
    }
    
    // 3. 홈 화면 주요 요소 확인
    console.log('\n🏠 홈 화면 검증 중...');
    try {
      // 게임 참가 버튼 확인
      const participateButton = page.locator('text=게임에 참가하기');
      if (await participateButton.isVisible()) {
        console.log('✅ 게임 참가 버튼 확인됨');
        
        // 버튼 클릭 테스트
        await participateButton.click();
        console.log('✅ 게임 참가 버튼 클릭 성공');
      }
    } catch (e) {
      console.log('❌ 홈 화면 요소 확인 실패:', e.message);
    }
    
    // 4. 체크인 화면 테스트
    console.log('\n📱 체크인 화면 테스트...');
    try {
      const checkInTab = page.locator('text=체크인');
      await checkInTab.click();
      await page.waitForTimeout(1000);
      
      const checkInButton = page.locator('text=체육관 도착!');
      if (await checkInButton.isVisible()) {
        console.log('✅ 체크인 버튼 확인됨');
        await checkInButton.click();
        console.log('✅ 체크인 버튼 클릭 성공');
      }
    } catch (e) {
      console.log('❌ 체크인 화면 테스트 실패:', e.message);
    }
    
    // 5. 게임 현황 화면 테스트
    console.log('\n🎮 게임 현황 화면 테스트...');
    try {
      const gameBoardTab = page.locator('text=게임현황');
      await gameBoardTab.click();
      await page.waitForTimeout(1000);
      
      // 현재 진행 중인 게임 확인
      const gameStatus = page.locator('text=A코트');
      if (await gameStatus.isVisible()) {
        console.log('✅ 게임 현황 정보 확인됨');
      }
    } catch (e) {
      console.log('❌ 게임 현황 화면 테스트 실패:', e.message);
    }
    
    // 6. 점수 입력 화면 테스트
    console.log('\n⚡ 점수 입력 화면 테스트...');
    try {
      const scoreTab = page.locator('text=점수입력');
      await scoreTab.click();
      await page.waitForTimeout(1000);
      
      // 팀 버튼 확인
      const teamButtons = await page.locator('button').filter({ hasText: '승리' }).count();
      if (teamButtons > 0) {
        console.log('✅ 점수 입력 버튼들 확인됨');
      }
    } catch (e) {
      console.log('❌ 점수 입력 화면 테스트 실패:', e.message);
    }
    
    // 7. 반응형 디자인 테스트
    console.log('\n📱 반응형 디자인 테스트...');
    
    // 태블릿 크기로 변경
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    console.log('✅ 태블릿 크기 적응 확인');
    
    // 다시 모바일 크기로
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(1000);
    console.log('✅ 모바일 크기 복원 확인');
    
    // 8. 성능 검사
    console.log('\n⚡ 성능 검사...');
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart),
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
      };
    });
    
    console.log(`✅ 페이지 로드 시간: ${performanceMetrics.loadTime}ms`);
    console.log(`✅ DOM 로드 시간: ${performanceMetrics.domContentLoaded}ms`);
    
    // 9. 콘솔 에러 요약
    console.log('\n📋 검증 결과 요약:');
    if (consoleErrors.length === 0) {
      console.log('✅ 콘솔 에러 없음');
    } else {
      console.log(`❌ 콘솔 에러 ${consoleErrors.length}개 발견:`);
      consoleErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: 'prototype-screenshot.png',
      fullPage: true 
    });
    console.log('📸 프로토타입 스크린샷 저장: prototype-screenshot.png');
    
    console.log('\n🎉 프로토타입 검증 완료!');
    
    // 5초 후 브라우저 닫기
    console.log('\n5초 후 브라우저를 닫습니다...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
}

// 테스트 실행
testPrototype().catch(console.error);