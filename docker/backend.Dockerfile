# Build stage
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml* package.json ./
COPY apps/backend/package.json apps/backend/
COPY packages/types/package.json packages/types/
RUN pnpm install --frozen-lockfile --filter @planq/backend --filter @planq/types

COPY tsconfig.base.json ./
COPY apps/backend/ apps/backend/
COPY packages/types/ packages/types/
RUN pnpm --filter @planq/backend exec prisma generate
RUN pnpm --filter @planq/backend run build

# Production stage
FROM node:22-alpine

# curl is needed for Docker HEALTHCHECK
RUN apk add --no-cache curl

RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy workspace config + package files for prod install
COPY pnpm-workspace.yaml pnpm-lock.yaml* package.json ./
COPY apps/backend/package.json apps/backend/
COPY packages/types/package.json packages/types/
RUN pnpm install --frozen-lockfile --filter @planq/backend --prod

# Copy built output, prisma schema, and generated client
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=builder /app/node_modules/.pnpm/@prisma+client*/node_modules/.prisma ./node_modules/.prisma

WORKDIR /app/apps/backend

EXPOSE 4000

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

CMD ["node", "dist/src/server.js"]
