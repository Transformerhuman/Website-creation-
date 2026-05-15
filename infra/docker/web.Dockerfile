# Build stage
FROM node:20-alpine AS build-stage
WORKDIR /app

# Copy manifests first for better layer caching
COPY package*.json ./
COPY packages/web/package*.json ./packages/web/

# Copy packages directory (will be empty if no shared packages exist)
COPY packages /app/packages

# Install dependencies
RUN npm install

# Copy source code (only web app)
COPY packages/web .

# Build the web application
RUN npm run build

# Production stage
FROM nginx:stable-alpine AS production-stage

# Copy nginx configuration
COPY infra/docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
