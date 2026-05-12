FROM node:20-alpine
WORKDIR /app

# Docker is now looking from the ROOT of the repo
COPY package*.json ./
COPY api/package*.json ./api/
COPY packages ./packages

RUN npm install

# Copy the source code relative to the root
COPY api ./api

EXPOSE 3000
CMD ["npx", "tsx", "api/src/server.ts"]
