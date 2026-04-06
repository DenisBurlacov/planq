# PLANQ — QA Locators Reference

This document lists all `data-testid` attributes used throughout the frontend, organized by page/component. Use these as stable selectors in automated tests.

> **Convention:** `data-testid` values are kebab-case and describe the role or content of the element.
> Dynamic suffixes use `-{slug}` or `-{index}` patterns.

---

## Layout / Navigation

### `<Navbar>`

| Locator                  | Element    | Notes                                         |
| ------------------------ | ---------- | --------------------------------------------- |
| `navbar`                 | `<nav>`    | Top navigation bar                            |
| `navbar-logo`            | `<Link>`   | PLANQ logo / home link                        |
| `nav-catalog`            | `<Link>`   | "Catalog" desktop link                        |
| `nav-orders`             | `<Link>`   | "Orders" desktop link (auth only)             |
| `nav-new-arrivals`       | `<Link>`   | "New Arrivals" desktop link                   |
| `nav-sale`               | `<Link>`   | "Sale" desktop link                           |
| `nav-about`              | `<Link>`   | "About" desktop link                          |
| `nav-blog`               | `<Link>`   | "Blog" desktop link                           |
| `blog-dropdown`          | `<div>`    | Blog dropdown menu                            |
| `lang-toggle`            | `<button>` | EN/RU language switcher                       |
| `theme-toggle`           | `<button>` | Light/Dark theme toggle                       |
| `nav-wishlist`           | `<Link>`   | Wishlist icon link                            |
| `nav-wishlist-link`      | `<Link>`   | Wishlist link (alternative)                   |
| `nav-cart`               | `<Link>`   | Cart icon link                                |
| `cart-badge`             | `<span>`   | Cart item count badge (absent when count = 0) |
| `nav-profile-button`     | `<button>` | Profile dropdown trigger (auth only)          |
| `nav-profile-link`       | `<Link>`   | "Profile" link inside dropdown                |
| `nav-orders-link`        | `<Link>`   | "Orders" link inside dropdown                 |
| `nav-logout-button`      | `<button>` | Logout button inside dropdown                 |
| `nav-login-button`       | `<Link>`   | "Sign in" button (guest only)                 |
| `nav-admin`              | `<Link>`   | "Admin" link, desktop (visible to ADMIN only) |
| `nav-admin-mobile`       | `<Link>`   | "Admin" link, mobile menu (ADMIN only)        |
| `navbar-search-trigger`  | `<button>` | Search bar open trigger                       |
| `navbar-search-input`    | `<input>`  | Search input field                            |
| `navbar-search-dropdown` | `<div>`    | Search results dropdown                       |
| `navbar-search-close`    | `<button>` | Close search bar                              |

### Mobile Menu

| Locator                      | Element    | Notes                     |
| ---------------------------- | ---------- | ------------------------- |
| `mobile-menu-catalog-expand` | `<button>` | Expand catalog categories |
| `mobile-menu-new-arrivals`   | `<Link>`   | "New Arrivals" link       |
| `mobile-menu-sale`           | `<Link>`   | "Sale" link               |
| `mobile-menu-about`          | `<Link>`   | "About" link              |
| `mobile-menu-blog`           | `<Link>`   | "Blog" link               |
| `mobile-menu-wishlist`       | `<Link>`   | "Wishlist" link           |
| `mobile-menu-search`         | `<button>` | Mobile search trigger     |

### `<MegaMenu>`

| Locator              | Element  | Notes                    |
| -------------------- | -------- | ------------------------ |
| `mega-menu`          | `<div>`  | Mega menu dropdown panel |
| `mega-menu-view-all` | `<Link>` | "View All" link          |

### `<Footer>`

| Locator                     | Element    | Notes                        |
| --------------------------- | ---------- | ---------------------------- |
| `footer-support-link`       | `<Link>`   | Support page link            |
| `footer-signin-link`        | `<Link>`   | Sign In link                 |
| `footer-signout-button`     | `<button>` | Sign Out button (auth only)  |
| `footer-link-blog`          | `<Link>`   | Blog page link               |
| `footer-link-contact`       | `<Link>`   | Contact page link            |
| `footer-link-faq`           | `<Link>`   | FAQ page link                |
| `footer-link-privacy`       | `<Link>`   | Privacy page link            |
| `footer-link-returns`       | `<Link>`   | Returns page link            |
| `footer-link-shipping`      | `<Link>`   | Shipping page link           |
| `footer-link-terms`         | `<Link>`   | Terms page link              |
| `footer-social`             | `<div>`    | Social media links section   |
| `footer-keyboard-shortcuts` | `<button>` | Keyboard shortcuts trigger   |
| `footer-newsletter`         | `<div>`    | Newsletter subscription area |
| `footer-newsletter-title`   | `<h3>`     | Newsletter heading           |
| `footer-newsletter-email`   | `<input>`  | Newsletter email input       |
| `footer-newsletter-submit`  | `<button>` | Newsletter subscribe button  |
| `footer-newsletter-success` | `<p>`      | Success confirmation message |
| `footer-newsletter-error`   | `<p>`      | Error message                |

---

## Pages

### HomePage (`/`)

| Locator                 | Element     | Notes                                                      |
| ----------------------- | ----------- | ---------------------------------------------------------- |
| `hero-section`          | `<section>` | Main hero banner                                           |
| `hero-cta`              | `<Link>`    | "Shop Now" call-to-action button                           |
| `sale-banner`           | `<section>` | Sale promo banner at bottom                                |
| `sale-banner-cta`       | `<Link>`    | "Shop Sale" button                                         |
| `categories-section`    | `<section>` | Category tiles grid                                        |
| `category-tile-{slug}`  | `<Link>`    | Individual category tile, e.g. `category-tile-living-room` |
| `best-sellers-section`  | `<section>` | Best sellers product grid                                  |
| `new-arrivals-section`  | `<section>` | New arrivals product grid                                  |
| `testimonials-section`  | `<section>` | Customer testimonials carousel section                     |
| `testimonials-title`    | `<h2>`      | Testimonials heading                                       |
| `testimonials-carousel` | `<div>`     | Testimonials carousel wrapper                              |
| `testimonials-prev`     | `<button>`  | Previous testimonial button                                |
| `testimonials-next`     | `<button>`  | Next testimonial button                                    |
| `partners-section`      | `<section>` | Partner logos section                                      |
| `partners-title`        | `<h2>`      | Partners heading                                           |
| `trust-badges`          | `<div>`     | Trust/guarantee badges row                                 |
| `ab-test-badge`         | `<span>`    | A/B test variant badge (feature flag controlled)           |

---

### CatalogPage (`/catalog`)

