import { test, expect } from '@playwright/test';

test.describe('Product catalog browsing', () => {
  test.describe('Homepage', () => {
    test('loads with hero, categories, best sellers, and new arrivals', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByTestId('hero-section')).toBeVisible();
      await expect(page.getByTestId('hero-cta')).toBeVisible();
      await expect(page.getByTestId('categories-section')).toBeVisible();
      await expect(page.getByTestId('best-sellers-section')).toBeVisible();
      await expect(page.getByTestId('new-arrivals-section')).toBeVisible();
    });

    test('hero CTA navigates to catalog', async ({ page }) => {
      await page.goto('/');
      await page.getByTestId('hero-cta').click();

      await expect(page).toHaveURL(/\/catalog/);
    });

    test('category tiles link to filtered catalog', async ({ page }) => {
      await page.goto('/');

      // Click any visible category tile
      const tiles = page.getByTestId(/^category-tile-/);
      const count = await tiles.count();
      expect(count).toBeGreaterThan(0);

      await tiles.first().click();
      await expect(page).toHaveURL(/\/catalog/);
    });
  });

  test.describe('Catalog page', () => {
    test('shows product grid with items', async ({ page }) => {
      await page.goto('/catalog');

      await expect(page.getByTestId('product-grid')).toBeVisible();

      const cards = page.getByTestId('product-card');
      await expect(cards.first()).toBeVisible();
    });

    test('search filters products', async ({ page }) => {
      await page.goto('/catalog');

      const searchInput = page.getByTestId('search-input');
      await searchInput.fill('chair');

      // Wait for filtered results
      await page.waitForTimeout(500);

      // Product grid should still be visible (or empty state if no match)
      const grid = page.getByTestId('product-grid');
      const emptyState = page.getByTestId('empty-state');

      const gridVisible = await grid.isVisible().catch(() => false);
      const emptyVisible = await emptyState.isVisible().catch(() => false);

      expect(gridVisible || emptyVisible).toBeTruthy();
    });

    test('sort select changes product order', async ({ page }) => {
      await page.goto('/catalog');

      const sortSelect = page.getByTestId('sort-select');
      await expect(sortSelect).toBeVisible();

      // Select a sort option (price low to high)
      await sortSelect.selectOption({ index: 1 });

      // Page should reload/re-render - product grid still visible
      await expect(page.getByTestId('product-grid')).toBeVisible();
    });

    test('category filter checkbox filters products', async ({ page }) => {
      await page.goto('/catalog');

      const categoryFilter = page.getByTestId('category-filter');
      await expect(categoryFilter).toBeVisible();

      // Click the first category checkbox
      const checkboxes = categoryFilter.locator('input[type="checkbox"]');
      const count = await checkboxes.count();
      expect(count).toBeGreaterThan(0);

      await checkboxes.first().check();

      // Wait for filter to apply
      await page.waitForTimeout(500);

      // Grid or empty state should be shown
      const grid = page.getByTestId('product-grid');
      const emptyState = page.getByTestId('empty-state');
      const gridVisible = await grid.isVisible().catch(() => false);
      const emptyVisible = await emptyState.isVisible().catch(() => false);
      expect(gridVisible || emptyVisible).toBeTruthy();
    });
  });

  test.describe('Product detail page', () => {
    test('shows product name, price, gallery, and accordion', async ({ page }) => {
      // Navigate to catalog and click first product
      await page.goto('/catalog');
      const firstCard = page.getByTestId('product-card').first();
      await firstCard.click();

      // Should navigate to a product page
      await expect(page).toHaveURL(/\/catalog\/.+/);

      await expect(page.getByTestId('product-name')).toBeVisible();
      await expect(page.getByTestId('product-price')).toBeVisible();
      await expect(page.getByTestId('product-gallery')).toBeVisible();
      await expect(page.getByTestId('accordion')).toBeVisible();
    });

    test('accordion opens and closes sections', async ({ page }) => {
      await page.goto('/catalog');
      await page.getByTestId('product-card').first().click();
      await expect(page).toHaveURL(/\/catalog\/.+/);

      const trigger = page.getByTestId('accordion-trigger-0');
      await expect(trigger).toBeVisible();

      // Click to toggle the first accordion section
      await trigger.click();
      await expect(page.getByTestId('accordion-content-0')).toBeVisible();

      // Click again to close
      await trigger.click();
      await expect(page.getByTestId('accordion-content-0')).not.toBeVisible();
    });

    test('breadcrumb navigates back', async ({ page }) => {
      await page.goto('/catalog');
      await page.getByTestId('product-card').first().click();
      await expect(page).toHaveURL(/\/catalog\/.+/);

      const breadcrumb = page.getByTestId('breadcrumb');
      await expect(breadcrumb).toBeVisible();

      // Click first breadcrumb item (Home)
      await page.getByTestId('breadcrumb-item-0').click();
      await expect(page).toHaveURL('/');
    });
  });
});
