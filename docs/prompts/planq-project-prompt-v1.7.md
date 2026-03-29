---

## dataviewjs: false

# PLANQ — промт для Claude Code v1.7 (финальный)

## [[#Инструкция для Claude Code|Инструкция для Claude Code]]

## [[#Текущее состояние|Текущее состояние]]

## [[#Настройка окружения|Настройка окружения]]

## [[#Команда и роли|Команда и роли]]

## [[#Инструкции для каждой роли|Инструкции для каждой роли]]

## [[#Концепция проекта|Концепция проекта]]

## [[#Бизнес модель|Бизнес модель]]

## [[#Архитектура репозиториев|Архитектура репозиториев]]

## [[#Структура монорепо|Структура монорепо]]

## [[#Структура planq-tests-js|Структура planq-tests-js]]

## [[#Переменные окружения|Переменные окружения]]

## [[#Git стандарты|Git стандарты]]

## [[#Качество кода|Качество кода]]

## [[#Дизайн система|Дизайн система]]

## [[#Страницы и навигация|Страницы и навигация]]

## [[#Стратегия локаторов|Стратегия локаторов]]

## [[#UI элементы|UI элементы]]

## [[#Флоу пользователя|Флоу пользователя]]

## [[#Тестовые аккаунты|Тестовые аккаунты]]

## [[#Оплата|Оплата]]

## [[#Акции|Акции]]

## [[#Интернационализация|Интернационализация]]

## [[#Async и real-time|Async и real-time]]

## [[#Технический стек|Технический стек]]

## [[#База данных|База данных]]

## [[#API контракт|API контракт]]

## [[#Безопасность|Безопасность]]

## [[#Мониторинг и логирование|Мониторинг и логирование]]

## [[#Accessibility|Accessibility]]

## [[#Пирамида тестирования|Пирамида тестирования]]

## [[#Требования к тестируемости|Требования к тестируемости]]

## [[#CI/CD флоу|CI/CD флоу]]

## [[#Документация|Документация]]

## [[#План разработки|План разработки]]

## [[#Ретроспективы по этапам|Ретроспективы по этапам]]

## [[#Открытые вопросы|Открытые вопросы]]

---

## Инструкция для Claude Code

Это живой документ. Claude Code читает его в начале каждой сессии и обновляет в конце.

### В начале каждой сессии

1. прочитай этот файл полностью
2. проверь раздел "Текущее состояние" — с чего продолжаем
3. проверь "Принятые решения" — что уже изменилось
4. проверь "Настройка окружения" — какие инструменты доступны
5. продолжай с того места где остановились

### В конце каждого этапа

Заполни ретроспективу этапа в разделе "Ретроспективы по этапам" — пока детали свежи:

- что сработало отлично
- что создало проблемы
- что сделали бы иначе
- что добавить в универсальный промт

### В конце каждой сессии

Обнови раздел "Текущее состояние":

- отметь завершённые подзадачи
- зафиксируй что предстоит следующим
- запиши архитектурные решения принятые в ходе работы
- запиши баги и правки
- запиши отклонения от оригинального промта

### Правила обновления промта

- архитектурное решение отличное от промта → обнови соответствующий раздел
- изменился дизайн → обнови "Дизайн система"
- добавился endpoint → обнови "API контракт"
- изменилась структура → обнови "Структура монорепо"
- CHANGELOG.md обновляется при каждом значимом изменении

### Язык в коде и документации

```
Code, comments, variable names    → English only
Commit messages                   → English only
PR titles and descriptions        → English only
docs/ files                       → English only
README.md                         → English + краткий Russian "Быстрый старт" блок
This prompt file                  → Russian (общение заказчика с командой)
```

**Примеры:**

```typescript
// ✓ CORRECT
// Calculate total price with discount applied
const totalWithDiscount = applyPromoCode(cart.total, promoCode)

// ✗ WRONG
// Подсчитываем итоговую цену со скидкой
const totalWithDiscount = applyPromoCode(cart.total, promoCode)
```

```bash
# ✓ CORRECT
git commit -m "feat(cart): add promo code validation"

# ✗ WRONG
git commit -m "feat(cart): добавить валидацию промокода"
```

### Правила работы с кодом

- каждый коммит следует Conventional Commits
- перед каждым коммитом: `pnpm lint && pnpm typecheck`
- husky запускает lint-staged автоматически — не обходить
- новый endpoint → сразу обновить Swagger
- новый компонент → сразу data-testid если страница требует
- новый текст в UI → сразу в оба локаля (en + ru)
- новый сервис на бэкенде → сразу юнит тест
- никогда не коммитить `.env` файлы

### Workflow для каждого этапа

```
Старт этапа N:
1. git checkout develop
2. git pull origin develop
3. git checkout -b feature/stage-N-название

Работа:
4. пишем код
5. pnpm lint && pnpm typecheck   ← перед каждым коммитом
6. git add -p                    ← атомарные коммиты
7. git commit -m "feat(scope): описание"
8. повторяем 4-7

Завершение этапа:
9. git push origin feature/stage-N-название
10. создать PR в develop (через gh или вручную)
11. обновить "Текущее состояние" в этом файле
```

### Работа с GitHub

**Если gh CLI доступен (предпочтительно):**

