# 🏗️ New Server Architecture - 5 Separate Servers

## Overview

Your application now runs on **5 dedicated EC2 instances**, each with a specific purpose!

---

## 📐 Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                      AWS VPC                             │
│                                                          │
│  PUBLIC SUBNET (Internet Accessible)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Web Server   │  │ API Server   │  │ Bastion Host │  │
│  │ (t3.micro)   │  │ (t3.micro)   │  │ (t3.micro)   │  │
│  │              │  │              │  │              │  │
│  │ 🐳 Nginx     │  │ 🐳 Node.js   │  │ SSH only     │  │
│  │ Port 80      │  │ Port 3000    │  │              │  │
│  │              │  │              │  │              │  │
│  │ Public IP ✅  │  │ Public IP ✅  │  │ Public IP ✅  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  PRIVATE SUBNET (Internal Only)                          │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │ Redis Server │  │ DB Server    │                     │
│  │ (t3.micro)   │  │ (t3.micro)   │                     │
│  │              │  │              │                     │
│  │ 🐳 Redis     │  │ 🐳 Postgre   │                     │
│  │ Port 6379    │  │ Port 5432    │                     │
│  │              │  │              │                     │
│  │ Public IP ❌  │  │ Public IP ❌  │                     │
│  └──────────────┘  └──────────────┘                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🖥️ The 5 Servers

### 1. **Web Server** (Public Subnet)
**Purpose**: Serve the React frontend

**What's Running**:
- 🐳 Nginx container (port 80)
- Static React files

**Access**:
- Public: ✅ Yes
- URL: `http://<WEB_SERVER_PUBLIC_IP>`

**Instance**: t3.micro (1 vCPU, 1GB RAM)

---

### 2. **API Server** (Public Subnet)
**Purpose**: Run the Node.js backend API

**What's Running**:
- 🐳 Node.js/Express container (port 3000)
- Connects to Redis and PostgreSQL

**Access**:
- Public: ✅ Yes
- URL: `http://<API_SERVER_PUBLIC_IP>:3000`

**Instance**: t3.micro (1 vCPU, 1GB RAM)

---

### 3. **Redis Server** (Private Subnet)
**Purpose**: Caching and session storage

**What's Running**:
- 🐳 Redis 7 container (port 6379)
- Persistent data storage

**Access**:
- Public: ❌ No (internal only)
- Accessible from: API Server, Bastion

**Instance**: t3.micro (1 vCPU, 1GB RAM)

---

### 4. **Database Server** (Private Subnet)
**Purpose**: Store application data

**What's Running**:
- 🐳 PostgreSQL 15 container (port 5432)
- Persistent data storage

**Access**:
- Public: ❌ No (internal only)
- Accessible from: API Server, Bastion

**Instance**: t3.micro (1 vCPU, 1GB RAM, 30GB storage)

---

### 5. **Bastion Host** (Public Subnet)
**Purpose**: Secure SSH access to private servers

**What's Running**:
- SSH server only
- No application containers

**Access**:
- Public: ✅ Yes (SSH only, port 22)
- Use to access: Redis Server, Database Server

**Instance**: t3.micro (1 vCPU, 1GB RAM)

---

## 🔗 How They Connect

```
User Request
    ↓
Web Server (Port 80)
    ↓ (API calls)
API Server (Port 3000)
    ↓ (cache queries)
Redis Server (Port 6379)
    ↓ (data queries)
Database Server (Port 5432)
```

### **Access Paths:**

**For Users:**
```
Internet → Web Server → Website
Internet → API Server → API
```

**For Admins (SSH):**
```
Your PC → Bastion → Redis Server
Your PC → Bastion → Database Server
```

---

## 💰 Cost Breakdown

| Server | Instance Type | Monthly Cost |
|--------|---------------|--------------|
| Web Server | t3.micro | ~$9 |
| API Server | t3.micro | ~$9 |
| Redis Server | t3.micro | ~$9 |
| Database Server | t3.micro | ~$9 |
| Bastion Host | t3.micro | ~$9 |
| NAT Gateway | - | ~$32 |
| **Total** | | **~$77/month** |

---

## 🎯 Benefits of This Architecture

### ✅ **Separation of Concerns**
- Each server has ONE job
- Easy to understand and maintain
- Clear responsibility boundaries

### ✅ **Independent Scaling**
- Can scale Web, API, Redis, or DB independently
- Optimize resources per service
- Pay only for what you need

### ✅ **Better Security**
- Redis and DB in private subnet
- Bastion for controlled access
- Security groups restrict traffic

### ✅ **Easier Debugging**
- Isolate issues to specific servers
- Check logs per service
- Restart individual components

### ✅ **Resource Optimization**
- No resource competition
- Each service gets dedicated resources
- Predictable performance

---

## 🔧 Server Management

### **Web Server:**
```bash
# SSH
ssh -i key.pem ec2-user@<WEB_SERVER_IP>

# Check Nginx
docker ps
docker logs web

# Restart
docker restart web
```

### **API Server:**
```bash
# SSH
ssh -i key.pem ec2-user@<API_SERVER_IP>

# Check API
docker ps
docker logs api

# Restart
docker restart api
```

### **Redis Server** (via Bastion):
```bash
# SSH through bastion
ssh -i key.pem -J ec2-user@<BASTION_IP> ec2-user@<REDIS_PRIVATE_IP>

# Check Redis
docker ps
docker exec -it redis redis-cli ping

# View data
docker exec -it redis redis-cli
> KEYS *
```

### **Database Server** (via Bastion):
```bash
# SSH through bastion
ssh -i key.pem -J ec2-user@<BASTION_IP> ec2-user@<DB_PRIVATE_IP>

# Check PostgreSQL
docker ps
docker exec -it postgres psql -U postgres -d agropulse

# Run queries
docker exec -it postgres psql -U postgres -d agropulse -c "SELECT * FROM users;"
```

---

## 📊 After Deployment Outputs

You'll get:

```
application_url = "http://54.123.45.67"         ← Web Server
api_url = "http://54.123.45.68:3000"            ← API Server
web_server_public_ip = "54.123.45.67"           ← Web Server IP
api_server_public_ip = "54.123.45.68"           ← API Server IP
bastion_public_ip = "54.123.45.69"              ← Bastion IP
redis_server_private_ip = "10.0.10.100"         ← Redis (internal)
db_server_private_ip = "10.0.10.101"            ← Database (internal)
```

---

## 🆚 Before vs After

### **Before (Confusing):**
```
3 Servers:
  - App Server (Web + API together)
  - Database Server (PostgreSQL only)
  - Bastion Host
  + ElastiCache Redis (wasted money!)
```

### **After (Clean):**
```
5 Servers:
  - Web Server (Nginx only) ✅
  - API Server (Node.js only) ✅
  - Redis Server (Redis only) ✅
  - Database Server (PostgreSQL only) ✅
  - Bastion Host (SSH only) ✅
  
NO ElastiCache (saved $13/month!) ✅
```

---

## 🎉 Summary

**What Changed:**
- ✅ Removed unused ElastiCache Redis
- ✅ Split App Server into Web + API servers
- ✅ Added dedicated Redis Server on EC2
- ✅ Each server has ONE clear purpose
- ✅ Better security and isolation

**Result:**
- 5 dedicated servers
- Clear architecture
- Proper Redis usage
- No wasted resources
- Easy to manage

---

**Status**: 🟢 **CLEAN 5-SERVER ARCHITECTURE READY!** 🚀
