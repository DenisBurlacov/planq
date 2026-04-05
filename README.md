# planq

> Furniture e-commerce platform built as a **practice target for QA automation teams**.

planq is a full-stack web application with a realistic e-commerce flow: product catalog, cart, checkout, orders, wishlist, profile, blog, and monitoring. Every interactive element carries a `data-testid` so automation engineers can write stable selectors from day one.

---

## Features

| Area                | What's included                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| **Catalog**         | 101 products · 10 categories · search · sort · filters (category, price range, sale, stock)            |
| **Product page**    | Photo gallery · accordion (specs / description / delivery / care) · reviews · variants · share         |
| **Cart & Checkout** | Add/remove/quantity · promo codes · saved cards · card & wallet payment · WebSocket confirmation       |
| **User account**    | Register · login · email verification · 2FA (TOTP) · profile · wallet · orders · addresses · cards     |
| **Admin panel**     | Dashboard · analytics · products CRUD · categories CRUD · orders · users · promos · reviews · audit    |
| **Wishlist**        | Add/remove · persisted per user · paginated                                                            |
| **Blog**            | Articles with cover images · categories · static pages (About, FAQ, Shipping, Returns, Privacy, Terms) |
| **Support**         | Contact form · support page · newsletter subscription                                                  |
| **Notifications**   | In-app notifications · notification preferences · real-time via WebSocket                              |
| **Webhooks**        | Subscribe to events · delivery tracking · admin management                                             |
| **Feature flags**   | `StoreSetting` with `ff_` prefix · admin toggle · `useFeatureFlag()` hook                              |
| **Auth & Security** | 3 roles (USER/MANAGER/ADMIN) · rate limiting · captcha · 2FA · email verification                      |
| **Content negot.**  | JSON (default) and XML responses via `Accept` header                                                   |
| **Monitoring**      | Grafana + Loki + Promtail — optional Docker Compose profile                                            |
| **i18n**            | English / Russian toggle                                                                               |
| **Dark mode**       | Full light/dark theme                                                                                  |
| **Compare**         | Side-by-side product comparison                                                                        |

---

## Quick Start

### Linux / macOS

```bash
# 1. Clone & install
git clone git@github.com:DenisBurlacov/planq.git
cd planq
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
pnpm install

# 2. Start all services (PostgreSQL + backend + frontend)
docker compose up

# 3. Seed the database
pnpm --filter @planq/backend db:seed

# 4. Open
#   Frontend:  http://localhost:3000
#   Backend:   http://localhost:4000
#   API docs:  http://localhost:4000/api-docs
```

### Windows (PowerShell)

```powershell
# 1. Clone & install
git clone git@github.com:DenisBurlacov/planq.git
cd planq
Copy-Item .env.example .env
Copy-Item apps/backend/.env.example apps/backend/.env
Copy-Item apps/frontend/.env.example apps/frontend/.env
pnpm install

# 2. Start all services (PostgreSQL + backend + frontend)
docker compose up

# 3. Seed the database
pnpm --filter @planq/backend db:seed
```

### Windows (CMD)

```cmd
git clone git@github.com:DenisBurlacov/planq.git
cd planq
copy .env.example .env
copy apps\backend\.env.example apps\backend\.env
copy apps\frontend\.env.example apps\frontend\.env
pnpm install
docker compose up
pnpm --filter @planq/backend db:seed
```

### Local development (without Docker)

```bash
# Requires: Node 22+, pnpm 10+, PostgreSQL running locally
pnpm install
pnpm --filter @planq/backend db:migrate
pnpm --filter @planq/backend db:seed
pnpm dev          # starts frontend + backend concurrently
```

### With monitoring stack

```bash
docker compose --profile monitoring up
# Grafana: http://localhost:3200  (admin / admin)
```

---

## Test Accounts

| Role         | Email                    | Password     |
| ------------ | ------------------------ | ------------ |
| Regular user | `alice@example.com`      | `Password1!` |
| Regular user | `bob@example.com`        | `Password1!` |
| Admin        | `admin@planq.com`        | `Password1!` |
| Manager      | `manager@planq.com`      | `Password1!` |
| Blocked user | `blocked@example.com`    | `Password1!` |
| Unverified   | `unverified@example.com` | `Password1!` |

Promo codes: `SAVE10` · `WELCOME20` · `FLASH30`

---

## Tech Stack

| Layer          | Technology                                                                          |
| -------------- | ----------------------------------------------------------------------------------- |
| Frontend       | React 18 · Vite · TypeScript · Tailwind CSS · React Query · Zustand · react-i18next |
| Backend        | Node.js · Express 5 · Prisma ORM · PostgreSQL · WebSocket (ws) · JWT · Winston      |
| Shared         | `@planq/types` — shared TypeScript types between frontend and backend               |
| Quality        | ESLint · Prettier · Husky · lint-staged · TypeScript strict · Zod validation        |
| Testing        | Playwright (E2E) · Jest (backend unit)                                              |
| Monitoring     | Grafana · Loki · Promtail                                                           |
| Infrastructure | pnpm workspaces · Docker Compose · GitHub Actions CI/CD · GHCR                      |

