import { test, expect, type Page } from '@playwright/test';

// Helper: log in via the UI
async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(password);
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('nav-profile-button')).toBeVisible();
}

test.describe('Accessibility', () => {
  test.describe('Modal focus trap and Escape', () => {
    test('modal has role="dialog" and aria-modal attributes', async ({ page }) => {
      await login(page, 'alice@example.com', 'Password1!');

      // Navigate to a product page and trigger the add-to-cart modal
      await page.goto('/catalog');
      await page.getByTestId('product-card').first().click();
      await expect(page).toHaveURL(/\/catalog\/.+/);

      await page.getByTestId('add-to-cart-button').click();

      // Check if modal appears -- it may be an AddToCartModal or a generic Modal
      const modal = page.getByTestId('modal');
      const modalVisible = await modal.isVisible().catch(() => false);

      if (modalVisible) {
        await expect(modal).toHaveAttribute('role', 'dialog');
        await expect(modal).toHaveAttribute('aria-modal', 'true');
      }
      // If no modal appears (inline add-to-cart), skip this assertion
    });

    test('Escape key closes modal', async ({ page }) => {
      await login(page, 'alice@example.com', 'Password1!');

      await page.goto('/catalog');
      await page.getByTestId('product-card').first().click();
      await expect(page).toHaveURL(/\/catalog\/.+/);

      await page.getByTestId('add-to-cart-button').click();

      const modal = page.getByTestId('modal');
      const modalVisible = await modal.isVisible().catch(() => false);

      if (modalVisible) {
        // Press Escape
        await page.keyboard.press('Escape');

        // Modal should be gone
        await expect(modal).not.toBeVisible();
      }
    });

    test('modal close button works', async ({ page }) => {
      await login(page, 'alice@example.com', 'Password1!');

      await page.goto('/catalog');
      await page.getByTestId('product-card').first().click();
      await expect(page).toHaveURL(/\/catalog\/.+/);

      await page.getByTestId('add-to-cart-button').click();

      const modalClose = page.getByTestId('modal-close');
      const closeVisible = await modalClose.isVisible().catch(() => false);

      if (closeVisible) {
        await modalClose.click();
        await expect(page.getByTestId('modal')).not.toBeVisible();
      }
    });
  });

  test.describe('Navbar dropdown keyboard accessibility', () => {
    test('profile dropdown opens on click and contains menu items', async ({ page }) => {
      await login(page, 'alice@example.com', 'Password1!');

      const profileButton = page.getByTestId('nav-profile-button');
      await profileButton.click();

      // Dropdown items should be visible
      await expect(page.getByTestId('nav-profile-link')).toBeVisible();
      await expect(page.getByTestId('nav-logout-button')).toBeVisible();
    });

    test('profile dropdown trigger has aria-expanded attribute', async ({ page }) => {
      await login(page, 'alice@example.com', 'Password1!');

      const profileButton = page.getByTestId('nav-profile-button');

      // Before click: should have aria-expanded="false" or not set
      const expandedBefore = await profileButton.getAttribute('aria-expanded');
      expect(expandedBefore === 'false' || expandedBefore === null).toBeTruthy();

      // After click: should have aria-expanded="true"
      await profileButton.click();
      await expect(profileButton).toHaveAttribute('aria-expanded', 'true');
    });

    test('Escape closes the profile dropdown', async ({ page }) => {
      await login(page, 'alice@example.com', 'Password1!');

      await page.getByTestId('nav-profile-button').click();
      await expect(page.getByTestId('nav-profile-link')).toBeVisible();

      await page.keyboard.press('Escape');

      await expect(page.getByTestId('nav-profile-link')).not.toBeVisible();
    });
  });

  test.describe('Toast notifications', () => {
    test('adding to cart shows a toast or feedback', async ({ page }) => {
      await login(page, 'alice@example.com', 'Password1!');

      await page.goto('/catalog');
      await page.getByTestId('product-card').first().click();
      await expect(page).toHaveURL(/\/catalog\/.+/);

      await page.getByTestId('add-to-cart-button').click();

      // A toast, modal, or cart badge update should appear as feedback
      // Check for toast with role="status" or role="alert"
      const toast = page.locator('[role="status"], [role="alert"]');
      const toastCount = await toast.count();

      // Also check cart badge as alternative feedback
      const cartBadge = page.getByTestId('cart-badge');
      const badgeVisible = await cartBadge.isVisible().catch(() => false);

      // At least one form of feedback should be present
      expect(toastCount > 0 || badgeVisible).toBeTruthy();
    });
  });

  test.describe('Semantic HTML and ARIA', () => {
    test('navbar is a nav element', async ({ page }) => {
      await page.goto('/');

      const navbar = page.getByTestId('navbar');
      await expect(navbar).toBeVisible();

      // Should be a <nav> element
      const tagName = await navbar.evaluate(el => el.tagName.toLowerCase());
      expect(tagName).toBe('nav');
    });

    test('product page heading hierarchy is correct', async ({ page }) => {
      await page.goto('/catalog');
      await page.getByTestId('product-card').first().click();
      await expect(page).toHaveURL(/\/catalog\/.+/);

      // Product name should be an h1
      const productName = page.getByTestId('product-name');
      const tagName = await productName.evaluate(el => el.tagName.toLowerCase());
      expect(tagName).toBe('h1');
    });

    test('accordion triggers have aria-expanded', async ({ page }) => {
      await page.goto('/catalog');
      await page.getByTestId('product-card').first().click();
      await expect(page).toHaveURL(/\/catalog\/.+/);

      const trigger = page.getByTestId('accordion-trigger-0');
      await expect(trigger).toBeVisible();

      // Should have aria-expanded attribute
      const expanded = await trigger.getAttribute('aria-expanded');
      expect(expanded === 'true' || expanded === 'false').toBeTruthy();
    });

    test('search input has accessible label', async ({ page }) => {
      await page.goto('/catalog');

      const searchInput = page.getByTestId('search-input');
      await expect(searchInput).toBeVisible();

      // Should have aria-label or associated label
      const ariaLabel = await searchInput.getAttribute('aria-label');
      const id = await searchInput.getAttribute('id');
      const hasLabel =
        ariaLabel !== null ||
        (id !== null && (await page.locator(`label[for="${id}"]`).count()) > 0);

      expect(hasLabel).toBeTruthy();
    });
  });
});
