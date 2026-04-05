import { test, expect } from '@playwright/test';

test.describe('Login page visual regression', () => {
  test('light theme', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('login-light.png', { fullPage: true });
  });

  test('dark theme', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot('login-dark.png', { fullPage: true });
  });
});
