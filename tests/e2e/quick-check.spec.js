import { test, expect } from '@playwright/test';

test('빠른 로딩 확인', async ({ page }) => {
  await page.goto('/', { timeout: 10000 });
  
  // 2초 대기
  await page.waitForTimeout(2000);
  
  const bodyText = await page.textContent('body');
  console.log('페이지 텍스트:', bodyText.substring(0, 500));
  
  // React 루트 확인
  const reactRoot = await page.locator('#root').count();
  console.log('React 루트 존재:', reactRoot > 0);
});
