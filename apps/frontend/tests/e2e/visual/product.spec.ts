import { test, expect } from '@playwright/test';

test.describe('Product page visual regression', () => {
  test('light theme', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    // Click first product card to navigate to product page
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');
    } else {
      // Fallback: go to catalog and use first link
      await page.goto('/catalog');
      await page.waitForLoadState('networkidle');
    }
    await expect(page).toHaveScreenshot('product-light.png', { fullPage: true });
  });

  test('dark theme', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="theme-toggle"]');
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');
    }
    await expect(page).toHaveScreenshot('product-dark.png', { fullPage: true });
  });
});
