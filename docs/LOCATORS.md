# PLANQ — QA Locators Reference

This document lists all `data-testid` attributes used throughout the frontend, organized by page/component. Use these as stable selectors in automated tests.

> **Convention:** `data-testid` values are kebab-case and describe the role or content of the element.
> Dynamic suffixes use `-{slug}` or `-{index}` patterns.

---

## Layout / Navigation

### `<Navbar>`

| Locator              | Element    | Notes                                         |
| -------------------- | ---------- | --------------------------------------------- |
| `navbar`             | `<nav>`    | Top navigation bar                            |
| `navbar-logo`        | `<Link>`   | PLANQ logo / home link                        |
| `nav-catalog`        | `<Link>`   | "Catalog" desktop link                        |
| `nav-orders`         | `<Link>`   | "Orders" desktop link (auth only)             |
| `lang-toggle`        | `<button>` | EN/RU language switcher                       |
| `theme-toggle`       | `<button>` | Light/Dark theme toggle                       |
| `nav-wishlist`       | `<Link>`   | Wishlist icon link                            |
| `nav-cart`           | `<Link>`   | Cart icon link                                |
| `cart-badge`         | `<span>`   | Cart item count badge (absent when count = 0) |
| `nav-profile-button` | `<button>` | Profile dropdown trigger (auth only)          |
| `nav-profile-link`   | `<Link>`   | "Profile" link inside dropdown                |
| `nav-orders-link`    | `<Link>`   | "Orders" link inside dropdown                 |
| `nav-logout-button`  | `<button>` | Logout button inside dropdown                 |
| `nav-login-button`   | `<Link>`   | "Sign in" button (guest only)                 |
| `nav-admin`          | `<Link>`   | "Admin" link, desktop (visible to ADMIN only) |
| `nav-admin-mobile`   | `<Link>`   | "Admin" link, mobile menu (ADMIN only)        |

---

## Pages

### HomePage (`/`)

| Locator                | Element     | Notes                                                      |
| ---------------------- | ----------- | ---------------------------------------------------------- |
| `hero-section`         | `<section>` | Main hero banner                                           |
| `hero-cta`             | `<Link>`    | "Shop Now" call-to-action button                           |
| `sale-banner`          | `<section>` | Sale promo banner at bottom                                |
| `sale-banner-cta`      | `<Link>`    | "Shop Sale" button                                         |
| `categories-section`   | `<section>` | Category tiles grid                                        |
| `category-tile-{slug}` | `<Link>`    | Individual category tile, e.g. `category-tile-living-room` |
| `best-sellers-section` | `<section>` | Best sellers product grid                                  |
| `new-arrivals-section` | `<section>` | New arrivals product grid                                  |

---

### CatalogPage (`/catalog`)

| Locator                    | Element                  | Notes                                                          |
| -------------------------- | ------------------------ | -------------------------------------------------------------- |
| `category-filter`          | `<div>`                  | Container for category checkboxes                              |
| `category-checkbox-{slug}` | `<input[type=checkbox]>` | Individual category checkbox, e.g. `category-checkbox-bedroom` |

> **Note:** The search input, sort select, filter checkboxes (sale/stock), product grid, and pagination buttons do not currently have `data-testid` attributes. Use semantic selectors (`aria-label`, `role`, element type) for these elements.

---

### ProductPage (`/catalog/:id`)

