# Exness — Perpetuals Trading Platform

A full-stack, real-time perpetual futures trading platform built as a **Turborepo monorepo**. Users can trade BTC, ETH, and SOL perpetual contracts with leverage, against live price feeds from Binance Futures. The system supports both authenticated users (magic-link email) and unauthenticated guests.


<img width="1917" height="901" alt="image" src=<img width="1919" height="948" alt="image" src="https://github.com/user-attachments/assets/263f69ad-3bba-4a57-9445-971f521d294e" />
 />

---

## Quick Start

> Make sure you have **Node.js ≥ 20**, **pnpm ≥ 9**, **Bun ≥ 1.0**, **Redis**, **PostgreSQL**, and **MongoDB** running before proceeding. See [Prerequisites](#prerequisites) for details.

**1. Clone the repository**

```bash
git clone https://github.com/your-username/exness.git
cd exness
```

**2. Install dependencies**

```bash
pnpm install
```

**3. Set up environment variables**

Create `.env` files for each app (see [Getting Started](#getting-started) for the full variable list):

```bash
cp apps/backend/.env.example   apps/backend/.env
cp apps/engine/.env.example    apps/engine/.env
cp apps/frontend/.env.example  apps/frontend/.env
```

Then fill in your database URLs, Redis URL, JWT secret, and Resend API key.

**4. Push the database schema**

```bash
cd packages/db && pnpm db:push && cd ../..
```

**5. Run all services**

```bash
pnpm dev
```

That's it — the frontend will be at **http://localhost:5173** and the backend API at **http://localhost:3001**.

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001/api/v1 |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Client (React)                      │
│   Vite · React 19 · TanStack Query · Lightweight Charts  │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP / REST
┌──────────────────────▼──────────────────────────────────┐
│                   Backend (Express 5)                    │
│   Auth · Trade · Balance · Response-Loop Worker         │
└───────────┬──────────────────────────┬──────────────────┘
            │ Redis Streams (push)      │ Redis Streams (pull)
┌───────────▼──────────────────────────▼──────────────────┐
│                  Engine (Bun / Node)                     │
│   Order book · Margin engine · Liquidation logic        │
│   MongoDB (candles/history) · PostgreSQL (state)        │
└─────────────────────────────────────────────────────────┘
```

Three long-running services communicate exclusively through **Redis Streams**, keeping them fully decoupled:

| Service | Role |
|---------|------|
| `apps/frontend` | React SPA — charts, order form, open positions |
| `apps/backend` | REST API — auth, trade routing, balance queries |
| `apps/engine` | Matching engine — order execution, PnL, liquidation |

Shared code lives under `packages/`:

| Package | Contents |
|---------|----------|
| `@repo/db` | Drizzle ORM client + PostgreSQL schema |
| `@repo/redis` | Redis client, pub/sub helpers, stream queue wrappers |
| `@repo/types` | Shared TypeScript types and Zod schemas |
| `@repo/eslint-config` | Shared ESLint rules |
| `@repo/typescript-config` | Shared `tsconfig.json` bases |

---

## Supported Assets

| Symbol | Name |
|--------|------|
| `BTC_USDC_PERP` | Bitcoin |
| `ETH_USDC_PERP` | Ethereum |
| `SOL_USDC_PERP` | Solana |

---

## Prerequisites

| Tool | Version |
|------|---------|
| [Node.js](https://nodejs.org/) | ≥ 20 |
| [pnpm](https://pnpm.io/) | ≥ 9 |
| [Bun](https://bun.sh/) | ≥ 1.0 (used by backend & engine in dev) |
| [Redis](https://redis.io/) | ≥ 7 (local or Docker) |
| PostgreSQL | ≥ 15 (or [Neon](https://neon.tech) serverless) |
| MongoDB | ≥ 7 (local or Atlas) |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-username/exness.git
cd exness
pnpm install
```

### 2. Set up environment variables

Each app requires its own `.env` file. Copy the examples below into the appropriate directories.

#### `apps/backend/.env`

```env
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:5173
HTTP_PORT=3001
API_BASE_URL=http://localhost:3001/api/v1
RESEND_API=re_your_resend_api_key        # https://resend.com
NODE_ENV=development
```

#### `apps/engine/.env`

```env
MONGODB_URL=mongodb://localhost:27017/Exness
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
```

#### `apps/frontend/.env`

```env
VITE_API_BASE_URL=/api/v1
VITE_WS_URL=ws://localhost:8080
VITE_BINANCE_KLINES_API_URL=https://fapi.binance.com/fapi/v1/klines
```

### 3. Push the database schema

```bash
cd packages/db
pnpm db:push
```

### 4. Start all services in development

From the repo root:

```bash
pnpm dev
```

This runs `turbo dev` which starts all three apps in parallel with hot-reload.

To start a single service:

```bash
pnpm --filter backend dev
pnpm --filter frontend dev
pnpm --filter engine dev
```

---

## Environment Variables Reference

### Backend

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection URL |
| `JWT_SECRET` | Secret used to sign magic-link JWTs |
| `CORS_ORIGIN` | Allowed origin for CORS (frontend URL) |
| `HTTP_PORT` | Port for the Express server (default `3001`) |
| `API_BASE_URL` | Base URL used in email magic links |
| `RESEND_API` | API key for [Resend](https://resend.com) email delivery |
| `NODE_ENV` | `development` or `production` |

### Engine

| Variable | Description |
|----------|-------------|
| `MONGODB_URL` | MongoDB connection string (trade history / candles) |
| `REDIS_URL` | Redis connection URL |
| `DATABASE_URL` | PostgreSQL connection string (live user/balance state) |

### Frontend

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API prefix (proxied via Vite in dev) |
| `VITE_WS_URL` | WebSocket URL for real-time price feed |
| `VITE_BINANCE_KLINES_API_URL` | Binance Futures klines endpoint for candlestick data |

---

## API Reference

All routes are prefixed with `/api/v1`.

### Auth

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/email` | Send magic-link sign-in email |
| `GET` | `/auth/signin?token=<jwt>` | Verify magic link and set session cookie |
| `GET` | `/auth/whoami` | Return current user identity |
| `POST` | `/auth/guest` | Create a 24-hour guest session |
| `POST` | `/auth/logout` | Clear session cookie |

### Trade

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/trade/open` | Open a new leveraged position |
| `POST` | `/trade/close` | Close an existing position |
| `GET` | `/trade/open` | Fetch all open orders for current user |

### Balance

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/balance` | Get current USDC balance |

### Assets

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/supportedAssets` | List all tradeable perpetual pairs |

---

## Authentication

Authentication uses **magic links** delivered via [Resend](https://resend.com):

1. User submits their email via `POST /api/v1/auth/email`.
2. The backend creates or retrieves the user in PostgreSQL, signs a JWT containing the user's UUID, and emails the link.
3. Clicking the link hits `GET /api/v1/auth/signin?token=<jwt>`, which sets an `httpOnly` cookie and redirects to `/trade`.

Guest sessions are also supported — a guest UUID is generated server-side, wrapped in a JWT, and stored in a short-lived cookie. Guests start with a virtual balance of **$5,000,000 (4 decimal places)** and can trade immediately without an account.

---

## Database Schema

### `users`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | Auto-generated |
| `email` | `varchar(255)` | Unique |
| `balance` | `integer` | Fixed-point (4 decimals) |
| `decimal` | `integer` | Precision (always `4`) |
| `last_logged_in` | `timestamp` | Nullable |

### `existing_trades`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | Auto-generated |
| `open_price` | `integer` | Fixed-point |
| `leverage` | `integer` | |
| `asset` | `varchar(255)` | Symbol e.g. `BTC_USDC_PERP` |
| `margin` | `integer` | Fixed-point |
| `quantity` | `float8` | |
| `type` | `order_type` enum | `long` \| `short` |
| `close_price` | `integer` | |
| `pnl` | `integer` | Fixed-point |
| `liquidated` | `boolean` | |
| `user_id` | `uuid` FK | References `users.id` |
| `created_at` | `timestamp` | |

Index: `(user_id, created_at)` for efficient trade history queries.

---

## Build

Build all packages and apps:

```bash
pnpm build
```

Build a specific app:

```bash
pnpm --filter backend build
pnpm --filter frontend build
pnpm --filter engine build
```

---

## Tech Stack

### Frontend
- **React 19** + **TypeScript**
- **Vite 7** (bundler)
- **TanStack Query v5** (server state)
- **Zustand** (client state)
- **Lightweight Charts** (TradingView candlestick charts)
- **Tailwind CSS v4**
- **React Router v7**

### Backend
- **Express 5** + **TypeScript**
- **Bun** (dev runtime)
- **Drizzle ORM** (PostgreSQL)
- **jsonwebtoken** (magic-link auth)
- **Resend** (transactional email)
- **express-rate-limit** (guest rate limiting)

### Engine
- **Bun** (dev runtime) / **Node.js** (production)
- **MongoDB** (trade history, candles)
- **Drizzle ORM** (PostgreSQL — live user state)
- **Zod** (input validation)

### Infrastructure
- **Redis Streams** — async communication between backend and engine
- **PostgreSQL** (via [Neon](https://neon.tech)) — persistent user/trade state
- **MongoDB** — time-series trade data
- **Turborepo** — monorepo task orchestration and caching

---

## Project Structure

```
exness/
├── apps/
│   ├── backend/          # Express REST API
│   │   └── src/
│   │       ├── controller/   # authController, tradeController, balanceController
│   │       ├── middleware/   # auth, guest session, error handler, rate limiter
│   │       ├── router/       # Express route definitions
│   │       └── utils/        # Response loop, email, trade error messages
│   ├── engine/           # Matching & margin engine
│   │   └── src/
│   │       ├── engineClass.ts  # Core engine logic
│   │       ├── dbClient.ts     # MongoDB client
│   │       └── utils.ts
│   └── frontend/         # React SPA
│       └── src/
│           ├── components/   # CandlesChart, TradeForm, OpenOrders, QuotesTable
│           └── lib/          # API helpers, balance utilities
├── packages/
│   ├── db/               # Drizzle schema + PostgreSQL client
│   ├── redis/            # Redis client, pub/sub, stream queues
│   ├── types/            # Shared TS types + Zod schemas
│   ├── eslint-config/    # Shared ESLint config
│   ├── typescript-config/ # Shared tsconfig bases
│   └── ui/               # Shared React component stubs
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---