| Locator                     | Element                  | Notes                                                          |
| --------------------------- | ------------------------ | -------------------------------------------------------------- |
| `catalog-search-form`       | `<form>`                 | Search form wrapper                                            |
| `catalog-search-input`      | `<input>`                | Search text input                                              |
| `search-clear-button`       | `<button>`               | Clear search input                                             |
| `catalog-filter-toggle`     | `<button>`               | Toggle filter panel visibility                                 |
| `catalog-filter-panel`      | `<div>`                  | Filter panel container                                         |
| `filter-min-price`          | `<input>`                | Min price range input                                          |
| `filter-max-price`          | `<input>`                | Max price range input                                          |
| `filter-in-stock`           | `<input[type=checkbox]>` | In stock filter checkbox                                       |
| `filter-on-sale`            | `<input[type=checkbox]>` | On sale filter checkbox                                        |
| `filter-rating`             | `<div>`                  | Rating filter (star-based)                                     |
| `category-checkbox-{slug}`  | `<input[type=checkbox]>` | Individual category checkbox, e.g. `category-checkbox-bedroom` |
| `active-filters`            | `<div>`                  | Active filter pills/badges                                     |
| `catalog-clear-filters`     | `<button>`               | Clear all filters button                                       |
| `save-filter-button`        | `<button>`               | Save current filter preset                                     |
| `saved-filters-dropdown`    | `<div>`                  | Saved filters dropdown                                         |
| `catalog-load-more`         | `<button>`               | Load more products button                                      |
| `pull-to-refresh-indicator` | `<div>`                  | Pull-to-refresh indicator (mobile)                             |

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
| `product-video`             | `<div>`      | Product video container                        |
| `product-video-placeholder` | `<div>`      | Video placeholder before load                  |
| `product-name`              | `<h1>`       | Product name heading                           |
| `product-rating`            | `<div>`      | Star rating + review count row                 |
| `rating-breakdown`          | `<div>`      | Rating distribution breakdown                  |
| `product-price`             | `<div>`      | Price display wrapper                          |
| `product-price-display`     | `<span>`     | Formatted price value                          |
| `product-stock`             | `<p>`        | Stock availability text                        |
| `variant-stock`             | `<span>`     | Variant-specific stock display                 |
| `stock-urgency`             | `<span>`     | Low stock urgency badge                        |
| `size-guide-button`         | `<button>`   | Open size guide modal                          |
| `size-guide-modal`          | `<div>`      | Size guide modal container                     |
| `size-guide-table`          | `<table>`    | Size guide data table                          |
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
| `star-{1-5}`                | `<button>`   | Individual star button                         |
| `review-comment`            | `<textarea>` | Review text input                              |
| `review-image-upload`       | `<input>`    | Review image upload input                      |
| `review-images`             | `<div>`      | Uploaded review images preview                 |
| `review-submit`             | `<button>`   | Submit review button                           |
| `reviews-list`              | `<div>`      | List of existing reviews                       |
| `review-item`               | `<div>`      | Single review card                             |
| `review-avatar`             | `<img>`      | Reviewer avatar image                          |
| `review-avatar-initial`     | `<span>`     | Reviewer avatar initial (fallback)             |
| `review-user-name`          | `<span>`     | Reviewer name                                  |
| `reviews-empty`             | `<p>`        | "No reviews yet" message                       |
| `reviews-load-more`         | `<button>`   | Load more reviews button                       |

---

### CartPage (`/cart`)

| Locator              | Element    | Notes                                         |
| -------------------- | ---------- | --------------------------------------------- |
| `cart-title`         | `<h1>`     | "My Cart" heading                             |
| `cart-empty`         | `<div>`    | Empty cart state (absent when cart has items) |
| `cart-drag-list`     | `<div>`    | Drag-reorderable cart items list              |
| `cart-item`          | `<div>`    | Individual cart item row (multiple)           |
| `cart-item-decrease` | `<button>` | "-" quantity button (disabled at qty=1)       |
| `cart-item-quantity` | `<span>`   | Current quantity value                        |
| `cart-item-increase` | `<button>` | "+" quantity button                           |
| `cart-item-remove`   | `<button>` | Trash / remove button                         |
| `cart-summary`       | `<div>`    | Order summary card                            |
| `promo-input`        | `<input>`  | Promo code input                              |
| `promo-apply`        | `<button>` | Apply promo button                            |
| `copy-promo`         | `<button>` | Copy promo code button                        |
| `checkout-button`    | `<button>` | Proceed to checkout CTA                       |

---

### CheckoutPage (`/checkout`)

| Locator                   | Element    | Notes                                          |
| ------------------------- | ---------- | ---------------------------------------------- |
| `breadcrumb`              | `<nav>`    | Home > Cart > Checkout breadcrumb              |
| `checkout-title`          | `<h1>`     | "Checkout" heading                             |
| `checkout-step-indicator` | `<div>`    | Step indicator (delivery / payment / review)   |
| `checkout-address`        | `<input>`  | Shipping address field                         |
| `checkout-map`            | `<div>`    | Delivery map container                         |
| `checkout-map-iframe`     | `<iframe>` | Embedded map iframe                            |
| `payment-card`            | `<label>`  | Card payment option (radio inside)             |
| `payment-wallet`          | `<label>`  | Wallet payment option (radio inside)           |
| `checkout-saved-cards`    | `<div>`    | Saved payment cards list                       |
| `checkout-use-new-card`   | `<button>` | Switch to new card input                       |
| `checkout-card-number`    | `<input>`  | Card number field (visible when CARD selected) |
| `checkout-terms-checkbox` | `<input>`  | Terms and conditions checkbox                  |
| `checkout-terms-error`    | `<p>`      | Terms validation error                         |
| `place-order-button`      | `<button>` | Submit / place order button                    |
| `checkout-resume-toast`   | `<div>`    | Resume abandoned checkout toast                |
| `checkout-resume-accept`  | `<button>` | Accept resume checkout                         |
| `checkout-resume-dismiss` | `<button>` | Dismiss resume checkout                        |

---

### CheckoutProcessingPage (`/checkout/processing`)

| Locator            | Element | Notes              |
| ------------------ | ------- | ------------------ |
| `processing-page`  | `<div>` | Page root          |
| `processing-title` | `<h1>`  | Processing heading |

---

### CheckoutSuccessPage (`/checkout/success`)

| Locator                            | Element    | Notes                            |
| ---------------------------------- | ---------- | -------------------------------- |
| `success-page`                     | `<div>`    | Page root                        |
| `success-title`                    | `<h1>`     | Success heading                  |
| `view-order-button`                | `<Link>`   | View order link button           |
| `order-confirmation-email`         | `<div>`    | Order confirmation email preview |
| `order-confirmation-email-toggle`  | `<button>` | Toggle email preview visibility  |
| `order-confirmation-email-address` | `<span>`   | Recipient email address          |
| `order-confirmation-email-content` | `<div>`    | Email body content               |
| `order-confirmation-email-item`    | `<div>`    | Order item in email              |
| `order-confirmation-email-total`   | `<span>`   | Order total in email             |

---

### CheckoutFailedPage (`/checkout/failed`)

| Locator            | Element  | Notes                 |
| ------------------ | -------- | --------------------- |
| `failed-page`      | `<div>`  | Page root             |
| `failed-title`     | `<h1>`   | Failed heading        |
| `try-again-button` | `<Link>` | Try again link button |

