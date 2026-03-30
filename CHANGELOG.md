# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
- **CheckoutPage:** Breadcrumb (Home → Cart → Checkout)
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

- GitHub Actions: lint → typecheck → test → build → docker push to GHCR
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

### Added — Stages 1–2: Foundation

- pnpm workspaces monorepo
- Docker Compose with PostgreSQL
- ESLint + Prettier + Husky + lint-staged
- TypeScript strict configuration

---

## [Unreleased]

_No unreleased changes._
