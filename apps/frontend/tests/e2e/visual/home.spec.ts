import { test, expect } from '@playwright/test';

test.describe('Home page visual regression', () => {
  test('light theme', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('home-light.png', { fullPage: true });
  });

  test('dark theme', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot('home-dark.png', { fullPage: true });
  });
});
