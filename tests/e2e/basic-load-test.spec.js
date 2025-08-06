import { test, expect } from '@playwright/test';

test('앱 기본 로드 테스트', async ({ page }) => {
  // 페이지로 이동
  await page.goto('/', {
    waitUntil: 'load',
    timeout: 10000
  });

  // 페이지가 로드되었는지 확인
  await page.waitForTimeout(2000);
  
  // 제목 확인
  const title = await page.title();
  expect(title).toContain('동배즐');
  
  // 페이지 내용 출력
  const content = await page.textContent('body');
  console.log('페이지 내용:', content);
});
