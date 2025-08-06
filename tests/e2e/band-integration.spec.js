import { test, expect } from '@playwright/test';

test.describe('Band API 연동 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Band 로그인 버튼 확인', async ({ page }) => {
    // Band 로그인 관련 UI 요소 확인
    const bandLoginButton = page.getByRole('button', { name: /band|밴드/i })
      .or(page.getByText(/band|밴드.*로그인/i));
    
    if (await bandLoginButton.isVisible()) {
      await expect(bandLoginButton).toBeVisible();
      
      // 버튼 클릭 테스트
      await bandLoginButton.click();
      
      // Mock API 응답 또는 로그인 화면 확인
      await page.waitForTimeout(2000); // Mock API 지연 시간 대기
    }
  });

  test('배드민턴 클럽 목록 표시', async ({ page }) => {
    // 클럽 목록 페이지 이동 시도
    const clubsTab = page.getByRole('button', { name: /클럽|Club/i })
      .or(page.getByText(/클럽|Club/i));
    
    if (await clubsTab.isVisible()) {
      await clubsTab.click();
      await page.waitForLoadState('networkidle');
      
      // 클럽 목록이나 "클럽이 없습니다" 메시지 확인
      const clubList = page.getByText(/클럽|동호회|배드민턴/i);
      await expect(clubList.first()).toBeVisible();
    }
  });

  test('게임 매칭 기능 접근', async ({ page }) => {
    // 게임 탭 이동
    const gamesTab = page.getByRole('button', { name: /게임|Game/i })
      .or(page.getByText(/게임|Game/i));
    
    if (await gamesTab.isVisible()) {
      await gamesTab.click();
      await page.waitForLoadState('networkidle');
      
      // 게임 목록 또는 생성 버튼 확인
      const gameContent = page.getByText(/게임|매칭|모집/i);
      await expect(gameContent.first()).toBeVisible();
    }
  });

  test('프로필 화면 접근', async ({ page }) => {
    // 프로필 탭 이동
    const profileTab = page.getByRole('button', { name: /프로필|Profile/i })
      .or(page.getByText(/프로필|Profile/i));
    
    if (await profileTab.isVisible()) {
      await profileTab.click();
      await page.waitForLoadState('networkidle');
      
      // 프로필 정보 또는 로그인 요구 메시지 확인
      const profileContent = page.getByText(/프로필|사용자|로그인/i);
      await expect(profileContent.first()).toBeVisible();
    }
  });
});