---

### ProfilePage (`/profile`)

| Locator                     | Element    | Notes                          |
| --------------------------- | ---------- | ------------------------------ |
| `profile-tabs`              | `<div>`    | Tabs container                 |
| `tab-settings`              | `<button>` | "Settings" tab                 |
| `tab-security`              | `<button>` | "Security" tab                 |
| `tab-notifications`         | `<button>` | "Notifications" tab            |
| `tab-addresses`             | `<button>` | "Addresses" tab                |
| `tab-webhooks`              | `<button>` | "Webhooks" tab                 |
| `tab-payment-methods`       | `<button>` | "Payment Methods" tab          |
| `unsaved-changes-modal`     | `<div>`    | Unsaved changes confirm dialog |
| `unsaved-changes-indicator` | `<span>`   | Unsaved changes dot indicator  |

#### Settings Tab (`tab-panel-settings`)

| Locator                      | Element    | Notes                     |
| ---------------------------- | ---------- | ------------------------- |
| `tab-panel-settings`         | `<div>`    | Settings tab content      |
| `profile-name-input`         | `<input>`  | User name input           |
| `profile-email-input`        | `<input>`  | User email input          |
| `avatar-upload`              | `<input>`  | Avatar image upload       |
| `save-settings`              | `<button>` | Save settings button      |
| `settings-unsaved-indicator` | `<span>`   | Unsaved changes indicator |

#### Security Tab (`tab-panel-security`)

| Locator                | Element    | Notes                             |
| ---------------------- | ---------- | --------------------------------- |
| `tab-panel-security`   | `<div>`    | Security tab content              |
| `2fa-section`          | `<div>`    | Two-factor authentication section |
| `2fa-enable-button`    | `<button>` | Enable 2FA button                 |
| `2fa-disable-button`   | `<button>` | Disable 2FA button                |
| `2fa-setup-modal`      | `<div>`    | 2FA setup modal                   |
| `2fa-qr-code`          | `<img>`    | TOTP QR code image                |
| `2fa-secret-code`      | `<span>`   | TOTP secret (text)                |
| `2fa-copy-secret`      | `<button>` | Copy secret to clipboard          |
| `2fa-setup-code-input` | `<input>`  | TOTP verification code input      |
| `2fa-disable-modal`    | `<div>`    | 2FA disable confirmation modal    |

#### Notifications Tab (`tab-panel-notifications`)

| Locator                   | Element    | Notes                         |
| ------------------------- | ---------- | ----------------------------- |
| `tab-panel-notifications` | `<div>`    | Notifications tab content     |
| `toggle-email`            | `<input>`  | Email notifications toggle    |
| `toggle-push`             | `<input>`  | Push notifications toggle     |
| `toggle-order-updates`    | `<input>`  | Order updates toggle          |
| `toggle-promotions`       | `<input>`  | Promotional emails toggle     |
| `toggle-newsletter`       | `<input>`  | Newsletter toggle             |
| `save-notifications`      | `<button>` | Save notification preferences |

#### Addresses Tab (`tab-panel-addresses`)

| Locator                    | Element    | Notes                      |
| -------------------------- | ---------- | -------------------------- |
| `tab-panel-addresses`      | `<div>`    | Addresses tab content      |
| `add-address-button`       | `<button>` | Add new address button     |
| `addresses-empty`          | `<div>`    | Empty state (no addresses) |
| `address-default-badge`    | `<span>`   | Default address badge      |
| `address-modal`            | `<div>`    | Add/edit address modal     |
| `address-form`             | `<form>`   | Address form               |
| `address-name-input`       | `<input>`  | Recipient name input       |
| `address-name-error`       | `<p>`      | Name validation error      |
| `address-street-input`     | `<input>`  | Street address input       |
| `address-street-error`     | `<p>`      | Street validation error    |
| `address-city-input`       | `<input>`  | City input                 |
| `address-city-error`       | `<p>`      | City validation error      |
| `address-zip-input`        | `<input>`  | ZIP/postal code input      |
| `address-zip-error`        | `<p>`      | ZIP validation error       |
| `address-country-select`   | `<select>` | Country select dropdown    |
| `address-default-checkbox` | `<input>`  | Set as default checkbox    |

#### Webhooks Tab (`tab-panel-webhooks`)

| Locator              | Element    | Notes                     |
| -------------------- | ---------- | ------------------------- |
| `tab-panel-webhooks` | `<div>`    | Webhooks tab content      |
| `add-webhook-button` | `<button>` | Add webhook button        |
| `webhooks-empty`     | `<div>`    | Empty state (no webhooks) |
| `webhook-modal`      | `<div>`    | Add/edit webhook modal    |
| `webhook-url-input`  | `<input>`  | Webhook URL input         |

#### Payment Methods Tab (`tab-panel-payment-methods`)

| Locator                     | Element    | Notes                        |
| --------------------------- | ---------- | ---------------------------- |
| `tab-panel-payment-methods` | `<div>`    | Payment methods tab content  |
| `add-card-button`           | `<button>` | Add new card button          |
| `card-count`                | `<span>`   | Number of saved cards        |
| `card-number-input`         | `<input>`  | Card number input            |
| `card-number-error`         | `<p>`      | Card number validation error |
| `cardholder-name-input`     | `<input>`  | Cardholder name input        |
| `cardholder-name-error`     | `<p>`      | Cardholder name error        |
| `card-expiry-error`         | `<p>`      | Expiry date validation error |

---

### WishlistPage (`/wishlist`)

| Locator                 | Element | Notes                              |
| ----------------------- | ------- | ---------------------------------- |
| `wishlist-grid`         | `<div>` | Products grid (absent when empty)  |
| `wishlist-remove-modal` | `<div>` | Remove from wishlist confirm modal |
| `empty-state`           | `<div>` | Empty wishlist state               |

---

### OrdersPage (`/orders`)

| Locator       | Element  | Notes                                  |
| ------------- | -------- | -------------------------------------- |
| `orders-list` | `<div>`  | Order list wrapper (absent when empty) |
| `order-item`  | `<a>`    | Single order row link (multiple)       |
| `orders-date` | `<span>` | Order date display                     |
| `empty-state` | `<div>`  | Empty orders state                     |

---

### OrderDetailPage (`/orders/:id`)

| Locator                  | Element    | Notes                        |
| ------------------------ | ---------- | ---------------------------- |
| `order-detail`           | `<div>`    | Order detail container       |
| `order-status`           | `<span>`   | Order status badge           |
| `order-status-panel`     | `<div>`    | Status progress panel        |
| `status-panel-pending`   | `<div>`    | Pending step indicator       |
| `status-panel-shipping`  | `<div>`    | Shipping step indicator      |
| `status-panel-delivered` | `<div>`    | Delivered step indicator     |
| `status-panel-cancelled` | `<div>`    | Cancelled step indicator     |
| `tracking-timeline`      | `<div>`    | Order tracking timeline      |
| `order-map-iframe`       | `<iframe>` | Delivery map iframe          |
| `cancel-order-button`    | `<button>` | Cancel order button          |
| `cancel-reason-select`   | `<select>` | Cancellation reason dropdown |
| `cancel-refund-info`     | `<div>`    | Refund information display   |