```bash
gh pr create \
  --base develop \
  --title "feat: Stage N — название этапа" \
  --body "## Что сделано\n- ...\n## Как проверить\n- ..."
```

**Если gh CLI недоступен (fallback):**

```bash
git push origin feature/stage-N-название
# затем создать PR вручную на github.com
```

### Анализ UI через инструменты

**Claude in Chrome (визуальный анализ):**

- открыть `localhost:3000` в Chrome
- активировать расширение Claude in Chrome
- попросить Claude проверить дизайн, верстку, accessibility
- использовать для дизайн ревью после Этапа 5

**Playwright MCP (интерактивный анализ):**

- если настроен Playwright MCP в Claude Desktop
- Claude может кликать, заполнять формы, проверять элементы
- использовать для проверки флоу и тестируемости

---

## Текущее состояние

**Версия промта:** v1.7 **Текущий этап:** не начат **Последняя сессия:** — **Система:** не определена (Ubuntu / CachyOS / macOS) **gh CLI:** не установлен **GitHub репо:** не создан **URL репо:** —

### Прогресс по этапам

**planq-app:**

- [ ] Этап 1 — Инфраструктура
- [ ] Этап 2 — База данных
- [ ] Этап 3 — Бэкенд + тесты
- [ ] Этап 4 — WebSocket
- [ ] Этап 5 — Фронтенд
- [ ] Этап 6 — Мониторинг
- [ ] Этап 7 — Интеграция
- [ ] Этап 8 — CI/CD
- [ ] Этап 9 — Документация

**planq-tests-js:**

- [ ] Этап 10 — E2E + API тесты

### Ветки

|Этап|Ветка|Статус|
|---|---|---|
|1|`feature/stage-1-infrastructure`|не создана|
|2|`feature/stage-2-database`|не создана|
|3|`feature/stage-3-backend`|не создана|
|4|`feature/stage-4-websocket`|не создана|
|5|`feature/stage-5-frontend`|не создана|
|6|`feature/stage-6-monitoring`|не создана|
|7|`feature/stage-7-integration`|не создана|
|8|`feature/stage-8-cicd`|не создана|
|9|`feature/stage-9-docs`|не создана|
|10|`feature/stage-10-tests-js`|не создана|

### Принятые решения (сверх промта)

пусто

### Известные баги и технический долг

пусто

### Отклонения от оригинального дизайна

пусто

---

## Настройка окружения

Поддерживаемые системы: **Ubuntu**, **CachyOS (Arch)**, **macOS**.

### Проверка инструментов в начале сессии

Claude Code проверяет доступность инструментов и обновляет раздел "Текущее состояние":

```bash
node --version      # должно быть 20.x
pnpm --version      # должно быть 8.x+
docker --version
docker compose version
git --version
gh --version        # опционально
```

### Установка gh CLI

**Ubuntu:**

```bash
sudo apt update
sudo apt install gh
gh auth login
```

**CachyOS / Arch:**

```bash
yay -S github-cli
# или
paru -S github-cli
gh auth login
```

**macOS:**

```bash
brew install gh
gh auth login
```

**После установки:**

```bash
gh auth status          # проверить авторизацию
gh repo list            # проверить доступ к репозиториям
```

### Установка Node.js

**Рекомендуемый способ — Volta (все системы, современный стандарт):**

Volta автоматически переключает версию Node.js когда входишь в папку проекта — читает `.nvmrc`. Работает одинаково на Ubuntu, CachyOS и macOS.

```bash
# Ubuntu / macOS
curl https://get.volta.sh | bash
# перезапустить терминал
volta install node@20
volta install pnpm
```

```bash
# CachyOS / Arch
yay -S volta
# или
paru -S volta
volta install node@20
volta install pnpm
```

**Альтернативы если Volta не подходит:**

```bash
# CachyOS / Arch — через системный пакетный менеджер
yay -S nodejs-lts-iron   # Node 20 LTS
yay -S pnpm

# macOS — через Homebrew
brew install node@20
brew install pnpm

# Ubuntu — через NodeSource репо
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs
npm install -g pnpm
```

**Проверка:**

```bash
node --version   # v20.x.x
pnpm --version   # 8.x.x+
```

### Установка pnpm

```bash
# если используешь Volta — уже установлен выше
volta install pnpm

# если без Volta
npm install -g pnpm
# или через corepack
corepack enable && corepack prepare pnpm@latest --activate
```

### Создание GitHub репозитория

**Через gh CLI (предпочтительно):**

```bash
gh repo create planq-app --private --clone
gh repo create planq-tests-js --private --clone
```

**Вручную (fallback):**

1. создать репо на github.com
2. `git remote add origin https://github.com/[username]/planq-app.git`
3. зафиксировать URL в "Текущее состояние"

### Настройка Chrome расширения (опционально)

**Claude in Chrome:**

1. установить расширение из Chrome Web Store (поиск "Claude for Chrome" или "Claude in Chrome" от Anthropic)
2. авторизоваться через аккаунт Anthropic
3. открыть `localhost:3000`
4. активировать расширение для анализа UI

**Playwright MCP (если настроен в Claude Desktop):**

- доступен автоматически если настроен в `~/.config/claude/claude_desktop_config.json`
- позволяет Claude кликать и взаимодействовать с приложением

---

## Команда и роли

