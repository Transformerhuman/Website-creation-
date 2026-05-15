# Build stage
FROM node:20-alpine AS build-stage
WORKDIR /app

# Copy manifests first for better layer caching
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

# Install dependencies
RUN npm install

# Copy source code (only web app)
COPY apps/web .

# Build the web application
RUN npm run build --workspace=apps/web

# Production stage
FROM nginx:stable-alpine AS production-stage

# Copy nginx configuration
COPY infra/docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage
COPY --from=build-stage /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