---

### BlogPage (`/blog`)

| Locator      | Element | Notes          |
| ------------ | ------- | -------------- |
| `blog-page`  | `<div>` | Page root      |
| `blog-title` | `<h1>`  | "Blog" heading |

---

### BlogArticlePage (`/blog/:slug`)

| Locator                | Element     | Notes                    |
| ---------------------- | ----------- | ------------------------ |
| `blog-article-page`    | `<div>`     | Page root                |
| `blog-article-title`   | `<h1>`      | Article title heading    |
| `blog-article-hero`    | `<img>`     | Article hero/cover image |
| `blog-article-body`    | `<div>`     | Article body content     |
| `blog-article-back`    | `<Link>`    | Back to blog link        |
| `blog-article-related` | `<section>` | Related articles section |

---

### ComparePage (`/compare`)

| Locator             | Element    | Notes                             |
| ------------------- | ---------- | --------------------------------- |
| `compare-page`      | `<div>`    | Page root                         |
| `compare-header`    | `<div>`    | Header with title and actions     |
| `compare-count`     | `<span>`   | Number of items being compared    |
| `compare-clear-all` | `<button>` | Clear all compared items          |
| `compare-table`     | `<table>`  | Comparison table                  |
| `compare-add-slot`  | `<button>` | Add product to comparison slot    |
| `compare-empty`     | `<div>`    | Empty state (no items to compare) |

---

### ContactPage (`/contact`)

| Locator                   | Element      | Notes                    |
| ------------------------- | ------------ | ------------------------ |
| `contact-page`            | `<div>`      | Page root                |
| `contact-title`           | `<h1>`       | Page heading             |
| `contact-form`            | `<form>`     | Contact form             |
| `contact-name`            | `<input>`    | Name input               |
| `contact-name-error`      | `<p>`        | Name validation error    |
| `contact-email`           | `<input>`    | Email input              |
| `contact-email-error`     | `<p>`        | Email validation error   |
| `contact-subject`         | `<input>`    | Subject input            |
| `contact-subject-error`   | `<p>`        | Subject validation error |
| `contact-message`         | `<textarea>` | Message textarea         |
| `contact-message-error`   | `<p>`        | Message validation error |
| `contact-submit`          | `<button>`   | Submit button            |
| `contact-info`            | `<div>`      | Contact info card        |
| `contact-info-email`      | `<span>`     | Email address            |
| `contact-info-phone`      | `<span>`     | Phone number             |
| `contact-info-address`    | `<span>`     | Physical address         |
| `contact-info-hours`      | `<span>`     | Business hours           |
| `contact-map-placeholder` | `<div>`      | Map placeholder          |

---

### AboutPage (`/about`)

| Locator            | Element     | Notes                  |
| ------------------ | ----------- | ---------------------- |
| `about-hero`       | `<section>` | Hero section           |
| `about-hero-title` | `<h1>`      | Hero heading           |
| `about-hero-cta`   | `<Link>`    | Hero call-to-action    |
| `about-values`     | `<section>` | Company values section |
| `about-timeline`   | `<section>` | Company timeline       |
| `about-team`       | `<section>` | Team members section   |

---

### FaqPage (`/faq`)

| Locator        | Element   | Notes                   |
| -------------- | --------- | ----------------------- |
| `faq-page`     | `<div>`   | Page root               |
| `faq-title`    | `<h1>`    | Page heading            |
| `faq-search`   | `<input>` | FAQ search input        |
| `faq-cta`      | `<div>`   | Call-to-action section  |
| `faq-cta-link` | `<Link>`  | CTA link (e.g. contact) |

---

### LoginPage (`/login`)

| Locator                 | Element    | Notes                                                           |
| ----------------------- | ---------- | --------------------------------------------------------------- |
| `login-title`           | `<h1>`     | "Sign In" heading                                               |
| `login-form`            | `<form>`   | Login form                                                      |
| `login-email`           | `<input>`  | Email input                                                     |
| `login-password`        | `<input>`  | Password input                                                  |
| `login-error`           | `<p>`      | Server error message (absent when no error)                     |
| `login-submit`          | `<button>` | Submit button                                                   |
| `register-link`         | `<Link>`   | Link to register page                                           |
| `2fa-title`             | `<h2>`     | 2FA verification heading                                        |
| `2fa-code-input`        | `<input>`  | 2FA TOTP code input                                             |
| `2fa-error`             | `<p>`      | 2FA verification error                                          |
| `2fa-submit`            | `<button>` | 2FA verify button                                               |
| `demo-accounts`         | `<div>`    | Demo accounts panel (only when VITE_SHOW_TEST_CREDENTIALS=true) |
| `demo-accounts-overlay` | `<div>`    | Demo accounts overlay backdrop                                  |
| `show-test-accounts`    | `<button>` | Show demo accounts button                                       |
| `close-test-accounts`   | `<button>` | Close demo accounts button                                      |
| `demo-account-{name}`   | `<button>` | Quick-fill demo account, e.g. `demo-account-user`               |

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

### ForgotPasswordPage (`/forgot-password`)

| Locator                   | Element    | Notes                |
| ------------------------- | ---------- | -------------------- |
| `forgot-password-form`    | `<form>`   | Forgot password form |
| `forgot-password-email`   | `<input>`  | Email input          |
| `forgot-password-submit`  | `<button>` | Submit button        |
| `forgot-password-error`   | `<p>`      | Error message        |
| `forgot-password-blocked` | `<div>`    | Blocked user message |

---

### VerifyEmailPage (`/verify-email`)

| Locator                      | Element    | Notes                        |
| ---------------------------- | ---------- | ---------------------------- |
| `verify-email-idle`          | `<div>`    | Idle state before verify     |
| `verify-email-verifying`     | `<div>`    | Verifying in progress        |
| `verify-email-success`       | `<div>`    | Verification success         |
| `verify-email-failed`        | `<div>`    | Verification failed          |
| `verify-email-home`          | `<Link>`   | Go home link                 |
| `verify-email-resend`        | `<button>` | Resend verification button   |
| `verify-email-resent`        | `<div>`    | Resend success message       |
| `verify-email-resend-failed` | `<div>`    | Resend failed message        |
| `verify-email-mock`          | `<div>`    | Mock verification (dev only) |

---

### SupportPage (`/support`)

| Locator         | Element | Notes               |
| --------------- | ------- | ------------------- |
| `support-title` | `<h1>`  | Page title          |
| `support-email` | `<div>` | Email contact card  |
| `support-chat`  | `<div>` | Live chat card      |
| `support-hours` | `<div>` | Business hours card |

---

### Static Pages

