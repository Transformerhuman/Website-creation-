# 🚀 Post-Deployment Configuration Guide

## 📋 Deployment Outputs

First, get your server IPs from GitHub Actions:

1. Go to **GitHub** → Your Repository → **Actions** tab
2. Click on the latest workflow run
3. Look for the **Terraform Apply** step
4. Copy these values:

```
application_url = "http://YOUR_WEB_SERVER_IP"
api_url = "http://YOUR_API_SERVER_IP:3000"
web_server_public_ip = "XX.XX.XX.XX"
api_server_public_ip = "YY.YY.YY.YY"
bastion_public_ip = "ZZ.ZZ.ZZ.ZZ"
redis_server_private_ip = "10.0.10.XX"
db_server_private_ip = "10.0.10.YY"
```

---

## 🌐 1. Web Server (Public Access)

### **Access:**
```
URL: http://<WEB_SERVER_PUBLIC_IP>
Example: http://54.123.45.67
```

### **SSH Access:**
```bash
ssh -i your-key.pem ec2-user@<WEB_SERVER_PUBLIC_IP>
```

### **Check Status:**
```bash
# Check if Nginx container is running
docker ps

# View logs
docker logs web

# Check Nginx config
docker exec web nginx -t

# Restart if needed
docker restart web
```

### **Verify Website:**
Open in browser: `http://<WEB_SERVER_PUBLIC_IP>`

**Expected**: You should see your AgroPulse React frontend!

---

## 🔌 2. API Server (Public Access)

### **Access:**
```
URL: http://<API_SERVER_PUBLIC_IP>:3000
Example: http://54.123.45.68:3000
```

### **SSH Access:**
```bash
ssh -i your-key.pem ec2-user@<API_SERVER_PUBLIC_IP>
```

### **Check Status:**
```bash
# Check if API container is running
docker ps

# View logs
docker logs api

# Check if API is responding
curl http://localhost:3000

# Test from outside
curl http://<API_SERVER_PUBLIC_IP>:3000

# Restart if needed
docker restart api
```

### **Verify API:**
```bash
# Health check
curl http://<API_SERVER_PUBLIC_IP>:3000/health

# Should return JSON response
```

### **Environment Variables (Already Set):**
```bash
POSTGRES_URL=postgresql://postgres:YOUR_PASSWORD@<DB_PRIVATE_IP>:5432/agropulse
REDIS_URL=redis://<REDIS_PRIVATE_IP>:6379
NODE_ENV=production
```

---

## 💾 3. Redis Server (Private - Internal Only)

### **Access:**
- ❌ **No public access** (security!)
- ✅ Accessible from: API Server, Bastion Host

### **SSH Access (via Bastion):**
```bash
# Jump through bastion
ssh -i your-key.pem -J ec2-user@<BASTION_PUBLIC_IP> ec2-user@<REDIS_PRIVATE_IP>
```

### **Check Status:**
```bash
# SSH to Redis server first (via bastion)
ssh -i your-key.pem -J ec2-user@<BASTION_PUBLIC_IP> ec2-user@<REDIS_PRIVATE_IP>

# Check Redis container
docker ps

# Test Redis connection
docker exec -it redis redis-cli ping
# Should return: PONG

# View Redis logs
docker logs redis

# Access Redis CLI
docker exec -it redis redis-cli

# Inside Redis CLI:
> INFO
> KEYS *
> DBSIZE
> exit
```

### **Redis Configuration:**
```bash
# Check Redis config
docker exec -it redis redis-cli CONFIG GET *

# Important settings:
# - maxmemory: Should be set
# - maxmemory-policy: volatile-lru or allkeys-lru
```

### **Persistent Storage:**
```bash
# Data is saved at:
/data/redis/dump.rdb

# Check if data is persisting
ls -la /data/redis/
```

---

## 🗄️ 4. Database Server (Private - Internal Only)

### **Access:**
- ❌ **No public access** (security!)
- ✅ Accessible from: API Server, Bastion Host

### **SSH Access (via Bastion):**
```bash
# Jump through bastion
ssh -i your-key.pem -J ec2-user@<BASTION_PUBLIC_IP> ec2-user@<DB_PRIVATE_IP>
```

