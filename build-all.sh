#!/bin/bash
set -e
echo -e "\n=== Installing dependencies ==="
pnpm install

echo -e "\n=== Building shared packages ==="
pnpm --filter @repo/redis build
pnpm --filter @repo/db build
pnpm --filter @repo/types build

echo -e "\n=== Building apps ==="
pnpm --filter engine build
pnpm --filter backend build
pnpm --filter web-socket build
pnpm --filter poller build

echo -e "\n=== All builds complete! ==="
