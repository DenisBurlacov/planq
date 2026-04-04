import { test, expect } from '@playwright/test';

test.describe('About page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
  });

  test('loads and displays hero section with title and CTA', async ({ page }) => {
    await expect(page.getByTestId('about-hero')).toBeVisible();
    await expect(page.getByTestId('about-hero-title')).toBeVisible();
    await expect(page.getByTestId('about-hero-cta')).toBeVisible();
  });

  test('hero CTA navigates to catalog', async ({ page }) => {
    await page.getByTestId('about-hero-cta').click();
    await expect(page).toHaveURL(/\/catalog/);
  });

  test('displays values section with 3 cards', async ({ page }) => {
    await expect(page.getByTestId('about-values')).toBeVisible();

    for (let i = 0; i < 3; i++) {
      await expect(page.getByTestId(`about-value-card-${i}`)).toBeVisible();
    }
  });

  test('displays timeline section with milestones', async ({ page }) => {
    await expect(page.getByTestId('about-timeline')).toBeVisible();

    // At least the first milestone should be visible
    await expect(page.getByTestId('about-milestone-0')).toBeVisible();
  });

  test('displays team section with members', async ({ page }) => {
    await expect(page.getByTestId('about-team')).toBeVisible();

    for (let i = 0; i < 4; i++) {
      await expect(page.getByTestId(`about-team-member-${i}`)).toBeVisible();
    }
  });

  test('is reachable from navbar About link', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-about').click();
    await expect(page).toHaveURL(/\/about/);
    await expect(page.getByTestId('about-hero')).toBeVisible();
  });
});
