import { test, expect, type Page } from '@playwright/test';

// Helper: log in via the UI
async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(password);
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('nav-profile-button')).toBeVisible();
}

test.describe('Admin panel', () => {
  test.describe('Access control', () => {
    test('non-admin user is redirected away from /admin', async ({ page }) => {
      await login(page, 'alice@example.com', 'Password1!');

      await page.goto('/admin');

      // Regular user should be redirected to home (not admin)
      await expect(page).not.toHaveURL(/\/admin/);
    });

    test('unauthenticated user is redirected to /login from /admin', async ({ page }) => {
      await page.goto('/admin');

      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await login(page, 'admin@planq.com', 'Password1!');
      await page.goto('/admin');
    });

    test('shows admin sidebar and content area', async ({ page }) => {
      await expect(page.getByTestId('admin-sidebar')).toBeVisible();
      await expect(page.getByTestId('admin-content')).toBeVisible();
    });

    test('shows stat cards on the dashboard', async ({ page }) => {
      await expect(page.getByTestId('stat-card-total-orders')).toBeVisible();
      await expect(page.getByTestId('stat-card-revenue-today')).toBeVisible();
      await expect(page.getByTestId('stat-card-pending-orders')).toBeVisible();
      await expect(page.getByTestId('stat-card-active-users')).toBeVisible();
    });

    test('stat cards display values', async ({ page }) => {
      // Each stat card should render a value
      const totalOrders = page.getByTestId('stat-card-total-orders');
      await expect(totalOrders.getByTestId('stat-value')).toBeVisible();
    });

    test('sidebar navigation links are present', async ({ page }) => {
      await expect(page.getByTestId('admin-nav-dashboard')).toBeVisible();
      await expect(page.getByTestId('admin-nav-products')).toBeVisible();
      await expect(page.getByTestId('admin-nav-orders')).toBeVisible();
      await expect(page.getByTestId('admin-nav-users')).toBeVisible();
      await expect(page.getByTestId('admin-nav-back')).toBeVisible();
    });
  });

  test.describe('Products page', () => {
    test.beforeEach(async ({ page }) => {
      await login(page, 'admin@planq.com', 'Password1!');
    });

    test('navigates to products page via sidebar', async ({ page }) => {
      await page.goto('/admin');
      await page.getByTestId('admin-nav-products').click();

      await expect(page).toHaveURL(/\/admin\/products/);
    });

    test('shows products table', async ({ page }) => {
      await page.goto('/admin/products');

      await expect(page.getByTestId('products-table')).toBeVisible();
    });

    test('shows add product button', async ({ page }) => {
      await page.goto('/admin/products');

      await expect(page.getByTestId('add-product-button')).toBeVisible();
    });
  });

  test.describe('Orders page', () => {
    test.beforeEach(async ({ page }) => {
      await login(page, 'admin@planq.com', 'Password1!');
    });

    test('navigates to orders page via sidebar', async ({ page }) => {
      await page.goto('/admin');
      await page.getByTestId('admin-nav-orders').click();

      await expect(page).toHaveURL(/\/admin\/orders/);
    });

    test('shows orders table', async ({ page }) => {
      await page.goto('/admin/orders');

      // Wait for the table to be rendered
      await expect(page.getByTestId('orders-table')).toBeVisible();
    });

    test('order status filter is available', async ({ page }) => {
      await page.goto('/admin/orders');

      await expect(page.getByTestId('order-filter-status')).toBeVisible();
    });
  });

  test.describe('Users page', () => {
    test.beforeEach(async ({ page }) => {
      await login(page, 'admin@planq.com', 'Password1!');
    });

    test('navigates to users page via sidebar', async ({ page }) => {
      await page.goto('/admin');
      await page.getByTestId('admin-nav-users').click();

      await expect(page).toHaveURL(/\/admin\/users/);
    });

    test('shows users table', async ({ page }) => {
      await page.goto('/admin/users');

      await expect(page.getByTestId('users-table')).toBeVisible();
    });

    test('user search input is available', async ({ page }) => {
      await page.goto('/admin/users');

      await expect(page.getByTestId('user-search-input')).toBeVisible();
    });
  });

  test.describe('Back to store', () => {
    test('back-to-store link navigates to homepage', async ({ page }) => {
      await login(page, 'admin@planq.com', 'Password1!');
      await page.goto('/admin');

      await page.getByTestId('admin-nav-back').click();

      await expect(page).toHaveURL('/');
    });
  });
});
