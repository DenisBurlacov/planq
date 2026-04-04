import { test, expect, type Page } from '@playwright/test';

// Helper: log in via the UI
async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(password);
  await page.getByTestId('login-submit').click();
}

test.describe('Authentication flows', () => {
  test.describe('Login', () => {
    test('logs in with valid credentials and redirects to home', async ({ page }) => {
      await login(page, 'alice@example.com', 'Password1!');

      // Should redirect away from /login
      await expect(page).not.toHaveURL(/\/login/);

      // Profile dropdown trigger should be visible (indicates logged-in state)
      await expect(page.getByTestId('nav-profile-button')).toBeVisible();
    });

    test('shows error with invalid credentials', async ({ page }) => {
      await login(page, 'alice@example.com', 'WrongPassword!');

      // Should stay on login page and show error
      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByTestId('login-error')).toBeVisible();
    });

    test('shows validation error for empty fields', async ({ page }) => {
      await page.goto('/login');
      await page.getByTestId('login-submit').click();

      // Form should not submit -- we stay on login
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Register', () => {
    test('registers a new user and redirects to home', async ({ page }) => {
      const unique = `e2e_${Date.now()}`;

      await page.goto('/register');
      await page.getByTestId('register-name').fill(`Test ${unique}`);
      await page.getByTestId('register-email').fill(`${unique}@example.com`);
      await page.getByTestId('register-password').fill('Password1!');
      await page.getByTestId('register-submit').click();

      // Should redirect to home after successful registration
      await expect(page).not.toHaveURL(/\/register/);
      await expect(page.getByTestId('nav-profile-button')).toBeVisible();
    });

    test('shows error when registering with existing email', async ({ page }) => {
      await page.goto('/register');
      await page.getByTestId('register-name').fill('Alice Duplicate');
      await page.getByTestId('register-email').fill('alice@example.com');
      await page.getByTestId('register-password').fill('Password1!');
      await page.getByTestId('register-submit').click();

      await expect(page.getByTestId('register-error')).toBeVisible();
    });
  });

  test.describe('Logout', () => {
    test('logout clears session and shows sign-in button', async ({ page }) => {
      // Login first
      await login(page, 'alice@example.com', 'Password1!');
      await expect(page.getByTestId('nav-profile-button')).toBeVisible();

      // Open profile dropdown and click logout
      await page.getByTestId('nav-profile-button').click();
      await page.getByTestId('nav-logout-button').click();

      // Should now see the login button instead of profile
      await expect(page.getByTestId('nav-login-button')).toBeVisible();
    });
  });

  test.describe('Protected routes', () => {
    test('redirects to login when accessing /orders without auth', async ({ page }) => {
      await page.goto('/orders');

      await expect(page).toHaveURL(/\/login/);
    });

    test('redirects to login when accessing /profile without auth', async ({ page }) => {
      await page.goto('/profile');

      await expect(page).toHaveURL(/\/login/);
    });
  });
});
