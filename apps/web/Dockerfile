FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
RUN npm install

COPY . .
RUN npm run build --workspace=apps/web

FROM nginx:stable-alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY infra/docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
