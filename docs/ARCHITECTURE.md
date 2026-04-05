# planq -- Architecture

## Overview

planq is a monorepo containing a React SPA frontend and a Node.js/Express backend, connected to PostgreSQL via Prisma ORM. The system is containerised with Docker Compose and ships with an optional monitoring stack (Grafana + Loki + Promtail).

```
Browser  --HTTP/WS-->  Frontend (Vite/React)  --REST/WS-->  Backend (Express)  -->  PostgreSQL
                                                                     |
                                               Promtail <-- Docker logs
                                               Promtail --> Loki --> Grafana
```

---

## Repository Layout

```
planq/
├── apps/
│   ├── frontend/                 # React 18 SPA
│   │   ├── src/
│   │   │   ├── api/              # apiFetch wrappers (auth, cart, products, blog, webhooks, 2fa, cards…)
│   │   │   ├── components/
│   │   │   │   ├── features/     # ProductCard, CompareButton, NotificationDropdown, QuickViewModal, OrderTrackingTimeline, etc.
│   │   │   │   ├── layout/       # Navbar, Footer, Layout, ProtectedRoute, AdminLayout, AdminRoute, MegaMenu, StaticPageLayout
│   │   │   │   └── ui/           # Button, Input, Modal, Toast, Accordion, DataTable, StatCard, RangeSlider, FileUploadZone, DragList, InfiniteScroll, Toggle, Tooltip, SearchAutocomplete, etc.
│   │   │   ├── pages/
│   │   │   │   ├── admin/        # AdminDashboardPage, AdminProductsPage, AdminCategoriesPage, AdminOrdersPage, AdminUsersPage, AdminPromosPage, AdminReviewsPage, AdminSettingsPage, AdminStatsPage, AdminAuditPage
│   │   │   │   └── ...           # Public pages (Home, Catalog, Product, Cart, Checkout, Blog, Contact, Compare, FAQ, About, Shipping, Returns, Privacy, Terms, etc.)
│   │   │   ├── store/            # Zustand stores (auth, cart, theme, compare, notifications, featureFlags)
│   │   │   ├── hooks/            # useDebounce, useFeatureFlag, useProductLocale
│   │   │   ├── locales/          # i18n JSON (en / ru) — namespaces: common, catalog, checkout, profile, admin, pages, about
│   │   │   └── styles/           # globals.css with CSS custom properties (design tokens)
│   │   └── vite.config.ts
│   └── backend/
│       ├── prisma/
│       │   ├── schema.prisma     # DB schema — 27 models, 3 roles, 5 enums
│       │   ├── migrations/       # Prisma migrate history
│       │   └── seed.ts           # Deterministic seed (10 categories, 101 products, 6 users, 6 blog articles)
│       └── src/
│           ├── routes/           # 23 Express routers
│           ├── controllers/      # Route handlers
│           ├── services/         # 24 service modules (business logic)
│           ├── middleware/       # auth, adminAuth, managerRestrictions, contentNegotiation, upload, validate, errorHandler, requestId
│           ├── utils/            # Prisma client, Swagger, response helpers
│           ├── ws/               # WebSocket server
│           ├── app.ts            # Express app setup (middleware, routes, rate limiter)
│           └── server.ts         # App entry point (HTTP + WS)
├── packages/
│   └── types/                    # @planq/types — shared TS types (frontend + backend)
├── docker/
│   ├── monitoring/               # Grafana + Loki + Promtail YAML configs
│   ├── nginx.conf                # Frontend nginx (proxies /api, /images, /uploads, /ws to backend)
│   ├── backend.Dockerfile
│   └── frontend.Dockerfile
├── scripts/                      # download-images.sh, generate-placeholders.ts
├── tests/                        # Performance tests
├── docs/
│   ├── ARCHITECTURE.md           # This file
│   ├── LOCATORS.md               # data-testid reference for QA
│   └── prompts/                  # AI team prompts
├── docker-compose.yml
├── docker-compose.test.yml
└── pnpm-workspace.yaml
```

---

## Frontend

### Tech choices

