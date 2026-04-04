# PLANQ — Architecture

## Overview

PLANQ is a monorepo containing a React SPA frontend and a Node.js/Express backend, connected to PostgreSQL via Prisma ORM. The system is containerised with Docker Compose and ships with an optional monitoring stack (Grafana + Loki + Promtail).

```
Browser  ──HTTP/WS──►  Frontend (Vite/React)  ──REST/WS──►  Backend (Express)  ──►  PostgreSQL
                                                                     │
                                               Promtail ◄── Docker logs
                                               Promtail ──► Loki ──► Grafana
```

---

## Repository Layout

```
Planq/
├── apps/
│   ├── frontend/                 # React 18 SPA
│   │   ├── src/
│   │   │   ├── api/              # apiFetch wrappers (auth, cart, products…)
│   │   │   ├── components/
│   │   │   │   ├── features/     # ProductCard
│   │   │   │   ├── layout/       # Navbar, Footer, Layout, ProtectedRoute, AdminLayout, AdminRoute
│   │   │   │   └── ui/           # Button, Input, Modal, Toast, Accordion, DataTable, StatCard…
│   │   │   ├── pages/
│   │   │   │   ├── admin/        # AdminDashboardPage, AdminProductsPage, AdminOrdersPage, AdminUsersPage
│   │   │   │   └── ...           # Public pages (Home, Catalog, Cart, Checkout, etc.)
│   │   │   ├── store/            # Zustand stores (auth, cart, theme)
│   │   │   ├── locales/          # i18n JSON (en / ru)
│   │   │   ├── types/            # Shared TS interfaces (api.ts)
│   │   │   └── ws/               # WebSocket hook
│   │   └── vite.config.ts
│   └── backend/
│       ├── prisma/
│       │   ├── schema.prisma     # DB schema
│       │   ├── migrations/       # Prisma migrate history
│       │   └── seed.ts           # Deterministic seed (10 categories, 62 products)
│       └── src/
│           ├── routes/           # Express routers (auth, products, cart, admin…)
│           ├── controllers/      # Route handlers
│           ├── services/         # Business logic layer
│           ├── middleware/       # auth, adminAuth, error handler, requestId, validate
│           ├── utils/            # Utility functions
│           ├── ws/               # WebSocket server
│           ├── app.ts            # Express app setup (middleware, routes, rate limiter)
│           └── server.ts         # App entry point (HTTP + WS)
├── packages/
│   └── types/                    # @planq/types — shared TS types (frontend + backend)
├── docker/
│   ├── monitoring/               # Grafana + Loki + Promtail YAML configs
│   ├── backend.Dockerfile
│   └── frontend.Dockerfile
├── docs/
│   ├── ARCHITECTURE.md           # This file
│   └── LOCATORS.md               # data-testid reference for QA
└── docker-compose.yml
```

---

## Frontend

### Tech choices

| Choice                     | Reason                                                    |
| -------------------------- | --------------------------------------------------------- |
| **React 18 + Vite**        | Fast HMR, ESM-native, small bundle                        |
| **TypeScript strict**      | Catch contract mismatches early                           |
| **Tailwind CSS**           | Utility-first, works well with design tokens via CSS vars |
| **React Query (TanStack)** | Server-state caching, background refetch, loading states  |
| **Zustand**                | Minimal global state (auth token, cart count, theme)      |
| **react-i18next**          | EN/RU toggle, JSON locale files                           |

### Routing

React Router v6 with nested routes. Protected routes wrapped in `<ProtectedRoute>` which redirects to `/login` with `state: { from }` for post-login redirect.

Admin routes are wrapped in `<AdminRoute>` which requires both authentication and `role === 'ADMIN'`. Non-admin users are silently redirected to `/`. The admin panel uses `<AdminLayout>` with a sidebar navigation and renders child routes via `<Outlet>`:

- `/admin` — Dashboard (stats + recent orders)
- `/admin/products` — Product CRUD
- `/admin/orders` — Order management (status updates)
- `/admin/users` — User management (block/unblock)

### State layers

```
Server state   →  React Query (products, cart, orders, reviews…)
UI/Auth state  →  Zustand (accessToken, user, itemCount, isDark)
Form state     →  react-hook-form + Zod validation
```

### API layer

All requests go through `apiFetch()` in `src/api/client.ts`:

- Attaches `Authorization: Bearer <token>` header
- On 401 → attempts silent refresh via `POST /api/v1/auth/refresh`
- On refresh failure → clears auth store, redirects to `/login`
- Throws `ApiException` with structured `{ error, message, statusCode }`