|Роль|Кто|Зона ответственности|
|---|---|---|
|Заказчик|Денис|формулирует требования, принимает решения, ставит задачи|
|Architect|Claude (7+ лет)|системный дизайн, структура, стандарты, масштабируемость|
|Backend Senior|Claude (7+ лет)|Express, Prisma, PostgreSQL, API, auth, WebSocket, тесты|
|Frontend Senior|Claude (7+ лет)|React, Vite, компоненты, стейт, темы, i18n, async UI|
|Designer Senior|Claude (7+ лет)|UI/UX, дизайн система, палитра, типографика, логотип|
|QA Senior|Claude (7+ лет)|E2E тесты, API тесты, POM, fixtures, helpers, тестируемость|
|Tech Writer|Claude (7+ лет)|документация, README, guides, CHANGELOG, аудит доков|

---

## Инструкции для каждой роли

**Язык:** весь код, комментарии, commit messages — только English. Без исключений.

### Architect

**Workflow:**

```bash
# старт этапа
git checkout develop && git pull
git checkout -b feature/stage-N-название

# работа — только инфраструктурные файлы
# конфиги, docker, eslint, структура папок

# коммит
pnpm lint && pnpm typecheck
git add -p
git commit -m "chore(infra): описание"

# завершение
git push origin feature/stage-N-название
gh pr create --base develop --title "chore: Stage N — Infrastructure"
```

**Правила:**

- закладывает стандарты с первого дня
- любое архитектурное решение аргументирует и документирует в промте
- следит за масштабируемостью
- проверяет что все роли следуют стандартам

### Backend Senior

**Workflow:**

```bash
git checkout develop && git pull
git checkout -b feature/stage-3-backend

# для каждого нового сервиса:
# 1. написать сервис
# 2. написать юнит тест
# 3. запустить тест локально
pnpm --filter backend test:unit

# для каждого нового endpoint:
# 1. написать роут + контроллер
# 2. обновить Swagger
# 3. написать интеграционный тест
pnpm --filter backend test:integration

# проверка coverage
pnpm --filter backend test:coverage
# coverage должен быть 70%+

# коммит
pnpm lint && pnpm typecheck
git add -p
git commit -m "feat(auth): add JWT refresh token rotation"
git commit -m "test(auth): add unit tests for auth service"

git push origin feature/stage-3-backend
gh pr create --base develop --title "feat: Stage 3 — Backend + Tests"
```

**Правила:**

- каждый новый сервис → сразу юнит тест
- каждый новый endpoint → сразу Swagger + интеграционный тест
- coverage не опускается ниже 70%
- все ошибки — единый формат с error code и requestId
- Winston логирование на каждое значимое событие
- Zod валидация независимо от фронта

**Запуск тестов:**

```bash
pnpm --filter backend test:unit        # юнит тесты
pnpm --filter backend test:integration # интеграционные
pnpm --filter backend test:coverage    # с coverage отчётом
pnpm --filter backend test:watch       # watch режим при разработке
```

### Frontend Senior

**Workflow:**

```bash
git checkout develop && git pull
git checkout -b feature/stage-5-frontend

# для каждого нового компонента:
# 1. создать компонент
# 2. добавить data-testid если страница требует
# 3. добавить тексты в оба локаля
# 4. проверить в светлой и тёмной теме
# 5. проверить на мобильном viewport

# проверка в браузере (если Claude in Chrome доступен):
# открыть localhost:3000
# активировать Claude in Chrome
# попросить проверить дизайн и accessibility

# коммит
pnpm lint && pnpm typecheck
git add -p
git commit -m "feat(catalog): add product card component"

git push origin feature/stage-5-frontend
gh pr create --base develop --title "feat: Stage 5 — Frontend"
```

**Правила:**

- все новые тексты сразу в оба локаля en + ru
- все async данные — skeleton loader + error state
- кнопки отправки форм — loading state
- path aliases везде, никаких `../../../`
- проверка в обеих темах перед коммитом

### Designer Senior

**Workflow:**

- все решения по дизайну документируются в промте
- отклонения от дизайн системы требуют аргументации
- новые компоненты следуют палитре и spacing системе
- contrast ratio проверяется для каждого нового цвета
- после Этапа 5 — дизайн ревью через Claude in Chrome

**Визуальный анализ через Claude in Chrome:**

```
1. запустить приложение: docker compose up
2. открыть localhost:3000 в Chrome
3. активировать расширение
4. проверить: отступы, цвета, типографика, responsive
5. зафиксировать правки в "Отклонения от дизайна"
```

### QA Senior

**Workflow (planq-tests-js):**

```bash
git checkout -b feature/stage-10-tests-js

# перед написанием тестов:
# убедиться что приложение запущено
docker compose up -d
curl http://localhost:4000/health

# сброс данных перед сессией тестирования
curl -X POST http://localhost:4000/api/test/reset \
  -H "X-Reset-Token: $RESET_TOKEN"

# запуск тестов локально
pnpm test                          # все тесты
pnpm test:e2e                      # только E2E
pnpm test:api                      # только API
pnpm test --grep "login"           # конкретный тест

# дебаг упавшего теста через Grafana:
# открыть localhost:3100
# найти логи по времени падения или requestId

# коммит
pnpm lint && pnpm typecheck
git add -p
git commit -m "test(checkout): add card payment E2E tests"

git push origin feature/stage-10-tests-js
gh pr create --base main --title "test: Stage 10 — E2E + API tests"
```

