# ---------- Build ----------
FROM node:20-bullseye-slim AS builder
WORKDIR /app

RUN apt-get update -y && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# 🔥 Matikan Turbopack & Telemetry
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_DISABLE_TURBOPACK=1
ENV NEXT_TURBOPACK=0
ENV TURBOPACK=0

COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# ========== SANITY CHECKS (sementara, untuk menemukan error build) ==========
RUN echo "=== SANITY: grep next/document ===" \
 && (grep -RIn --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next -E "from ['\"]next/document['\"]" . || true) \
 && echo "=== SANITY: grep Html/Head/Main/NextScript ===" \
 && (grep -RIn --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next -E "<Html|<Head|<Main|<NextScript" . || true) \
 && echo "=== SANITY: list pages dirs (case-insensitive) ===" \
 && (find . -type d \( -iname "pages" -o -iname "src/pages" -o -iname "*document*" \) -print -exec find {} -maxdepth 2 -type f -print \; || true) \
 && echo "=== SANITY: app dir listing ===" \
 && (ls -la app || true) \
 && echo "=== SANITY: not-found presence ===" \
 && (test -f app/not-found.tsx && echo "app/not-found.tsx present" || echo "app/not-found.tsx MISSING")

# 🔥 Build Next.js menggunakan Webpack, bukan Turbopack
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
