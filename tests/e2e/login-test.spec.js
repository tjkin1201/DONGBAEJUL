import { test, expect } from '@playwright/test';

test('로그인 기능 테스트', async ({ page }) => {
  await page.goto('/', { timeout: 10000 });
  
  // 로그인 전 상태 확인
  await expect(page.locator('text=🏸 동배즐')).toBeVisible();
  await expect(page.locator('text=일반 로그인')).toBeVisible();
  await expect(page.locator('text=Band 로그인')).toBeVisible();
  
  // 일반 로그인 버튼 클릭
  await page.click('text=일반 로그인');
  
  // 로그인 후 상태 확인 (로딩 기다림)
  await page.waitForTimeout(2000);
  
  // 로그인 성공 후 UI 확인
  await expect(page.locator('text=환영합니다!')).toBeVisible();
  await expect(page.locator('text=로그인되었습니다.')).toBeVisible();
  await expect(page.locator('text=로그아웃')).toBeVisible();
  
  // 로그아웃 테스트
  await page.click('text=로그아웃');
  
  // 로그아웃 후 상태 확인
  await expect(page.locator('text=일반 로그인')).toBeVisible();
  await expect(page.locator('text=Band 로그인')).toBeVisible();
});
