# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

_Nothing yet._

---

## [2.0.0] — 2026-04-04

Major release. Admin panel fully built out, 3 user roles, product variants, blog, static pages, compare, notifications, webhooks, feature flags, A/B testing, onboarding tour, keyboard shortcuts, and significantly expanded test infrastructure.

### Added

- **Admin panel** — 10 pages: Dashboard, Products CRUD, Orders, Users, Promos, Categories, Reviews, Stats/Analytics, Settings, Audit log
- **3 user roles** — USER, MANAGER, ADMIN with granular permissions; `managerRestrictions` middleware blocks destructive operations for MANAGER
- **Product variants** — `ProductVariant` model with color, size, stock, price adjustment; 101 products, 54 reviews in seed
- **Blog system** — `BlogArticle` model, `/api/v1/blog` endpoints, `BlogPage` and `BlogArticlePage` on frontend, 6 seed articles with cover images
- **Static pages** — About, FAQ, Shipping, Returns, Privacy Policy, Terms of Service with `StaticPageLayout`
- **Contact form** — `ContactMessage` model, `/api/v1/contact` endpoint, `ContactPage` on frontend
- **Support page** — `/support` with email, chat, and business hours contact cards
- **Compare page** — side-by-side comparison of up to 4 products, `CompareButton` component, `compare.store.ts`
- **Saved payment cards** — `SavedCard` model, `/api/v1/cards` CRUD (max 5 per user, with Luhn validation and expiry check)
- **Addresses** — `Address` model, `/api/v1/addresses` CRUD with default address support
- **Notifications** — `Notification` model, in-app system, `NotificationDropdown` component, notification preferences on profile, scheduled notifications via cron
- **Real-time notifications** — WebSocket `notification.new` event
- **Email verification** — `EmailVerificationToken` model, `emailVerified` field on User, `VerifyEmailPage`
- **Two-factor authentication (2FA)** — TOTP-based via `/api/v1/auth/2fa` (setup, verify, disable) — mock implementation
- **Captcha** — `/api/v1/auth/captcha` generate and verify — mock implementation
- **Social login** — OAuth mock endpoints for Google/GitHub
- **Cookie consent** — banner component with accept/decline
- **Session expired modal** — shown on 401 when refresh token fails
- **Feature flags** — `StoreSetting` with `ff_` prefix, admin toggle, `useFeatureFlag()` hook, `featureFlags.store.ts`
- **A/B testing** — variant assignment via feature flags
- **Flaky QA zone** — intentionally flaky endpoints for QA resilience testing
- **File upload** — avatar, product images, review photos via Multer middleware
- **Webhooks** — `WebhookSubscription` + `WebhookDelivery` models, `/api/v1/webhooks` CRUD with delivery log
- **Content negotiation** — XML response support via `Accept: application/xml` header on all GET endpoints
- **Order tracking** — `trackingEvents` JSON field, `OrderTrackingTimeline` component, cancellation reasons, delivery method & cost, status-dependent panel
- **Product specs** — JSON `specs` field on Product model, `SpecsTable` component
- **Stock notifications** — `StockNotification` model, notify-when-in-stock feature
- **Countdown timers** — for sale products and flash deals
- **Stock urgency badges** — low-stock indicator on product cards
- **Rating breakdown** — star distribution chart on product page
- **Photo reviews** — `images[]` field on Review model, image upload in review form
- **Share product** — modal with copy-link, social share buttons
- **Social media modals** — in footer for social links
- **Keyboard shortcuts** — `Ctrl+K` for search, `?` for shortcut help overlay
- **Onboarding tour** — guided walkthrough for new users
- **Product localization** — `nameRu`, `descriptionRu` on Product, `nameRu` on Category, `useProductLocale` hook
- **Admin categories CRUD** — `/api/v1/admin/categories` with image upload, `AdminCategoriesPage`
- **Admin promo codes CRUD** — `/api/v1/admin/promos` with create/update/delete, `AdminPromosPage`
- **Admin review moderation** — `/api/v1/admin/reviews` list and delete, `AdminReviewsPage`
- **Admin store settings** — `/api/v1/admin/settings` list and update, `AdminSettingsPage`
- **Admin analytics** — `/api/v1/admin/stats` with revenue chart, top products, orders by status, `AdminStatsPage`
- **Admin bulk operations** — bulk delete products, bulk update order status, CSV order export
- **Admin product image upload** — multipart upload via `/api/v1/admin/products/:id/images`
- **Admin product restore** — restore soft-deleted products via `/api/v1/admin/products/:id/restore`
- **Audit logging** — `AuditLog` model, all admin actions logged, `/api/v1/admin/audit` endpoint, `AdminAuditPage`
- **Newsletter** — `NewsletterSubscriber` model, `/api/v1/newsletter` subscribe/unsubscribe
- **MegaMenu** — dropdown navigation component
- **Checkout flow pages** — `CheckoutProcessingPage`, `CheckoutSuccessPage`, `CheckoutFailedPage`
- **Error pages** — `ForbiddenPage`, `ServerErrorPage`, `RateLimitedPage`
- **UI components** — AddToCartModal, BackButton, CopyButton, CountdownTimer, DragList, EmptyState, FileUploadZone, InfiniteScroll, PageLoadingFallback, RangeSlider, ScrollToTop, SearchableSelect, SearchAutocomplete, Stepper, StockUrgencyBadge, Toggle, Tooltip, ViewToggle
- **Feature components** — CategoryBar, MobileFilterModal, OrderTrackingTimeline, ProductCardList, QuickViewModal, RecentlyViewedSection, RelatedProductsSection, ShareProduct
- **ErrorBoundary** and **OfflineBanner** global components
- **Additional frontend API modules** — addresses, blog, cards, contact, featureFlags, newsletter, notifications, oauth, twoFactor, upload, webhooks
- **Seed expanded** — 101 products (was 62), 6 users (was 4), 54 reviews, 6 blog articles, product variants, store settings
- **i18n namespace: about** — translations for About page
- **Winston logging** — structured logging on backend
- **Helmet** — HTTP security headers
- **Compression** — gzip response compression
- **k6 performance scripts** — load testing for key API endpoints
- **Playwright visual regression** — screenshot comparison tests
- **Test data factory** — programmatic test data generation
- **Scoped API reset** — test-only endpoint to reset specific data domains
- **Order auto-progress** — test endpoint to advance order status for E2E flows
- **`docker-compose.test.yml`** — separate compose for test environment
- **`scripts/`** — `download-images.sh`, `generate-placeholders.ts`

