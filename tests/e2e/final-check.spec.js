import { test, expect } from '@playwright/test';

test('최종 확인', async ({ page }) => {
  await page.goto('/', { timeout: 15000 });
  await page.waitForTimeout(3000);
  
  const bodyText = await page.textContent('body');
  console.log('현재 페이지:', bodyText.substring(0, 200));
});