| Locator                | Element   | Route       | Notes                 |
| ---------------------- | --------- | ----------- | --------------------- |
| `static-page`          | `<div>`   | (shared)    | Static page wrapper   |
| `static-page-title`    | `<h1>`    | (shared)    | Page title            |
| `static-page-content`  | `<div>`   | (shared)    | Page body content     |
| `static-page-updated`  | `<p>`     | (shared)    | Last updated date     |
| `privacy-page`         | `<div>`   | `/privacy`  | Privacy policy page   |
| `terms-page`           | `<div>`   | `/terms`    | Terms of service page |
| `shipping-page`        | `<div>`   | `/shipping` | Shipping info page    |
| `shipping-rates-table` | `<table>` | `/shipping` | Shipping rates table  |
| `returns-page`         | `<div>`   | `/returns`  | Returns policy page   |

---

### ForbiddenPage (`/403`)

| Locator                 | Element    | Notes               |
| ----------------------- | ---------- | ------------------- |
| `forbidden-page`        | `<div>`    | Page root           |
| `forbidden-icon`        | `<div>`    | Forbidden icon      |
| `forbidden-code`        | `<p>`      | "403" display text  |
| `forbidden-title`       | `<h1>`     | "Forbidden" heading |
| `forbidden-message`     | `<p>`      | Description text    |
| `forbidden-home-link`   | `<Link>`   | "Go Home" button    |
| `forbidden-back-button` | `<button>` | "Go Back" button    |

---

### RateLimitedPage (`/429`)

| Locator                  | Element    | Notes                       |
| ------------------------ | ---------- | --------------------------- |
| `rate-limited-page`      | `<div>`    | Page root                   |
| `rate-limited-icon`      | `<div>`    | Rate limited icon           |
| `rate-limited-code`      | `<p>`      | "429" display text          |
| `rate-limited-title`     | `<h1>`     | "Too Many Requests" heading |
| `rate-limited-message`   | `<p>`      | Description text            |
| `rate-limited-countdown` | `<span>`   | Countdown timer             |
| `rate-limited-home-link` | `<Link>`   | "Go Home" button            |
| `rate-limited-retry`     | `<button>` | "Retry" button              |

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

| Locator                | Element   | Notes                         |
| ---------------------- | --------- | ----------------------------- |
| `admin-sidebar`        | `<aside>` | Sidebar container             |
| `admin-content`        | `<main>`  | Content area (renders Outlet) |
| `admin-nav-dashboard`  | `<Link>`  | Dashboard nav item            |
| `admin-nav-products`   | `<Link>`  | Products nav item             |
| `admin-nav-orders`     | `<Link>`  | Orders nav item               |
| `admin-nav-users`      | `<Link>`  | Users nav item                |
| `admin-nav-categories` | `<Link>`  | Categories nav item           |
| `admin-nav-promos`     | `<Link>`  | Promos nav item               |
| `admin-nav-reviews`    | `<Link>`  | Reviews nav item              |
| `admin-nav-stats`      | `<Link>`  | Stats nav item                |
| `admin-nav-settings`   | `<Link>`  | Settings nav item             |
| `admin-nav-audit`      | `<Link>`  | Audit nav item                |
| `admin-nav-back`       | `<Link>`  | "Back to Store" nav item      |

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

| Locator                | Element    | Notes                             |
| ---------------------- | ---------- | --------------------------------- |
| `add-product-button`   | `<button>` | "Add Product" button (top right)  |
| `products-table`       | `<div>`    | DataTable container               |
| `select-all-products`  | `<input>`  | Select all checkbox               |
| `edit-product-{id}`    | `<button>` | Edit button for product row       |
| `delete-product-{id}`  | `<button>` | Delete button for product row     |
| `bulk-delete-button`   | `<button>` | Bulk delete selected products     |
| `show-deleted-toggle`  | `<input>`  | Show soft-deleted products toggle |
| `product-form`         | `<form>`   | Add/Edit product form (in modal)  |
| `product-form-submit`  | `<button>` | Form submit button                |
| `product-image-upload` | `<input>`  | Product image upload              |

---

### AdminCategoriesPage (`/admin/categories`)

| Locator                         | Element    | Notes                      |
| ------------------------------- | ---------- | -------------------------- |
| `admin-categories-page`         | `<div>`    | Page root                  |
| `admin-categories-title`        | `<h1>`     | Page heading               |
| `admin-categories-add-button`   | `<button>` | "Add Category" button      |
| `admin-categories-table`        | `<div>`    | DataTable container        |
| `admin-category-modal`          | `<div>`    | Add/Edit category modal    |
| `admin-category-name-input`     | `<input>`  | Category name input        |
| `admin-category-slug-input`     | `<input>`  | Category slug input        |
| `admin-category-desc-input`     | `<input>`  | Category description input |
| `admin-category-save-button`    | `<button>` | Save category button       |
| `admin-category-delete-confirm` | `<button>` | Delete confirmation button |

---

### AdminOrdersPage (`/admin/orders`)

| Locator                         | Element    | Notes                                       |
| ------------------------------- | ---------- | ------------------------------------------- |
| `order-filter-status`           | `<select>` | Status filter dropdown                      |
| `order-filter-search`           | `<input>`  | Search input                                |
| `order-filter-date`             | `<input>`  | Date filter input                           |
| `orders-table`                  | `<div>`    | DataTable container                         |
| `select-all-orders`             | `<input>`  | Select all checkbox                         |
| `order-status-select-{orderId}` | `<select>` | Inline status update dropdown per order row |
| `order-badge-{id}`              | `<span>`   | Order status badge per row                  |
| `bulk-status-button`            | `<button>` | Bulk status update button                   |
| `bulk-status-select`            | `<select>` | Bulk status select dropdown                 |
| `export-button`                 | `<button>` | Export dropdown trigger                     |
| `export-csv`                    | `<button>` | Export as CSV                               |
| `export-pdf`                    | `<button>` | Export as PDF                               |

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

### AdminPromosPage (`/admin/promos`)

| Locator                      | Element    | Notes                      |
| ---------------------------- | ---------- | -------------------------- |
| `admin-promos-page`          | `<div>`    | Page root                  |
| `admin-promos-title`         | `<h1>`     | Page heading               |
| `admin-promos-add-button`    | `<button>` | "Add Promo" button         |
| `admin-promos-table`         | `<div>`    | DataTable container        |
| `admin-promo-modal`          | `<div>`    | Add/Edit promo modal       |
| `admin-promo-code-input`     | `<input>`  | Promo code input           |
| `admin-promo-discount-input` | `<input>`  | Discount percentage input  |
| `admin-promo-from-input`     | `<input>`  | Valid from date input      |
| `admin-promo-until-input`    | `<input>`  | Valid until date input     |
| `admin-promo-minorder-input` | `<input>`  | Minimum order amount input |
| `admin-promo-maxuses-input`  | `<input>`  | Maximum uses input         |
| `admin-promo-active-toggle`  | `<input>`  | Active toggle              |
| `admin-promo-save-button`    | `<button>` | Save promo button          |
| `admin-promo-delete-confirm` | `<button>` | Delete confirmation button |

