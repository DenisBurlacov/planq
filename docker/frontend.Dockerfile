# Build stage
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml* package.json ./
COPY apps/frontend/package.json apps/frontend/
COPY packages/types/package.json packages/types/
RUN pnpm install --frozen-lockfile --filter @planq/frontend --filter @planq/types

COPY tsconfig.base.json ./
COPY apps/frontend/ apps/frontend/
COPY packages/types/ packages/types/
RUN pnpm --filter @planq/frontend run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
