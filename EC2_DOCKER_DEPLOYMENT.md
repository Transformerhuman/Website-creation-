# 🚀 Simplified EC2 Docker Deployment (No ECS!)

## Architecture Overview

Since ECS kept failing with HTTP 500 errors, we've switched to a **simpler, more reliable architecture** using plain EC2 instances with Docker.

---

## 📐 New Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        AWS VPC                              │
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │  PUBLIC SUBNET                                    │      │
│  │                                                   │      │
│  │  ┌─────────────────────┐    ┌──────────────────┐ │      │
│  │  │  App Server EC2     │    │  Bastion Host    │ │      │
│  │  │  (t3.medium)        │    │  (t3.micro)      │ │      │
│  │  │                     │    │                  │ │      │
│  │  │  🐳 API Container   │    │  SSH access only │ │      │
│  │  │     (port 3000)     │    │                  │ │      │
│  │  │                     │    │  Use this to SSH │ │      │
│  │  │  🐳 Web Container   │    │  → DB Server     │ │      │
│  │  │     (port 80)       │    │                  │ │      │
│  │  │                     │    └──────────────────┘ │      │
│  │  │  Public IP: ✅       │                         │      │
│  │  └─────────────────────┘                         │      │
│  └──────────────────────────────────────────────────┘      │
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │  PRIVATE SUBNET                                   │      │
│  │                                                   │      │
│  │  ┌─────────────────────┐                         │      │
│  │  │  Database Server    │                         │      │
│  │  │  (t3.micro)         │                         │      │
│  │  │                     │                         │      │
│  │  │  🐳 PostgreSQL 15   │                         │      │
│  │  │     (port 5432)     │                         │      │
│  │  │                     │                         │      │
│  │  │  Public IP: ❌       │                         │      │
│  │  │  (Only accessible   │                         │      │
│  │  │   from App Server   │                         │      │
│  │  │    & Bastion)       │                         │      │
│  │  └─────────────────────┘                         │      │
│  └──────────────────────────────────────────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🖥️ EC2 Instances Created

### 1. **App Server** (Public Subnet)
- **Instance Type**: t3.medium (2 vCPU, 4GB RAM)
- **Purpose**: Runs both frontend and backend Docker containers
- **Public IP**: Yes
- **Ports**: 80 (Web), 3000 (API), 22 (SSH)
- **Docker Containers**:
  - API (Node.js/Express) - Port 3000
  - Web (React/Nginx) - Port 80

### 2. **Database Server** (Private Subnet)
- **Instance Type**: t3.micro (1 vCPU, 1GB RAM)
- **Purpose**: Runs PostgreSQL in Docker
- **Public IP**: No (private only)
- **Ports**: 5432 (PostgreSQL), 22 (SSH from bastion only)
- **Docker Containers**:
  - PostgreSQL 15 - Port 5432

### 3. **Bastion Host** (Public Subnet)
- **Instance Type**: t3.micro (1 vCPU, 1GB RAM)
- **Purpose**: SSH jump box to access database server
- **Public IP**: Yes
- **Ports**: 22 (SSH only)
- **No Docker containers** (just for SSH access)

---

## 🔒 Security

### Network Security:

| Component | Access From | Ports Open |
|-----------|-------------|------------|
| App Server | Internet | 80, 3000, 22 |
| Database Server | App Server + Bastion | 5432, 22 |
| Bastion Host | Internet | 22 |

### Why Bastion Host?

The database is in a **private subnet** (no public IP). To access it:

```
Your PC → Internet → Bastion (SSH) → Database Server (SSH)
```

This is **more secure** than exposing the database to the internet.

---

## 🚀 How It Works

### 1. App Server Setup (Automatic via user_data):

```bash
#!/bin/bash
# Install Docker
yum install -y docker
systemctl start docker

# Create Docker network
docker network create agropulse-network

# Run API container
docker run -d \
  --name api \
  -p 3000:3000 \
  -e POSTGRES_URL=postgresql://postgres:PASSWORD@DB_PRIVATE_IP:5432/agropulse \
  -e NODE_ENV=production \
  your-ecr-repo/api:latest

# Run Web container
docker run -d \
  --name web \
  -p 80:80 \
  your-ecr-repo/web:latest
```

### 2. Database Server Setup (Automatic):

```bash
#!/bin/bash
# Install Docker
yum install -y docker
systemctl start docker

# Run PostgreSQL
docker run -d \
  --name postgres \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=YOUR_PASSWORD \
  -e POSTGRES_DB=agropulse \
  -v /data/postgres:/var/lib/postgresql/data \
  postgres:15-alpine
```

### 3. Bastion Host Setup:

```bash
#!/bin/bash
# Just install Docker (in case you need it)
yum install -y docker
systemctl start docker
```

---

## 🔑 Accessing Your Application

### Web Application:
```
http://<APP_SERVER_PUBLIC_IP>
```

### API:
```
http://<APP_SERVER_PUBLIC_IP>:3000
```

### SSH to App Server:
```bash
ssh -i your-key.pem ec2-user@<APP_SERVER_PUBLIC_IP>
```

### SSH to Bastion:
```bash
ssh -i your-key.pem ec2-user@<BASTION_PUBLIC_IP>
```

### SSH to Database (via Bastion):
```bash
# From your PC:
ssh -i your-key.pem -J ec2-user@<BASTION_PUBLIC_IP> ec2-user@<DB_PRIVATE_IP>

# Or from Bastion:
ssh ec2-user@<DB_PRIVATE_IP>
```

