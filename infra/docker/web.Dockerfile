# Build stage
FROM node:20-alpine AS build-stage
WORKDIR /app

# Copy web app package.json
COPY apps/web/package.json ./

# Install dependencies
RUN npm install

# Copy web app source code
COPY apps/web/ ./

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
