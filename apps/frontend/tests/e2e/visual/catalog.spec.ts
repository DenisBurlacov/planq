import { test, expect } from '@playwright/test';

test.describe('Catalog page visual regression', () => {
  test('light theme', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('catalog-light.png', { fullPage: true });
  });

  test('dark theme', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot('catalog-dark.png', { fullPage: true });
  });
});