**Принципы:**

- тест независим — не зависит от порядка запуска
- тест атомарен — проверяет одну вещь
- данные создаются через API helper когда UI не цель теста
- негативные сценарии обязательны
- имена тестов: `should show error when promo code is expired`
- перед каждым spec файлом: `beforeEach(() => apiHelper.resetDb())`

### Tech Writer

**Workflow:**

```bash
git checkout develop && git pull
git checkout -b docs/название-изменений

# обновить нужные файлы в docs/
# обновить CHANGELOG.md

git add -p
git commit -m "docs(api): update Swagger examples for wallet"

git push origin docs/название-изменений
gh pr create --base develop --title "docs: update API documentation"
```

**Правила:**

- документация обновляется синхронно с кодом
- новый endpoint → `docs/API.md`
- архитектурное решение → `docs/ARCHITECTURE.md`
- изменение локаторов → `docs/LOCATORS.md`
- CHANGELOG.md при каждом значимом PR

---

## Концепция проекта

**PLANQ** — мебельный интернет-магазин в стиле IKEA. Полноценное веб-приложение — тестируемый объект для трёх команд автоматизации (JS/TS, Python, Java).

**Принцип:** приближено к боевому проекту, лучшие технические решения, без фанатизма — с поправкой на учебный контекст.

**Визуал:** среднее между Jira и Notion — скандинавская эстетика, тёплые постельные тона, чистые отступы, карточки с округлыми углами, цветные бейджи, большие качественные фото.

**Темы:** светлая (тёплые постельные тона с градиентом) и тёмная (Nordic dark) с переключателем.

**Языки:** английский (по умолчанию) и русский, переключатель в navbar.

**Домен локально:** `localhost:3000` (frontend), `localhost:4000` (backend), `localhost:3100` (Grafana)

---

## Бизнес модель

**Каталог** — товары с категориями, фильтрами, вариантами, галереями, рейтингами, отзывами.

**Корзина** — добавление, количество (Optimistic UI), промокоды, синхронизация вкладок (WebSocket).

**Checkout** — многошаговый: адрес → доставка → оплата → подтверждение. Результат через WebSocket.

**Оплата** — карта (тестовые карты) и внутренний wallet.

**Заказы** — история, live статус через WebSocket.

**Профиль** — кабинет, wallet, wishlist (Optimistic UI).

**Акции** — промокоды, SALE, баннер с countdown (polling).

---

## Архитектура репозиториев

```
planq-app              ← приложение + бэкенд тесты
planq-tests-js         ← E2E + API тесты (Playwright)
planq-tests-python     ← Python + Selenium/Playwright
planq-tests-java       ← Java + Playwright/Selenium
```

**Локальный флоу:**

1. `gh repo clone [org]/planq-app` или `git clone [url]`
2. скопировать `.env.example` → `.env`
3. `pnpm install`
4. `docker compose up`
5. опционально: `docker compose --profile monitoring up`

---

## Структура монорепо

```
planq-app/
├── apps/
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── store/
│   │   │   ├── api/
│   │   │   ├── ws/
│   │   │   ├── locales/
│   │   │   │   ├── en/
│   │   │   │   └── ru/
│   │   │   ├── types/
│   │   │   └── styles/
│   │   ├── .env.example
│   │   └── vite.config.ts
│   └── backend/
│       ├── src/
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── middleware/
│       │   ├── services/
│       │   ├── ws/
│       │   └── utils/
│       ├── tests/
│       │   ├── unit/services/
│       │   ├── integration/
│       │   └── helpers/
│       │       ├── test-db.ts
│       │       └── factories.ts
│       ├── prisma/
│       └── .env.example
├── packages/types/
├── docker/
│   ├── frontend.Dockerfile
│   ├── backend.Dockerfile
│   └── monitoring/
│       ├── grafana/
│       ├── loki/
│       └── promtail/
├── docs/
├── .editorconfig
├── .env.example
├── .eslintrc.json
├── .gitignore
├── .husky/pre-commit
├── .lintstagedrc
├── .nvmrc
├── .prettierrc
├── pnpm-workspace.yaml
├── docker-compose.yml
├── docker-compose.test.yml
├── docker-compose.override.yml
├── CHANGELOG.md
├── LICENSE
├── README.md
└── SECURITY.md
```

---

## Структура planq-tests-js

```
planq-tests-js/
├── tests/
│   ├── e2e/
│   │   ├── auth/
│   │   │   ├── login.spec.ts
│   │   │   ├── register.spec.ts
│   │   │   └── forgot-password.spec.ts
│   │   ├── catalog/
│   │   │   ├── browse.spec.ts
│   │   │   ├── filters.spec.ts
│   │   │   └── product-page.spec.ts
│   │   ├── cart/
│   │   │   ├── add-to-cart.spec.ts
│   │   │   └── promo-code.spec.ts
│   │   ├── checkout/
│   │   │   ├── card-payment.spec.ts
│   │   │   ├── wallet-payment.spec.ts
│   │   │   └── failed-payment.spec.ts
│   │   ├── orders/orders.spec.ts
│   │   ├── profile/
│   │   │   ├── settings.spec.ts
│   │   │   └── wallet.spec.ts
│   │   └── wishlist/wishlist.spec.ts
│   └── api/
│       ├── auth.api.spec.ts
│       ├── products.api.spec.ts
│       ├── cart.api.spec.ts
│       ├── orders.api.spec.ts
│       ├── checkout.api.spec.ts
│       └── wishlist.api.spec.ts
├── pages/
│   ├── base.page.ts
│   ├── login.page.ts
│   ├── catalog.page.ts
│   ├── product.page.ts
│   ├── cart.page.ts
│   ├── checkout.page.ts
│   ├── orders.page.ts
│   ├── profile.page.ts
│   └── wishlist.page.ts
├── fixtures/
│   ├── auth.fixture.ts
│   └── db.fixture.ts
├── helpers/
│   ├── api.helper.ts
│   └── db.helper.ts
├── .env.example
├── playwright.config.ts
├── package.json
└── README.md
```

