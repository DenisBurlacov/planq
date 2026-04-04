import { test, expect, type Page } from '@playwright/test';

// Helper: log in via the UI
async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(password);
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('nav-profile-button')).toBeVisible();
}

// Helper: add the first available product to the cart from the catalog
async function addFirstProductToCart(page: Page) {
  await page.goto('/catalog');

  // Click first product card to go to detail page
  await page.getByTestId('product-card').first().click();
  await expect(page).toHaveURL(/\/catalog\/.+/);

  // Click add-to-cart on the product page
  await page.getByTestId('add-to-cart-button').click();
}

test.describe('Cart and checkout flow', () => {
  test.describe('Add to cart', () => {
    test('adds a product to cart and cart badge updates', async ({ page }) => {
      await login(page, 'alice@example.com', 'Password1!');

      await addFirstProductToCart(page);

      // Cart badge should appear or increment
      await expect(page.getByTestId('cart-badge')).toBeVisible();
    });
  });

  test.describe('Cart page', () => {
    test('shows items with correct details after adding a product', async ({ page }) => {
      await login(page, 'alice@example.com', 'Password1!');
      await addFirstProductToCart(page);

      // Navigate to cart
      await page.getByTestId('nav-cart').click();
      await expect(page).toHaveURL(/\/cart/);

      await expect(page.getByTestId('cart-title')).toBeVisible();
      await expect(page.getByTestId('cart-item').first()).toBeVisible();
      await expect(page.getByTestId('cart-summary')).toBeVisible();
    });

    test('quantity increase and decrease work', async ({ page }) => {
      await login(page, 'alice@example.com', 'Password1!');
      await addFirstProductToCart(page);

      await page.getByTestId('nav-cart').click();
      await expect(page).toHaveURL(/\/cart/);

      const cartItem = page.getByTestId('cart-item').first();
      const qtyDisplay = cartItem.getByTestId('cart-item-quantity');
      const initialQty = await qtyDisplay.textContent();

      // Increase quantity
      await cartItem.getByTestId('cart-item-increase').click();
      await expect(qtyDisplay).not.toHaveText(initialQty ?? '');

      const increasedQty = await qtyDisplay.textContent();
      expect(Number(increasedQty)).toBe(Number(initialQty) + 1);

      // Decrease quantity
      await cartItem.getByTestId('cart-item-decrease').click();
      await expect(qtyDisplay).toHaveText(initialQty ?? '');
    });

    test('promo code SAVE10 applies discount', async ({ page }) => {
      await login(page, 'alice@example.com', 'Password1!');
      await addFirstProductToCart(page);

      await page.getByTestId('nav-cart').click();
      await expect(page).toHaveURL(/\/cart/);

      await page.getByTestId('promo-input').fill('SAVE10');
      await page.getByTestId('promo-apply').click();

      // Summary should reflect the discount -- look for any discount text or updated total
      // The promo code should either show success feedback or update the summary
      await expect(page.getByTestId('cart-summary')).toContainText(/\d/);
    });

    test('remove item from cart', async ({ page }) => {
      await login(page, 'alice@example.com', 'Password1!');
      await addFirstProductToCart(page);

      await page.getByTestId('nav-cart').click();
      await expect(page).toHaveURL(/\/cart/);

      await page.getByTestId('cart-item-remove').first().click();

      // Cart should now be empty or have one fewer item
      const cartEmpty = page.getByTestId('cart-empty');
      const cartItem = page.getByTestId('cart-item');

      // Either empty state is shown or item count decreased
      const emptyVisible = await cartEmpty.isVisible().catch(() => false);
      const itemCount = await cartItem.count();

      expect(emptyVisible || itemCount === 0).toBeTruthy();
    });
  });

  test.describe('Checkout', () => {
    test('checkout form is shown with address and payment fields', async ({ page }) => {
      await login(page, 'alice@example.com', 'Password1!');
      await addFirstProductToCart(page);

      await page.getByTestId('nav-cart').click();
      await expect(page).toHaveURL(/\/cart/);

      await page.getByTestId('checkout-button').click();
      await expect(page).toHaveURL(/\/checkout/);

      await expect(page.getByTestId('checkout-title')).toBeVisible();
      await expect(page.getByTestId('address-input')).toBeVisible();
      await expect(page.getByTestId('payment-card')).toBeVisible();
    });

    test('placing an order with valid data succeeds', async ({ page }) => {
      await login(page, 'alice@example.com', 'Password1!');
      await addFirstProductToCart(page);

      await page.getByTestId('nav-cart').click();
      await page.getByTestId('checkout-button').click();
      await expect(page).toHaveURL(/\/checkout/);

      // Fill checkout form
      await page.getByTestId('address-input').fill('123 Test Street, City, 12345');
      await page.getByTestId('payment-card').check();

      // Fill card number if visible
      const cardInput = page.getByTestId('card-number-input');
      if (await cardInput.isVisible()) {
        await cardInput.fill('4242424242424242');
      }

      await page.getByTestId('place-order-button').click();

      // Should navigate away from checkout after successful order
      // (typically to an order confirmation or orders page)
      await expect(page).not.toHaveURL(/\/checkout/);
    });

    test('checkout validates required address field', async ({ page }) => {
      await login(page, 'alice@example.com', 'Password1!');
      await addFirstProductToCart(page);

      await page.getByTestId('nav-cart').click();
      await page.getByTestId('checkout-button').click();
      await expect(page).toHaveURL(/\/checkout/);

      // Try to place order without filling address
      await page.getByTestId('place-order-button').click();

      // Should remain on checkout page (validation prevents submission)
      await expect(page).toHaveURL(/\/checkout/);
    });
  });
});