| Choice                     | Reason                                                                         |
| -------------------------- | ------------------------------------------------------------------------------ |
| **React 18 + Vite**        | Fast HMR, ESM-native, small bundle                                             |
| **TypeScript strict**      | Catch contract mismatches early                                                |
| **Tailwind CSS**           | Utility-first, works well with design tokens via CSS vars                      |
| **React Query (TanStack)** | Server-state caching, background refetch, loading states                       |
| **Zustand**                | Minimal global state (auth, cart, theme, compare, notifications, featureFlags) |
| **react-i18next**          | EN/RU toggle, JSON locale files, 7 namespaces                                  |

### Routing

React Router v6 with `React.lazy` + `Suspense` on all routes for code-splitting. Protected routes wrapped in `<ProtectedRoute>` which redirects to `/login` with `state: { from }` for post-login redirect.

Admin routes are wrapped in `<AdminRoute>` which requires both authentication and `role === 'ADMIN'` or `role === 'MANAGER'`. Non-admin users are silently redirected to `/`. The admin panel uses `<AdminLayout>` with a sidebar navigation and renders child routes via `<Outlet>`:

- `/admin` — Dashboard (stats + recent orders)
- `/admin/products` — Product CRUD (with image upload, bulk delete, restore)
- `/admin/categories` — Category CRUD (with image upload)
- `/admin/orders` — Order management (status updates, bulk status, CSV export)
- `/admin/users` — User management (block/unblock)
- `/admin/promos` — Promo code CRUD
- `/admin/reviews` — Review moderation (delete)
- `/admin/settings` — Store settings & feature flags
- `/admin/stats` — Analytics (revenue chart, top products, orders by status)
- `/admin/audit` — Audit log viewer

### State layers

```
Server state   →  React Query (products, cart, orders, reviews, blog, notifications…)
UI/Auth state  →  Zustand (accessToken, user, itemCount, isDark, compare, notifications, featureFlags)
Form state     →  react-hook-form + Zod validation
```

### API layer

All requests go through `apiFetch()` in `src/api/client.ts`:

- Attaches `Authorization: Bearer <token>` header
- On 401 → attempts silent refresh via `POST /api/v1/auth/refresh`
- On refresh failure → clears auth store, redirects to `/login`
- Throws `ApiException` with structured `{ error, message, statusCode }`

### Real-time (WebSocket)

`useWebSocket` hook connects to `ws://localhost:4000` after login. Reconnects automatically with exponential backoff on disconnect. Handles events:

- `payment.result` — resolves checkout processing screen
- `order.status.updated` — updates order detail in real time
- `cart.updated` — syncs cart count across tabs
- `notification.new` — real-time notification delivery

---

## Backend

### Tech choices

| Choice                     | Reason                                                                        |
| -------------------------- | ----------------------------------------------------------------------------- |
| **Express 5**              | Lightweight, familiar, easy to add middleware                                 |
| **Prisma ORM**             | Type-safe queries, migrations, seed tooling                                   |
| **PostgreSQL**             | ACID, JSON support, good Prisma support                                       |
| **JWT (access + refresh)** | Stateless auth, short-lived access tokens (15 min), rotating refresh (7 days) |
| **bcrypt**                 | Password hashing (10 rounds)                                                  |
| **ws**                     | Lightweight WebSocket server for real-time events                             |
| **Winston**                | Structured logging                                                            |
| **Helmet**                 | HTTP security headers                                                         |
| **Compression**            | gzip response compression                                                     |

### API structure

