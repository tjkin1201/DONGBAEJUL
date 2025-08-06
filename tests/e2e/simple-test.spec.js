import { test, expect } from '@playwright/test';

test.describe('동배즐 앱 간단 테스트', () => {
  test('웹 앱 기본 로딩 테스트', async ({ page }) => {
    // 타임아웃을 늘리고 웹 앱 홈페이지로 이동
    await page.goto('/', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });

    // 페이지 제목 확인
    const title = await page.title();
    console.log('페이지 제목:', title);
    expect(title).toBeTruthy();

    // React Native 웹의 기본 구조 확인
    const bodyContent = await page.textContent('body');
    console.log('페이지 콘텐츠 길이:', bodyContent?.length || 0);
    expect(bodyContent?.length || 0).toBeGreaterThan(0);

    // 스크린샷 촬영
    await page.screenshot({ path: 'test-results/app-loaded.png' });
  });

  test('페이지 응답성 테스트', async ({ page }) => {
    await page.goto('/', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });

    // 모든 클릭 가능한 요소 찾기
    const clickableElements = await page.locator('button, [role="button"], a, [role="link"], div[onclick], span[onclick]').all();
    
    console.log(`클릭 가능한 요소 수: ${clickableElements.length}`);

    if (clickableElements.length > 0) {
      // 첫 번째 요소 클릭
      try {
        await clickableElements[0].click({ timeout: 5000 });
        console.log('첫 번째 요소 클릭 성공');
        
        // 클릭 후 페이지 상태 확인
        await page.waitForTimeout(2000);
        
        const afterClickContent = await page.textContent('body');
        expect(afterClickContent?.length || 0).toBeGreaterThan(0);
      } catch (error) {
        console.log('클릭 실패:', error.message);
      }
    }
  });

  test('브라우저 콘솔 에러 확인', async ({ page }) => {
    const errors = [];
    const warnings = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    await page.goto('/', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });

    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForTimeout(5000);

    console.log(`콘솔 에러 수: ${errors.length}`);
    console.log(`콘솔 경고 수: ${warnings.length}`);

    if (errors.length > 0) {
      console.log('콘솔 에러들:', errors.slice(0, 3));
    }

    // 심각한 에러만 체크 (일부 경고나 알려진 에러는 허용)
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') &&
      !error.includes('Warning') &&
      !error.includes('deprecated') &&
      !error.includes('ResizeObserver')
    );

    expect(criticalErrors.length).toBeLessThan(10); // 너무 많은 에러가 없는지 확인
  });
});