| Locator                     | Element      | Notes                                          |
| --------------------------- | ------------ | ---------------------------------------------- |
| `breadcrumb`                | `<nav>`      | Breadcrumb navigation                          |
| `breadcrumb-item-{index}`   | `<li>`       | Individual breadcrumb item (0-based)           |
| `product-gallery`           | `<div>`      | Image gallery wrapper                          |
| `product-image-main`        | `<div>`      | Main (large) product image container           |
| `product-thumbnails`        | `<div>`      | Thumbnail strip (absent if only 1 image)       |
| `thumbnail-{index}`         | `<button>`   | Thumbnail button, 0-based                      |
| `product-name`              | `<h1>`       | Product name heading                           |
| `product-rating`            | `<div>`      | Star rating + review count row                 |
| `product-price`             | `<div>`      | Price display (includes sale price)            |
| `product-stock`             | `<p>`        | Stock availability text                        |
| `add-to-cart-button`        | `<button>`   | "Add to Cart" CTA (disabled when out of stock) |
| `wishlist-toggle-button`    | `<button>`   | Heart toggle button                            |
| `product-accordion`         | `<div>`      | Accordion wrapper                              |
| `accordion`                 | `<div>`      | Accordion component root                       |
| `accordion-item-{index}`    | `<div>`      | Accordion section (0-based)                    |
| `accordion-trigger-{index}` | `<button>`   | Section header / toggle                        |
| `accordion-content-{index}` | `<div>`      | Section content (absent when collapsed)        |
| `reviews-section`           | `<section>`  | Reviews section                                |
| `review-form`               | `<form>`     | Write-a-review form (auth only)                |
| `review-stars`              | `<div>`      | Star picker container                          |
| `star-{1–5}`                | `<button>`   | Individual star button                         |
| `review-comment`            | `<textarea>` | Review text input                              |
| `review-submit`             | `<button>`   | Submit review button                           |
| `reviews-list`              | `<div>`      | List of existing reviews                       |
| `review-item`               | `<div>`      | Single review card                             |
| `reviews-empty`             | `<p>`        | "No reviews yet" message                       |

---

### CartPage (`/cart`)

| Locator              | Element    | Notes                                         |
| -------------------- | ---------- | --------------------------------------------- |
| `cart-title`         | `<h1>`     | "My Cart" heading                             |
| `cart-empty`         | `<div>`    | Empty cart state (absent when cart has items) |
| `cart-item`          | `<div>`    | Individual cart item row (multiple)           |
| `cart-item-decrease` | `<button>` | "−" quantity button (disabled at qty=1)       |
| `cart-item-quantity` | `<span>`   | Current quantity value                        |
| `cart-item-increase` | `<button>` | "+" quantity button                           |
| `cart-item-remove`   | `<button>` | Trash / remove button                         |
| `cart-summary`       | `<div>`    | Order summary card                            |
| `promo-input`        | `<input>`  | Promo code input                              |
| `promo-apply`        | `<button>` | Apply promo button                            |
| `checkout-button`    | `<button>` | Proceed to checkout CTA                       |

---

### CheckoutPage (`/checkout`)

| Locator                | Element    | Notes                                          |
| ---------------------- | ---------- | ---------------------------------------------- |
| `breadcrumb`           | `<nav>`    | Home → Cart → Checkout breadcrumb              |
| `checkout-title`       | `<h1>`     | "Checkout" heading                             |
| `checkout-address`     | `<input>`  | Shipping address field                         |
| `payment-card`         | `<label>`  | Card payment option (radio inside)             |
| `payment-wallet`       | `<label>`  | Wallet payment option (radio inside)           |
| `checkout-card-number` | `<input>`  | Card number field (visible when CARD selected) |
| `place-order-button`   | `<button>` | Submit / place order button                    |

---

### ProfilePage (`/profile`)

| Locator              | Element    | Notes                |
| -------------------- | ---------- | -------------------- |
| `profile-tabs`       | `<div>`    | Tabs container       |
| `tab-settings`       | `<button>` | "Settings" tab       |
| `tab-security`       | `<button>` | "Security" tab       |
| `tab-panel-settings` | `<div>`    | Settings tab content |
| `tab-panel-security` | `<div>`    | Security tab content |

---

### WishlistPage (`/wishlist`)

| Locator         | Element | Notes                             |
| --------------- | ------- | --------------------------------- |
| `wishlist-grid` | `<div>` | Products grid (absent when empty) |
| `empty-state`   | `<div>` | Empty wishlist state              |

---

### OrdersPage (`/orders`)

| Locator       | Element | Notes                                  |
| ------------- | ------- | -------------------------------------- |
| `orders-list` | `<div>` | Order list wrapper (absent when empty) |
| `order-item`  | `<a>`   | Single order row link (multiple)       |
| `empty-state` | `<div>` | Empty orders state                     |

