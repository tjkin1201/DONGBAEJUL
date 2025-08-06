import { test, expect } from '@playwright/test';

test('완전한 네비게이션 테스트', async ({ page }) => {
  await page.goto('/', { timeout: 10000 });
  
  // 2초 대기
  await page.waitForTimeout(2000);
  
  // WelcomeScreen 요소들 확인
  await expect(page.locator('text=동배즐')).toBeVisible();
  await expect(page.locator('text=함께하는 배드민턴의 즐거움')).toBeVisible();
  await expect(page.locator('text=Band로 시작하기')).toBeVisible();
  await expect(page.locator('text=이메일로 로그인')).toBeVisible();
  
  // Band 로그인 버튼 클릭
  await page.click('text=Band로 시작하기');
  
  // 로그인 후 MainNavigator 확인 (로딩 기다림)
  await page.waitForTimeout(2000);
  
  // MainNavigator 탭들 확인
  await expect(page.locator('text=홈')).toBeVisible();
  await expect(page.locator('text=경기')).toBeVisible();
  await expect(page.locator('text=멤버')).toBeVisible();
  await expect(page.locator('text=프로필')).toBeVisible();
  
  // 홈 화면 내용 확인
  await expect(page.locator('text=동배즐 홈')).toBeVisible();
  
  // 다른 탭들 테스트
  await page.click('text=경기');
  await expect(page.locator('text=경기 관리')).toBeVisible();
  
  await page.click('text=멤버');
  await expect(page.locator('text=멤버')).toBeVisible();
  
  await page.click('text=프로필');
  await expect(page.locator('text=프로필')).toBeVisible();
  await expect(page.locator('text=로그아웃')).toBeVisible();
  
  // 로그아웃 테스트
  await page.click('text=로그아웃');
  
  // WelcomeScreen으로 돌아왔는지 확인
  await page.waitForTimeout(1000);
  await expect(page.locator('text=Band로 시작하기')).toBeVisible();
});
