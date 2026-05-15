# Build stage
FROM node:20-alpine AS build-stage
WORKDIR /app

# Copy root configuration
COPY package*.json ./
COPY .npmrc* ./

# Copy web package manifest
COPY packages/web/package*.json ./packages/web/

# Install dependencies
RUN npm ci --only=production || npm install

# Copy source code
COPY packages/web ./packages/web
COPY packages/shared* ./packages/ 2>/dev/null || true

# Build the web application
WORKDIR /app/packages/web
RUN npm run build

# List build output for debugging
RUN ls -la dist/ || ls -la ../dist/ || find /app -name "*.html" -type f

# Production stage
FROM nginx:stable-alpine AS production-stage

# Copy nginx configuration
COPY --chown=nginx:nginx infra/docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts - try different possible locations
COPY --from=build-stage /app/packages/web/dist /usr/share/nginx/html

# Verify files were copied
RUN ls -la /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