---

### LoginPage (`/login`)

| Locator               | Element    | Notes                                                           |
| --------------------- | ---------- | --------------------------------------------------------------- |
| `login-title`         | `<h1>`     | "Sign In" heading                                               |
| `login-form`          | `<form>`   | Login form                                                      |
| `login-email`         | `<input>`  | Email input                                                     |
| `login-password`      | `<input>`  | Password input                                                  |
| `login-error`         | `<p>`      | Server error message (absent when no error)                     |
| `login-submit`        | `<button>` | Submit button                                                   |
| `register-link`       | `<Link>`   | Link to register page                                           |
| `demo-accounts`       | `<div>`    | Demo accounts panel (only when VITE_SHOW_TEST_CREDENTIALS=true) |
| `demo-account-{name}` | `<button>` | Quick-fill demo account, e.g. `demo-account-user`               |

---

### RegisterPage (`/register`)

| Locator             | Element    | Notes                                 |
| ------------------- | ---------- | ------------------------------------- |
| `register-title`    | `<h1>`     | "Create Account" heading              |
| `register-form`     | `<form>`   | Registration form                     |
| `register-name`     | `<input>`  | Name input                            |
| `register-email`    | `<input>`  | Email input                           |
| `register-password` | `<input>`  | Password input                        |
| `register-error`    | `<p>`      | Server error message (absent when ok) |
| `register-submit`   | `<button>` | Submit button                         |

---

### SupportPage (`/support`)

| Locator         | Element | Notes               |
| --------------- | ------- | ------------------- |
| `support-title` | `<h1>`  | Page title          |
| `support-email` | `<div>` | Email contact card  |
| `support-chat`  | `<div>` | Live chat card      |
| `support-hours` | `<div>` | Business hours card |

---

### CheckoutProcessingPage (`/checkout/processing`)

| Locator            | Element | Notes              |
| ------------------ | ------- | ------------------ |
| `processing-page`  | `<div>` | Page root          |
| `processing-title` | `<h1>`  | Processing heading |

---

### CheckoutSuccessPage (`/checkout/success`)

| Locator             | Element  | Notes                  |
| ------------------- | -------- | ---------------------- |
| `success-page`      | `<div>`  | Page root              |
| `success-title`     | `<h1>`   | Success heading        |
| `view-order-button` | `<Link>` | View order link button |

---

### CheckoutFailedPage (`/checkout/failed`)

| Locator            | Element  | Notes                 |
| ------------------ | -------- | --------------------- |
| `failed-page`      | `<div>`  | Page root             |
| `failed-title`     | `<h1>`   | Failed heading        |
| `try-again-button` | `<Link>` | Try again link button |

---

### OrderDetailPage (`/orders/:id`)

| Locator        | Element  | Notes                  |
| -------------- | -------- | ---------------------- |
| `order-detail` | `<div>`  | Order detail container |
| `order-status` | `<span>` | Order status badge     |

---

### NotFoundPage (`*`)

| Locator                  | Element  | Notes                    |
| ------------------------ | -------- | ------------------------ |
| `not-found-page`         | `<div>`  | Page root                |
| `not-found-code`         | `<p>`    | "404" display text       |
| `not-found-title`        | `<h1>`   | "Page Not Found" heading |
| `not-found-message`      | `<p>`    | Description text         |
| `not-found-home-link`    | `<Link>` | "Go Home" button         |
| `not-found-catalog-link` | `<Link>` | "Browse Catalog" button  |

---

## Admin Panel

### `<AdminLayout>` (sidebar + content)

| Locator               | Element   | Notes                         |
| --------------------- | --------- | ----------------------------- |
| `admin-sidebar`       | `<aside>` | Sidebar container             |
| `admin-content`       | `<main>`  | Content area (renders Outlet) |
| `admin-nav-dashboard` | `<Link>`  | Dashboard nav item            |
| `admin-nav-products`  | `<Link>`  | Products nav item             |
| `admin-nav-orders`    | `<Link>`  | Orders nav item               |
| `admin-nav-users`     | `<Link>`  | Users nav item                |
| `admin-nav-back`      | `<Link>`  | "Back to Store" nav item      |

