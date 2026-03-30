# PLANQ

> Furniture e-commerce platform built as a **practice target for QA automation teams**.

PLANQ is a full-stack web application with a realistic e-commerce flow: product catalog, cart, checkout, orders, wishlist, profile, and monitoring. Every interactive element carries a `data-testid` so automation engineers can write stable selectors from day one.

---

## Features

| Area                | What's included                                                                    |
| ------------------- | ---------------------------------------------------------------------------------- |
| **Catalog**         | 62 products · 10 categories · search · sort · filters (category, sale, stock)      |
| **Product page**    | Photo gallery · accordion (specs / description / delivery / care) · reviews        |
| **Cart & Checkout** | Add/remove/quantity · promo codes · card & wallet payment · WebSocket confirmation |
| **User account**    | Register · login · profile tabs · wallet top-up · order history                    |
| **Wishlist**        | Add/remove · persisted per user                                                    |
| **Monitoring**      | Grafana + Loki + Promtail — optional Docker Compose profile                        |
| **i18n**            | English / Russian toggle                                                           |
| **Dark mode**       | Full light/dark theme                                                              |

---

## Quick Start

```bash
# 1. Clone & install
git clone git@github.com:DenisBurlacov/Planq.git
cd Planq
cp apps/backend/.env.example apps/backend/.env
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
# Grafana: http://localhost:3001  (admin / admin)
```

---

## Test Accounts

| Role         | Email                 | Password     |
| ------------ | --------------------- | ------------ |
| Regular user | `alice@example.com`   | `Password1!` |
| Regular user | `bob@example.com`     | `Password1!` |
| Admin        | `admin@planq.com`     | `Password1!` |
| Blocked user | `blocked@example.com` | `Password1!` |

Promo codes: `SAVE10` · `WELCOME20` · `FLASH30`

---

## Tech Stack

| Layer          | Technology                                                                          |
| -------------- | ----------------------------------------------------------------------------------- |
| Frontend       | React 18 · Vite · TypeScript · Tailwind CSS · React Query · Zustand · react-i18next |
| Backend        | Node.js · Express · Prisma ORM · PostgreSQL · WebSocket (ws) · JWT                  |
| Quality        | ESLint · Prettier · Husky · lint-staged · TypeScript strict                         |
| Monitoring     | Grafana · Loki · Promtail                                                           |
| Infrastructure | pnpm workspaces · Docker Compose · GitHub Actions CI/CD · GHCR                      |

---

## Project Structure

```
Planq/
├── apps/
│   ├── frontend/          # React SPA (Vite)
│   └── backend/           # Express API + Prisma
├── docker/
│   ├── monitoring/        # Grafana + Loki + Promtail configs
│   ├── backend.Dockerfile
│   └── frontend.Dockerfile
├── docs/
│   ├── ARCHITECTURE.md    # System design & decisions
│   ├── LOCATORS.md        # All data-testid selectors reference
│   └── prompts/           # AI team prompts
├── docker-compose.yml
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
pnpm --filter @planq/backend test # Backend unit tests
pnpm --filter @planq/backend db:seed   # Seed database
pnpm --filter @planq/backend db:reset  # Reset + re-seed database
```

---

## QA Automation Guide

PLANQ is designed to be automation-friendly:

- All interactive elements have `data-testid` attributes — see **[docs/LOCATORS.md](docs/LOCATORS.md)**
- Stable REST API at `http://localhost:4000/api-docs` (Swagger)
- Deterministic seed data (same IDs on every `db:seed`)
- Test accounts with known credentials (see table above)
- WebSocket events for real-time order status testing

---

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [QA Locators Reference](docs/LOCATORS.md)

---

## Быстрый старт (RU)

```bash
git clone git@github.com:DenisBurlacov/Planq.git
cd Planq
cp apps/backend/.env.example apps/backend/.env
pnpm install
docker compose up
pnpm --filter @planq/backend db:seed
```

Фронтенд: `http://localhost:3000` | Бэкенд: `http://localhost:4000` | API docs: `http://localhost:4000/api-docs`

---

## License

[MIT](LICENSE)
