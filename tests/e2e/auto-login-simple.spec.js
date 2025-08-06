const { test, expect } = require('@playwright/test');

test('자동 로그인 기능 확인', async ({ page }) => {
  // 페이지로 이동
  await page.goto('/');
  
  // 페이지가 로드될 때까지 기다림
  await page.waitForTimeout(3000);
  
  // 현재 페이지 내용 확인
  const content = await page.textContent('body');
  console.log('페이지 내용:', content);
  
  // 웰컴 화면이 표시되는지 확인
  const welcomeVisible = await page.locator('[data-testid="welcome-screen"]').isVisible().catch(() => false);
  console.log('웰컴 화면 표시 여부:', welcomeVisible);
  
  if (welcomeVisible) {
    console.log('✅ 자동 로그인 토큰이 없어서 웰컴 화면이 표시됨');
    
    // Band 로그인 버튼 클릭
    await page.click('[data-testid="band-login-button"]');
    
    // 로그인 완료 기다림
    await page.waitForSelector('[data-testid="main-navigator"]', { timeout: 15000 });
    console.log('✅ Band 로그인 성공');
    
    // localStorage에 토큰이 저장되었는지 확인
    const token = await page.evaluate(() => localStorage.getItem('bandAccessToken'));
    console.log('저장된 토큰:', token ? '있음' : '없음');
    
    // 페이지 새로고침
    await page.reload();
    
    // 자동 로그인으로 메인 화면이 바로 나타나는지 확인
    await page.waitForSelector('[data-testid="main-navigator"]', { timeout: 10000 });
    console.log('✅ 자동 로그인 성공');
    
    // 웰컴 화면이 나타나지 않는지 확인
    const welcomeAfterReload = await page.locator('[data-testid="welcome-screen"]').isVisible().catch(() => false);
    expect(welcomeAfterReload).toBe(false);
    console.log('✅ 자동 로그인 후 웰컴 화면이 나타나지 않음');
    
  } else {
    // 메인 화면이 바로 표시되는지 확인
    const mainVisible = await page.locator('[data-testid="main-navigator"]').isVisible().catch(() => false);
    if (mainVisible) {
      console.log('✅ 자동 로그인으로 메인 화면이 바로 표시됨');
    } else {
      console.log('❌ 웰컴 화면도 메인 화면도 표시되지 않음');
    }
  }
});