### Improved

- **Category pill bar** — horizontal scrollable pill navigation for categories
- **Catalog filters** — material, color, style, rating, saved filters in addition to category/price/sale/stock
- **Multi-step checkout** — 3 steps (address, payment, review) with delivery options and test card numbers
- **Search** — autocomplete dropdown with product suggestions and clear button
- **Grid/list/load-more** — view mode toggle and infinite scroll on catalog page
- **Unsaved changes detection** — notifications and settings pages track dirty state with warning modals
- **Cart badge** — syncs from API on page load (Layout.tsx), not just in-memory
- **Admin-only navigation** — ADMIN role sees only admin panel, no store links in navbar
- **Date range validation** — `DateRangeFilter` component enforces from-before-to with `max`/`min` attributes
- **Password visibility toggle** — `Input` component shows eye icon on password fields

### Refactored

- **Shared components** extracted — `StarRating`, `PriceDisplay`, `ProductImage`, `DateRangeFilter`
- **Shared hooks** extracted — `useAddToCart`, `useConfirmModal`, `useModalAccessibility`, `usePagination`, `useDebounce`
- **Shared utilities** — `pricing.ts` for price calculations, `validation.ts` for form validation with XSS/SQL injection checks
- **All API modules** now use real `apiFetch` — removed all localStorage mocks and setTimeout fakes

