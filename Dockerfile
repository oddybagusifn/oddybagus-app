# --- Build tahap Next export ---
FROM node:20-bullseye-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./
RUN npm ci

COPY . .
# menghasilkan folder out/
RUN npm run build

# --- Run tahap Nginx (serve file statis) ---
FROM nginx:stable-alpine
# Nginx conf simpel + SPA fallback ke index.html
RUN printf 'server {\n\
  listen 80;\n\
  server_name _;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
  location /_next/static/ {\n\
    add_header Cache-Control "public, max-age=31536000, immutable";\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

COPY --from=builder /app/out /usr/share/nginx/html
EXPOSE 80