---

### AdminDashboardPage (`/admin`)

| Locator                    | Element  | Notes                           |
| -------------------------- | -------- | ------------------------------- |
| `stat-card-total-orders`   | `<div>`  | Total Orders stat card          |
| `stat-card-revenue-today`  | `<div>`  | Revenue Today stat card         |
| `stat-card-pending-orders` | `<div>`  | Pending Orders stat card        |
| `stat-card-active-users`   | `<div>`  | Active Users stat card          |
| `stat-value`               | `<span>` | Metric value (inside each card) |
| `stat-change`              | `<span>` | Change badge (inside each card) |
| `recent-orders-table`      | `<div>`  | Recent orders DataTable         |
| `order-badge-{id}`         | `<span>` | Order status badge per row      |

---

### AdminProductsPage (`/admin/products`)

| Locator               | Element    | Notes                            |
| --------------------- | ---------- | -------------------------------- |
| `add-product-button`  | `<button>` | "Add Product" button (top right) |
| `products-table`      | `<div>`    | DataTable container              |
| `edit-product-{id}`   | `<button>` | Edit button for product row      |
| `delete-product-{id}` | `<button>` | Delete button for product row    |
| `product-form`        | `<form>`   | Add/Edit product form (in modal) |
| `product-form-submit` | `<button>` | Form submit button               |

---

### AdminOrdersPage (`/admin/orders`)

| Locator                         | Element    | Notes                                       |
| ------------------------------- | ---------- | ------------------------------------------- |
| `order-filter-status`           | `<select>` | Status filter dropdown                      |
| `order-filter-search`           | `<input>`  | Search input                                |
| `orders-table`                  | `<div>`    | DataTable container                         |
| `order-status-select-{orderId}` | `<select>` | Inline status update dropdown per order row |
| `order-badge-{id}`              | `<span>`   | Order status badge per row                  |

---

### AdminUsersPage (`/admin/users`)

| Locator             | Element    | Notes                                    |
| ------------------- | ---------- | ---------------------------------------- |
| `user-search-input` | `<input>`  | Search by name or email                  |
| `users-table`       | `<div>`    | DataTable container                      |
| `user-role-{id}`    | `<span>`   | Role badge per user row                  |
| `user-status-{id}`  | `<span>`   | Status badge per user row                |
| `block-user-{id}`   | `<button>` | Block user button (non-admin users only) |
| `unblock-user-{id}` | `<button>` | Unblock user button (blocked users only) |

---

### `<DataTable>` (reusable, used across admin pages)

| Locator                | Element    | Notes                                            |
| ---------------------- | ---------- | ------------------------------------------------ |
| `{table-testid}`       | `<div>`    | Container (prop-provided, e.g. `products-table`) |
| `table-header-{key}`   | `<th>`     | Header cell for column `key`                     |
| `table-row-{rowKey}`   | `<tr>`     | Body row keyed by `rowKey`                       |
| `table-sort-{key}`     | `<button>` | Sort toggle button in header                     |
| `table-page-prev`      | `<button>` | Previous page button                             |
| `table-page-next`      | `<button>` | Next page button                                 |
| `table-page-indicator` | `<span>`   | "page / total" text                              |

---

### `<StatCard>` (reusable)

| Locator            | Element  | Notes                           |
| ------------------ | -------- | ------------------------------- |
| `stat-card-{slug}` | `<div>`  | Outer container (prop-provided) |
| `stat-value`       | `<span>` | Metric value display            |
| `stat-change`      | `<span>` | Change percentage badge         |

---

## Shared Components

### `<AddToCartModal>`

| Locator                     | Element    | Notes                        |
| --------------------------- | ---------- | ---------------------------- |
| `add-to-cart-modal-overlay` | `<div>`    | Backdrop overlay             |
| `add-to-cart-modal`         | `<div>`    | Modal dialog container       |
| `add-to-cart-modal-close`   | `<button>` | Close button (top-right)     |
| `add-to-cart-modal-name`    | `<h3>`     | Product name heading         |
| `modal-quantity-minus`      | `<button>` | Decrease quantity button     |
| `modal-quantity-value`      | `<span>`   | Current quantity value       |
| `modal-quantity-plus`       | `<button>` | Increase quantity button     |
| `modal-total-price`         | `<span>`   | Total price display          |
| `modal-cancel-button`       | `<button>` | Cancel / "No, thanks" button |
| `modal-confirm-add`         | `<button>` | Confirm "Add to Cart" button |

