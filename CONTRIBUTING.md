# Contributing to PLANQ

## Development Setup

```bash
# Prerequisites: Node 22+, pnpm 10+, Docker

git clone git@github.com:DenisBurlacov/Planq.git
cd Planq
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
pnpm install
docker compose up -d
pnpm --filter @planq/backend db:migrate
pnpm --filter @planq/backend db:seed
pnpm dev
```

Frontend: `http://localhost:3000` | Backend: `http://localhost:4000` | API docs: `http://localhost:4000/api-docs`

---

## Branch Naming

| Prefix      | Use for                              | Example                       |
| ----------- | ------------------------------------ | ----------------------------- |
| `feature/`  | New features                         | `feature/admin-dashboard`     |
| `fix/`      | Bug fixes                            | `fix/cart-quantity-overflow`  |
| `docs/`     | Documentation only                   | `docs/update-locators`        |
| `refactor/` | Code restructuring (no new behavior) | `refactor/extract-api-client` |
| `test/`     | Adding or updating tests             | `test/e2e-checkout-flow`      |
| `chore/`    | Build, CI, tooling changes           | `chore/upgrade-playwright`    |

---

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Scope** (optional): `frontend`, `backend`, `types`, `devops`, `seed`, `ui`

**Examples:**

```
feat(frontend): add admin dashboard stat cards
fix(backend): prevent duplicate wishlist entries
docs: update LOCATORS.md with admin selectors
test(frontend): add e2e tests for checkout flow
chore(devops): add Docker health checks
```

---

## Pull Request Process

1. Create a branch from `develop` (not `main`).
2. Make your changes and ensure all checks pass locally (see below).
3. Push and open a PR targeting `develop`.
4. Fill in the PR description: what changed, why, and how to test.
5. Wait for CI to pass and request review.

---

## Code Style

- **ESLint + Prettier** are enforced via Husky pre-commit hooks.
- Run `pnpm lint` and `pnpm format:check` before committing.
- TypeScript strict mode is enabled. Run `pnpm typecheck` to verify.

---

## Testing

Run these before opening a PR:

```bash
pnpm lint                         # Linting
pnpm typecheck                    # Type checking
pnpm --filter @planq/backend test # Backend unit tests

# E2E tests (requires running backend + frontend)
cd apps/frontend && npx playwright test
```

---

## data-testid Conventions

Every interactive UI element must have a `data-testid` attribute. Follow these rules:

- Use **kebab-case**: `add-product-button`, `cart-item-remove`
- Dynamic suffixes use the item's **slug** or **id**: `product-card-{slug}`, `edit-product-{id}`
- Index-based suffixes are **0-based**: `accordion-item-{index}`
- Document all new `data-testid` values in [`docs/LOCATORS.md`](docs/LOCATORS.md)
- Group by page or component, following the existing table format

---

## Environment Variables

- Never commit `.env` files. Use `.env.example` as a template.
- When adding a new env var, update the relevant `.env.example` file(s): root, `apps/backend/.env.example`, and/or `apps/frontend/.env.example` with a comment explaining the variable.
