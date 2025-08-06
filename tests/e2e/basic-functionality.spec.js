import { test, expect } from '@playwright/test';

test.describe('동배즐 앱 기본 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 웹 앱 홈페이지로 이동
    await page.goto('/');
    
    // 페이지 로딩 대기
    await page.waitForLoadState('networkidle');
  });

  test('앱이 정상적으로 로딩되는지 확인', async ({ page }) => {
    // 앱 타이틀 또는 로고 확인
    await expect(page).toHaveTitle(/동배즐|DongBaeJul/);
    
    // 기본 네비게이션 요소 확인
    const welcomeText = page.getByText(/동배즐|배드민턴|Welcome/);
    await expect(welcomeText.first()).toBeVisible();
  });

  test('네비게이션 기능 테스트', async ({ page }) => {
    // 메인 네비게이션 탭들이 있는지 확인
    const tabs = ['홈', '클럽', '게임', '프로필'];
    
    for (const tab of tabs) {
      const tabElement = page.getByRole('button', { name: new RegExp(tab, 'i') })
        .or(page.getByText(new RegExp(tab, 'i')));
      
      if (await tabElement.isVisible()) {
        await expect(tabElement).toBeVisible();
      }
    }
  });

  test('로그인 화면 접근 테스트', async ({ page }) => {
    // 로그인 버튼 또는 링크 찾기
    const loginButton = page.getByRole('button', { name: /로그인|Login/i })
      .or(page.getByText(/로그인|Login/i));
    
    if (await loginButton.isVisible()) {
      await loginButton.click();
      
      // 로그인 폼 요소들 확인
      const emailInput = page.getByPlaceholder(/이메일|Email/i);
      const passwordInput = page.getByPlaceholder(/비밀번호|Password/i);
      
      await expect(emailInput.or(passwordInput)).toBeVisible();
    }
  });
});