---

### `<ProductCard>`

| Locator              | Element    | Notes                                                      |
| -------------------- | ---------- | ---------------------------------------------------------- |
| `product-card`       | `<div>`    | Card root                                                  |
| `add-to-cart-button` | `<button>` | Add to cart (disabled when out of stock)                   |
| `wishlist-button`    | `<button>` | Heart toggle (present only if `onToggleWishlist` provided) |
| `quick-view-button`  | `<button>` | Quick view overlay (visible on hover)                      |

---

### `<Modal>`

| Locator         | Element    | Notes                      |
| --------------- | ---------- | -------------------------- |
| `modal-overlay` | `<div>`    | Backdrop overlay           |
| `modal`         | `<div>`    | Modal dialog box           |
| `modal-title`   | `<h2>`     | Dialog title               |
| `modal-body`    | `<div>`    | Dialog body content        |
| `modal-confirm` | `<button>` | Confirm action button      |
| `modal-cancel`  | `<button>` | Cancel action button       |
| `modal-close`   | `<button>` | ✕ close button (top-right) |

---

### `<Breadcrumb>`

| Locator                   | Element | Notes                                               |
| ------------------------- | ------- | --------------------------------------------------- |
| `breadcrumb`              | `<nav>` | Breadcrumb navigation                               |
| `breadcrumb-item-{index}` | `<li>`  | Individual item (0-based), last item = current page |

---

### `<Accordion>`

| Locator                     | Element    | Notes                                 |
| --------------------------- | ---------- | ------------------------------------- |
| `accordion`                 | `<div>`    | Accordion root                        |
| `accordion-item-{index}`    | `<div>`    | Item wrapper                          |
| `accordion-trigger-{index}` | `<button>` | Toggle button (aria-expanded)         |
| `accordion-content-{index}` | `<div>`    | Content panel (absent when collapsed) |

---

### `<Footer>`

| Locator               | Element  | Notes                    |
| --------------------- | -------- | ------------------------ |
| `footer-support-link` | `<Link>` | Support page link        |
| `footer-500-link`     | `<Link>` | Server Error (test) link |
| `footer-signin-link`  | `<Link>` | Sign In link             |

---

### `<Toast>`

| Locator           | Element | Notes                                  |
| ----------------- | ------- | -------------------------------------- |
| `toast-container` | `<div>` | Toast notifications wrapper            |
| `toast-{type}`    | `<div>` | Individual toast, e.g. `toast-success` |

---

### `<Input>` (password visibility toggle)

| Locator                  | Element    | Notes                                                        |
| ------------------------ | ---------- | ------------------------------------------------------------ |
| `{id}-toggle-visibility` | `<button>` | Password show/hide toggle, e.g. `password-toggle-visibility` |

> The toggle button `data-testid` is derived from the input's `id` prop. If `id="password"`, the testid is `password-toggle-visibility`. If no `id` is provided, it falls back to `password-toggle-visibility`.

---

## Intentionally Absent Locators

Some elements do **not** have `data-testid` by design — they should be located via semantic selectors or role-based queries:

- Navigation links in mobile menu (use text or `href`)
- Footer links (use text or `href`)
- Form `<label>` elements (use `for` / `htmlFor`)
- `<img>` elements (use `alt` attribute)
- Page titles in `<h1>` (use heading role)

---

## Test Account Credentials

| Role         | Email                 | Password     |
| ------------ | --------------------- | ------------ |
| Regular user | `alice@example.com`   | `Password1!` |
| Regular user | `bob@example.com`     | `Password1!` |
| Admin        | `admin@planq.com`     | `Password1!` |
| Blocked user | `blocked@example.com` | `Password1!` |
