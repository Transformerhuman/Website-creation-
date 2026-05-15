FROM node:20-alpine AS build-stage
WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy web app from apps directory (NOT packages)
COPY apps/web/package*.json ./apps/web/

# Copy packages directory if it exists (optional)
COPY packages /app/packages 2>/dev/null || true

# Install dependencies
RUN npm install

# Copy web app source code
COPY apps/web .

# Build the web application
RUN npm run build

# Production stage
FROM nginx:stable-alpine AS production-stage

# Copy nginx configuration
COPY infra/docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