### Fixed

- **Price filter overlap** — min and max sliders no longer overlap each other
- **Case-insensitive filters** — style, material, and color filters now work regardless of case
- **Addresses API path** — frontend path corrected to match backend mount point (`/api/v1/addresses`)
- **Webhook `updatedAt`** — added missing column to webhook delivery model
- **Delivery method case mismatch** — normalized delivery method values between frontend and backend
- **Manager restrictions** — users list, settings, and audit endpoints now properly blocked for MANAGER role
- **Cart cache invalidation** — `['cart']` query invalidated after `cartApi.add` call
- **Page fade transition removed** — caused flickering and broke E2E tests
- **30+ i18n fixes** — replaced hardcoded English strings with `t()` calls across all pages
- **6 dead components removed** — unused components cleaned up from the codebase
- **Footer logo** — matched with navbar SVG icon (was using a different icon)
- **Wishlist API** — frontend adapted to paginated response format from backend
- **Docker: frontend VITE_API_URL** — fixed for Docker environment using nginx proxy
- **Docker: Postgres healthcheck** — corrected database name in healthcheck command
- **Docker: backend runner** — switched to `tsx` to resolve TypeScript path aliases at runtime
- **Docker: Husky** — disabled Husky during Docker build
- **Docker: backend Dockerfile** — install prod deps in production stage
- **Docker: Prisma generate** — added `prisma generate` before backend build
- **CI: Playwright** — added `@playwright/test` dependency, fixed lowercase Docker tags

### Changed

- **Roles** — expanded from 2 (USER/ADMIN) to 3 (USER/MANAGER/ADMIN)
- **CartItem** — unique constraint now includes `variantId` for variant support
- **Zustand stores** — expanded from 3 (auth, cart, theme) to 6 (+ compare, notifications, featureFlags)
- **Frontend routing** — all routes now use `React.lazy` + `Suspense` for code splitting
- **Seed data** — 101 products across 10 categories (was 62), 54 reviews, 6 blog articles

---

## [1.1.0] — 2026-04-04

### Added

- **Admin panel** — Dashboard (`/admin`), Products CRUD (`/admin/products`), Orders management (`/admin/orders`), Users management (`/admin/users`)
- **Admin components** — `AdminLayout` (sidebar navigation), `AdminRoute` (role-based route guard), `DataTable` (sortable, paginated), `StatCard` (dashboard metrics)
- **Password reset flow** — `POST /auth/forgot-password` and `POST /auth/reset-password` endpoints; `PasswordResetToken` model
- **Role-based access control** — `Role` enum (`USER`/`ADMIN`) on User model; admin middleware on backend; `AdminRoute` guard on frontend
- **Rate limiting** — 100 req/min global, 5 req/15min on auth endpoints (raised in test env)
- **Shared types package** — `@planq/types` for TypeScript types used by both frontend and backend
- **Playwright E2E test setup** — `playwright.config.ts`, Chromium + Firefox projects, `tests/e2e/` directory
- **Docker health checks** — backend and database containers now have health check probes
- **JWT secrets management** — environment variables for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
- **`.dockerignore`** — reduces Docker build context size
- **Admin test account** — `admin@planq.com` / `Password1!` (seeded)
- **Blocked test account** — `blocked@example.com` / `Password1!` (seeded)
- **Admin API routes** — `GET/POST/PUT/DELETE /api/v1/admin/products`, `GET/PUT /api/v1/admin/orders`, `GET/PUT /api/v1/admin/users`
- **Paginated wishlist** — `GET /api/v1/wishlist?page=&limit=`
- **WebSocket reconnect** — exponential backoff on disconnect in `useWebSocket` hook
- **Image lazy loading** — with fallback in `ProductCard`

### Changed

- **Grafana port** — changed from 3001 to 3200 to avoid conflict with Loki (port 3100)

### Fixed

