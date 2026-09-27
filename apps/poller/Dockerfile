# syntax=docker/dockerfile:1
#
# Build context MUST be the monorepo root, e.g.:
#   docker build -f apps/poller/Dockerfile -t exness-poller .

FROM node:20-alpine AS base
RUN corepack enable
RUN apk add --no-cache libc6-compat

# ---- 1. Prune the monorepo down to only what "poller" needs ----
FROM base AS pruner
WORKDIR /app
COPY . .
RUN npx turbo prune poller --docker

# ---- 2. Install pruned deps and build ----
FROM base AS builder
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build --filter=poller...

# ---- 3. Slim runtime image ----
FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app .
USER appuser
CMD ["node", "apps/poller/dist/index.js"]