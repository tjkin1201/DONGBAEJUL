import { test, expect } from '@playwright/test';

test.describe('동배즐 앱 건강 상태 체크', () => {
  test('기본 페이지 로딩 확인', async ({ page }) => {
    // 더 긴 타임아웃으로 페이지 로드
    await page.goto('/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // 페이지 제목 확인
    const title = await page.title();
    console.log('페이지 제목:', title);
    
    // HTML 내용 기본 확인
    const html = await page.content();
    console.log('HTML 길이:', html.length);
    
    // 기본 React Native 웹 구조 확인
    expect(html).toContain('<!DOCTYPE html>');
    expect(html.length).toBeGreaterThan(100);

    // 스크린샷 저장
    await page.screenshot({ 
      path: 'test-results/health-check.png',
      fullPage: true 
    });
  });

  test('네트워크 요청 모니터링', async ({ page }) => {
    const requests = [];
    const responses = [];

    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method()
      });
    });

    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status()
      });
    });

    await page.goto('/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    console.log(`총 요청 수: ${requests.length}`);
    console.log(`총 응답 수: ${responses.length}`);
    
    // 실패한 요청 확인
    const failedRequests = responses.filter(r => r.status >= 400);
    console.log(`실패한 요청: ${failedRequests.length}`);
    
    if (failedRequests.length > 0) {
      console.log('실패한 요청들:', failedRequests.slice(0, 5));
    }

    // 너무 많은 실패 요청이 없는지 확인
    expect(failedRequests.length).toBeLessThan(5);
  });

  test('JavaScript 에러 모니터링', async ({ page }) => {
    const errors = [];
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForTimeout(5000);

    console.log(`JavaScript 에러 수: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('에러들:', errors.slice(0, 3));
    }

    // 심각한 에러가 없는지 확인 (일부 경고는 허용)
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') &&
      !error.includes('Warning') &&
      !error.includes('deprecated')
    );

    expect(criticalErrors.length).toBeLessThan(3);
  });
});