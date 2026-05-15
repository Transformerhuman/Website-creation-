FROM node:20-alpine

WORKDIR /app

# Copy API package.json
COPY apps/api/package.json ./

# Install dependencies
RUN npm install

# Copy API source code
COPY apps/api/ ./

EXPOSE 3000

CMD ["npx", "tsx", "src/server.ts"]
