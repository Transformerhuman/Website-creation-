# Build stage
FROM node:20-alpine AS build-stage
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/web/package*.json ./packages/web/

# Install dependencies
RUN npm install

# Copy the entire monorepo
COPY . .

# Build only the web package
WORKDIR /app/packages/web
RUN npm run build

# Production stage
FROM nginx:stable-alpine AS production-stage
# Copy the built files (adjust path based on your build output)
COPY --from=build-stage /app/packages/web/dist /usr/share/nginx/html
# Or if building from root outputs to /app/dist
# COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY --chown=nginx:nginx /app/infra/docker/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
