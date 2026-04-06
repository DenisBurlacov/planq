# PLANQ — UI Test Framework Plan (TypeScript + Playwright)

## Target

- **App**: PLANQ e-commerce (http://localhost:3000)
- **Backend**: http://localhost:4000
- **Pages**: 42
- **data-testid selectors**: 779+
- **Locators reference**: docs/LOCATORS.md

## Tech Stack

```
@playwright/test
typescript
allure-playwright (reporting)
dotenv
```

## Project Structure

```
planq-ui-tests/
├── playwright.config.ts      # Config (baseURL, browsers, retries)
├── tsconfig.json
├── package.json
├── .env                      # BASE_URL, API_URL, RESET_TOKEN
├── src/
│   ├── pages/                # Page Object Model
│   │   ├── BasePage.ts       # Common methods (navigate, waitFor, screenshot)
│   │   ├── LoginPage.ts
│   │   ├── RegisterPage.ts
│   │   ├── HomePage.ts
│   │   ├── CatalogPage.ts
│   │   ├── ProductPage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutPage.ts
│   │   ├── OrdersPage.ts
│   │   ├── OrderDetailPage.ts
│   │   ├── ProfilePage.ts
│   │   ├── WishlistPage.ts
│   │   ├── ComparePage.ts
│   │   ├── BlogPage.ts
│   │   ├── FaqPage.ts
│   │   ├── ContactPage.ts
│   │   ├── ChallengesPage.ts
│   │   └── admin/
│   │       ├── AdminDashboardPage.ts
│   │       ├── AdminProductsPage.ts
│   │       ├── AdminOrdersPage.ts
│   │       ├── AdminUsersPage.ts
│   │       └── AdminSettingsPage.ts
│   ├── components/           # Component Objects
│   │   ├── Navbar.ts         # Nav links, search, cart badge, notifications
│   │   ├── Footer.ts         # Newsletter, social links
│   │   ├── Modal.ts          # Generic modal (open, close, confirm, cancel)
│   │   ├── Toast.ts          # Toast notifications
│   │   ├── DataTable.ts      # Sorting, pagination, rows
│   │   ├── FilterPanel.ts    # Price, material, color, style, rating
│   │   ├── CategoryBar.ts    # Category pills
│   │   └── StarRating.ts     # Star rating interaction
│   ├── fixtures/
│   │   ├── auth.fixture.ts   # Login as USER/ADMIN/MANAGER
│   │   ├── data.fixture.ts   # Seed/reset via API
│   │   └── page.fixture.ts   # Extended page with common helpers
│   ├── helpers/
│   │   ├── api.helper.ts     # Direct API calls for setup/teardown
│   │   ├── ws.helper.ts      # WebSocket listener
│   │   └── visual.helper.ts  # Screenshot comparison helpers
│   └── types/
│       └── index.ts          # Shared types
├── tests/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   ├── register.spec.ts
│   │   ├── logout.spec.ts
│   │   ├── forgot-password.spec.ts
│   │   ├── 2fa.spec.ts
│   │   └── session-expired.spec.ts
│   ├── catalog/
│   │   ├── browse.spec.ts
│   │   ├── search.spec.ts
│   │   ├── filters.spec.ts
│   │   ├── sort.spec.ts
│   │   ├── view-toggle.spec.ts
│   │   ├── category-bar.spec.ts
│   │   └── pagination.spec.ts
│   ├── product/
│   │   ├── detail.spec.ts
│   │   ├── variants.spec.ts
│   │   ├── reviews.spec.ts
│   │   ├── share.spec.ts
│   │   ├── wishlist.spec.ts
│   │   └── compare.spec.ts
│   ├── cart/
│   │   ├── add-remove.spec.ts
│   │   ├── quantity.spec.ts
│   │   ├── promo-code.spec.ts
│   │   └── drag-reorder.spec.ts
│   ├── checkout/
│   │   ├── shipping.spec.ts
│   │   ├── payment.spec.ts
│   │   ├── review-step.spec.ts
│   │   ├── success-failure.spec.ts
│   │   └── autosave.spec.ts
│   ├── orders/
│   │   ├── list.spec.ts
│   │   ├── detail.spec.ts
│   │   ├── cancel.spec.ts
│   │   ├── tracking.spec.ts
│   │   └── auto-progress.spec.ts
│   ├── profile/
│   │   ├── settings.spec.ts
│   │   ├── security.spec.ts
│   │   ├── notifications.spec.ts
│   │   ├── addresses.spec.ts
│   │   ├── webhooks.spec.ts
│   │   ├── payment-methods.spec.ts
│   │   └── unsaved-changes.spec.ts
│   ├── admin/
│   │   ├── dashboard.spec.ts
│   │   ├── products.spec.ts
│   │   ├── orders.spec.ts
│   │   ├── users.spec.ts
│   │   ├── promos.spec.ts
│   │   ├── categories.spec.ts
│   │   ├── reviews.spec.ts
│   │   ├── settings.spec.ts
│   │   ├── audit.spec.ts
│   │   └── manager-restrictions.spec.ts
│   ├── navigation/
│   │   ├── navbar.spec.ts
│   │   ├── footer.spec.ts
│   │   ├── breadcrumb.spec.ts
│   │   ├── mobile-menu.spec.ts
│   │   └── keyboard-shortcuts.spec.ts
│   ├── features/
│   │   ├── dark-mode.spec.ts
│   │   ├── i18n.spec.ts
│   │   ├── cookie-consent.spec.ts
│   │   ├── captcha.spec.ts
│   │   ├── onboarding.spec.ts
│   │   ├── feature-flags.spec.ts
│   │   ├── ab-testing.spec.ts
│   │   ├── flaky-zone.spec.ts
│   │   ├── social-modals.spec.ts
│   │   └── notifications-realtime.spec.ts
│   ├── e2e/
│   │   ├── full-purchase.spec.ts
│   │   ├── order-lifecycle.spec.ts
│   │   ├── multi-role.spec.ts
│   │   └── register-to-purchase.spec.ts
│   └── visual/
│       ├── homepage.spec.ts
│       ├── catalog.spec.ts
│       ├── product.spec.ts
│       ├── login.spec.ts
│       └── admin-dashboard.spec.ts
└── reports/
    └── allure-results/
```

---

## Test Plan by Priority

### Phase 1: Setup + Auth (Week 1)

**Config & Fixtures:**

- playwright.config.ts: baseURL, 2 browsers (chromium, firefox), retries: 1, screenshot on failure
- Auth fixture: login via API → set storageState → reuse across tests
- Data fixture: POST /test/reset before test suite

**Tests:**

1. **login.spec.ts**
   - Valid login → redirect to home, user name in navbar
   - Invalid credentials → error message visible
   - Empty fields → validation errors
   - Demo accounts panel → click fills form
   - Blocked user → error "Account blocked"
   - Admin login → redirect to /admin

2. **register.spec.ts**
   - Valid registration → redirect to /verify-email
   - Duplicate email → error
   - Password validation (too short, no uppercase, no number)

3. **logout.spec.ts**
   - Click logout in dropdown → redirect to login
   - Click logout in footer → confirmation modal → confirm → redirect

### Phase 2: Catalog & Product (Week 2)

4. **browse.spec.ts**
   - Homepage loads: hero, categories, best sellers, new arrivals
   - Click category tile → catalog filtered
   - Click "Shop Now" → catalog page

5. **search.spec.ts**
   - Type in search → autocomplete dropdown appears
   - Click suggestion → navigate to product
   - Search + Submit → catalog filtered
   - Clear (X) button → results reset

6. **filters.spec.ts**
   - Category pills: click → products filtered, pill highlighted
   - Price range: set min/max → products in range
   - Material chip: click Wood → only wood products
   - Star rating: click 4 stars → products with 4+ rating
   - Active filter chips appear → click X to remove
   - Clear Filters → all reset
   - Save filter → load saved → applied correctly

7. **product-detail.spec.ts**
   - Page shows: image carousel, name, price, specs table, reviews, variants
   - Color swatch click → image/stock updates
   - Size pill click → price adjusts
   - Add to Cart → modal → confirm → badge updates
   - Wishlist toggle → heart fills/unfills
   - Share buttons → modals open with correct content

### Phase 3: Cart & Checkout (Week 3)

8. **cart.spec.ts**
   - Add item → appears in cart
   - Quantity +/- → price updates
   - Remove item → confirmation modal → item gone
   - Promo code SAVE10 → discount applied
   - Empty cart → "Browse Catalog" CTA
   - Drag reorder (if testable)

9. **checkout-flow.spec.ts**
   - Step 1: enter address → Next
   - Step 2: select delivery (Standard/Express/Next Day) → price updates → select payment
   - Step 3: review → terms checkbox required → Place Order
   - Success page → order confirmation
   - Test card 4000...0002 → failed page

10. **orders.spec.ts**
    - Order list shows recent orders
    - Date filter works
    - Order detail: items, summary, tracking timeline
    - Cancel order → reason modal → status changes → refund if wallet

### Phase 4: Profile (Week 4)

11. **profile-settings.spec.ts**
    - Edit name → save → reflected in navbar
    - Name validation: empty, too long (>15), Cyrillic → errors
    - Edit email → save → login with new email works
    - Upload avatar → appears
    - Delete avatar → default shown
    - Unsaved changes → switch tab → warning modal

12. **profile-security.spec.ts**
    - Change password → logout → login with new password
    - 2FA: enable → QR + secret shown → disable

13. **profile-notifications.spec.ts**
    - Toggle preferences → save → verify saved
    - Unsaved changes indicator appears
    - Switch tab without save → modal

14. **profile-addresses.spec.ts**
    - Add address → appears in list
    - Edit address → changes saved
    - Delete → confirmation → removed
    - Set default → badge shown
    - Validation: empty fields, XSS in street → error

15. **profile-cards.spec.ts**
    - Add card → appears with masked number
    - Counter shows X/5
    - Card validation: empty number, past expiry, Cyrillic name
    - Max 5 → button hidden
    - Delete + set default

### Phase 5: Admin (Week 5)

16. **admin-dashboard.spec.ts**
    - Admin login → /admin, no store nav
    - 4 stat cards visible
    - Recent orders table

17. **admin-products.spec.ts**
    - Product table loads with data
    - Add product → appears in list
    - Edit product → changes saved
    - Delete → soft delete → restore
    - Bulk select + delete

18. **admin-orders.spec.ts**
    - Order list with status filter
    - Update status → reflected
    - Export CSV → file downloads
    - Date range filter

19. **admin-manager.spec.ts**
    - Login as MANAGER → sees limited sidebar
    - Can access: orders, reviews, products (read)
    - Cannot access: users, audit, settings → redirect/hidden

### Phase 6: Advanced (Week 6)

20. **dark-mode.spec.ts**
    - Toggle → background/text colors change
    - Persists after refresh

21. **i18n.spec.ts**
    - Switch EN→RU → navbar, footer, page titles change
    - Product names in Russian (nameRu)
    - Switch back → English

22. **keyboard-shortcuts.spec.ts**
    - Ctrl+K → search focused
    - ? → shortcuts modal
    - Escape → close modal

23. **cookie-consent.spec.ts**
    - Banner appears on first visit
    - Accept → gone, doesn't reappear
    - Customize → toggles

24. **captcha.spec.ts**
    - Login page: checkbox → challenge grid → verify → success checkmark

25. **websocket-tracking.spec.ts**
    - Place order → trigger auto-progress via API
    - Watch tracking timeline update in real-time
    - Status panel changes (preparing → map → delivered message)

26. **feature-flags.spec.ts**
    - Admin toggles flag → UI element appears/disappears

27. **visual-regression.spec.ts**
    - Screenshot: homepage, catalog, product, login, admin
    - Light + dark mode × each page

### Phase 7: E2E Flows (Week 7)

28. **full-purchase.spec.ts**
    - Login → browse → add to cart → checkout → order confirmed → view in orders

29. **register-to-purchase.spec.ts**
    - Register → verify email → login → full checkout flow

30. **order-lifecycle.spec.ts**
    - Checkout → auto-progress → verify each status in timeline → delivered message

31. **multi-role.spec.ts**
    - Same page, 3 roles: USER sees store, ADMIN sees admin only, MANAGER sees limited admin

---

## Key Fixtures

```typescript
// fixtures/auth.fixture.ts
import { test as base } from '@playwright/test';

type AuthFixtures = {
  userPage: Page; // Logged in as alice
  adminPage: Page; // Logged in as admin
  managerPage: Page; // Logged in as manager
};

export const test = base.extend<AuthFixtures>({
  userPage: async ({ browser }, use) => {
    // Login via API, save storageState, create page
  },
  adminPage: async ({ browser }, use) => {
    // Login as admin
  },
  managerPage: async ({ browser }, use) => {
    // Login as manager
  },
});
```

```typescript
// fixtures/data.fixture.ts
export async function resetTestData(scope?: string[]) {
  await fetch(`${API_URL}/api/test/reset`, {
    method: 'POST',
    headers: { 'X-Reset-Token': RESET_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ scope }),
  });
}

export async function triggerAutoProgress(orderId: string, interval = 8) {
  await fetch(`${API_URL}/api/test/orders/${orderId}/auto-progress`, {
    method: 'POST',
    headers: { 'X-Reset-Token': RESET_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ intervalSeconds: interval }),
  });
}
```

## Test Accounts

| Role       | Email                  | Password   |
| ---------- | ---------------------- | ---------- |
| User       | alice@example.com      | Password1! |
| Admin      | admin@planq.com        | Password1! |
| Manager    | manager@planq.com      | Password1! |
| Blocked    | blocked@example.com    | Password1! |
| Unverified | unverified@example.com | Password1! |

## Key data-testid selectors (most used)

```
# Auth
login-email, login-password, login-submit, login-error
register-form, demo-account-alice, show-test-accounts

# Navigation
navbar, nav-catalog, nav-cart, cart-badge, nav-profile-button

# Catalog
category-pill-{slug}, filter-material-{mat}, filter-color-{key}
filter-star-{1-5}, search-clear-button, catalog-filter-toggle
active-filters, active-filter-remove-{type}-{value}

# Product
product-card, add-to-cart-button, wishlist-button, quick-view-button
product-name, product-price, specs-table, review-stars

# Cart
cart-item, cart-item-increase, cart-item-decrease, cart-item-remove
promo-input, promo-apply, checkout-button

# Checkout
delivery-standard, delivery-express, payment-card, payment-wallet
place-order-button, checkout-terms

# Admin
admin-sidebar, admin-nav-{page}, admin-content
add-product-button, products-table, order-status-select-{id}
```

## Auto-Progress Timing

```
POST /api/test/orders/:id/auto-progress { intervalSeconds: 8 }
PROCESSING at 8s → SHIPPED at 16s → DELIVERED at 24s
Fits within Playwright 30s default timeout
```
