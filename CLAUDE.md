# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PLANQ is a furniture e-commerce platform built as a QA automation training target. Full-stack monorepo: React frontend + Express backend + PostgreSQL, with 101 products, 6 test accounts, 3 roles, and 200+ `data-testid` selectors.

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
pnpm --filter @planq/backend test:coverage     # Tests with coverage
pnpm --filter @planq/backend db:migrate        # Run Prisma migrations
pnpm --filter @planq/backend db:seed           # Seed database
pnpm --filter @planq/backend db:reset          # Reset + re-seed
pnpm --filter @planq/backend exec prisma generate  # Regenerate Prisma client

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
- **ORM**: Prisma with PostgreSQL. Schema at `prisma/schema.prisma`. After schema changes: run `prisma generate` then create migration.
- **Path aliases**: `@services/`, `@routes/`, `@controllers/`, `@middleware/`, `@utils/`, `@ws/` — resolved by tsx at runtime, mapped in `jest.config.cjs` for tests. All imports use `.js` extension (ESM).
- **Auth**: JWT (access 15m + refresh 7d). Three roles: `USER`, `MANAGER`, `ADMIN`. 2FA via TOTP. Email verification tokens. Captcha support.
- **Testing**: Jest with `ts-jest/presets/default-esm`. Prisma is mocked via `jest.mock('@utils/prisma.js')`. When adding new Prisma models, **all test files that mock Prisma must include the new model** or tests will crash.
- **WebSocket**: `ws` library on same server. Events: `payment.result`, `order.status.updated`, `cart.updated`, `notification.new`.

### Frontend (`apps/frontend`)

- **Stack**: React 18 + Vite + TypeScript + Tailwind CSS + React Query + Zustand
- **Path aliases**: `@components/`, `@pages/`, `@hooks/`, `@store/`, `@api/`, `@appTypes/`, `@constants/`, `@utils/` — configured in both `tsconfig.json` and `vite.config.ts`.
- **i18n**: react-i18next with namespace-per-domain: `common`, `catalog`, `checkout`, `profile`, `admin`, `pages`, `about`. Locales at `src/locales/{en,ru}/`. **All user-visible text must use `t()` — no hardcoded English.**
- **State**: Zustand stores (`auth`, `cart`, `theme`, `compare`, `notifications`, `featureFlags`). React Query for server state.
- **API client**: `src/api/client.ts` — `apiFetch()` with auto-refresh on 401. `BASE_URL` is empty in Docker (nginx proxies `/api` to backend). **All API modules MUST use `apiFetch` — never localStorage mocks or setTimeout fakes.**
- **Design system**: CSS custom properties in `src/styles/globals.css`. Light/dark via `.dark` class.
- **Routing**: React Router v6 with `React.lazy` + `Suspense` on all routes. **Every page file must have a corresponding route in App.tsx.**

### Docker

- Backend runs via `tsx` (not compiled JS) — Dockerfile at `docker/backend.Dockerfile`
- Frontend built by Vite, served by nginx — `docker/frontend.Dockerfile`
- nginx proxies `/api`, `/images`, `/uploads`, `/ws` to backend — `docker/nginx.conf`
- **After schema changes**: stop backend container, run `prisma migrate deploy` locally, reseed, restart.

## Critical Rules (from bugs found)

### API Integration

- **Frontend API paths MUST match backend mount points exactly.** E.g., backend mounts on `/api/v1/addresses` → frontend must call `/api/v1/addresses`, NOT `/api/v1/profile/addresses`.
- **HTTP methods MUST match.** If backend uses `router.put()`, frontend must use `method: 'PUT'`, not `PATCH`.
- **Never use localStorage mocks in API modules.** All `src/api/*.ts` files must use `apiFetch()` to call real backend endpoints.
- **Verify every new endpoint** with a real HTTP request before considering it done.

### Component Reuse

- **Any UI pattern used more than once MUST be extracted** into a shared component. Examples: `StarRating`, `PriceDisplay`, `ProductImage`, `DateRangeFilter`, `EmptyState`, `CountdownTimer`, `StockUrgencyBadge`.
- **Shared components** go in `src/components/ui/` (generic) or `src/components/features/` (domain-specific).
- **Shared hooks**: `useAddToCart`, `useConfirmModal`, `useModalAccessibility`, `usePagination`, `useDebounce`, `useFeatureFlag`, `useProductLocale`.
- **Shared utils**: `src/utils/pricing.ts` for price calculations, `src/utils/validation.ts` for form validation (XSS/SQL injection checks).

### Admin Panel

- **ADMIN role** sees only admin panel — no catalog, cart, wishlist in navbar. Redirects to `/admin` on login. No "Back to Store" button.
- **MANAGER role** has limited access — `managerRestrictions` middleware blocks: users list, audit log, settings, product/promo/category create/delete.
- **Every admin route** that should be restricted must have `managerRestrictions` middleware.

### Forms & Validation

- **Unsaved changes detection**: track saved vs current state, show indicator + warning modal on tab switch + `beforeunload` event.
- **Name fields**: min 2, max 15 characters, Latin only (`/^[a-zA-Z\s\-']+$/`), no Cyrillic.
- **Date ranges**: From cannot be after To — use `DateRangeFilter` component with `max`/`min` attributes.
- **Card expiry**: cannot be in the past.

### Modals

- Single-action (info/close): use `cancelLabel=""` to hide cancel button.
- Dual-action (confirm/cancel): use both labels.
- Never render duplicate close buttons.

### i18n

- ALL user-visible text via `t()` with correct namespace prefix (`common:`, `catalog:`, etc.).
- Add keys to BOTH `en` and `ru` locale files.
- Cross-namespace: use `t('common:actions.cancel')` not `t('actions.cancel')` from non-common namespace.

### Cart

- **After `cartApi.add`, always invalidate `['cart']` query** — use the `useAddToCart` hook which handles this automatically.

### Validation

- **All forms must have client-side validation including XSS/SQL injection checks** — use `utils/validation.ts` for sanitization and pattern checks.

### Transitions

- **No page fade transitions** — causes flickering and breaks E2E tests. Removed in 2.0.0; do not re-add.

### Other

- **Commits**: no `Co-Authored-By` lines.
- **Every interactive UI element needs `data-testid`**.
- **Feature flags**: stored in `StoreSetting` with `ff_` prefix, toggled in admin.
- **Cart badge**: syncs from API on page load (Layout.tsx), not just in-memory.
- **Notification scheduler**: configurable in admin settings (interval, max, type).

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
