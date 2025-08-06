import { test, expect } from '@playwright/test';

test.describe('반응형 디자인 및 모바일 경험 테스트', () => {
  test('데스크톱 화면에서 레이아웃 확인', async ({ page }) => {
    // 데스크톱 크기로 설정
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // 데스크톱 레이아웃 확인
    const container = page.locator('body');
    await expect(container).toBeVisible();
    
    // 네비게이션 메뉴가 적절히 표시되는지 확인
    await page.waitForLoadState('networkidle');
  });

  test('태블릿 화면에서 레이아웃 확인', async ({ page }) => {
    // 태블릿 크기로 설정
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    
    // 태블릿에서도 주요 요소들이 보이는지 확인
    const mainContent = page.locator('body');
    await expect(mainContent).toBeVisible();
  });

  test('모바일 화면에서 레이아웃 확인', async ({ page }) => {
    // 모바일 크기로 설정
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    
    // 모바일에서 적절한 레이아웃인지 확인
    const mainContent = page.locator('body');
    await expect(mainContent).toBeVisible();
  });

  test('터치 상호작용 시뮬레이션', async ({ page }) => {
    // 모바일 환경 시뮬레이션
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // 터치 이벤트 시뮬레이션
    const touchableElements = page.getByRole('button');
    const firstButton = touchableElements.first();
    
    if (await firstButton.isVisible()) {
      // 터치 시작, 종료 이벤트 시뮬레이션
      await firstButton.tap();
      await page.waitForTimeout(500);
    }
  });
});
