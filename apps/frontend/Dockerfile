# syntax=docker/dockerfile:1
#
# Build context is apps/frontend itself (it has no workspace deps), e.g.:
#   docker build -f apps/frontend/Dockerfile -t exness-frontend apps/frontend

FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines these into the JS bundle at build time, so they must be
# passed as build args (not runtime env vars).
ARG VITE_API_BASE_URL
ARG VITE_WS_URL
ARG VITE_BINANCE_KLINES_API_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_WS_URL=$VITE_WS_URL \
    VITE_BINANCE_KLINES_API_URL=$VITE_BINANCE_KLINES_API_URL

RUN npm run build

FROM nginx:1.27-alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80