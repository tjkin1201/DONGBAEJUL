import { test, expect } from '@playwright/test';

test('동배즐 화면 내용 확인', async ({ page }) => {
  await page.goto('/', { 
    waitUntil: 'domcontentloaded',
    timeout: 60000 
  });

  // 페이지의 전체 텍스트 내용 확인
  const bodyText = await page.textContent('body');
  console.log('페이지 전체 텍스트:', bodyText);

  // 동배즐 제목이 있는지 확인
  const titleExists = await page.getByText('🏸 동배즐').isVisible().catch(() => false);
  console.log('🏸 동배즐 제목 존재:', titleExists);

  // 로그인 버튼이 있는지 확인
  const loginButtonExists = await page.getByText('로그인').isVisible().catch(() => false);
  console.log('로그인 버튼 존재:', loginButtonExists);

  // 회원가입 버튼이 있는지 확인
  const signupButtonExists = await page.getByText('회원가입').isVisible().catch(() => false);
  console.log('회원가입 버튼 존재:', signupButtonExists);

  // Band 로그인 버튼이 있는지 확인
  const bandButtonExists = await page.getByText('🎵 Band로 로그인').isVisible().catch(() => false);
  console.log('Band 로그인 버튼 존재:', bandButtonExists);

  // HTML 구조 확인
  const htmlContent = await page.content();
  console.log('HTML 길이:', htmlContent.length);
  
  // React Native 웹 구조 확인
  const hasReactRoot = htmlContent.includes('id="root"') || htmlContent.includes('data-reactroot');
  console.log('React 루트 요소 존재:', hasReactRoot);

  // 스크린샷 촬영
  await page.screenshot({ path: 'test-results/current-app-state.png', fullPage: true });
  
  // 최소한의 검증
  expect(bodyText?.length || 0).toBeGreaterThan(50);
});
