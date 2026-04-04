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

ENV VITE_API_URL=""
ENV VITE_WS_URL=""
RUN pnpm --filter @planq/frontend run build

# Production stage
FROM nginx:1.27-alpine
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
