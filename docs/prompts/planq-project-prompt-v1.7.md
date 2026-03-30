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
9. QA-прогон по чеклисту (обязательно перед коммитом ретроспективы):
   - Проверить каждый frontend API-файл (/src/api/*.ts) — URL и метод совпадают с backend роутами?
   - Протестировать все критические флоу: добавить в корзину, оформить заказ, профиль, wishlist
   - Проверить navigate state между страницами (передаются ли данные между экранами)
   - Backend: каждый query param из фронтенда есть в схеме и обрабатывается в where/orderBy?
10. git push origin feature/stage-N-название
11. создать PR в develop (через gh или вручную)
12. обновить "Текущее состояние" в этом файле
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

**Версия промта:** v1.7 **Текущий этап:** Этап 6 — CI/CD **Последняя сессия:** 2026-03-30 **Система:** macOS Darwin arm64 **gh CLI:** v2.89.0 (авторизован) **GitHub репо:** DenisBurlacov/Planq (private) **URL репо:** git@github.com:DenisBurlacov/Planq.git

**Окружение:** Node v22.22.2 (Volta) | pnpm v10.33.0 | Docker v29.3.1 | WebStorm

### Прогресс по этапам

**planq-app:**

- [x] Этап 1 — Инфраструктура ✅
- [x] Этап 2 — База данных ✅
- [x] Этап 3 — Бэкенд + тесты ✅
- [x] Этап 4 — WebSocket ✅
- [x] Этап 5 — Фронтенд ✅
- [x] Этап 6 — CI/CD ✅
- [x] Этап 7 — Мониторинг ✅
- [x] Этап 8 — UI + Контент ✅
- [x] Этап 9 — Документация ✅

**planq-tests-js (студенческий этап — вне скоупа команды):**

- [ ] Этап 10 — E2E + API тесты (пишут студенты самостоятельно)

### Ветки

|Этап|Ветка|Статус|
|---|---|---|
|1|`feature/stage-1-infrastructure`|завершена, запушена|
|2|`feature/stage-2-database`|PR #1 создан|
|3|`feature/stage-3-backend`|создана, в работе|
|4|`feature/stage-4-websocket`|создана, в работе|
|5|`feature/stage-5-frontend`|не создана|
|6|`feature/stage-6-cicd`|не создана|
|7|`feature/stage-7-monitoring`|не создана|
|8|`feature/stage-8-integration`|не создана|
|9|`feature/stage-9-docs`|не создана|
|10|`feature/stage-10-tests-js`|не создана|

### Принятые решения (сверх промта)

- Node 22 LTS вместо Node 20 (актуальный LTS на март 2026)
- ESLint 10 flat config (eslint.config.js) вместо .eslintrc.json (ESLint 8 deprecated)
- Jest 29.x вместо 30 (ts-jest 30 не существует)
- Express 5 (вместо 4) — актуальная стабильная версия
- Volta как менеджер Node (глобально), .husky/pre-commit экспортирует VOLTA_HOME
- bcrypt для хэширования паролей в seed и auth

### Решения команды перед Этапом 3

- **Ритуал этапа:** перед стартом — каждая роль высказывается. После — ретроспектива + обновление промтов. Без исключений.
- **Этап 3 разбить на атомарные коммиты:** middleware → auth → products → cart → orders → checkout → profile → wishlist → reviews → promotions → health/reset
- **Soft delete middleware:** централизованный Prisma middleware для фильтрации deletedAt, не копипаст в каждом запросе
- **Swagger синхронно:** каждый новый endpoint → сразу Swagger, не в конце этапа
- **`/health` с проверкой БД:** не просто `{ status: "ok" }`, а реальный ping к PostgreSQL
- **`POST /api/test/reset`:** реальный сброс к seed, защищён X-Reset-Token с первого дня
- **Каждый сервис → сразу юнит тест.** Каждый endpoint → сразу интеграционный тест + Swagger
- **Security с первого endpoint:** helmet, CORS, rate limiting, JWT refresh rotation, Zod валидация

### Решения команды перед Этапом 4

- **PM чеклист старта этапа:** перед стартом нового этапа обязательно проверить что предыдущая ветка замержена в develop
- **WebSocket сервер:** отдельный `src/ws/` модуль с handler'ами для каждого события
- **JWT аутентификация WS:** `?token=accessToken` в URL при connect, сразу отклонять невалидные соединения
- **Три события:** `payment.result`, `order.status.updated`, `cart.updated` — определены в Этапе 3
- **Симуляция оплаты:** payment processing происходит в WebSocket handler после checkout, не в REST endpoint
- **Юнит тест для WS сервиса:** написать сразу вместе с реализацией

### Известные баги и технический долг

- pnpm approve-builds — Prisma/esbuild/bcrypt build scripts требуют .pnpm-approve-builds.json, интерактивный prompt блокирует CI

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
- **Стратегия `data-testid`:**
  - Страницы **С** `data-testid` (показывают правильный подход): `/login`, `/checkout`, `/cart`, `/orders/:id`, toast, модалки, WebSocket элементы
  - Страницы **БЕЗ** `data-testid` (студенты практикуют локаторы): `/catalog`, `/catalog/:id`, `/profile`, `/wishlist`, `/wallet`
  - Цель: часть страниц — эталон; часть — задача на составление локаторов по тексту, роли, CSS
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

_UI-компоненты для QA-практики (обязательно присутствуют на страницах):_
- **Попапы / Модальные окна** — confirm dialog, form modal, info modal
- **Dropdown** — searchable select, multi-select (например, фильтры каталога)
- **Checkboxes** — фильтры "On Sale", "In Stock"; настройки уведомлений
- **Tables** — история заказов (динамическая), транзакции кошелька (статическая)
- **Навигационная панель** — navbar с dropdown-меню пользователя, sidebar с collapse
- **Toast-уведомления** — success / error / warning / info (уже есть)
- **Stepper / Прогресс-бар** — статус заказа (Pending → Processing → Shipped → Delivered)

**Этап 6 — CI/CD** GitHub Actions (lint → tests → build → push), GitHub Container Registry, защита веток
⚠️ _Урок: CI/CD должен идти сразу после Backend (Этап 3). Три раза обсуждалось — не зафиксировали. Исправлено в плане._

**Этап 7 — Мониторинг** ✅ Grafana + Loki + Promtail, docker-compose `--profile monitoring`, Promtail Docker SD scraping, Grafana datasource + dashboard auto-provisioning

**Этап 8 — UI + Контент** ✅ Закрыт 2026-03-30. PR #17 → develop → main.

_Выполнено (8.1):_
- ✅ Checkbox-фильтры по категории в каталоге
- ✅ Modal — подтверждение удаления товара из корзины
- ✅ Tabs на ProfilePage — вкладки «Настройки» / «Безопасность»
- ✅ Toast — цветная левая граница по типу
- ✅ Empty state для Wishlist и Orders (`data-testid="empty-state"`)
- ✅ data-testid="orders-list", "order-item", "wishlist-grid"

_Выполнено (8.2):_
- ✅ Seed: 10 категорий (+ Декор, Текстиль, Освещение, Хранение), 62 товара, все Unsplash-фото проверены (16 битых ID исправлено)
- ✅ HomePage: Hero с бейджем + статистикой + dual CTA, плитка категорий, Best Sellers, Sale Banner
- ✅ ProductCard: hover lift + Quick View overlay + Wishlist tooltip; data-testid
- ✅ ProductPage: галерея h-96 + thumbnail strip, Breadcrumb, Accordion (4 секции), полные data-testids
- ✅ Новые компоненты: `Breadcrumb`, `Accordion`
- ✅ Navbar: 13 data-testid (logo, links, cart-badge, auth buttons, dropdown)
- ✅ NotFoundPage: data-testids + Browse Catalog CTA
- ✅ CheckoutPage: Breadcrumb (Home → Cart → Checkout)
- ✅ docs/LOCATORS.md: 70+ data-testid, разбиты по страницам, намеренные отсутствия

⚠️ _Урок: часть Unsplash ID даёт 404. Проверять через curl с User-Agent браузера перед коммитом seed._

**Этап 9 — Документация** ✅ Закрыт 2026-03-30. v1.0.0 — все этапы завершены.
- ✅ README.md — полный обзор проекта, quick start, QA guide, тестовые аккаунты
- ✅ docs/ARCHITECTURE.md — архитектура, стек, DB-схема, auth flow, CI/CD
- ✅ CHANGELOG.md — история всех 9 этапов, формат Keep-a-Changelog
- ✅ LICENSE — MIT
- ✅ SECURITY.md — политика уязвимостей, практики безопасности
- ✅ docs/LOCATORS.md — 70+ data-testid локаторов (выполнено в Этапе 8)

**Этап 10 — planq-tests-js** инфраструктура тестового репо, POM, fixtures, helpers, E2E тесты, API тесты, CI

---

## Ретроспективы по этапам

Заполняется Claude Code в конце каждого этапа — пока детали свежи. Формат фиксированный, ответы короткие и конкретные. По завершении всего проекта — финальная ретроспектива переносится в универсальный промт.

### Этап 1 — Инфраструктура ✅ (2026-03-29)

```
Что сработало отлично:
- pnpm workspaces + монорепо структура встала с первого раза
- ESLint 10 flat config + Prettier + Husky — все проверки проходят чисто
- Docker Compose с PostgreSQL — healthcheck, поднялся сразу
- Tailwind настроен через CSS переменные дизайн системы — темы готовы

Что создало проблемы:
- Volta PATH не попадает в git hooks (Husky) — пришлось явно экспортировать
  VOLTA_HOME и PATH в .husky/pre-commit
- Express 5 + TypeScript — inferred type ошибка, нужна явная аннотация Express
- Jest 30 / ts-jest 30 не существуют — промт указывал ^30, откатили на 29.x
- pnpm approve-builds — интерактивный prompt блокирует автоматизацию,
  пришлось создать .pnpm-approve-builds.json вручную
- WebStorm не видит Node через Volta — потребовалась ручная настройка пути
- SSH ключ был не загружен в agent — блокировал push

Что сделали бы иначе:
- сразу добавить type: "module" в корневой package.json
- сразу добавить @types/node в backend devDependencies
- сразу создать .prettierignore (pnpm-lock.yaml, промты)
- проверять актуальные версии пакетов перед записью в package.json
- Husky pre-commit — сразу закладывать Volta PATH

Что добавить в универсальный промт:
- Volta + Husky: всегда экспортировать VOLTA_HOME в .husky/pre-commit
- Express 5 + TS: требует явной типизации const app: Express
- pnpm approve-builds: создавать .pnpm-approve-builds.json заранее
- Версии пакетов: всегда проверять актуальные версии, не угадывать
```

### Этап 2 — База данных ✅ (2026-03-29)

```
Что сработало отлично:
- Prisma schema — 12 моделей встали с первого раза, миграция чистая
- upsert в seed — идемпотентность из коробки, повторный запуск безопасен
- Edge cases в seed сразу — длинные названия, stock 0, пустые images, рейтинг 1.0/5.0
- bcrypt для паролей — правильно с первого дня

Что создало проблемы:
- prisma/ в tsconfig include ломает typecheck (rootDir конфликт)
- non-null assertion (!) в seed — ESLint strict не пропускает, заменили на helper
- bcrypt требует approve-builds (native addon) — добавили в .pnpm-approve-builds.json

Что сделали бы иначе:
- сразу исключить prisma/ из tsconfig include (seed вне src/)
- использовать helper функцию для поиска по seed данным вместо find()!

Что добавить в универсальный промт:
- Prisma seed: не включать prisma/ в tsconfig include — rootDir конфликт
- Seed: использовать throw вместо non-null assertion для поиска по данным
```

### Этап 3 — Бэкенд + тесты ✅ (2026-03-30)

```
Что сработало отлично:
- AppError + централизованный errorHandler — единый формат ошибок с requestId из коробки
- getAuthUser() utility вместо req.user! — решило ESLint no-non-null-assertion элегантно
- Сервисный слой отделён от роутов — юнит тесты пишутся легко и чисто
- 14 юнит тестов написаны и проходят, /health возвращает реальный db ping

Что создало проблемы (13 ошибок):
1. Stage 2 не замержена в develop перед стартом Stage 3 — PM checklist провал.
   Пришлось: git stash → merge stage-2 → push → rebase stage-3
2. tsconfig rootDir + tests/ конфликт (TS6059) — rootDir: "src" несовместим
   с tests/ вне src/. Решение: убрать rootDir из tsconfig.json
3. Prisma v6: $use middleware удалён — soft delete через централизованный middleware
   невозможен. Пришлось добавлять deletedAt: null вручную в каждый запрос
4. Неправильные имена relation в schema — писали orderItems/cartItems, в схеме items.
   Причина: не прочитали schema.prisma до написания сервисов
5. Express 5 Router TS2742 — каждый роут файл требует явную аннотацию
   const router: ExpressRouter = Router()
6. Express 5 req.params — тип string | string[], нужен явный as string cast
7. tsconfig "types" массив блокирует @types/bcrypt — пришлось добавить "bcrypt"
   и "swagger-jsdoc" явно в массив types
8. @types/jest + @jest/globals конфликт — убрать все @jest/globals импорты,
   оставить только @types/jest глобальный
9. jest.config.ts требует ts-node которого нет — переименовать в jest.config.cjs
   с module.exports = {...}
10. moduleNameMapper не убирает .js суффикс из path aliases — нужен optional .js:
    '^@utils/(.*?)(\\.js)?': '<rootDir>/src/utils/$1'
11. tsx --tsconfig флаг перед watch — правильно: tsx watch --tsconfig tsconfig.json
    (subcommand watch должен идти первым)
12. dotenv не загружается автоматически — Prisma Client читает process.env, не .env.
    Нужен import 'dotenv/config' как ПЕРВЫЙ импорт в server.ts
13. NODE_OPTIONS подход для --tsconfig не работал с tsx — только dotenv решение

Что сделали бы иначе:
- Добавить в PM чеклист: перед стартом нового этапа — проверить что предыдущий
  замержен в develop
- Читать Prisma CHANGELOG при переходе на новую major версию
- Читать schema.prisma ПЕРЕД написанием сервисов, не угадывать имена relation
- Создавать jest.config.cjs сразу, а не переименовывать потом
- Добавить import 'dotenv/config' в server.ts шаблон этапа 3

Что добавить в универсальный промт:
- Prisma v6: $use удалён → soft delete только через explicit deletedAt: null
- Jest: jest.config.cjs (module.exports), ESM мок дефолтного экспорта требует __esModule: true
- tsx: флаг --tsconfig ПОСЛЕ subcommand watch
- dotenv: import 'dotenv/config' — первый импорт в server.ts, иначе DATABASE_URL пустой
- Express 5: req.params всегда as string
- tsconfig split: основной без rootDir, tsconfig.build.json с rootDir только для сборки
- читать schema.prisma перед написанием сервисов
```

### Этап 4 — WebSocket ✅ (2026-03-30)

```
Что сработало отлично:
- WsServer singleton pattern — чистый DI, сервисы импортируют и используют без конфигурации
- jest.useFakeTimers() + runAllTimersAsync() — schedulePaymentResult протестирован без реального setTimeout
- @ws/* alias уже был настроен в tsconfig и jest.config.cjs — ноль дополнительной конфигурации
- 22 тестов, всё зелёное с первого запуска

Что создало проблемы (1 ошибка):
1. eslint.config.js ignores: паттерн '*.config.cjs' не матчит файл в поддиректории.
   Нужен '**/*.config.cjs' — globstar для рекурсивного поиска

Что сделали бы иначе:
- Добавить **/*.config.cjs в eslint ignores сразу при создании jest.config.cjs (Этап 3)

Что добавить в универсальный промт:
- ESLint ignores: паттерны для файлов в поддиректориях требуют **/ префикс (globstar)
- jest.useFakeTimers() — стандарт для тестирования setTimeout/setInterval логики
```

### Этап 5 — Фронтенд ✅ (2026-03-30)

```
Что сработало отлично:
- Zustand persist + devtools — store готов за 10 минут, SSR hydration не нужна
- React Query v5 placeholderData prev → prev — плавная пагинация без единой строки extra кода
- apiFetch с 401 auto-refresh — реализовано однократно, работает для всех 18 API-файлов
- useWebSocket hook с reconnect — изолирован, страницы checkout/order-detail подключили без дублирования
- data-testid на всех интерактивных элементах с первого коммита — zero QA долг
- Husky + lint-staged сработали сразу: prettier + eslint --fix на каждый коммит

Что создало проблемы (5 ошибок):
1. Алиас @types конфликтует с зарезервированным namespace TypeScript.
   TypeScript трактует @types/* как пространство имён деклараций, не как path alias.
   Ошибка TS6137 во всех 18 файлах с импортами.
   Решение: переименовать alias в vite.config.ts и tsconfig.json: @types → @appTypes,
   затем bulk replace в src/ через sed.
2. import.meta.env даёт TS2339 — vite/client типы не подключены.
   Решение: создать src/vite-env.d.ts с /// <reference types="vite/client" />.
3. Alias @ws/* не добавлен во frontend vite.config.ts и tsconfig.json —
   присутствовал только в backend. Ошибка TS2307 в useWebSocket import.
   Решение: добавить '@ws' в оба конфига frontend.
4. Импорт { useState } в CheckoutPage — объявлен, не использован (TS6133/ESLint).
   Решение: удалить строку импорта.
5. @typescript-eslint/no-invalid-void-type — apiFetch<void> запрещён в strict режиме.
   void валиден только как return type, не как generic аргумент.
   Решение: заменить apiFetch<void> → apiFetch<undefined> во всех API-файлах.

Что сделали бы иначе:
- Сразу называть alias @appTypes, не @types — TypeScript reserved namespace известен
- Создавать vite-env.d.ts в шаблоне этапа 5, не добавлять постфактум
- Добавлять @ws alias во frontend конфиг одновременно с backend (один шаблон)
- Использовать apiFetch<undefined> вместо apiFetch<void> с первого файла

Что добавить в универсальный промт:
- Vite/TS: alias @types/* — зарезервировано TypeScript, использовать @appTypes или @models
- Vite/TS frontend: всегда создавать vite-env.d.ts с /// <reference types="vite/client" />
- apiFetch<void>: в strict TS void нельзя как generic arg — использовать undefined
- Path aliases: добавлять одновременно в vite.config.ts И tsconfig.json — иначе Vite
  разрешает, а TypeScript ругается (или наоборот)
```

### QA-прогон после Этапа 5 (2026-03-30) — 6 критических багов

```
Найденные и исправленные баги:

FRONTEND:
1. Cart API — все 3 операции на несуществующих URL /cart/items/*
   add: POST /cart/items → POST /cart
   update: PATCH /cart/items/:itemId → PATCH /cart/:productId
   remove: DELETE /cart/items/:itemId → DELETE /cart/:productId
   Причина: frontend написан по предположению, не сверен с роутами backend

2. CartPage передавал item.id (CartItem ID) вместо item.productId
   Причина: update/remove handler принимал itemId, а backend ожидает productId

3. Checkout не отображал скидку от промокода
   Причина: CartPage передавал только promoCode в navigate state, не promoDiscount %.
   Checkout вычислял total из корзины без скидки, но правильно отправлял promoCode на backend.

BACKEND:
4. Карта «Insufficient funds» 4000000000009995 проходила как успешная
   Причина: опечатка в CARD_SCENARIOS: '4000000000000995' вместо '4000000000009995'

5. Фильтр onSale=true возвращал все 30 товаров
   Причина: onSale отсутствовал в ProductsQuerySchema и в where-клаузе

6. Сортировка priceAsc/priceDesc/rating не работала (всегда newest)
   Причина: sort отсутствовал в ProductsQuerySchema, orderBy не был реализован

Что добавить в процесс для следующих этапов:
- После каждого этапа — QA-прогон по чеклисту ВСЕХ API endpoint (URL, метод, параметры)
- Сверять frontend API-клиент (/src/api/*.ts) с backend роутами перед коммитом
- Проверять navigate state между страницами (cart→checkout, checkout→success)
- Backend: проверять все query params схемы — есть ли поле, есть ли обработка в where/orderBy
- Тест-карты: сверять номера в CARD_SCENARIOS с документацией и frontend тест-хинтами
```

### Код-ревью после Этапа 5 (2026-03-30)

```
Исправлено в ходе ревью:

BACKEND:
1. getProductById — не фильтровал deletedAt: null → удалённый товар был виден по прямой ссылке
2. LoginSchema — password min(1) вместо min(8) → несоответствие с RegisterSchema
3. cart.service.ts — floating point на total (Math.round * 100 / 100)
4. orders.service.ts — floating point на total и promo discount (round2 helper)

FRONTEND:
5. CartPage.tsx — floating point на subtotal/discountAmount/total
6. CheckoutPage.tsx — floating point на subtotal/discountAmount/total
7. CatalogPage.tsx — wishlistedIds не синхронизировался с сервером (только локальный Set).
   Добавлен useQuery(['wishlist']) + useEffect для инициализации Set из ответа API.

Намеренно оставлено (для студентов):
- CARD_SCENARIOS в orders.service.ts — захардкожены, это ожидаемо для демо
- race condition в refresh token — допустимо для учебного проекта
- Login password min(8) теперь совпадает с Register → тест min(1) стал негативным кейсом

Правила для следующих этапов:
- При добавлении soft-delete поля — сразу везде в where добавлять deletedAt: null
- Схемы Zod для register/login должны быть идентичны по password constraints
- Math.round(n * 100) / 100 на всех price calculations (нет смысла тащить библиотеку decimal)
- Wishlist/favorites state всегда инициализировать с сервера, не с пустого Set
```

### Ретро заказчика после Этапа 5 (2026-03-30)

```
Замечания заказчика (Denis):

1. CI/CD порядок — КРИТИЧНО
   Заказчик трижды спрашивал про архитектуру и план.
   Команда обсуждала, но не зафиксировала: CI/CD должен идти сразу после Backend (Этап 3).
   Исправлено: CI/CD перенесён на Этап 6 (был Этап 8).
   Правило: любое обсуждённое решение — немедленно фиксируется в промте.

2. UI-компоненты для QA-практики — не задокументировано
   Обсуждалось добавить попапы, дропдауны, чекбоксы, таблицы, navbar dropdown.
   Никто не записал. Теперь зафиксировано в плане Этапа 5.
   Правило: QA (или Tech Writer) обязан фиксировать требования к UI-компонентам в промте.

3. Стратегия data-testid — обсуждалось, не зафиксировано
   Часть страниц — с data-testid (эталон для студентов).
   Часть страниц — без data-testid (практика локаторов).
   Теперь зафиксировано в разделе «Требования к тестируемости».

4. Фиксы по замечаниям заказчика (применены в сессии):
   - Sort dropdown: добавлен value={query.sort ?? 'newest'}, опция value='newest'
   - Clear Filters: теперь сбрасывает sort + priceError
   - Price range: валидация min > max (красная рамка + сообщение)
   - WalletPage: amount input получил step="0.01" min="0.01", Zod min(0.01)
   - Rate limiting: NODE_ENV=test → лимит 1000 (не блокирует тесты)
   - Backend sort: явный enum ['newest', 'priceAsc', 'priceDesc', 'rating']
```

### Этап 6 — CI/CD

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

### Этап 7 — Мониторинг

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

### Этап 8 — Интеграция

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