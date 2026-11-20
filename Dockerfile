# Stage 1: Build Frontend (React 19 + Vite + Tailwind)
FROM --platform=$BUILDPLATFORM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install --no-audit --no-fund

COPY frontend/tsconfig.json frontend/vite.config.ts frontend/tailwind.config.js frontend/postcss.config.js frontend/index.html ./
COPY frontend/src ./src/
RUN npm run build

# Stage 2: Build Backend (Fastify + Drizzle ORM + TypeScript)
FROM --platform=$BUILDPLATFORM node:20-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install --no-audit --no-fund

COPY backend/tsconfig.json ./
COPY backend/src ./src/
RUN npm run build

# Stage 3: Install pure-JS Backend production dependencies
FROM --platform=$BUILDPLATFORM node:20-alpine AS backend-prod-deps
WORKDIR /app/backend

COPY backend/package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install --omit=dev --no-optional --no-audit --no-fund

# Stage 4: Unified Production Runner (Nginx + Node 20)
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache nginx openssl

COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html
COPY --from=backend-builder /app/backend/package*.json ./backend/
COPY --from=backend-prod-deps /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/dist ./backend/dist

COPY deploy/nginx-unified.conf /etc/nginx/http.d/default.conf
COPY deploy/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 80

ENV NODE_ENV=production
ENV PORT=5000

CMD ["/app/entrypoint.sh"]
