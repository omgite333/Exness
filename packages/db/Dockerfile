# syntax=docker/dockerfile:1
#
# One-shot job: pushes the Drizzle schema to Postgres, then exits.
# Build context MUST be the monorepo root, e.g.:
#   docker build -f packages/db/Dockerfile -t exness-migrate .

FROM node:20-alpine AS base
RUN corepack enable
RUN apk add --no-cache libc6-compat

FROM base AS pruner
WORKDIR /app
COPY . .
RUN npx turbo prune @repo/db --docker

FROM base AS runner
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
WORKDIR /app/packages/db
CMD ["pnpm", "exec", "drizzle-kit", "push", "--force"]