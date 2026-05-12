FROM node:20-alpine

WORKDIR /app

# If your API code is in the root directory
COPY package*.json ./
RUN npm install

COPY . .

# OR if your API code is in a subdirectory called 'api'
# COPY api/package*.json ./
# RUN npm install
# COPY api .

EXPOSE 3000

CMD ["npx", "tsx", "src/server.ts"]
