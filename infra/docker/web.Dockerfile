# Build stage
FROM node:20-alpine as build-stage

WORKDIR /app

COPY web/package*.json ./
RUN npm install

COPY web .
COPY packages /app/packages
RUN npm run build

# Production stage
FROM nginx:stable-alpine as production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY infra/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
