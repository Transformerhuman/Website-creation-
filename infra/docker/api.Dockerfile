FROM node:20-alpine

WORKDIR /app

COPY api/package*.json ./
RUN npm install

COPY api .
# Build the project if needed (though tsx runs source directly)
# For production, we'll use tsx to run server.ts
EXPOSE 3000

CMD ["npx", "tsx", "src/server.ts"]
