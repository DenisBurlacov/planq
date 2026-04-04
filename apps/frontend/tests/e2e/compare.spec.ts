import { test, expect } from '@playwright/test';

test.describe('Product comparison', () => {
  test('compare page shows empty state when no products added', async ({ page }) => {
    // Clear any persisted compare store
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('planq-compare'));

    await page.goto('/compare');
    await expect(page.getByTestId('compare-page')).toBeVisible();
    await expect(page.getByTestId('compare-empty')).toBeVisible();
  });

  test('add to compare from catalog and view on compare page', async ({ page }) => {
    // Clear persisted state
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('planq-compare'));

    await page.goto('/catalog');
    await expect(page.getByTestId('product-card').first()).toBeVisible();

    // Hover the first product card to reveal the compare button
    const firstCard = page.getByTestId('product-card').first();
    await firstCard.hover();

    const compareBtn = firstCard.getByTestId('compare-button');
    await compareBtn.click();

    // Hover the second card and add to compare
    const secondCard = page.getByTestId('product-card').nth(1);
    await secondCard.hover();
    await secondCard.getByTestId('compare-button').click();

    // Compare floating bar should appear
    await page.waitForTimeout(300);

    // Navigate to compare page
    await page.goto('/compare');
    await expect(page.getByTestId('compare-page')).toBeVisible();
    await expect(page.getByTestId('compare-table')).toBeVisible();

    // Should show 2 products
    await expect(page.getByTestId('compare-count')).toContainText('2');
    await expect(page.getByTestId('compare-product-0')).toBeVisible();
    await expect(page.getByTestId('compare-product-1')).toBeVisible();
  });

  test('remove product from compare page', async ({ page }) => {
    // Seed compare store with products via catalog
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('planq-compare'));

    await page.goto('/catalog');
    const firstCard = page.getByTestId('product-card').first();
    await firstCard.hover();
    await firstCard.getByTestId('compare-button').click();

    const secondCard = page.getByTestId('product-card').nth(1);
    await secondCard.hover();
    await secondCard.getByTestId('compare-button').click();

    await page.goto('/compare');
    await expect(page.getByTestId('compare-table')).toBeVisible();

    // Remove first product via the remove button in the action row
    await page.getByTestId('compare-remove-0').click();

    // Should now have 1 product
    await expect(page.getByTestId('compare-count')).toContainText('1');
  });

  test('clear all removes all products and shows empty state', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('planq-compare'));

    await page.goto('/catalog');
    const firstCard = page.getByTestId('product-card').first();
    await firstCard.hover();
    await firstCard.getByTestId('compare-button').click();

    await page.goto('/compare');
    await expect(page.getByTestId('compare-table')).toBeVisible();

    await page.getByTestId('compare-clear-all').click();
    await expect(page.getByTestId('compare-empty')).toBeVisible();
  });

  test('compare table shows spec rows', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('planq-compare'));

    await page.goto('/catalog');
    const firstCard = page.getByTestId('product-card').first();
    await firstCard.hover();
    await firstCard.getByTestId('compare-button').click();

    await page.goto('/compare');
    await expect(page.getByTestId('compare-table')).toBeVisible();

    // Check that spec rows exist
    await expect(page.getByTestId('compare-row-name')).toBeVisible();
    await expect(page.getByTestId('compare-row-price')).toBeVisible();
    await expect(page.getByTestId('compare-row-rating')).toBeVisible();
    await expect(page.getByTestId('compare-row-category')).toBeVisible();
    await expect(page.getByTestId('compare-row-stock')).toBeVisible();
  });
});
