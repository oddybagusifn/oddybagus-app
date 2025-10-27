# ---------- Build ----------
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV TURBOPACK=0
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build   # pastikan next.config.ts: output: "standalone"

# ---------- Run (standalone) ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Wajib: copy standalone + static + public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
