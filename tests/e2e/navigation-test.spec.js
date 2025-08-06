import { test, expect } from '@playwright/test';

test('새로운 네비게이션 확인', async ({ page }) => {
  await page.goto('/', { timeout: 10000 });
  
  // 2초 대기
  await page.waitForTimeout(2000);
  
  const bodyText = await page.textContent('body');
  console.log('페이지 텍스트:', bodyText.substring(0, 500));
  
  // 제목 확인
  await expect(page.locator('text=🏸 동배즐')).toBeVisible();
  
  // WelcomeScreen 버튼들 확인
  const bandButton = page.locator('text=Band로 시작하기');
  const emailButton = page.locator('text=이메일로 로그인');
  const signupButton = page.locator('text=회원가입');
  
  console.log('Band 버튼 존재:', await bandButton.count());
  console.log('이메일 버튼 존재:', await emailButton.count());
  console.log('회원가입 버튼 존재:', await signupButton.count());
});
