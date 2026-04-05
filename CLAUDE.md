# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

planq is a furniture e-commerce platform built as a QA automation training target. Full-stack monorepo: React frontend + Express backend + PostgreSQL, with 101 products, 6 test accounts, 3 roles, and 200+ `data-testid` selectors.

## Commands

```bash
# Development
pnpm dev                          # Start frontend (3000) + backend (4000) concurrently
pnpm build                        # Build all packages
pnpm lint                         # ESLint all packages
pnpm typecheck                    # TypeScript check all packages

# Backend
pnpm --filter @planq/backend test              # Run all backend tests (Jest)
pnpm --filter @planq/backend test:unit         # Unit tests only
pnpm --filter @planq/backend test:integration  # Integration tests only
pnpm --filter @planq/backend test:coverage     # Tests with coverage
pnpm --filter @planq/backend db:migrate        # Run Prisma migrations
pnpm --filter @planq/backend db:seed           # Seed database
pnpm --filter @planq/backend db:reset          # Reset + re-seed

# Frontend E2E
cd apps/frontend && npx playwright test        # Run Playwright E2E tests

# Docker
docker compose up --build                      # Full stack in Docker
docker compose --profile monitoring up         # With Grafana/Loki
```

## Architecture

**Monorepo** (pnpm workspaces): `apps/backend`, `apps/frontend`, `packages/types`

### Backend (`apps/backend`)

- **Runtime**: Express 5 + tsx (TypeScript executed directly, no build step in dev/Docker)
- **ORM**: Prisma with PostgreSQL. Schema at `prisma/schema.prisma` (27 models, 4 enums). After schema changes: run `prisma generate` then create migration.
- **Path aliases**: `@services/`, `@routes/`, `@controllers/`, `@middleware/`, `@utils/`, `@ws/` — resolved by tsx at runtime, mapped in `jest.config.cjs` for tests. All imports use `.js` extension (ESM).
- **Auth**: JWT (access 15m + refresh 7d). Three roles: `USER`, `MANAGER`, `ADMIN`. 2FA via TOTP. Email verification tokens. Captcha support.
- **Testing**: Jest with `ts-jest/presets/default-esm`. Prisma is mocked via `jest.mock('@utils/prisma.js')`. When adding new Prisma models, **all test files that mock Prisma must include the new model** or tests will crash.
- **WebSocket**: `ws` library on same server. Events: `payment.result`, `order.status.updated`, `cart.updated`, `notification.new`.
- **Middleware**: auth, adminAuth, managerRestrictions, contentNegotiation (XML support), upload (multer), validate (Zod), errorHandler, requestId.
- **23 route files**, **24 service modules**.

### Frontend (`apps/frontend`)

- **Stack**: React 18 + Vite + TypeScript + Tailwind CSS + React Query + Zustand
- **Path aliases**: `@components/`, `@pages/`, `@hooks/`, `@store/`, `@api/`, `@appTypes/`, `@constants/` — configured in both `tsconfig.json` and `vite.config.ts`.
- **i18n**: react-i18next with namespace-per-domain: `common`, `catalog`, `checkout`, `profile`, `admin`, `pages`, `about`. Locales at `src/locales/{en,ru}/`. **All user-visible text must use `t()` — no hardcoded English.**
- **State**: Zustand stores (`auth`, `cart`, `theme`, `compare`, `notifications`, `featureFlags`). React Query for server state.
- **API client**: `src/api/client.ts` — `apiFetch()` with auto-refresh on 401. `BASE_URL` is empty in Docker (nginx proxies `/api` to backend). 20 API modules.
- **Design system**: CSS custom properties in `src/styles/globals.css` (`--bg-page`, `--bg-card`, `--accent`, etc.). Light/dark via `.dark` class.
- **Routing**: React Router v6 with `React.lazy` + `Suspense` on all routes (code-splitting).
- **Hooks**: `useDebounce`, `useFeatureFlag`, `useProductLocale`.

### Docker

- Backend runs via `tsx` (not compiled JS) — Dockerfile at `docker/backend.Dockerfile`
- Frontend built by Vite, served by nginx — `docker/frontend.Dockerfile`
- nginx proxies `/api`, `/images`, `/uploads`, `/ws` to backend — `docker/nginx.conf`
- **After schema changes**: stop backend container, run `prisma migrate deploy` locally, reseed, restart. Docker backend holds a Prisma advisory lock that blocks `prisma migrate dev`.

## Key Patterns

- **Every interactive UI element needs `data-testid`** — this is a QA training platform
- **Commits**: no `Co-Authored-By` lines
- **Modals**: single-action (info/close) use `cancelLabel=""`, dual-action (confirm/cancel) use both labels
- **Feature flags**: stored in `StoreSetting` with `ff_` prefix, toggled in admin, consumed via `useFeatureFlag()` hook
- **Product images**: Unsplash URLs in seed. Local placeholder SVGs in `apps/backend/public/images/` as fallback.
- **Manager role**: can access admin panel but cannot perform destructive operations (delete products/promos, block users, change settings, view audit logs) — enforced by `managerRestrictions` middleware.
- **Content negotiation**: all GET endpoints support `Accept: application/xml` for XML responses.
- **Audit logging**: all admin actions are automatically logged to `AuditLog` table.

## Test Accounts

| Role       | Email                  | Password   |
| ---------- | ---------------------- | ---------- |
| User       | alice@example.com      | Password1! |
| User       | bob@example.com        | Password1! |
| Admin      | admin@planq.com        | Password1! |
| Manager    | manager@planq.com      | Password1! |
| Blocked    | blocked@example.com    | Password1! |
| Unverified | unverified@example.com | Password1! |

Promo codes: `SAVE10`, `WELCOME20`, `FLASH30`