---

## Переменные окружения

### Корневой `.env.example`

```bash
# PostgreSQL
POSTGRES_USER=planq
POSTGRES_PASSWORD=planq_secret
POSTGRES_DB=planq_db
POSTGRES_PORT=5432

# Grafana (optional, only for --profile monitoring)
GRAFANA_PORT=3100
GRAFANA_ADMIN_PASSWORD=admin

# Reset endpoint secret token — used in tests: POST /api/test/reset
RESET_TOKEN=super_secret_reset_token_change_in_production
```

### `apps/backend/.env.example`

```bash
# Server
PORT=4000
NODE_ENV=development   # development | test | production

# Database (must match root .env)
DATABASE_URL=postgresql://planq:planq_secret@localhost:5432/planq_db

# JWT
JWT_ACCESS_SECRET=your_access_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS — frontend origin
CORS_ORIGIN=http://localhost:3000

# Reset token (must match root .env)
RESET_TOKEN=super_secret_reset_token_change_in_production

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000   # 15 minutes in milliseconds
RATE_LIMIT_MAX_REQUESTS=5     # max login attempts before lockout
```

### `apps/frontend/.env.example`

```bash
# API endpoints
VITE_API_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:4000/ws

# Show demo accounts block on /login page
# true  — local development and testing
# false — production
VITE_SHOW_TEST_CREDENTIALS=true

# Show DEV/TEST environment badge in corner
VITE_SHOW_ENV_BADGE=true

# Default language
VITE_DEFAULT_LOCALE=en   # en | ru
```

### `planq-tests-js/.env.example`

```bash
# Application URLs
BASE_URL=http://localhost:3000
API_URL=http://localhost:4000

# Test accounts
TEST_USER_EMAIL=user@planq.dev
TEST_USER_PASSWORD=Test1234!
TEST_NEW_USER_EMAIL=new@planq.dev
TEST_NEW_USER_PASSWORD=Test1234!
TEST_RICH_USER_EMAIL=rich@planq.dev
TEST_RICH_USER_PASSWORD=Test1234!

# Reset token (must match planq-app .env)
RESET_TOKEN=super_secret_reset_token_change_in_production

# Playwright settings
HEADLESS=true   # set false for local debugging
```

---

## Git стандарты

### .gitignore

```
node_modules/
.pnpm-store/
.env
.env.local
.env.*.local
dist/
build/
apps/backend/src/generated/
logs/
*.log
docker/volumes/
playwright-report/
test-results/
coverage/
.DS_Store
Thumbs.db
desktop.ini
.vscode/
.idea/
*.swp
*.tsbuildinfo
```

### Git flow

```
main        ← стабильная, защищённая, только через PR
develop     ← база для feature веток
feature/stage-N-название
fix/описание
chore/описание
docs/описание
```

### Conventional Commits

|Тип|Когда|
|---|---|
|`feat`|новая функциональность|
|`fix`|исправление бага|
|`test`|тесты|
|`chore`|конфиги, зависимости|
|`docs`|документация|
|`style`|форматирование|
|`refactor`|рефакторинг|
|`perf`|производительность|

---

## Качество кода

**ESLint** — TypeScript strict, React hooks, import порядок, запрет `console.log`, запрет `any`.

**Prettier** — semi: true, singleQuote: true, tabWidth: 2, printWidth: 100, trailingComma: es5.

**TypeScript** — strict: true везде. Path aliases: `@components/`, `@pages/`, `@hooks/`, `@store/`, `@api/`, `@types/`, `@locales/`.

**Husky + lint-staged** — pre-commit: ESLint + Prettier на изменённых файлах. Не обходить.

**EditorConfig** — indent 2 пробела, LF, UTF-8.

**.nvmrc** — Node 20.11.0. Работает с Volta, nvm и другими менеджерами версий.

**pnpm скрипты из корня:**

```bash
pnpm lint              # ESLint весь монорепо
pnpm typecheck         # TypeScript проверка
pnpm format:check      # Prettier проверка
pnpm format:fix        # Prettier исправление
pnpm test              # все тесты
pnpm --filter backend test:unit
pnpm --filter backend test:integration
pnpm --filter backend test:coverage
```

---

## Дизайн система

**Логотип:** иконка — схема комнаты сверху. `#2D6A4F` светлая, `#52B788` тёмная.

**Шрифт:** Inter. H1 32px / H2 24px / H3 20px / body 16px / caption 14px / label 12px.

**Светлая тема:**

