# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

_No unreleased changes._

---

## [1.1.0] — 2026-04-04

### Added

- **Admin panel** — Dashboard (`/admin`), Products CRUD (`/admin/products`), Orders management (`/admin/orders`), Users management (`/admin/users`)
- **Admin components** — `AdminLayout` (sidebar navigation), `AdminRoute` (role-based route guard), `DataTable` (sortable, paginated), `StatCard` (dashboard metrics)
- **Password reset flow** — `POST /auth/forgot-password` and `POST /auth/reset-password` endpoints; `PasswordResetToken` model
- **Role-based access control** — `Role` enum (`USER`/`ADMIN`) on User model; admin middleware on backend; `AdminRoute` guard on frontend
- **Rate limiting** — 100 req/min global, 20 req/min on auth endpoints (raised to 1000 in test env)
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
