# ---------- Build ----------
FROM node:20-bullseye-slim AS builder
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
ENV NEXT_TELEMETRY_DISABLED=1
ENV TURBOPACK=0

COPY package*.json ./
RUN npm ci
COPY . .
# pastikan next.config.ts: output: "standalone", eslint/TS ignore sementara
RUN npm run build

# ---------- Run (standalone) ----------
FROM node:20-bullseye-slim
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
