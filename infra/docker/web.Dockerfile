# Build stage
FROM node:20-alpine AS build-stage
WORKDIR /app

# Copy manifests first for better layer caching
COPY web/package*.json ./
COPY packages /app/packages

# Install deps (cached unless package.json changes)
RUN npm install

# Copy source last (changes most often)
COPY web .

RUN npm run build

# Production stage
FROM nginx:stable-alpine AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY ./infra/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
