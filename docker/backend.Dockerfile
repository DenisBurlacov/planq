# Single stage — run with tsx (handles TS path aliases)
FROM node:22-alpine

RUN apk add --no-cache curl
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

ENV HUSKY=0

COPY pnpm-workspace.yaml pnpm-lock.yaml* package.json ./
COPY apps/backend/package.json apps/backend/
COPY packages/types/package.json packages/types/
RUN pnpm install --frozen-lockfile --filter @planq/backend --filter @planq/types --ignore-scripts

COPY tsconfig.base.json ./
COPY apps/backend/ apps/backend/
COPY packages/types/ packages/types/
RUN pnpm --filter @planq/backend exec prisma generate

WORKDIR /app/apps/backend

EXPOSE 4000

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

CMD ["npx", "tsx", "src/server.ts"]
