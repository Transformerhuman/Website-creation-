FROM node:20-alpine AS builder

ENV NODE_OPTIONS="--max-old-space-size=4096"

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy web package files
COPY apps/web/package*.json ./apps/web/

# Install dependencies
RUN npm ci --legacy-peer-deps 2>/dev/null || npm install --legacy-peer-deps

# Copy the entire monorepo
COPY . .

# Debug: Check files before build
RUN echo "=== Checking for index.html ===" && \
    if [ -f apps/web/index.html ]; then echo "✅ index.html found"; else echo "❌ index.html missing"; fi

# Build the web app
RUN npm run build --workspace=apps/web

# Debug: Verify build output
RUN echo "=== Checking build output ===" && \
    if [ -d apps/web/dist ]; then \
        echo "✅ dist directory exists"; \
        ls -la apps/web/dist/; \
        if [ -f apps/web/dist/index.html ]; then echo "✅ index.html built successfully"; \
        else echo "❌ index.html not found in dist"; fi \
    else \
        echo "❌ dist directory not found"; \
        exit 1; \
    fi

# Production stage
FROM nginx:stable-alpine

# Copy built assets
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copy nginx config
COPY infra/docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Debug: Verify files in nginx
RUN echo "=== Files in nginx html directory ===" && \
    ls -la /usr/share/nginx/html/ && \
    if [ -f /usr/share/nginx/html/index.html ]; then echo "✅ index.html deployed successfully"; \
    else echo "❌ index.html missing in nginx"; fi

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