### **Check Status:**
```bash
# SSH to DB server first (via bastion)
ssh -i your-key.pem -J ec2-user@<BASTION_PUBLIC_IP> ec2-user@<DB_PRIVATE_IP>

# Check PostgreSQL container
docker ps

# Check if PostgreSQL is running
docker exec postgres pg_isready

# View logs
docker logs postgres

# Access PostgreSQL
docker exec -it postgres psql -U postgres -d agropulse
```

### **Database Configuration:**
```sql
-- Inside psql:

-- List databases
\l

-- Connect to agropulse database
\c agropulse

-- List tables
\dt

-- Check extensions
\dx

-- Create uuid-ossp extension (if not exists)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Check users
\du

-- Check database size
SELECT pg_size_pretty(pg_database_size('agropulse'));

-- Exit
\q
```

### **Backup Database:**
```bash
# Create backup
docker exec postgres pg_dump -U postgres agropulse > backup_$(date +%Y%m%d).sql

# Restore from backup
cat backup.sql | docker exec -i postgres psql -U postgres agropulse
```

### **Persistent Storage:**
```bash
# Data is saved at:
/data/postgres/

# Check data directory
ls -la /data/postgres/
```

---

## 🔐 5. Bastion Host (Public SSH Access)

### **Access:**
```bash
ssh -i your-key.pem ec2-user@<BASTION_PUBLIC_IP>
```

### **Check Status:**
```bash
# SSH to bastion
ssh -i your-key.pem ec2-user@<BASTION_PUBLIC_IP>

# Check system
uptime
free -h
df -h

# Check Docker (should be installed but not running containers)
docker ps
```

### **Use Bastion to Access Private Servers:**

**To Redis Server:**
```bash
ssh -i your-key.pem -J ec2-user@<BASTION_PUBLIC_IP> ec2-user@<REDIS_PRIVATE_IP>
```

**To Database Server:**
```bash
ssh -i your-key.pem -J ec2-user@<BASTION_PUBLIC_IP> ec2-user@<DB_PRIVATE_IP>
```

---

## 🔧 Configuration Tasks

### **Task 1: Verify All Containers Are Running**

**On each server, run:**
```bash
docker ps
```

**Expected:**
- Web Server: `web` container (Nginx)
- API Server: `api` container (Node.js)
- Redis Server: `redis` container (Redis)
- DB Server: `postgres` container (PostgreSQL)

---

### **Task 2: Test Connectivity Between Servers**

**From API Server:**
```bash
# SSH to API Server
ssh -i your-key.pem ec2-user@<API_SERVER_PUBLIC_IP>

# Test connection to Redis
telnet <REDIS_PRIVATE_IP> 6379

# Test connection to Database
telnet <DB_PRIVATE_IP> 5432

# Should connect successfully (not timeout)
```

---

### **Task 3: Configure API Database Connection**

The API should already be configured, but verify:

```bash
# SSH to API Server
ssh -i your-key.pem ec2-user@<API_SERVER_PUBLIC_IP>

# Check environment variables
docker inspect api | grep -A 10 Env

# Verify connection to database
docker exec api node -e "
  const { Client } = require('pg');
  const client = new Client({
    connectionString: process.env.POSTGRES_URL
  });
  client.connect()
    .then(() => console.log('Connected to PostgreSQL!'))
    .catch(err => console.error('Connection error:', err));
"
```

---

### **Task 4: Set Up Database Schema**

```bash
# SSH to DB Server (via bastion)
ssh -i your-key.pem -J ec2-user@<BASTION_PUBLIC_IP> ec2-user@<DB_PRIVATE_IP>

# Access PostgreSQL
docker exec -it postgres psql -U postgres -d agropulse

# Run your schema setup
\i /path/to/your/schema.sql

# Or run API migrations (if your app has them)
```

---

### **Task 5: Configure Frontend API URL**

If your frontend needs to know the API URL:

```bash
# SSH to Web Server
ssh -i your-key.pem ec2-user@<WEB_SERVER_PUBLIC_IP>

# Check Nginx config
docker exec web cat /etc/nginx/conf.d/default.conf

# If needed, update Nginx to proxy API requests
# Example: Add to Nginx config:
# location /api/ {
#     proxy_pass http://<API_SERVER_PUBLIC_IP>:3000/;
# }
```