- **Accessibility** — 20 issues fixed across Modal, Toast, Navbar, Button, CatalogPage, Accordion, ProductCard, OfflineBanner (focus traps, ARIA roles, keyboard navigation, labels, live regions)
- Breadcrumb on CatalogPage displaying incorrect product photos
- Footer Support link pointing to `/500` error page
- Seed credentials synced with documentation
- Page overlay opacity reduced (0.90 to 0.60) so background photo is visible
- Below-hero sections wrapped in solid background to prevent photo bleeding between cards

### Style

- Clean neutral color palette with CSS custom properties
- Removed page-wide background photo
- Admin surface design tokens (`--bg-admin-sidebar`, `--table-header-bg`, `--stat-positive`, etc.)

---

## [1.0.0] — 2026-03-30

First production-ready release. All 9 stages complete.

### Added — Stage 9: Documentation

- `README.md` — full project overview, quick start, QA guide, test accounts, scripts
- `docs/ARCHITECTURE.md` — system design, tech choices, DB schema, auth flow, monitoring, CI/CD
- `CHANGELOG.md` — full history of all stages
- `LICENSE` — MIT
- `SECURITY.md` — vulnerability reporting policy and security practices

### Added — Stage 8: UI Enrichment & Content

- **Seed:** 10 categories (+ Decor, Textiles, Lighting, Storage), 62 products, verified Unsplash photos
- **HomePage:** Hero banner with stats/badge/dual CTA, category tiles grid, Best Sellers section, Sale Banner
- **ProductCard:** hover lift + shadow, Quick View overlay button, wishlist tooltip
- **ProductPage:** h-96 gallery + thumbnail strip, Breadcrumb, Accordion (Specs / Description / Delivery / Care), full `data-testid` coverage
- **Navbar:** `data-testid` on all 13 navigation elements
- **NotFoundPage:** `data-testid` attributes + Browse Catalog CTA
- **CheckoutPage:** Breadcrumb (Home > Cart > Checkout)
- **New components:** `Breadcrumb`, `Accordion`
- **Modal:** confirmation dialog for cart item removal
- **CatalogPage:** category checkboxes with `data-testid="category-checkbox-{slug}"`
- **ProfilePage:** Settings / Security tabs with full testid coverage
- **Toast:** coloured left border per type
- **`docs/LOCATORS.md`:** 70+ `data-testid` reference table

### Added — Stage 7: Monitoring

- Grafana + Loki + Promtail via Docker Compose `--profile monitoring`
- Promtail Docker Socket SD — scrapes backend, frontend, postgres containers
- Grafana auto-provisioned datasource + dashboard (4 panels)

### Added — Stage 6: CI/CD

- GitHub Actions: lint > typecheck > test > build > docker push to GHCR
- Branch protection on `develop` and `main`

### Added — Stage 5: QA Pass

- Backend unit tests (Jest): auth, orders, products services
- Input validation with Zod on all API routes
- Rate limiting on auth endpoints
- Standardised error responses: `{ error, message, statusCode, requestId }`

### Added — Stage 4: Frontend

- React 18 + Vite + TypeScript SPA with React Router v6
- React Query (TanStack) + Zustand (auth, cart, theme)
- All pages: Home, Catalog, Product, Cart, Checkout, Orders, Wishlist, Profile, Wallet, Auth, 404
- `apiFetch` client with JWT auto-refresh
- WebSocket hook for real-time events (payment, order status, cart sync)
- EN / RU i18n via react-i18next
- Light / Dark theme via CSS custom properties
- UI library: Button, Input, Badge, Toast, Skeleton, Modal

### Added — Stage 3: Backend

- Express REST API with JWT auth (access 15m + refresh 7d rotating)
- Prisma ORM + PostgreSQL — full e-commerce schema
- WebSocket server for real-time events
- Swagger/OpenAPI at `/api-docs`
- Deterministic seed with upsert

### Added — Stages 1-2: Foundation

- pnpm workspaces monorepo
- Docker Compose with PostgreSQL
- ESLint + Prettier + Husky + lint-staged
- TypeScript strict configuration
