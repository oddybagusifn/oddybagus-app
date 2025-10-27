# ---------- Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Fix umum untuk Next.js/Sharp di Alpine (musl)
RUN apk add --no-cache libc6-compat

ENV NEXT_TELEMETRY_DISABLED=1
ENV TURBOPACK=0

# Install deps
COPY package*.json ./
RUN npm ci

# Copy source & build
COPY . .
# Pastikan next.config.ts berisi:  output: "standalone"
RUN npm run build

# ---------- Run (standalone) ----------
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy hasil build — wajib bawa .next/static agar CSS/JS tidak 404
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
