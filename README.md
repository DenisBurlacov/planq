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

> New to the toolchain? This section walks you from **zero installed tools** to **PLANQ running in your browser**. If you're already comfortable with Node, pnpm, and Docker, jump straight to [Run PLANQ](#run-planq).

### Prerequisites

You need four tools installed before PLANQ can start:

- **Git** — downloads the source code from GitHub
- **Node.js 22+** — JavaScript runtime the app is built on
- **pnpm 10+** — package manager (faster alternative to npm, required because this repo is a pnpm workspace)
- **Docker Desktop** (Windows / macOS) or **Docker Engine + Compose plugin** (Linux) — runs PostgreSQL, the backend, and the frontend in containers so you don't have to install a database manually

Pick your OS below and run the commands. Each block is independent — you only need one.

<details>
<summary><strong>Windows 10 / 11</strong></summary>

The easiest way on Windows is [`winget`](https://learn.microsoft.com/en-us/windows/package-manager/winget/), Microsoft's built-in package manager. It ships with Windows 11 and with recent Windows 10 updates. Open **PowerShell** and run:

```powershell
winget install Git.Git
winget install OpenJS.NodeJS.LTS
winget install pnpm.pnpm
winget install Docker.DockerDesktop
```

After the Docker install finishes, **launch Docker Desktop once from the Start menu** and wait until the whale icon in the system tray says _"Docker Desktop is running"_. On first launch Docker Desktop will also install or enable **WSL 2** for you — just accept the prompts and reboot if asked.

**If `winget` is not available**, download each tool manually instead:

- Git: https://git-scm.com
- Node.js LTS: https://nodejs.org
- pnpm: https://pnpm.io/installation
- Docker Desktop: https://www.docker.com/products/docker-desktop

After installing, **close and reopen PowerShell** so the new tools are picked up on PATH.

</details>

<details>
<summary><strong>macOS (Intel or Apple Silicon)</strong></summary>

The standard package manager for macOS is **Homebrew** (`brew`) — one command installs developer tools, just like `apt` on Linux. If you don't have it yet, open **Terminal** and paste the one-line installer from https://brew.sh first.

Once `brew` is available, install everything PLANQ needs:

```bash
brew install git node pnpm
brew install --cask docker
```

**PATH note — important on Apple Silicon (M1 / M2 / M3):** Homebrew installs to `/opt/homebrew`, which isn't on PATH by default. At the end of the Homebrew installer you'll see a short "Next steps" block telling you exactly what to paste. It looks like this:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

Run those two lines once, open a new Terminal tab, and `git`, `node`, and `pnpm` will be available everywhere. **On Intel Macs you don't need to touch PATH** — Homebrew installs into `/usr/local/bin`, which is already on PATH, so everything works immediately after `brew install`.

Finally, open **Docker** from `/Applications` once and wait until the whale icon in the menu bar stops animating before moving on.

</details>

<details>
<summary><strong>Linux (Ubuntu / Debian, Fedora, Arch)</strong></summary>

**Ubuntu / Debian:**

```bash
sudo apt update
sudo apt install -y git curl
# Node.js 22 from NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pnpm
# Docker Engine + Compose plugin
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # log out and back in after this line
```

**Fedora:**

```bash
sudo dnf install -y git nodejs
sudo npm install -g pnpm
# Docker: follow https://docs.docker.com/engine/install/fedora/
sudo usermod -aG docker $USER
```

**Arch / Manjaro:**

```bash
sudo pacman -S --needed git nodejs npm docker docker-compose
sudo npm install -g pnpm
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

After `usermod`, **log out and log back in** (or reboot) so your shell picks up the new `docker` group — otherwise `docker` commands will fail with a permission error.

</details>

### Verify your installation

Before going further, run these five commands in a **fresh terminal** to confirm every tool is on PATH:

```bash
git --version          # git version 2.x
node --version         # v22.x or higher
pnpm --version         # 10.x or higher
docker --version       # Docker version 24.x or higher
docker compose version # Docker Compose version v2.x
```

If any command says `command not found`, the tool is missing from PATH. On **Windows**, close and reopen PowerShell. On **macOS / Linux**, open a new terminal tab. If it still fails, reinstall that specific tool.

### Run PLANQ

The steps are the same on every OS — only the `.env` copy command differs (`cp` vs `Copy-Item` vs `copy`). Commands below assume your terminal is somewhere you want the repo to live (for example, `~/Projects`).

**1. Download the code** — using HTTPS so you don't need a GitHub SSH key:

```bash
git clone https://github.com/DenisBurlacov/planq.git
cd planq
```

**2. Create the three environment files from the examples.** Pick the command that matches your shell:

```bash
# Linux / macOS / Git Bash on Windows
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

```powershell
# Windows PowerShell
Copy-Item .env.example .env
Copy-Item apps/backend/.env.example apps/backend/.env
Copy-Item apps/frontend/.env.example apps/frontend/.env
```

```cmd
:: Windows CMD
copy .env.example .env
copy apps\backend\.env.example apps\backend\.env
copy apps\frontend\.env.example apps\frontend\.env
```

> **Do you need to edit anything inside those `.env` files? No.** For the default Docker-based setup the values in all three example files are already wired to work together out of the box — Postgres credentials match, the `RESET_TOKEN` is the same in root and backend, the frontend points at `http://localhost:4000`, and the demo-account banner on the login page is enabled. The placeholder JWT secrets (`your_access_secret_min_32_chars_change_me`) are fine for local learning; only swap them if you ever deploy PLANQ publicly. If a test framework later needs a different `BASE_URL` or `RESET_TOKEN`, put that in the test project's own `.env` instead of touching PLANQ's.

**3. Install the JavaScript dependencies:**

```bash
pnpm install
```

**4. Start the database, backend, and frontend** — all three run inside Docker containers:

```bash
docker compose up
```

The first run downloads the Postgres image and builds the backend + frontend images — expect a few minutes on a fresh machine. **Leave this terminal open**; the containers keep running as long as it's alive, and you'll see their logs stream here.

**5. In a _second_ terminal**, seed the database with the 101 sample products, 10 categories, and test accounts:

```bash
pnpm --filter @planq/backend db:seed
```

**6. Open your browser:**

- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- API docs (Swagger): http://localhost:4000/api-docs

You should see the PLANQ home page with products. Log in with any [test account](#test-accounts) to try the full flow.

### Stop PLANQ when you're done

Newcomers often leave `docker compose up` running in a terminal and don't realize the containers keep consuming CPU, RAM, and laptop battery even after the terminal window is closed. Here's how to shut everything down cleanly.

**1. If the `docker compose up` terminal is still open** — press `Ctrl+C` once in that terminal. Compose will signal all containers and shut them down in a few seconds. This is the preferred way.

**2. If you already closed the terminal** (or you ran `docker compose up -d` in the background), go back to the repo folder and run:

```bash
docker compose down
```

This stops **and removes** the containers. Your database data survives because it lives in a named Docker volume — the next `docker compose up` picks up exactly where you left off, with all your products, orders, and users intact.

**3. Check that nothing is left running:**

```bash
docker ps
```

An empty list means you're clean. If you still see `planq-*` containers, run `docker compose down` once more from inside the repo folder.

**4. Fully quit Docker Desktop (macOS / Windows):** after stopping the containers, you can also right-click the whale icon in the system tray / menu bar and choose **Quit Docker Desktop**. This frees the 2–4 GB of RAM the Docker VM reserves even when idle. On Linux with Docker Engine there's no desktop app to quit — stopping the containers is enough.

> **⚠️ Do not use these unless you actually want to wipe everything:**
>
> - `docker compose down -v` — also deletes the Postgres volume, which **erases all seeded data**. You'd have to re-run `pnpm --filter @planq/backend db:seed` after your next start.
> - `docker system prune -a` — removes unused images and containers across your **whole machine**, not just PLANQ.

### Troubleshooting

- **`port is already allocated` / `address already in use`** — another app on your machine is already using 3000, 4000, or 5432. Either stop that app, or change the host-side port in `docker-compose.yml`.
- **`Cannot connect to the Docker daemon`** — Docker Desktop isn't running. Open it and wait for the whale icon to go steady before retrying.
- **`pnpm: command not found` right after installing it** — close and reopen your terminal so PATH refreshes. If it still fails on Linux, enable Corepack instead: `corepack enable && corepack prepare pnpm@latest --activate`.
- **`permission denied while trying to connect to the Docker daemon` on Linux** — your user isn't in the `docker` group yet. Run `sudo usermod -aG docker $USER`, then **log out and back in** (group changes only apply to new sessions).
- **`git clone` fails with `Permission denied (publickey)`** — you're using the SSH URL without a GitHub SSH key set up. Use the HTTPS URL shown above (`https://github.com/DenisBurlacov/planq.git`).
- **`db:seed` fails with `database does not exist` or `connection refused`** — Postgres inside Docker hasn't finished starting yet. Wait until the `docker compose up` logs show `ready on :4000` from the backend container, then rerun the seed command.

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