|Токен|Значение|
|---|---|
|`--bg-page`|градиент `#F5F0EB → #EDE8E3`|
|`--bg-card`|`#FDFAF7`|
|`--bg-sidebar`|`#EDE8E3`|
|`--accent`|`#2D6A4F`|
|`--accent-hover`|`#245A42`|
|`--text-primary`|`#1C1917`|
|`--text-secondary`|`#78716C`|
|`--border`|`#E7E0D8`|

**Тёмная тема — Nordic dark:**

|Токен|Значение|
|---|---|
|`--bg-page`|`#1C1F1E`|
|`--bg-card`|`#242827`|
|`--bg-sidebar`|`#1A1D1C`|
|`--accent`|`#52B788`|
|`--accent-hover`|`#3DA374`|
|`--text-primary`|`#EDE8E3`|
|`--text-secondary`|`#9C9690`|
|`--border`|`#2E3330`|

**Статусы:** success `#40916C` / warning `#E9C46A` / error `#E63946` / info `#457B9D`

**Spacing:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px.

**Border radius:** карточки 12px / кнопки 8px / badges 4px / модалки 16px / аватар 50%.

**Кнопки:** Primary / Secondary / Ghost / Danger. Все с loading state.

**Спецэлементы:** environment индикатор, 404/500, error boundary, offline баннер, print стили, favicon, Open Graph.

---

## Страницы и навигация

**Auth:** `/login` (+ demo accounts) / `/register` / `/forgot-password`

**Публичные:** `/` / `/catalog` / `/catalog/:id` / `/wishlist`

**Приватные:** `/cart` / `/checkout` / `/checkout/processing` / `/checkout/success` / `/checkout/failed` / `/orders` / `/orders/:id` / `/profile` / `/profile/wallet`

**Системные:** `/404` / `/500`

---

## Стратегия локаторов

**Полное `data-testid`:** `/login`, `/checkout`

**Смешанный:** `/register`, `/profile`

**Только селекторы:** `/catalog`, `/catalog/:id`, `/cart`, `/orders`, `/wishlist`, `/`

|Тип|Где|Что отрабатывает|
|---|---|---|
|`data-testid`|login, checkout|базовый надёжный подход|
|`getByRole`|кнопки, навигация|ARIA семантика|
|`getByLabel`|формы без testid|accessibility|
|CSS селекторы|catalog, cart, orders|реальная жизнь|
|`nth-child` / вложенные|таблицы, списки|сложные структуры|

---

## UI элементы

**Формы:** text, password, email, number, textarea, date picker, time picker, range slider, file upload, rich text editor, маска карты

**Выборы:** single/multi select, searchable dropdown, autocomplete, radio, checkboxes, toggle

**Таблицы:** статическая, динамическая (сортировка + фильтры + пагинация), с чекбоксами, inline editing, expandable rows

**Оверлеи:** модалки (confirm/form/info), попапы, тултипы, drawer, toast (success/error/warning/info)

**Навигация:** navbar с dropdown, sidebar с collapse, breadcrumbs, tabs, stepper, pagination

**Async:** WebSocket processing, live статус, Optimistic UI, polling индикатор, countdown

**Прочее:** drag and drop, progress bar, skeleton loader, empty/error state, badges, аватар с upload, галерея с зумом, SALE бейджи, onboarding tooltip chain, offline баннер

---

## Флоу пользователя

```
Регистрация / логин
→ Onboarding тур (только новый пользователь)
→ Главная (баннер + countdown polling)
→ Каталог (фильтры)
→ Страница товара (галерея, варианты, polling наличия, wishlist Optimistic UI)
→ Корзина (количество Optimistic UI, промокод, WebSocket синхр. вкладок)
→ Checkout:
    Шаг 1 → Адрес
    Шаг 2 → Доставка
    Шаг 3 → Оплата (карта / wallet)
    Шаг 4 → Подтверждение
→ /checkout/processing (WebSocket, анимация)
→ Success / Failed
→ /orders/:id (live статус WebSocket)
→ Профиль (настройки, wallet, транзакции)
```

---

## Тестовые аккаунты

|Email|Пароль|Состояние|
|---|---|---|
|`user@planq.dev`|`Test1234!`|3 заказа, wishlist, аватар, wallet 50€|
|`new@planq.dev`|`Test1234!`|чистый аккаунт, wallet 0€|
|`rich@planq.dev`|`Test1234!`|wallet 999€, нет заказов|
|`blocked@planq.dev`|`Test1234!`|заблокирован|

**Edge cases:** товар с длинным названием, без фото, stock 0, заказ с 10+ позициями.

---

## Оплата

|Номер карты|CVV|Результат|
|---|---|---|
|`4242 4242 4242 4242`|любой|Успех|
|`4000 0000 0000 0002`|любой|Карта отклонена|
|`4000 0000 0000 9995`|любой|Недостаточно средств|
|любой|`000`|Неверный CVV|

**Wallet:** пополнение теми же картами. При нехватке — подсвечивает разницу.

**Processing:** клик → `/checkout/processing` → WebSocket → `payment.result` → redirect.

---

## Акции

**Промокод:** валидный / невалидный / истёкший / использован / минимальная сумма.

**SALE:** везде — каталог / товар / корзина / заказ.

**Баннер:** countdown polling 30 сек.

---

## Интернационализация

**react-i18next.** EN + RU. Переключатель в navbar.

