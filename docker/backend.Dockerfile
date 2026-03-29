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
RUN pnpm --filter @planq/backend run build

# Production stage
FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package.json ./
COPY --from=builder /app/apps/backend/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 4000
CMD ["node", "dist/server.js"]
