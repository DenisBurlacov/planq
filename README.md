# PLANQ

Furniture e-commerce platform — a testable web application for QA automation teams.

## Quick Start

```bash
# Clone and install
git clone git@github.com:DenisBurlacov/Planq.git
cd Planq
cp .env.example .env
pnpm install

# Start services
docker compose up

# Open
# Frontend: http://localhost:3000
# Backend:  http://localhost:4000
# API docs: http://localhost:4000/api-docs
```

## Tech Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS
- **Backend:** Express + Prisma + PostgreSQL + WebSocket
- **Quality:** ESLint + Prettier + Husky + TypeScript strict
- **Monitoring:** Grafana + Loki + Promtail
- **Infrastructure:** pnpm workspaces + Docker Compose

## Scripts

```bash
pnpm lint              # ESLint
pnpm typecheck         # TypeScript check
pnpm format:check      # Prettier check
pnpm format:fix        # Prettier fix
pnpm dev               # Dev servers
pnpm build             # Build all
pnpm test              # Run tests
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API](docs/API.md)
- [Contributing](docs/CONTRIBUTING.md)

---

## Быстрый старт (RU)

```bash
git clone git@github.com:DenisBurlacov/Planq.git
cd Planq
cp .env.example .env
pnpm install
docker compose up
```

Фронтенд: `http://localhost:3000` | Бэкенд: `http://localhost:4000`

## License

[MIT](LICENSE)
