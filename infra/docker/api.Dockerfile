FROM node:20-alpine

WORKDIR /app

# 1. Copy root workspace configs (if using npm/pnpm/yarn workspaces)
COPY package*.json ./

# 2. Copy the api package files
COPY api/package*.json ./api/

# 3. Copy the shared packages
COPY packages ./packages

# 4. Install dependencies from the root 
# (This handles workspace hoisting correctly)
RUN npm install

# 5. Copy the rest of the API source code
COPY api ./api

EXPOSE 3000

# 6. Adjust your CMD to point to the correct path
CMD ["npx", "tsx", "api/src/server.ts"]