---

## Project Structure

```
planq/
├── apps/
│   ├── frontend/          # React SPA (Vite)
│   │   ├── src/
│   │   │   ├── api/              # API client wrappers (auth, cart, products, blog, webhooks…)
│   │   │   ├── pages/
│   │   │   │   ├── admin/        # Admin pages (Dashboard, Products, Categories, Orders, Users, Promos, Reviews, Settings, Stats, Audit)
│   │   │   │   └── ...           # Public pages (Home, Catalog, Cart, Checkout, Blog, Contact, FAQ, About, Compare, etc.)
│   │   │   ├── components/
│   │   │   │   ├── features/     # ProductCard, CompareButton, NotificationDropdown, QuickViewModal, etc.
│   │   │   │   ├── layout/       # Navbar, Footer, AdminLayout, AdminRoute, ProtectedRoute, MegaMenu
│   │   │   │   └── ui/           # Button, Input, Modal, Toast, DataTable, RangeSlider, FileUploadZone, etc.
│   │   │   ├── store/            # Zustand stores (auth, cart, theme, compare, notifications, featureFlags)
│   │   │   ├── hooks/            # useDebounce, useFeatureFlag, useProductLocale
│   │   │   └── locales/          # i18n JSON (en / ru) — 7 namespaces
│   │   └── tests/e2e/            # Playwright E2E tests
│   └── backend/           # Express API + Prisma
│       ├── prisma/
│       │   ├── schema.prisma     # 27 models, 3 roles, 5 enums
│       │   ├── migrations/       # Prisma migration history
│       │   └── seed.ts           # 101 products, 10 categories, 6 users, 6 blog articles
│       └── src/
│           ├── routes/           # 23 Express routers
│           ├── controllers/      # Route handlers
│           ├── services/         # 24 service modules (business logic layer)
│           ├── middleware/       # auth, adminAuth, managerRestrictions, contentNegotiation, upload, validate
│           ├── utils/            # Helpers, Prisma client, Swagger config
│           └── ws/               # WebSocket server
├── packages/
│   └── types/             # @planq/types — shared TS types
├── docker/
│   ├── monitoring/        # Grafana + Loki + Promtail configs
│   ├── nginx.conf         # Frontend nginx config (proxies /api, /images, /uploads, /ws)
│   ├── backend.Dockerfile
│   └── frontend.Dockerfile
├── docs/
│   ├── ARCHITECTURE.md    # System design & decisions
│   ├── LOCATORS.md        # All data-testid selectors reference
│   └── prompts/           # AI team prompts
├── scripts/               # download-images.sh, generate-placeholders.ts
├── tests/                 # Performance tests
├── docker-compose.yml
├── docker-compose.test.yml
└── pnpm-workspace.yaml
```

---

## Scripts

```bash
pnpm dev                          # Dev servers (frontend + backend)
pnpm build                        # Build all packages
pnpm lint                         # ESLint all packages
pnpm typecheck                    # TypeScript check all packages
pnpm format:check                 # Prettier check
pnpm format:fix                   # Prettier fix
pnpm test                         # Run all tests across packages
pnpm --filter @planq/backend test              # Backend unit tests (Jest)
pnpm --filter @planq/backend test:unit         # Unit tests only
pnpm --filter @planq/backend test:integration  # Integration tests only
pnpm --filter @planq/backend test:coverage     # Tests with coverage
pnpm --filter @planq/backend db:migrate        # Run Prisma migrations
pnpm --filter @planq/backend db:seed           # Seed database
pnpm --filter @planq/backend db:reset          # Reset + re-seed database
```

### E2E tests (Playwright)

Requires running backend + frontend.

```bash
# Linux / macOS
cd apps/frontend && npx playwright test              # Run all E2E tests
cd apps/frontend && npx playwright test --ui         # Open Playwright UI
cd apps/frontend && npx playwright test --project=chromium  # Chromium only

# Windows (PowerShell)
Set-Location apps\frontend; npx playwright test
Set-Location apps\frontend; npx playwright test --ui
```

---

## QA Automation Guide

planq is designed to be automation-friendly:

- All interactive elements have `data-testid` attributes — see **[docs/LOCATORS.md](docs/LOCATORS.md)**
- Stable REST API at `http://localhost:4000/api-docs` (Swagger)
- Deterministic seed data (same IDs on every `db:seed`)
- Test accounts with known credentials (see table above)
- WebSocket events for real-time order status testing
- Feature flags for A/B testing scenarios
- Content negotiation (JSON/XML) for API testing

---

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [QA Locators Reference](docs/LOCATORS.md)
- [Contributing](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

---

## License

[MIT](LICENSE)
