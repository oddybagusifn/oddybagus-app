# ---------- Build ----------
FROM node:20-bullseye-slim AS builder
WORKDIR /app

# paket dasar
RUN apt-get update -y && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# MATIKAN telemetry & Turbopack di build prod
ENV NEXT_TELEMETRY_DISABLED=1
ENV TURBOPACK=0

# deps
COPY package*.json ./
RUN npm ci

# source & build
COPY . .
# pastikan next.config.ts: output: "standalone"
RUN npm run build

# ---------- Run (standalone) ----------
FROM node:20-bullseye-slim
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# hasil build — WAJIB sertakan .next/static agar CSS/JS tidak 404
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