```
src/locales/
  en/ → common, catalog, checkout, profile, errors
  ru/ → common, catalog, checkout, profile, errors
```

**Форматирование:** EN `€1,299.00` / RU `1 299,00 €`.

---

## Async и real-time

### WebSocket `ws://localhost:4000/ws` + JWT `?token=...`

|Событие|Данные|Где|
|---|---|---|
|`payment.result`|`{ status, orderId, reason? }`|/checkout/processing|
|`order.status.updated`|`{ orderId, status }`|/orders/:id|
|`cart.updated`|`{ items, total }`|корзина|

### Polling

|Что|Интервал|Endpoint|
|---|---|---|
|Наличие товара|60 сек|`GET /api/v1/products/:id/stock`|
|Countdown|30 сек|`GET /api/v1/promotions/active`|

### Optimistic UI

Wishlist и количество в корзине — rollback + toast error при ошибке.

---

## Технический стек

**Frontend:** React 18 + Vite + TypeScript strict, Zustand, React Query, React Hook Form + Zod, react-i18next, Lucide React, vite-plugin-svgr, Tailwind CSS (настроен под дизайн систему), axe-playwright

**Backend:** Node.js 20 + Express, Prisma ORM, PostgreSQL 15, ws, JWT, express-rate-limit, helmet.js, cors, compression, Zod, Winston, Swagger UI Express

**Тесты бэкенда:** Jest + Supertest, coverage 70%+

**Тесты QA:** Playwright + TypeScript, POM, fixtures, API helpers

**Качество:** ESLint + Prettier + Husky + lint-staged, TypeScript strict, Conventional Commits, EditorConfig, .nvmrc

**Мониторинг:** Grafana + Loki + Promtail

**Инфраструктура:** pnpm workspaces, Docker + Compose, GitHub Actions, GitHub Container Registry

---

## База данных

**PostgreSQL 15** + Prisma ORM. Offset pagination. Soft delete: User, Product, Order, Review.

```
User, Product, Category, Order, OrderItem
Cart, CartItem, Wishlist, Review
PromoCode, Transaction, RefreshToken
```

**Seed:** 4 юзера, 6 категорий, 30+ товаров, edge cases, 3 промокода, активная акция.

---

## API контракт

**Версионирование:** `/api/v1/`

**Request ID:** `X-Request-ID` UUID → Winston → заголовок ответа.

**Endpoints:** Auth / Products / Cart / Orders / Checkout / Profile / Wishlist / Reviews / Promotions / Health / Reset

**Формат ошибок:**

```json
{
  "error": "INVALID_PROMO_CODE",
  "message": "Promo code has expired",
  "statusCode": 400,
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Swagger UI:** `localhost:4000/api-docs`

---

## Безопасность

JWT access 15 мин + refresh 7 дней, rate limiting (login 5 попыток), helmet.js, cors, compression, Zod, Request ID, soft delete, `X-Reset-Token`, robots.txt.

---

## Мониторинг и логирование

**Запуск:** `docker compose --profile monitoring up`

**Grafana:** `localhost:3100`, `admin/admin`.

**Winston логирует:** запросы, ошибки, auth, WebSocket, платёжные, reset события.

**Grafana дашборд:** real-time, фильтры по уровню / endpoint / userId / requestId / времени.

---

## Accessibility

WCAG AA. Семантический HTML, ARIA, клавиатура, focus visible, contrast 4.5:1, alt тексты, labels, aria-live.

---

## Пирамида тестирования

```
         /    E2E тесты    /   ← QA Senior (planq-tests-js)
        /    API тесты     /   ← QA Senior (planq-tests-js)
       / интеграционные   /    ← Backend Senior (planq-app)
      /    юнит тесты    /     ← Backend Senior (planq-app)
```

---

## Требования к тестируемости

- `docker-compose.yml` поднимает всё одной командой
- `.env.example` с описанием переменных
- образы на GitHub Container Registry
- `GET /health` — статус сервисов
- `POST /api/test/reset` — сброс к seed, `X-Reset-Token`
- Swagger актуален
- детерминированный seed с edge cases
- `/login` и `/checkout` полностью `data-testid`
- toast, модалки, WebSocket элементы имеют `data-testid`
- `VITE_SHOW_TEST_CREDENTIALS=true` → demo accounts
- Grafana auto-provisioning
- `X-Request-ID` в каждом ответе
- backend coverage 70%+

---

## CI/CD флоу

**planq-app:**

```yaml
lint → typecheck → backend-tests (coverage 70%+) → build → docker push
```

**planq-tests-js:**

```yaml
lint → typecheck → docker compose up → health check → reset db → playwright tests → upload report
```

---

## Документация

README, ARCHITECTURE, API, ASYNC, TEST_ACCOUNTS, LOCATORS, MONITORING, I18N, CONTRIBUTING, TROUBLESHOOTING, CHANGELOG, LICENSE, SECURITY.

---

## План разработки

**Этап 1 — Инфраструктура** монорепо + pnpm, gh CLI setup, создать GitHub репо, ESLint + Prettier + Husky, EditorConfig, .nvmrc, .gitignore, Docker, docker-compose, `.env.example`, защита веток, базовый README

**Этап 2 — База данных** Prisma схема, миграции, детерминированный seed с edge cases

**Этап 3 — Бэкенд + тесты** все endpoints, JWT + refresh, helmet + cors + compression, rate limiting, Request ID, soft delete, Zod, Winston, Swagger, `/health`, `/api/test/reset`, юнит тесты всех сервисов, интеграционные тесты, coverage 70%+

**Этап 4 — WebSocket** ws сервер, все события, JWT аутентификация

**Этап 5 — Фронтенд** дизайн система + темы, логотип, компоненты, страницы, React Query + polling, WebSocket клиент, Optimistic UI, i18n EN/RU, responsive, WCAG AA, error boundary, offline баннер, 404/500

**Этап 6 — Мониторинг** Grafana + Loki + Promtail, docker-compose profile, дашборд auto-provisioning

**Этап 7 — Интеграция + UI ревью** E2E проверка всех флоу, отладка, дизайн ревью через Claude in Chrome если доступен

**Этап 8 — CI/CD** GitHub Actions (lint → tests → build → push), GitHub Container Registry, защита веток

**Этап 9 — Документация** полный комплект docs/, CHANGELOG v1.0, LICENSE, SECURITY.md

**Этап 10 — planq-tests-js** инфраструктура тестового репо, POM, fixtures, helpers, E2E тесты, API тесты, CI

---

## Ретроспективы по этапам

Заполняется Claude Code в конце каждого этапа — пока детали свежи. Формат фиксированный, ответы короткие и конкретные. По завершении всего проекта — финальная ретроспектива переносится в универсальный промт.

### Этап 1 — Инфраструктура

```
Что сработало отлично:
[заполняется после завершения]

