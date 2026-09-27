# syntax=docker/dockerfile:1
#
# Build context MUST be the monorepo root, e.g.:
#   docker build -f apps/backend/Dockerfile -t exness-backend .
# (docker-compose.yml at the repo root is already set up this way.)

FROM node:20-alpine AS base
RUN corepack enable
RUN apk add --no-cache libc6-compat

# ---- 1. Prune the monorepo down to only what "backend" needs ----
FROM base AS pruner
WORKDIR /app
COPY . .
RUN npx turbo prune backend --docker

# ---- 2. Install pruned deps and build ----
FROM base AS builder
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build --filter=backend...

# ---- 3. Slim runtime image ----
FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app .
USER appuser
EXPOSE 3001
CMD ["node", "apps/backend/dist/index.js"]