```
/health               healthcheck endpoint
/api-docs             Swagger UI
/api/v1/
  auth/              register · login · refresh · logout · me · forgot-password · reset-password
  auth/2fa/          setup · verify · disable (TOTP-based two-factor authentication)
  auth/captcha/      generate · verify
  products/          list (paginated + filtered) · getById · stock
  categories/        list
  cart/              get · add · update · remove
  orders/            checkout · list · getById
  reviews/           byProduct · create · delete
  wishlist/          get (paginated) · add · remove
  profile/           get · update · changePassword
  profile/notifications/  get · update notification preferences
  addresses/         list · create · update · delete · set-default
  notifications/     list · mark-read · mark-all-read
  promotions/        validate promo code
  cards/             list · create · delete · set-default (saved payment cards)
  webhooks/          list · create · update · delete · deliveries
  blog/              list articles · get by slug
  contact/           submit contact form
  newsletter/        subscribe · unsubscribe
  feature-flags/     list public flags
  admin/
    products/        list · create · update · delete · restore · bulk-delete · image upload    (ADMIN/MANAGER)
    categories/      list · create · update · delete · image upload                            (ADMIN/MANAGER)
    orders/          list · update status · bulk status update · export CSV                    (ADMIN/MANAGER)
    users/           list · block/unblock                                                     (ADMIN only)
    promos/          list · create · update · delete                                           (ADMIN only)
    reviews/         list · delete                                                             (ADMIN/MANAGER)
    settings/        list · update store settings                                              (ADMIN only)
    stats/           dashboard · revenue-chart · top-products · orders-by-status               (ADMIN/MANAGER)
    audit/           list audit logs                                                           (ADMIN only)
    feature-flags/   list · update                                                             (ADMIN only)
/api/test/           reset endpoint (test environment only)
```

### Auth flow

```
POST /auth/register         →  hash password → create user → return tokens
POST /auth/login            →  verify password → check 2FA → issue accessToken (15m) + refreshToken (7d)
POST /auth/refresh          →  verify refreshToken → rotate → issue new pair
POST /auth/logout           →  blacklist refreshToken
POST /auth/forgot-password  →  generate reset token → (in dev: return token in response)
POST /auth/reset-password   →  verify token → update password → invalidate token
POST /auth/2fa/setup        →  generate TOTP secret → return QR code
POST /auth/2fa/verify       →  verify TOTP code → enable 2FA
POST /auth/2fa/disable      →  verify TOTP code → disable 2FA
```

Protected routes use `authMiddleware` which verifies the JWT and attaches `req.user`. Admin routes additionally require `role === 'ADMIN'` or `role === 'MANAGER'`. Certain destructive operations (user block, product delete, promo delete, settings update, audit logs) are restricted to ADMIN only via `managerRestrictions` middleware.

### Rate limiting

| Scope                      | Limit        | Window     |
| -------------------------- | ------------ | ---------- |
| Global (all public API)    | 100 requests | 1 minute   |
| Auth endpoints (`/auth/*`) | 5 requests   | 15 minutes |

Rate limits are enforced per IP. In `NODE_ENV=test`, global limit is raised to 10,000 and auth limit to 1,000 to avoid flaky tests. Auth rate limit window and max are configurable via `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS` environment variables.

### Content negotiation

All GET endpoints on `/api/` support content negotiation via the `Accept` header. Responses default to JSON. When `Accept: application/xml` is sent, responses are converted to XML format.

### Database schema

