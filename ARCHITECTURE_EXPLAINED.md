# 🏗️ Infrastructure Architecture Explained

## Why Multiple EC2 Instances?

Your AgroPulse application runs on **3 EC2 instances**, each with a specific purpose:

---

## 📐 Current Architecture (After Fix)

```
┌─────────────────────────────────────────────────────┐
│                  AWS VPC                            │
│                                                     │
│  PUBLIC SUBNET                                      │
│  ┌─────────────────────┐    ┌──────────────────┐  │
│  │  App Server         │    │  Bastion Host    │  │
│  │  (t3.medium)        │    │  (t3.micro)      │  │
│  │                     │    │                  │  │
│  │  🐳 API Container   │    │  SSH access only │  │
│  │  🐳 Web Container   │    │  (No database!)  │  │
│  │                     │    │                  │  │
│  └─────────────────────┘    └──────────────────┘  │
│                                                     │
│  PRIVATE SUBNET                                     │
│  ┌─────────────────────┐                           │
│  │  Database Server    │                           │
│  │  (t3.micro)         │                           │
│  │                     │                           │
│  │  🐳 PostgreSQL 15   │                           │
│  │  (Only DB here!)    │                           │
│  │                     │                           │
│  └─────────────────────┘                           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🖥️ The 3 EC2 Instances

### 1. **App Server** (Public Subnet)
**Purpose**: Run your application containers

**What's Running**:
- 🐳 **API Container** (Node.js/Express) - Port 3000
- 🐳 **Web Container** (React/Nginx) - Port 80

**Why Separate?**:
- ✅ Needs public IP for internet access
- ✅ Handles user traffic
- ✅ Runs application code
- ✅ Easy to scale independently

**Instance Type**: t3.medium (2 vCPU, 4GB RAM)

---

### 2. **Database Server** (Private Subnet)
**Purpose**: Run PostgreSQL database

**What's Running**:
- 🐳 **PostgreSQL 15** in Docker - Port 5432

**Why Separate?**:
- ✅ **Security**: No public IP, can't be accessed from internet
- ✅ **Isolation**: Database runs in private subnet
- ✅ **Protection**: Only accessible from App Server and Bastion
- ✅ **Performance**: Dedicated resources for database

**Instance Type**: t3.micro (1 vCPU, 1GB RAM)

---

### 3. **Bastion Host** (Public Subnet)
**Purpose**: Secure SSH access to private resources

**What's Running**:
- 🔐 **SSH Server** only (no applications)

**Why Have It?**:
- ✅ **Secure Access**: Jump box to reach private database
- ✅ **No Direct DB Access**: Database not exposed to internet
- ✅ **Audit Trail**: All DB access goes through bastion
- ✅ **Best Practice**: Industry standard for security

**Instance Type**: t3.micro (1 vCPU, 1GB RAM)

---

## 🔴 **FIXED: Removed Duplicate Database!**

### **Before (WRONG)**:
```
EC2 #1: App Server (API + Web)
EC2 #2: Database Server (PostgreSQL in Docker) ← From docker_deployment module
EC2 #3: Bastion Host
EC2 #4: PostgreSQL DB (PostgreSQL on OS) ← From rds module (DUPLICATE!)
```

**Problem**: Two separate databases running, wasting money!

---

### **After (CORRECT)**:
```
EC2 #1: App Server (API + Web)
EC2 #2: Database Server (PostgreSQL in Docker) ← ONLY ONE!
EC2 #3: Bastion Host
```

**Solution**: Removed the duplicate `rds` module!

---

## 💰 Cost Savings

### Before (With Duplicate):
- App Server (t3.medium): ~$30/month
- DB Server (t3.micro): ~$9/month
- Bastion (t3.micro): ~$9/month
- **Duplicate DB (t3.micro): ~$9/month** ← WASTED!
- **Total: ~$57/month**

### After (Fixed):
- App Server (t3.medium): ~$30/month
- DB Server (t3.micro): ~$9/month
- Bastion (t3.micro): ~$9/month
- **Total: ~$48/month**

**Savings**: $9/month (16% cheaper!)

---

## 🎯 Why This Architecture?

### **Security Benefits**:
1. ✅ Database in private subnet (no internet access)
2. ✅ Bastion host for controlled access
3. ✅ Security groups restrict traffic
4. ✅ Separation of concerns

### **Performance Benefits**:
1. ✅ Dedicated database server
2. ✅ No resource competition
3. ✅ Easy to monitor and scale
4. ✅ Independent backup strategies

### **Maintenance Benefits**:
1. ✅ Can update app without touching database
2. ✅ Can backup database independently
3. ✅ Clear separation makes debugging easier
4. ✅ Easy to replace individual components

---

## 🔗 How They Connect

```
User Internet Request
        ↓
   App Server (Public IP)
        ↓
   Web Container (Port 80)
        ↓
   API Container (Port 3000)
        ↓
   Database Server (Private IP: 10.0.10.x)
        ↓
   PostgreSQL (Port 5432)
```

**Access Path to Database**:
```
Option 1 (App):  App Server → Database Server (automatic)
Option 2 (Admin): Your PC → Bastion → Database Server (SSH)
```

---

## 📊 Resource Allocation

| Instance | CPU | RAM | Storage | Purpose |
|----------|-----|-----|---------|---------|
| App Server | 2 vCPU | 4 GB | 30 GB | Run API + Web |
| DB Server | 1 vCPU | 1 GB | 30 GB | Run PostgreSQL |
| Bastion | 1 vCPU | 1 GB | 10 GB | SSH access only |

**Total Resources**:
- CPU: 4 vCPU
- RAM: 6 GB
- Storage: 70 GB

---

## 🚀 What Changed

### **File Modified**: `infra/terraform/main.tf`

**Before**:
```hcl
module "rds" {  # ❌ Creates duplicate database
  source = "./modules/rds"
  # ...
}

module "docker_deployment" {  # ✅ Also creates database
  source = "./modules/docker"
  # ...
}
```

**After**:
```hcl
# module "rds" {  # ❌ COMMENTED OUT
#   source = "./modules/rds"
# }

module "docker_deployment" {  # ✅ Only database now
  source = "./modules/docker"
}
```

---

## ✅ Verification

After deploying, you should see **only ONE database server**:

```bash
# Check EC2 instances in AWS Console
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=agropulse-*" \
  --query 'Reservations[].Instances[].Tags[?Key==`Name`].Value'
```

**Expected Output**:
```
[
  "agropulse-app-server",
  "agropulse-db-server",      ← Only ONE database!
  "agropulse-bastion"
]
```

**NOT** (old duplicate):
```
[
  "agropulse-app-server",
  "agropulse-db-server",      ← From docker module
  "agropulse-bastion",
  "agropulse-postgres-db"     ← ❌ DUPLICATE (removed)
]
```

---

## 🎉 Summary

### **You Now Have**:
- ✅ 1 App Server (runs your application)
- ✅ 1 Database Server (runs PostgreSQL in Docker)
- ✅ 1 Bastion Host (secure SSH access)
- ✅ **NO duplicates!**

### **Benefits**:
- ✅ Saves $9/month
- ✅ Simpler architecture
- ✅ Less confusion
- ✅ Easier to manage

---

**Status**: 🟢 **DUPLICATE DATABASE REMOVED - CLEAN ARCHITECTURE!** 🚀
