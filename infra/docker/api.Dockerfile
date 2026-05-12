FROM node:20-alpine

WORKDIR /app

# Adjust these paths based on your actual structure
COPY backend/api/package*.json ./
RUN npm install

COPY backend/api .
COPY shared/packages /app/packages

EXPOSE 3000

CMD ["npx", "tsx", "src/server.ts"]