Что создало проблемы:
[заполняется после завершения]

Что сделали бы иначе:
[заполняется после завершения]

Что добавить в универсальный промт:
[заполняется после завершения]
```

### Этап 2 — База данных

```
Что сработало отлично:
[заполняется после завершения]

Что создало проблемы:
[заполняется после завершения]

Что сделали бы иначе:
[заполняется после завершения]

Что добавить в универсальный промт:
[заполняется после завершения]
```

### Этап 3 — Бэкенд + тесты

```
Что сработало отлично:
[заполняется после завершения]

Что создало проблемы:
[заполняется после завершения]

Что сделали бы иначе:
[заполняется после завершения]

Что добавить в универсальный промт:
[заполняется после завершения]
```

### Этап 4 — WebSocket

```
Что сработало отлично:
[заполняется после завершения]

Что создало проблемы:
[заполняется после завершения]

Что сделали бы иначе:
[заполняется после завершения]

Что добавить в универсальный промт:
[заполняется после завершения]
```

### Этап 5 — Фронтенд

```
Что сработало отлично:
[заполняется после завершения]

Что создало проблемы:
[заполняется после завершения]

Что сделали бы иначе:
[заполняется после завершения]

Что добавить в универсальный промт:
[заполняется после завершения]
```

### Этап 6 — Мониторинг

```
Что сработало отлично:
[заполняется после завершения]

Что создало проблемы:
[заполняется после завершения]

Что сделали бы иначе:
[заполняется после завершения]

Что добавить в универсальный промт:
[заполняется после завершения]
```

### Этап 7 — Интеграция

```
Что сработало отлично:
[заполняется после завершения]

Что создало проблемы:
[заполняется после завершения]

Что сделали бы иначе:
[заполняется после завершения]

Что добавить в универсальный промт:
[заполняется после завершения]
```

### Этап 8 — CI/CD

```
Что сработало отлично:
[заполняется после завершения]

Что создало проблемы:
[заполняется после завершения]

Что сделали бы иначе:
[заполняется после завершения]

Что добавить в универсальный промт:
[заполняется после завершения]
```

### Этап 9 — Документация

```
Что сработало отлично:
[заполняется после завершения]

Что создало проблемы:
[заполняется после завершения]

Что сделали бы иначе:
[заполняется после завершения]

Что добавить в универсальный промт:
[заполняется после завершения]
```

### Этап 10 — planq-tests-js

```
Что сработало отлично:
[заполняется после завершения]

Что создало проблемы:
[заполняется после завершения]

Что сделали бы иначе:
[заполняется после завершения]

Что добавить в универсальный промт:
[заполняется после завершения]
```

### Финальная ретроспектива проекта

```
Лучшие решения проекта (берём в универсальный промт):
[заполняется после завершения всех этапов]

Антипаттерны (не повторять):
[заполняется после завершения всех этапов]

Что обновить в универсальном промте:
[заполняется после завершения всех этапов]

Прокачка ролей — что добавить каждой роли:
[заполняется после завершения всех этапов]
```

---

## Открытые вопросы

- система разработки — Ubuntu / CachyOS / macOS (обновить в "Текущее состояние")
- gh CLI — установить перед стартом (инструкция в "Настройка окружения")
- GitHub репо — создать перед Этапом 1
- роли admin/user — вынесены за скобки, добавить позже отдельным PR
- Java тестовый фреймворк — Playwright или Selenium (решит Java команда) **Стратегия изоляции тестовых данных — комбинированная (Подход В):**
- `beforeAll` → сброс базы к seed
- read-only тесты (каталог, главная, страница товара) → параллельно против seed данных
- write тесты (checkout, профиль, wallet) → создают уникального юзера через API helper **CSS подход — Tailwind** (настроен под нашу дизайн систему через CSS переменные)