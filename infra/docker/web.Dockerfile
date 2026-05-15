# Build stage
FROM node:20-alpine AS build-stage
WORKDIR /app

# Copy root package files if using workspaces
COPY package*.json ./
COPY packages/web/package*.json ./packages/web/

# Copy packages
COPY packages /app/packages

# Install deps (cached unless package.json changes)
RUN npm install

# Copy source last (changes most often)
COPY packages/web .

# Set working directory to the web package
WORKDIR /app/packages/web
RUN npm run build

# Production stage
FROM nginx:stable-alpine AS production-stage
# Adjust the dist path based on your build output
COPY --from=build-stage /app/packages/web/dist /usr/share/nginx/html
# OR if build output goes to /app/dist
# COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY --chown=nginx:nginx infra/docker/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
