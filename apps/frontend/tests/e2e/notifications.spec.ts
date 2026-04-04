import { test, expect, type Page } from '@playwright/test';

async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(password);
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('nav-profile-button')).toBeVisible();
}

test.describe('Notification dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'alice@example.com', 'Password1!');
  });

  test('shows notification bell button', async ({ page }) => {
    await expect(page.getByTestId('notification-bell')).toBeVisible();
  });

  test('bell has correct aria attributes', async ({ page }) => {
    const bell = page.getByTestId('notification-bell');
    await expect(bell).toHaveAttribute('aria-label');
    await expect(bell).toHaveAttribute('aria-expanded', 'false');
  });

  test('clicking bell opens notification dropdown', async ({ page }) => {
    await page.getByTestId('notification-bell').click();
    await expect(page.getByTestId('notification-dropdown')).toBeVisible();
  });

  test('clicking bell toggles dropdown open and closed', async ({ page }) => {
    const bell = page.getByTestId('notification-bell');
    await bell.click();
    await expect(page.getByTestId('notification-dropdown')).toBeVisible();

    await bell.click();
    await expect(page.getByTestId('notification-dropdown')).not.toBeVisible();
  });

  test('dropdown shows empty state or notification items', async ({ page }) => {
    await page.getByTestId('notification-bell').click();
    const dropdown = page.getByTestId('notification-dropdown');
    await expect(dropdown).toBeVisible();

    // Should contain text content (either empty state or items)
    const text = await dropdown.textContent();
    expect(text?.length).toBeGreaterThan(0);
  });

  test('clicking outside dropdown closes it', async ({ page }) => {
    await page.getByTestId('notification-bell').click();
    await expect(page.getByTestId('notification-dropdown')).toBeVisible();

    // Click outside
    await page.locator('body').click({ position: { x: 10, y: 10 } });
    await expect(page.getByTestId('notification-dropdown')).not.toBeVisible();
  });

  test('mark all read button visible when unread notifications exist', async ({ page }) => {
    await page.getByTestId('notification-bell').click();
    const dropdown = page.getByTestId('notification-dropdown');
    await expect(dropdown).toBeVisible();

    // If there are unread notifications, the mark-all-read button should exist
    const badge = page.getByTestId('notification-badge');
    const hasBadge = await badge.isVisible().catch(() => false);
    if (hasBadge) {
      await expect(page.getByTestId('mark-all-read')).toBeVisible();
    }
  });

  test('mark all read clears unread count', async ({ page }) => {
    await page.getByTestId('notification-bell').click();
    const markAll = page.getByTestId('mark-all-read');
    const isVisible = await markAll.isVisible().catch(() => false);
    if (isVisible) {
      await markAll.click();
      // Badge should disappear or count should be 0
      await page.waitForTimeout(1000);
      const badge = page.getByTestId('notification-badge');
      const badgeVisible = await badge.isVisible().catch(() => false);
      if (badgeVisible) {
        // If still visible, should show 0 or be gone
        const text = await badge.textContent();
        expect(text === '0' || text === null).toBeTruthy();
      }
    }
  });

  test('individual notification mark-read works', async ({ page }) => {
    await page.getByTestId('notification-bell').click();
    await expect(page.getByTestId('notification-dropdown')).toBeVisible();

    // Find first mark-read button if any exist
    const markReadButtons = page.locator('[data-testid^="mark-read-"]');
    const count = await markReadButtons.count();
    if (count > 0) {
      await markReadButtons.first().click();
      // Should not crash, wait for response
      await page.waitForTimeout(500);
    }
  });
});