```
enum Role              USER | MANAGER | ADMIN
enum OrderStatus       PENDING | PROCESSING | SHIPPED | DELIVERED | CANCELLED
enum PaymentMethod     CARD | WALLET
enum TransactionType   TOPUP | PURCHASE | REFUND

User                   id · email · password · name · avatar? · role(Role) · emailVerified · provider? · providerId? · walletBalance · isBlocked · notificationPrefs? · twoFactorEnabled · twoFactorSecret? · deletedAt?
RefreshToken           id · token(unique) · userId · expiresAt
PasswordResetToken     id · userId · token(unique) · expiresAt
EmailVerificationToken id · userId · token(unique) · expiresAt
Category               id · name(unique) · nameRu? · slug(unique) · image?
Product                id · name · nameRu? · slug(unique) · description · descriptionRu? · price · salePrice? · stock · categoryId · images[] · rating · reviewCount · specs(Json)? · deletedAt?
ProductVariant         id · productId · name · color? · size? · stock · priceAdjustment · image?
StockNotification      id · email · productId · notified (unique on [email, productId])
Cart                   id · userId(unique)
CartItem               id · cartId · productId · quantity · variantId? (unique on [cartId, productId, variantId])
Wishlist               id · userId · productId (unique on [userId, productId])
Order                  id · userId · status(OrderStatus) · totalAmount · shippingAddress · paymentMethod · cancellationReason? · deliveryMethod · deliveryCost · trackingEvents(Json)? · deletedAt?
OrderItem              id · orderId · productId · quantity · priceAtOrder
Review                 id · userId · productId · rating · comment? · images[] · deletedAt? (unique on [userId, productId])
PromoCode              id · code(unique) · discountPercent · validFrom · validUntil · minOrderAmount? · maxUses · currentUses · isActive
Transaction            id · userId · amount · type(TransactionType) · description? · orderId?
Address                id · userId · name · street · city · zip · country · isDefault
Notification           id · userId · type · title · message · read
AuditLog               id · userId · action · resource · resourceId? · details(Json)?
WebhookSubscription    id · userId · url · events[] · active
WebhookDelivery        id · subscriptionId · event · payload(Json) · status
SavedCard              id · userId · last4 · brand · cardholderName · expMonth · expYear · isDefault
StoreSetting           key(PK) · value (used for feature flags with `ff_` prefix)
BlogArticle            id · title · slug(unique) · excerpt · content · coverImage? · category · authorName · publishedAt
ContactMessage         id · name · email · subject · message
NewsletterSubscriber   id · email(unique)
```

**Total: 27 models, 4 enums.**

---

## Monitoring

Optional `--profile monitoring` adds three containers:

| Container  | Port | Role                             |
| ---------- | ---- | -------------------------------- |
| `loki`     | 3100 | Log aggregation (TSDB backend)   |
| `promtail` | ---  | Log collector (Docker socket SD) |
| `grafana`  | 3200 | Dashboard UI                     |

Promtail uses Docker Socket Service Discovery to scrape logs from `backend`, `frontend`, and `postgres` containers. Labels: `container`, `service`, `project`.

Grafana auto-provisions:

- **Datasource:** Loki at `http://loki:3100`
- **Dashboard:** 4 panels — log stream, log rate, error rate, HTTP request logs

---

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`):

```
push/PR to develop or main
  ├── lint & typecheck (ESLint + tsc --noEmit)
  ├── test (Jest — backend unit tests, requires lint)    → uploads coverage artifact
  ├── build (tsc + vite build, requires lint)
  ├── e2e (Playwright — chromium + firefox, requires build, continue-on-error)  → uploads report artifact
  └── docker push → GHCR (main branch push only, requires test + build)
```

Branch protection: `develop` and `main` require CI to pass before merge.

---

## Design System

CSS custom properties defined in `src/styles/globals.css`:

```css
--bg-page        Background page
--bg-card        Card / panel background
--bg-sidebar     Sidebar / input background
--text-primary   Primary text
--text-secondary Muted text
--border         Border color
--accent         Brand green (#2d6a4f)
--accent-hover   Hover state

/* Admin & table tokens */
--bg-admin-sidebar        Admin sidebar background
--bg-admin-sidebar-active Active admin nav item
--admin-sidebar-width     Sidebar width (256px, collapsed: 64px)
--stat-positive           Stat card positive trend
--stat-negative           Stat card negative trend
--stat-neutral            Stat card neutral
--table-header-bg         Table header background
--table-row-hover         Table row hover
--table-stripe            Alternating row stripe
```

Dark mode toggled via `data-theme="dark"` on `<html>` and persisted in localStorage via Zustand.

---

## QA Design Decisions

- Every interactive element has a `data-testid` — see [LOCATORS.md](LOCATORS.md)
- Seed is **idempotent** (`upsert` by slug) — safe to re-run, same IDs every time
- Test accounts have predictable credentials (6 accounts: alice, bob, admin, manager, blocked, unverified)
- Promo codes are seeded deterministically (`SAVE10`, `WELCOME20`, `FLASH30`)
- WebSocket events are fired server-side after order creation — testable with WS clients
- API returns structured errors: `{ error, message, statusCode, requestId }`
- Feature flags allow toggling features for A/B testing scenarios
- Content negotiation supports JSON and XML response formats
