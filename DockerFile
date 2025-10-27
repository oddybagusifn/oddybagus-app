# ------------ Build Stage ------------
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build Next.js untuk mode production (standalone)
RUN npm run build

# ------------ Production Stage ------------
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

# Copy hasil build dan public assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
