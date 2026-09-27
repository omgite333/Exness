# syntax=docker/dockerfile:1
#
# Build context MUST be the monorepo root, e.g.:
#   docker build -f apps/web-socket/Dockerfile -t exness-web-socket .

FROM node:20-alpine AS base
RUN corepack enable
RUN apk add --no-cache libc6-compat

# ---- 1. Prune the monorepo down to only what "web-socket" needs ----
FROM base AS pruner
WORKDIR /app
COPY . .
RUN npx turbo prune web-socket --docker

# ---- 2. Install pruned deps and build ----
FROM base AS builder
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build --filter=web-socket...

# ---- 3. Slim runtime image ----
FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app .
USER appuser
EXPOSE 8080
CMD ["node", "apps/web-socket/dist/index.js"]