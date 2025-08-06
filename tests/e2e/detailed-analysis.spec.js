import { test, expect } from '@playwright/test';

test('앱 상세 분석', async ({ page }) => {
  // 브라우저 콘솔 로그 수집
  const consoleMessages = [];
  page.on('console', msg => consoleMessages.push(msg.text()));

  // 에러 수집
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  // 페이지로 이동
  await page.goto('/', {
    waitUntil: 'networkidle',
    timeout: 15000
  });

  // JavaScript가 실행될 때까지 대기
  await page.waitForTimeout(3000);

  // 제목 확인
  const title = await page.title();
  console.log('페이지 제목:', title);

  // HTML 내용 확인
  const html = await page.content();
  console.log('HTML 길이:', html.length);

  // 페이지 텍스트 확인
  const bodyText = await page.textContent('body');
  console.log('페이지 텍스트:', bodyText);

  // React 앱이 렌더링되었는지 확인
  const reactRoot = await page.locator('#root').count();
  console.log('React 루트 존재:', reactRoot > 0);

  // 동배즐 텍스트 찾기
  const dongbaejulText = await page.locator('text=🏸 동배즐').count();
  console.log('동배즐 텍스트 존재:', dongbaejulText > 0);

  // 콘솔 메시지 출력
  console.log('콘솔 메시지들:', consoleMessages);

  // 에러 메시지 출력
  console.log('페이지 에러들:', pageErrors);

  // 스크린샷 촬영
  await page.screenshot({ path: 'test-results/current-page.png', fullPage: true });
});