---

### AdminReviewsPage (`/admin/reviews`)

| Locator                       | Element    | Notes                      |
| ----------------------------- | ---------- | -------------------------- |
| `admin-reviews-page`          | `<div>`    | Page root                  |
| `admin-reviews-title`         | `<h1>`     | Page heading               |
| `admin-reviews-search`        | `<input>`  | Search reviews             |
| `admin-reviews-filter-status` | `<select>` | Filter by status           |
| `admin-reviews-filter-rating` | `<select>` | Filter by rating           |
| `admin-reviews-table`         | `<div>`    | DataTable container        |
| `admin-review-delete-confirm` | `<button>` | Delete confirmation button |

---

### AdminStatsPage (`/admin/stats`)

| Locator                       | Element   | Notes                    |
| ----------------------------- | --------- | ------------------------ |
| `admin-stats-page`            | `<div>`   | Page root                |
| `admin-stats-title`           | `<h1>`    | Page heading             |
| `admin-stats-date-from`       | `<input>` | Date range start         |
| `admin-stats-date-to`         | `<input>` | Date range end           |
| `admin-stats-revenue-card`    | `<div>`   | Revenue stat card        |
| `admin-stats-orders-card`     | `<div>`   | Orders stat card         |
| `admin-stats-avg-order-card`  | `<div>`   | Average order value card |
| `admin-stats-conversion-card` | `<div>`   | Conversion rate card     |
| `admin-stats-revenue-chart`   | `<div>`   | Revenue chart            |
| `admin-stats-top-products`    | `<div>`   | Top products table       |
| `admin-stats-status-chart`    | `<div>`   | Orders by status chart   |
| `admin-stats-status-legend`   | `<div>`   | Status chart legend      |

---

### AdminSettingsPage (`/admin/settings`)

| Locator                        | Element    | Notes                          |
| ------------------------------ | ---------- | ------------------------------ |
| `admin-settings-page`          | `<div>`    | Page root                      |
| `admin-settings-title`         | `<h1>`     | Page heading                   |
| `admin-settings-form`          | `<form>`   | Settings form                  |
| `admin-settings-store-name`    | `<input>`  | Store name input               |
| `admin-settings-contact-email` | `<input>`  | Contact email input            |
| `admin-settings-currency`      | `<select>` | Currency select                |
| `admin-settings-free-shipping` | `<input>`  | Free shipping threshold input  |
| `admin-settings-max-cart`      | `<input>`  | Max cart items input           |
| `admin-settings-return-days`   | `<input>`  | Return window days input       |
| `admin-settings-maintenance`   | `<input>`  | Maintenance mode toggle        |
| `admin-settings-save`          | `<button>` | Save settings button           |
| `admin-feature-flags-section`  | `<div>`    | Feature flags section          |
| `admin-feature-flags-title`    | `<h2>`     | Feature flags heading          |
| `admin-scheduler-section`      | `<div>`    | Notification scheduler section |
| `admin-scheduler-title`        | `<h2>`     | Scheduler heading              |
| `admin-scheduler-enabled`      | `<input>`  | Scheduler enabled toggle       |
| `admin-scheduler-interval`     | `<input>`  | Scheduler interval input       |
| `admin-scheduler-type`         | `<select>` | Scheduler type select          |
| `admin-scheduler-max`          | `<input>`  | Max notifications input        |
| `admin-scheduler-restart`      | `<button>` | Restart scheduler button       |

---

### AdminAuditPage (`/admin/audit`)

| Locator               | Element    | Notes                 |
| --------------------- | ---------- | --------------------- |
| `audit-filter-action` | `<select>` | Filter by action type |
| `audit-filter-date`   | `<input>`  | Filter by date        |
| `audit-table`         | `<div>`    | DataTable container   |

---

## Shared Components

### `<ProductCard>`

| Locator                    | Element    | Notes                                                      |
| -------------------------- | ---------- | ---------------------------------------------------------- |
| `product-card`             | `<div>`    | Card root                                                  |
| `product-card-overlay`     | `<div>`    | Hover overlay with action buttons                          |
| `product-card-material`    | `<span>`   | Material badge                                             |
| `add-to-cart-button`       | `<button>` | Add to cart (disabled when out of stock)                   |
| `wishlist-button`          | `<button>` | Heart toggle (present only if `onToggleWishlist` provided) |
| `quick-view-button`        | `<button>` | Quick view overlay (visible on hover)                      |
| `compare-button`           | `<button>` | Add to compare button                                      |
| `swipe-indicator-cart`     | `<div>`    | Swipe-to-add-to-cart indicator (mobile)                    |
| `swipe-indicator-wishlist` | `<div>`    | Swipe-to-wishlist indicator (mobile)                       |

### `<ProductCardList>`

| Locator             | Element | Notes                    |
| ------------------- | ------- | ------------------------ |
| `product-card-list` | `<div>` | List-view card container |

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

### `<QuickViewModal>`

| Locator                  | Element    | Notes                       |
| ------------------------ | ---------- | --------------------------- |
| `quick-view-modal`       | `<div>`    | Modal container             |
| `quick-view-image`       | `<img>`    | Product image               |
| `quick-view-name`        | `<h2>`     | Product name                |
| `quick-view-price`       | `<span>`   | Product price               |
| `quick-view-description` | `<p>`      | Product description         |
| `quick-view-specs`       | `<div>`    | Product specs               |
| `quick-view-qty-minus`   | `<button>` | Decrease quantity           |
| `quick-view-qty-input`   | `<input>`  | Quantity input              |
| `quick-view-qty-plus`    | `<button>` | Increase quantity           |
| `quick-view-add-to-cart` | `<button>` | Add to cart button          |
| `quick-view-full-link`   | `<Link>`   | View full product page link |

### `<Modal>`

| Locator         | Element    | Notes                    |
| --------------- | ---------- | ------------------------ |
| `modal-overlay` | `<div>`    | Backdrop overlay         |
| `modal`         | `<div>`    | Modal dialog box         |
| `modal-title`   | `<h2>`     | Dialog title             |
| `modal-body`    | `<div>`    | Dialog body content      |
| `modal-confirm` | `<button>` | Confirm action button    |
| `modal-cancel`  | `<button>` | Cancel action button     |
| `modal-close`   | `<button>` | Close button (top-right) |

### `<Breadcrumb>`

| Locator                   | Element | Notes                                               |
| ------------------------- | ------- | --------------------------------------------------- |
| `breadcrumb`              | `<nav>` | Breadcrumb navigation                               |
| `breadcrumb-item-{index}` | `<li>`  | Individual item (0-based), last item = current page |

### `<Accordion>`

| Locator                     | Element    | Notes                                 |
| --------------------------- | ---------- | ------------------------------------- |
| `accordion`                 | `<div>`    | Accordion root                        |
| `accordion-item-{index}`    | `<div>`    | Item wrapper                          |
| `accordion-trigger-{index}` | `<button>` | Toggle button (aria-expanded)         |
| `accordion-content-{index}` | `<div>`    | Content panel (absent when collapsed) |

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