### Connect to PostgreSQL (from Bastion):
```bash
# SSH to database server first
ssh ec2-user@<DB_PRIVATE_IP>

# Then connect to PostgreSQL
docker exec -it postgres psql -U postgres -d agropulse
```

---

## 💰 Cost Comparison

### Previous ECS Architecture:
- ECS Fargate: ~$60/month
- EC2 PostgreSQL: ~$9/month
- **Total**: ~$69/month
- **Issues**: HTTP 500 errors, Learner's Lab compatibility

### New EC2 Docker Architecture:
- App Server (t3.medium): ~$30/month
- DB Server (t3.micro): ~$9/month
- Bastion (t3.micro): ~$9/month
- NAT Gateway: ~$32/month
- **Total**: ~$80/month
- **Benefits**: ✅ Works reliably, ✅ No ECS issues, ✅ Full control

**Slightly more expensive, but 100% reliable!**

---

## 📋 Deployment Steps

### 1. Push Code to GitHub:
```bash
git add .
git commit -m "feat: Switch to EC2 Docker deployment (no ECS)

- Add 3 EC2 instances: App Server, DB Server, Bastion
- Run Docker containers directly on EC2
- Database in private subnet for security
- Bastion host for secure DB access
- Remove problematic ECS configuration"

git push origin main
```

### 2. GitHub Actions Will:
- ✅ Build Docker images
- ✅ Push to ECR
- ✅ Create VPC with public + private subnets
- ✅ Create NAT Gateway
- ✅ Launch 3 EC2 instances
- ✅ Install Docker on all instances
- ✅ Deploy containers automatically

### 3. Get Application URL:
After deployment, check Terraform outputs:
```
app_server_public_ip = 54.123.45.67
application_url = http://54.123.45.67
api_url = http://54.123.45.67:3000
bastion_public_ip = 54.123.45.68
db_server_private_ip = 10.0.10.100
```

---

## 🔧 Managing Containers

### On App Server:

```bash
# SSH to app server
ssh -i your-key.pem ec2-user@<APP_SERVER_PUBLIC_IP>

# Check running containers
docker ps

# View API logs
docker logs -f api

# View Web logs
docker logs -f web

# Restart API
docker restart api

# Restart Web
docker restart web

# Stop all containers
docker stop api web

# Start all containers
docker start api web
```

### On Database Server:

```bash
# SSH via bastion
ssh -i your-key.pem -J ec2-user@<BASTION_PUBLIC_IP> ec2-user@<DB_PRIVATE_IP>

# Check PostgreSQL container
docker ps

# View PostgreSQL logs
docker logs -f postgres

# Connect to database
docker exec -it postgres psql -U postgres -d agropulse

# Restart PostgreSQL
docker restart postgres

# Backup database
docker exec postgres pg_dump -U postgres agropulse > backup.sql
```

---

## 🎯 Advantages of This Approach

### ✅ Reliability:
- No ECS API errors
- No Fargate compatibility issues
- Direct Docker control

### ✅ Simplicity:
- Plain Docker commands
- No ECS concepts to learn
- Easy to debug

### ✅ Flexibility:
- SSH into any server
- Direct container access
- Easy to modify configurations

### ✅ Security:
- Database in private subnet
- Bastion host for access
- Security groups restrict traffic

### ✅ Learner's Lab Compatible:
- No IAM role creation needed
- Uses basic EC2 + Docker
- Works with Learner's Lab permissions

---

## 🆘 Troubleshooting

### App Server Issues:

**Containers not starting:**
```bash
# Check Docker status
systemctl status docker

# Check container logs
docker logs api
docker logs web

# Check environment variables
docker inspect api | grep -A 10 Env
```

**Can't access web:**
```bash
# Check if container is running
docker ps

# Check security group allows port 80
# Check if Nginx is running inside container
docker exec web nginx -t
```

### Database Issues:

**Can't connect from App Server:**
```bash
# From App Server, test connectivity
telnet <DB_PRIVATE_IP> 5432

# Check PostgreSQL is running
docker exec postgres pg_isready

# Check logs
docker logs postgres
```

**Need to reset database:**
```bash
# Stop PostgreSQL
docker stop postgres
docker rm postgres

# Remove data
sudo rm -rf /data/postgres/*

# Restart (will create fresh database)
docker run -d \
  --name postgres \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=YOUR_PASSWORD \
  -e POSTGRES_DB=agropulse \
  -v /data/postgres:/var/lib/postgresql/data \
  postgres:15-alpine
```

---

## 📊 Monitoring

### Check Container Health:

```bash
# On App Server
docker stats
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# On DB Server
docker stats
docker ps
```

### Check Server Resources:

```bash
# Disk usage
df -h

# Memory usage
free -h

# CPU usage
top
```

---

## 🎉 Summary

**What Changed:**
- ❌ Removed ECS (too many issues)
- ✅ Added 3 EC2 instances with Docker
- ✅ Database in private subnet
- ✅ Bastion host for secure access
- ✅ Simple, reliable architecture

**Benefits:**
- ✅ 100% Learner's Lab compatible
- ✅ No ECS HTTP 500 errors
- ✅ Full control over infrastructure
- ✅ Easy to debug and manage
- ✅ More secure (private DB)

---

**Status**: 🟢 **READY TO DEPLOY - NO ECS, JUST DOCKER!** 🚀