---

## 🌍 Make Public Access Work

### **For Web Server (Already Public):**
✅ **Done!** Access at: `http://<WEB_SERVER_PUBLIC_IP>`

### **For API Server (Already Public):**
✅ **Done!** Access at: `http://<API_SERVER_PUBLIC_IP>:3000`

### **Optional: Connect Frontend to API**

If your frontend needs to call the API:

**Option A: Update Frontend Code**
```javascript
// In your React app, set API URL
const API_URL = 'http://<API_SERVER_PUBLIC_IP>:3000';
```

**Option B: Use Nginx Proxy (Recommended)**
```bash
# SSH to Web Server
ssh -i your-key.pem ec2-user@<WEB_SERVER_PUBLIC_IP>

# Create custom Nginx config
cat > nginx-proxy.conf << 'EOF'
server {
    listen 80;
    server_name _;

    # Serve frontend
    location / {
        root /usr/share/nginx/html;
        index index.html;
    }

    # Proxy API requests
    location /api/ {
        proxy_pass http://<API_SERVER_PUBLIC_IP>:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

# Copy to container
docker cp nginx-proxy.conf web:/etc/nginx/conf.d/default.conf

# Restart Nginx
docker restart web
```

Now users can access:
- Frontend: `http://<WEB_SERVER_PUBLIC_IP>`
- API: `http://<WEB_SERVER_PUBLIC_IP>/api/`

---

## 🔍 Monitoring & Maintenance

### **Check All Servers at Once:**

Create a script on your local machine:
```bash
#!/bin/bash
# check-servers.sh

WEB_IP="<WEB_SERVER_PUBLIC_IP>"
API_IP="<API_SERVER_PUBLIC_IP>"
BASTION_IP="<BASTION_PUBLIC_IP>"
REDIS_IP="<REDIS_PRIVATE_IP>"
DB_IP="<DB_PRIVATE_IP>"

echo "=== Web Server ==="
ssh -i your-key.pem ec2-user@$WEB_IP "docker ps"

echo -e "\n=== API Server ==="
ssh -i your-key.pem ec2-user@$API_IP "docker ps && curl -s http://localhost:3000/health"

echo -e "\n=== Redis Server ==="
ssh -i your-key.pem -J ec2-user@$BASTION_IP ec2-user@$REDIS_IP "docker ps && docker exec redis redis-cli ping"

echo -e "\n=== Database Server ==="
ssh -i your-key.pem -J ec2-user@$BASTION_IP ec2-user@$DB_IP "docker ps && docker exec postgres pg_isready"
```

---

## 🎯 Quick Reference

| Server | Public IP | Private IP | Access URL | SSH Command |
|--------|-----------|------------|------------|-------------|
| **Web** | XX.XX.XX.XX | 10.0.1.XX | http://XX.XX.XX.XX | `ssh -i key ec2-user@XX.XX.XX.XX` |
| **API** | YY.YY.YY.YY | 10.0.1.YY | http://YY.YY.YY.YY:3000 | `ssh -i key ec2-user@YY.YY.YY.YY` |
| **Redis** | - | 10.0.10.XX | Internal only | `ssh -i key -J ec2-user@BASTION ec2-user@10.0.10.XX` |
| **DB** | - | 10.0.10.YY | Internal only | `ssh -i key -J ec2-user@BASTION ec2-user@10.0.10.YY` |
| **Bastion** | ZZ.ZZ.ZZ.ZZ | 10.0.1.ZZ | SSH only | `ssh -i key ec2-user@ZZ.ZZ.ZZ.ZZ` |

---

## ✅ Deployment Checklist

- [ ] All 5 servers are running
- [ ] All containers are up (docker ps)
- [ ] Website accessible at http://<WEB_IP>
- [ ] API accessible at http://<API_IP>:3000
- [ ] API can connect to Redis
- [ ] API can connect to PostgreSQL
- [ ] Database schema is set up
- [ ] Frontend can call API
- [ ] Bastion can access private servers
- [ ] Logs are clean (no errors)

---

**Status**: 🟢 **YOUR 5-SERVER ARCHITECTURE IS LIVE!** 🎉