### `<StatCard>` (reusable)

| Locator            | Element  | Notes                           |
| ------------------ | -------- | ------------------------------- |
| `stat-card-{slug}` | `<div>`  | Outer container (prop-provided) |
| `stat-value`       | `<span>` | Metric value display            |
| `stat-change`      | `<span>` | Change percentage badge         |

### `<Toast>`

| Locator           | Element | Notes                                  |
| ----------------- | ------- | -------------------------------------- |
| `toast-container` | `<div>` | Toast notifications wrapper            |
| `toast-{type}`    | `<div>` | Individual toast, e.g. `toast-success` |

### `<ViewToggle>`

| Locator                 | Element    | Notes                 |
| ----------------------- | ---------- | --------------------- |
| `view-toggle`           | `<div>`    | View toggle container |
| `view-toggle-grid`      | `<button>` | Grid view button      |
| `view-toggle-list`      | `<button>` | List view button      |
| `view-toggle-load-more` | `<button>` | Load more button      |

### `<CategoryBar>`

| Locator                  | Element    | Notes                        |
| ------------------------ | ---------- | ---------------------------- |
| `category-bar`           | `<div>`    | Category pill bar container  |
| `category-pill-all`      | `<button>` | "All" category pill          |
| `category-pill-skeleton` | `<div>`    | Loading skeleton placeholder |

### `<MobileFilterModal>`

| Locator                      | Element    | Notes                         |
| ---------------------------- | ---------- | ----------------------------- |
| `mobile-filter-modal`        | `<div>`    | Mobile filter modal container |
| `mobile-filter-close`        | `<button>` | Close modal button            |
| `mobile-filter-category-all` | `<button>` | "All categories" button       |
| `mobile-filter-min-price`    | `<input>`  | Min price input               |
| `mobile-filter-max-price`    | `<input>`  | Max price input               |
| `mobile-filter-in-stock`     | `<input>`  | In stock toggle               |
| `mobile-filter-on-sale`      | `<input>`  | On sale toggle                |
| `mobile-filter-clear`        | `<button>` | Clear filters button          |
| `mobile-filter-apply`        | `<button>` | Apply filters button          |

### `<NotificationDropdown>`

| Locator                 | Element    | Notes                      |
| ----------------------- | ---------- | -------------------------- |
| `notification-bell`     | `<button>` | Bell icon trigger          |
| `notification-badge`    | `<span>`   | Unread count badge         |
| `notification-dropdown` | `<div>`    | Dropdown panel             |
| `notification-empty`    | `<p>`      | "No notifications" message |
| `mark-all-read`         | `<button>` | Mark all as read button    |

### `<NotifyWhenInStock>`

| Locator         | Element    | Notes                        |
| --------------- | ---------- | ---------------------------- |
| `notify-email`  | `<input>`  | Email input for stock notify |
| `notify-submit` | `<button>` | Submit notification request  |

### `<OrderTrackingTimeline>`

| Locator             | Element | Notes                  |
| ------------------- | ------- | ---------------------- |
| `tracking-timeline` | `<div>` | Tracking timeline root |

### `<ShareProduct>` / `<ShareModal>`

| Locator      | Element    | Notes                        |
| ------------ | ---------- | ---------------------------- |
| `share-copy` | `<button>` | Copy share link to clipboard |

### `<RecentlyViewedSection>`

| Locator                    | Element     | Notes             |
| -------------------------- | ----------- | ----------------- |
| `recently-viewed-section`  | `<section>` | Section container |
| `recently-viewed-title`    | `<h2>`      | Section heading   |
| `recently-viewed-carousel` | `<div>`     | Carousel wrapper  |

### `<RelatedProductsSection>`

| Locator                     | Element     | Notes             |
| --------------------------- | ----------- | ----------------- |
| `related-products-section`  | `<section>` | Section container |
| `related-products-title`    | `<h2>`      | Section heading   |
| `related-products-carousel` | `<div>`     | Carousel wrapper  |

### `<ImageCarousel>`

| Locator             | Element    | Notes                 |
| ------------------- | ---------- | --------------------- |
| `image-carousel`    | `<div>`    | Carousel root         |
| `carousel-viewport` | `<div>`    | Visible area          |
| `carousel-image`    | `<img>`    | Current image         |
| `carousel-prev`     | `<button>` | Previous image button |
| `carousel-next`     | `<button>` | Next image button     |
| `carousel-dots`     | `<div>`    | Dot indicators        |

### `<Input>` (password visibility toggle)

| Locator                  | Element    | Notes                                                        |
| ------------------------ | ---------- | ------------------------------------------------------------ |
| `{id}-toggle-visibility` | `<button>` | Password show/hide toggle, e.g. `password-toggle-visibility` |

> The toggle button `data-testid` is derived from the input's `id` prop. If `id="password"`, the testid is `password-toggle-visibility`. If no `id` is provided, it falls back to `password-toggle-visibility`.

### `<FileUploadZone>`

| Locator            | Element   | Notes                |
| ------------------ | --------- | -------------------- |
| `upload-dropzone`  | `<div>`   | Drop target area     |
| `upload-input`     | `<input>` | File input (hidden)  |
| `upload-preview`   | `<div>`   | File preview area    |
| `upload-file-info` | `<span>`  | File name/size info  |
| `upload-error`     | `<p>`     | Upload error message |

### `<EmptyState>`

| Locator           | Element    | Notes                 |
| ----------------- | ---------- | --------------------- |
| `empty-state`     | `<div>`    | Empty state container |
| `empty-state-cta` | `<button>` | Call-to-action button |

### `<BackButton>`

| Locator       | Element    | Notes         |
| ------------- | ---------- | ------------- |
| `back-button` | `<button>` | Navigate back |

### `<ScrollToTop>`

| Locator         | Element    | Notes                |
| --------------- | ---------- | -------------------- |
| `scroll-to-top` | `<button>` | Scroll to top button |

### `<StockUrgencyBadge>`

| Locator         | Element  | Notes                   |
| --------------- | -------- | ----------------------- |
| `stock-urgency` | `<span>` | Low stock urgency badge |

### `<SpecsTable>`

| Locator       | Element   | Notes                        |
| ------------- | --------- | ---------------------------- |
| `specs-table` | `<table>` | Product specifications table |

### `<PriceDisplay>`

| Locator                 | Element  | Notes                   |
| ----------------------- | -------- | ----------------------- |
| `product-price-display` | `<span>` | Formatted price display |

### `<Tooltip>`

| Locator   | Element | Notes         |
| --------- | ------- | ------------- |
| `tooltip` | `<div>` | Tooltip popup |

### `<PageLoadingFallback>`

| Locator                 | Element | Notes                        |
| ----------------------- | ------- | ---------------------------- |
| `page-loading-fallback` | `<div>` | Suspense loading placeholder |

### `<SizeGuideButton>` (in ProductPage)

