# Build all packages and apps in correct dependency order
# Run from project root: .\build-all.ps1

Write-Host "`n=== Installing dependencies ===" -ForegroundColor Cyan
pnpm install

Write-Host "`n=== Building shared packages ===" -ForegroundColor Cyan
pnpm --filter @repo/redis build
pnpm --filter @repo/db build
pnpm --filter @repo/types build

Write-Host "`n=== Building apps ===" -ForegroundColor Cyan
pnpm --filter engine build
pnpm --filter backend build
pnpm --filter web-socket build
pnpm --filter poller build

Write-Host "`n=== All builds complete! ===" -ForegroundColor Green
Write-Host "Now open 5 terminals and run each service." -ForegroundColor Green
