  # Full-Stack Deployment Guide: AgroPulse Nepal
  
  This guide provides a comprehensive strategy for deploying AgroPulse Nepal to your local machine or a production server.
  
  ---
  
  ## 1. Project Restructuring
  The project has been separated into two main directories:
  - **backend/**: Contains the Express server, PostgreSQL connection (Knex), and Redis integration.
  - **frontend/**: Contains the React-Vite application and Nginx configuration for serving the static files.
  
  ---
  
  ## 2. Docker Orchestration
  Use the root `docker-compose.yml` to spin up the entire stack:
  ```bash
  docker-compose up --build -d
  ```
  
  ### Services in Compose:
  - **db**: PostgreSQL 16 (Port 5432)
  - **redis**: Redis 7 (Port 6379)
  - **backend**: Express API (Port 3000)
  - **frontend**: Nginx serving React (Port 8080)
  
  ---
  
  ## 3. Local Development Setup
  To run without Docker locally:
  
  ### Backend:
  1. `cd backend`
  2. `npm install`
  3. Create `.env` from `../.env.example`
  4. `npm run dev`
  
  ### Frontend:
  1. `cd frontend`
  2. `npm install`
  3. `npm run dev`
  
  ---
  
  ## 4. Environment Configuration
  Refer to `.env.example` in the root. Ensure `DB_HOST` and `REDIS_URL` are set correctly depending on whether you are running inside or outside of Docker.


---

## 3. CI/CD Pipeline (GitHub Actions)

A conceptual workflow for automating the build and deployment process.

### Workflow Stages:
1.  **Lint & Test**: Ensure code quality before building.
2.  **Build Images**: Build Docker images for frontend and backend.
3.  **Push to Registry**: Push images to a private registry (e.g., Harbor, GitLab Registry, or AWS ECR).
4.  **Deploy**: SSH into the local datacenter server and trigger a pull/restart.

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install & Test
        run: |
          npm ci
          npm test

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Login to Private Registry
        uses: docker/login-action@v3
        with:
          registry: registry.local.datacenter
          username: ${{ secrets.REGISTRY_USER }}
          password: ${{ secrets.REGISTRY_PASS }}
      
      - name: Build and Push Backend
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: registry.local.datacenter/myapp-backend:latest

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_IP }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/myapp
            docker-compose pull
            docker-compose up -d
```

---

## 4. Deployment Strategy in Local Datacenter

### Networking & Reverse Proxy
In a production environment, you should never expose your Node.js or React containers directly to the internet. Use **Nginx** as a Reverse Proxy.

-   **Routing**: Nginx handles incoming traffic on port 80/443 and routes `/api` to the backend and `/` to the frontend.
-   **UI/UX Documentation**: Access the design system and documentation at `http://your-domain/ui-ux/`.
-   **SSL/TLS**: Use Certbot (Let's Encrypt) to handle SSL termination at the Nginx level.
-   **Load Balancing**: If you scale to multiple backend instances, Nginx can distribute traffic among them.

### Environment Variables
-   **Secrets**: Use a `.env` file on the server (never commit this to Git).
-   **Management**: For more complex setups, consider **HashiCorp Vault** or Docker Secrets.

---

## 5. Database Management Best Practices

### Persistence
Always use **Docker Volumes** to ensure data persists even if the container is deleted or updated.

### Backups
-   **MongoDB**: Use `mongodump` via a cron job to create periodic backups.
-   **PostgreSQL**: Use `pg_dump`.
-   **Offsite Storage**: Sync backups to a separate physical server or S/S3-compatible storage.

### Monitoring
-   Use **Prometheus** and **Grafana** to monitor database performance (CPU, Memory, Disk I/O).
-   Enable slow query logging to identify performance bottlenecks.

### Security
-   **Internal Network**: Keep the database on a private Docker network, inaccessible from the outside world.
-   **Authentication**: Always enable strong password authentication and avoid using default users like `admin` or `postgres` for application access.
