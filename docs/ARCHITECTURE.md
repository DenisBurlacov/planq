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
│           ├── routes/
│           │   ├── admin/        # Admin CRUD routers (products, orders, users)
│           │   └── ...           # Public routers (auth, products, cart, orders…)
│           ├── services/         # Business logic layer
│           ├── middlewares/      # auth, error handler, rate-limiter
│           └── index.ts          # App entry point
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
/api/v1/
  auth/          register · login · refresh · logout · forgot-password · reset-password
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

| Scope                      | Limit        | Window   |
| -------------------------- | ------------ | -------- |
| Global (all public API)    | 100 requests | 1 minute |
| Auth endpoints (`/auth/*`) | 20 requests  | 1 minute |

Rate limits are enforced per IP. In `NODE_ENV=test`, limits are raised to 1000 to avoid flaky tests.

### Database schema (key models)

```
enum Role              USER | ADMIN

User                   id · email · name · passwordHash · walletBalance · isBlocked · role(Role)
Category               id · name · slug · image
Product                id · name · slug · description · price · salePrice · stock · images[] · categoryId
Cart                   id · userId
CartItem               id · cartId · productId · quantity
Order                  id · userId · status · totalAmount · shippingAddress · paymentMethod
OrderItem              id · orderId · productId · quantity · priceAtOrder
Review                 id · userId · productId · rating · comment
Wishlist               id · userId · productId (direct User↔Product, unique on [userId, productId])
PromoCode              id · code · discountPercent · validFrom · validUntil · minOrderAmount
Transaction            id · userId · amount · type · description
PasswordResetToken     id · userId · token(unique) · expiresAt · createdAt
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
  └── lint (ESLint)
  └── typecheck (tsc --noEmit)
  └── test (Jest — backend unit tests)
  └── build (tsc + vite build)
  └── docker push → GHCR (main branch only)
```

Branch protection: `develop` and `main` require CI to pass before merge.

---

## Design System

CSS custom properties defined in `index.css`:

```css
--bg-page        Background page
--bg-card        Card / panel background
--bg-sidebar     Sidebar / input background
--text-primary   Primary text
--text-secondary Muted text
--border         Border color
--accent         Brand green (#2d6a4f)
--accent-hover   Hover state
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