### Real-time (WebSocket)

`useWebSocket` hook connects to `ws://localhost:4000` after login. Reconnects automatically with exponential backoff on disconnect. Handles three events:

- `payment.result` — resolves checkout processing screen
- `order.status.updated` — updates order detail in real time
- `cart.updated` — syncs cart count across tabs

---

## Backend

### Tech choices

| Choice                     | Reason                                                                        |
| -------------------------- | ----------------------------------------------------------------------------- |
| **Express**                | Lightweight, familiar, easy to add middleware                                 |
| **Prisma ORM**             | Type-safe queries, migrations, seed tooling                                   |
| **PostgreSQL**             | ACID, JSON support, good Prisma support                                       |
| **JWT (access + refresh)** | Stateless auth, short-lived access tokens (15 min), rotating refresh (7 days) |
| **bcrypt**                 | Password hashing (10 rounds)                                                  |
| **ws**                     | Lightweight WebSocket server for real-time events                             |

### API structure

```
/health           healthcheck endpoint
/api/v1/
  auth/          register · login · refresh · logout · me · forgot-password · reset-password
  products/      list (paginated + filtered) · getById · stock
  categories/    list
  cart/          get · add · update · remove
  orders/        checkout · list · getById
  reviews/       byProduct · create · delete
  wishlist/      get (paginated) · add · remove
  profile/       get · update · changePassword
  promotions/    validate promo code
  admin/
    products/    list · create · update · soft-delete     (ADMIN only)
    orders/      list (filterable) · update status         (ADMIN only)
    users/       list · block/unblock                      (ADMIN only)
```

### Auth flow

```
POST /auth/register         →  hash password → create user → return tokens
POST /auth/login            →  verify password → issue accessToken (15m) + refreshToken (7d)
POST /auth/refresh          →  verify refreshToken → rotate → issue new pair
POST /auth/logout           →  blacklist refreshToken
POST /auth/forgot-password  →  generate reset token → (in dev: return token in response)
POST /auth/reset-password   →  verify token → update password → invalidate token
```

Protected routes use `authMiddleware` which verifies the JWT and attaches `req.user`. Admin routes additionally require `role === 'ADMIN'`.

### Rate limiting

| Scope                      | Limit        | Window     |
| -------------------------- | ------------ | ---------- |
| Global (all public API)    | 100 requests | 1 minute   |
| Auth endpoints (`/auth/*`) | 5 requests   | 15 minutes |

Rate limits are enforced per IP. In `NODE_ENV=test`, global limit is raised to 10,000 and auth limit to 1,000 to avoid flaky tests. Auth rate limit window and max are configurable via `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS` environment variables.

### Database schema (key models)

```
enum Role              USER | ADMIN
enum OrderStatus       PENDING | PROCESSING | SHIPPED | DELIVERED | CANCELLED
enum PaymentMethod     CARD | WALLET
enum TransactionType   TOPUP | PURCHASE | REFUND

User                   id · email · password · name · avatar? · role(Role) · walletBalance · isBlocked · deletedAt?
RefreshToken           id · token(unique) · userId · expiresAt
PasswordResetToken     id · userId · token(unique) · expiresAt
Category               id · name(unique) · slug(unique) · image?
Product                id · name · slug(unique) · description · price · salePrice? · stock · categoryId · images[] · rating · reviewCount · deletedAt?
Cart                   id · userId(unique)
CartItem               id · cartId · productId · quantity (unique on [cartId, productId])
Wishlist               id · userId · productId (unique on [userId, productId])
Order                  id · userId · status(OrderStatus) · totalAmount · shippingAddress · paymentMethod · deletedAt?
OrderItem              id · orderId · productId · quantity · priceAtOrder
Review                 id · userId · productId · rating · comment? · deletedAt? (unique on [userId, productId])
PromoCode              id · code(unique) · discountPercent · validFrom · validUntil · minOrderAmount? · maxUses · currentUses · isActive
Transaction            id · userId · amount · type(TransactionType) · description? · orderId?
```

---

## Monitoring

Optional `--profile monitoring` adds three containers:

| Container  | Port | Role                             |
| ---------- | ---- | -------------------------------- |
| `loki`     | 3100 | Log aggregation (TSDB backend)   |
| `promtail` | —    | Log collector (Docker socket SD) |
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
- Test accounts have predictable credentials
- Promo codes are seeded deterministically
- WebSocket events are fired server-side after order creation — testable with WS clients
- API returns structured errors: `{ error, message, statusCode, requestId }`