| Locator             | Element    | Notes                  |
| ------------------- | ---------- | ---------------------- |
| `size-guide-button` | `<button>` | Opens size guide modal |
| `size-guide-modal`  | `<div>`    | Size guide modal       |
| `size-guide-table`  | `<table>`  | Size chart table       |

---

## Overlay Components

### `<CookieConsent>`

| Locator                   | Element    | Notes                             |
| ------------------------- | ---------- | --------------------------------- |
| `cookie-consent-banner`   | `<div>`    | Cookie consent banner             |
| `cookie-consent-message`  | `<p>`      | Consent message text              |
| `cookie-accept`           | `<button>` | Accept all cookies                |
| `cookie-decline`          | `<button>` | Decline optional cookies          |
| `cookie-customize`        | `<button>` | Open settings modal               |
| `cookie-settings-overlay` | `<div>`    | Settings modal backdrop           |
| `cookie-settings-modal`   | `<div>`    | Settings modal                    |
| `cookie-settings-title`   | `<h2>`     | Settings modal heading            |
| `cookie-settings-close`   | `<button>` | Close settings modal              |
| `cookie-toggle-essential` | `<input>`  | Essential cookies toggle (locked) |
| `cookie-toggle-analytics` | `<input>`  | Analytics cookies toggle          |
| `cookie-toggle-marketing` | `<input>`  | Marketing cookies toggle          |
| `cookie-save-preferences` | `<button>` | Save cookie preferences           |

### `<SessionExpiredModal>`

| Locator                   | Element    | Notes                   |
| ------------------------- | ---------- | ----------------------- |
| `session-expired-overlay` | `<div>`    | Backdrop overlay        |
| `session-expired-modal`   | `<div>`    | Modal container         |
| `session-expired-title`   | `<h2>`     | Modal heading           |
| `session-expired-message` | `<p>`      | Session expired message |
| `session-expired-signin`  | `<button>` | Sign in again button    |

### `<KeyboardShortcutsModal>`

| Locator                      | Element    | Notes                   |
| ---------------------------- | ---------- | ----------------------- |
| `keyboard-shortcuts-overlay` | `<div>`    | Backdrop overlay        |
| `keyboard-shortcuts-modal`   | `<div>`    | Modal container         |
| `keyboard-shortcuts-title`   | `<h2>`     | Modal heading           |
| `keyboard-shortcuts-close`   | `<button>` | Close button            |
| `keyboard-shortcut-item`     | `<div>`    | Individual shortcut row |

### `<OnboardingTour>`

| Locator                | Element    | Notes                    |
| ---------------------- | ---------- | ------------------------ |
| `onboarding-tour`      | `<div>`    | Tour container           |
| `onboarding-overlay`   | `<div>`    | Backdrop overlay         |
| `onboarding-spotlight` | `<div>`    | Spotlight highlight area |
| `onboarding-tooltip`   | `<div>`    | Step tooltip             |
| `onboarding-step-dots` | `<div>`    | Step progress dots       |
| `onboarding-skip`      | `<button>` | Skip tour button         |
| `onboarding-prev`      | `<button>` | Previous step button     |
| `onboarding-next`      | `<button>` | Next step button         |

### `<EmailVerificationBanner>`

| Locator                            | Element    | Notes                      |
| ---------------------------------- | ---------- | -------------------------- |
| `email-verification-banner`        | `<div>`    | Banner container           |
| `email-verification-banner-text`   | `<p>`      | Verification reminder text |
| `email-verification-banner-resend` | `<button>` | Resend verification email  |
| `email-verification-banner-sent`   | `<span>`   | "Email sent" confirmation  |

### `<SocialLoginButtons>`

| Locator                | Element    | Notes                  |
| ---------------------- | ---------- | ---------------------- |
| `social-login-buttons` | `<div>`    | Social login container |
| `oauth-google`         | `<button>` | Google OAuth button    |
| `oauth-github`         | `<button>` | GitHub OAuth button    |

### `<CaptchaMock>`

| Locator             | Element    | Notes                       |
| ------------------- | ---------- | --------------------------- |
| `captcha-challenge` | `<div>`    | Captcha challenge container |
| `captcha-checkbox`  | `<input>`  | "I'm not a robot" checkbox  |
| `captcha-verify`    | `<button>` | Verify button               |
| `captcha-success`   | `<div>`    | Success state               |

---

## Flaky Elements (Test Training Zone)

The `<FlakyZone>` component provides intentionally unstable elements for practicing flaky test handling.

| Locator                             | Element    | Notes                                   |
| ----------------------------------- | ---------- | --------------------------------------- |
| `flaky-zone`                        | `<div>`    | Zone container                          |
| `flaky-zone-title`                  | `<h2>`     | Zone heading                            |
| `flaky-zone-description`            | `<p>`      | Zone description                        |
| `flaky-delayed-section`             | `<div>`    | Delayed button section                  |
| `flaky-delayed-button-wrapper`      | `<div>`    | Delayed button wrapper                  |
| `flaky-delayed-button`              | `<button>` | Button that appears after random delay  |
| `flaky-delayed-button-placeholder`  | `<div>`    | Placeholder before button appears       |
| `flaky-intermittent-section`        | `<div>`    | Intermittent banner section             |
| `flaky-intermittent-banner-wrapper` | `<div>`    | Banner wrapper                          |
| `flaky-intermittent-banner`         | `<div>`    | Banner that toggles visibility randomly |
| `flaky-intermittent-banner-hidden`  | `<div>`    | Hidden state of banner                  |
| `flaky-slow-wrapper`                | `<div>`    | Slow-loading section wrapper            |
| `flaky-slow-section`                | `<div>`    | Slow section container                  |
| `flaky-slow-section-loading`        | `<div>`    | Loading state                           |
| `flaky-slow-section-loaded`         | `<div>`    | Loaded state                            |
| `flaky-tooltip-section`             | `<div>`    | Tooltip section                         |
| `flaky-tooltip-wrapper`             | `<div>`    | Tooltip wrapper                         |
| `flaky-tooltip-trigger`             | `<button>` | Tooltip trigger (hover-sensitive)       |
| `flaky-tooltip`                     | `<div>`    | Tooltip that appears on hover           |

---

## Intentionally Absent Locators

Some elements do **not** have `data-testid` by design — they should be located via semantic selectors or role-based queries:

- Navigation links in mobile menu (use text or `href`)
- Form `<label>` elements (use `for` / `htmlFor`)
- `<img>` elements (use `alt` attribute)
- Page titles in `<h1>` (use heading role)

---

## Test Account Credentials

| Role         | Email                    | Password     |
| ------------ | ------------------------ | ------------ |
| Regular user | `alice@example.com`      | `Password1!` |
| Regular user | `bob@example.com`        | `Password1!` |
| Admin        | `admin@planq.com`        | `Password1!` |
| Manager      | `manager@planq.com`      | `Password1!` |
| Blocked user | `blocked@example.com`    | `Password1!` |
| Unverified   | `unverified@example.com` | `Password1!` |
