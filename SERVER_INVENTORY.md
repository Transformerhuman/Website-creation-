# 🔍 Server Inventory - What's Actually Running

## Current Infrastructure (What Gets Created)

When you deploy, you're creating **MORE servers than you need**!

---

## 📊 What You're Deploying:

### ✅ **From `docker_deployment` module:**

1. **App Server** (t3.medium) - Public Subnet
   - 🐳 API Container (port 3000)
   - 🐳 Web Container (port 80)

2. **Database Server** (t3.micro) - Private Subnet
   - 🐳 PostgreSQL 15 (port 5432)
   - ❌ NO Redis running here!

3. **Bastion Host** (t3.micro) - Public Subnet
   - SSH access only

### ⚠️ **From `redis` module (STILL ACTIVE):**

4. **ElastiCache Redis Cluster** (cache.t3.micro)
   - Managed Redis service
   - ❌ **NOT BEING USED** by your app!

---

## 🔴 **The Problem:**

### **Your API is configured to connect to:**
```hcl
# In docker/main.tf line 179:
-e REDIS_URL=redis://${module.db_server.private_ip}:6379
```

**This means:** Your app expects Redis to be on the **Database Server** at port 6379

### **But:**
- Database Server only runs **PostgreSQL** (port 5432)
- **Redis is NOT installed** on the Database Server
- You have a **separate ElastiCache Redis** cluster that costs money but isn't used!

---

## 💰 **Wasted Resources:**

| Resource | Purpose | Being Used? | Monthly Cost |
|----------|---------|-------------|--------------|
| ElastiCache Redis | Cache layer | ❌ NO | ~$13/month |
| Redis config in API | Points to wrong server | ❌ NO | N/A |

**You're wasting ~$13/month on unused Redis!**

---

## ✅ **Solutions:**

### **Option 1: Remove Redis Completely** (Recommended for now)

If your app doesn't need Redis/caching yet:

1. **Comment out the redis module**
2. **Remove REDIS_URL from API environment**
3. **Save $13/month**

### **Option 2: Actually Use Redis**

If you want Redis:

1. **Install Redis on Database Server** (alongside PostgreSQL)
2. **OR** point API to ElastiCache Redis endpoint
3. **Use the Redis you're paying for**

---

## 🎯 **Recommendation:**

**For now, remove Redis** because:
- ✅ Your app probably doesn't need it yet
- ✅ Simpler architecture
- ✅ Saves money ($13/month)
- ✅ Less complexity

**Add Redis later** when you actually need caching.

---

## 🔧 **What Should Be Fixed:**

### **Current (Confusing):**
```
3 EC2 Instances:
  - App Server (API + Web)
  - Database Server (PostgreSQL only)
  - Bastion Host
  
1 ElastiCache Redis (NOT USED!) ❌
```

### **Recommended (Simple):**
```
3 EC2 Instances:
  - App Server (API + Web)
  - Database Server (PostgreSQL only)
  - Bastion Host
  
NO ElastiCache (save money!) ✅
```

---

## 📋 **Server Purpose Summary:**

| Server | What It Does | Needed? |
|--------|--------------|---------|
| **App Server** | Runs your website | ✅ YES |
| **Database Server** | Stores your data | ✅ YES |
| **Bastion Host** | Secure SSH access | ✅ YES (optional) |
| **ElastiCache Redis** | Caching layer | ❌ NO (not used) |

---

**Bottom Line**: You have **4 resources** but only need **3**. The 4th one (Redis) is wasted money!
