# 🔑 SSH Key Configuration Guide

## ✅ What You Did Right:

You created a `.pem` key in AWS EC2 Console - that's the first step!

---

## 🎯 What Needs to Be Done:

### **Step 1: Note Your Key Pair Name**

When you created the key pair in AWS, it has a **name**. Find it:

1. Go to **AWS Console** → EC2
2. Click **Key Pairs** (left sidebar)
3. Note the **Name** of your key pair (e.g., `agropulse-key`, `my-key`, etc.)

**Example**: `agropulse-key-pair`

---

### **Step 2: Add SSH Key Name to GitHub Secrets**

1. Go to your **GitHub repository**
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add this secret:

```
Name: SSH_KEY_NAME
Value: <YOUR_KEY_PAIR_NAME>  (e.g., agropulse-key-pair)
```

5. Click **Add secret**

---

### **Step 3: Download Your .pem File**

If you haven't already:

1. When you created the key pair in AWS, you should have downloaded a `.pem` file
2. **Save it securely** - you'll need it for SSH access
3. Example filename: `agropulse-key-pair.pem`

**If you lost it**: You'll need to create a new key pair in AWS EC2 Console

---

### **Step 4: Set Permissions on .pem File (Linux/Mac)**

```bash
# Move to a secure location
mv ~/Downloads/your-key.pem ~/.ssh/

# Set correct permissions (CRITICAL!)
chmod 400 ~/.ssh/your-key.pem
```

**Windows**: Keep the `.pem` file in a safe location, you'll use it with PuTTY or Git Bash

---

### **Step 5: Re-deploy with SSH Key**

Push the updated Terraform code:

```bash
cd d:\Deployment_ready_agropulse\Website-creation-

git add .
git commit -m "feat: Add SSH key pair configuration to all EC2 instances

- Add ssh_key_name variable to all modules
- Configure all 5 servers with SSH key access
- Enable secure SSH login to all instances"

git push origin main
```

GitHub Actions will now deploy with SSH key configured!

---

## 🔧 After Deployment: SSH Access

### **Get Server IPs:**

From GitHub Actions output logs:
```
web_server_public_ip = "54.123.45.67"
api_server_public_ip = "54.123.45.68"
bastion_public_ip = "54.123.45.69"
redis_server_private_ip = "10.0.10.100"
db_server_private_ip = "10.0.10.101"
```

---

### **SSH Commands:**

#### **1. Web Server:**
```bash
ssh -i ~/.ssh/your-key.pem ec2-user@54.123.45.67
```

**Windows (Git Bash):**
```bash
ssh -i /c/path/to/your-key.pem ec2-user@54.123.45.67
```

#### **2. API Server:**
```bash
ssh -i ~/.ssh/your-key.pem ec2-user@54.123.45.68
```

#### **3. Bastion Host:**
```bash
ssh -i ~/.ssh/your-key.pem ec2-user@54.123.45.69
```

#### **4. Redis Server (via Bastion):**
```bash
ssh -i ~/.ssh/your-key.pem -J ec2-user@54.123.45.69 ec2-user@10.0.10.100
```

#### **5. Database Server (via Bastion):**
```bash
ssh -i ~/.ssh/your-key.pem -J ec2-user@54.123.45.69 ec2-user@10.0.10.101
```

---

## 🆘 Troubleshooting

### **Error: "Permission denied (publickey)"**

**Cause**: Wrong key file or wrong permissions

**Fix:**
```bash
# Check permissions (should be 400)
ls -la your-key.pem

# Fix permissions
chmod 400 your-key.pem

# Make sure you're using the correct key
ssh -v -i your-key.pem ec2-user@<IP>  # Verbose mode
```

---

### **Error: "Key pair not found"**

**Cause**: Key pair name in GitHub secret doesn't match AWS

**Fix:**
1. Check AWS Console → EC2 → Key Pairs
2. Verify the exact name
3. Update GitHub secret `SSH_KEY_NAME`
4. Re-deploy

---

### **Error: "Connection timed out"**

**Cause**: Security group not allowing SSH (port 22)

**Fix:**
- Security groups should already allow SSH (we configured this)
- Check AWS Console → EC2 → Security Groups
- Verify port 22 is open for each server

---

## 📋 Quick Checklist

- [ ] Created key pair in AWS EC2 Console
- [ ] Downloaded `.pem` file
- [ ] Noted the key pair name
- [ ] Added `SSH_KEY_NAME` secret to GitHub
- [ ] Pushed updated Terraform code
- [ ] Waited for deployment to complete
- [ ] Tested SSH access to servers
- [ ] Saved `.pem` file securely

---

## 🔐 Security Best Practices

### **DO:**
✅ Keep `.pem` file secure and private  
✅ Set permissions to `400` (read-only for owner)  
✅ Use bastion host to access private servers  
✅ Don't share the `.pem` file  
✅ Backup the `.pem` file securely  

### **DON'T:**
❌ Commit `.pem` file to Git  
❌ Share via email or chat  
❌ Store in public locations  
❌ Use weak file permissions  
❌ Lose the file (can't recover!)  

---

## 🎯 What Changed in Terraform

### **Added to All EC2 Instances:**
```hcl
key_name = var.ssh_key_name
```

### **Variables Added:**
1. Root `variables.tf`: `ssh_key_name`
2. Docker module: `ssh_key_name`
3. EC2 instance module: `key_name`

### **All 5 Servers Now Have:**
- Web Server: SSH key configured ✅
- API Server: SSH key configured ✅
- Redis Server: SSH key configured ✅
- Database Server: SSH key configured ✅
- Bastion Host: SSH key configured ✅

---

## 🚀 Summary

**What you need to do:**
1. ✅ Find your key pair name from AWS
2. ✅ Add `SSH_KEY_NAME` secret to GitHub
3. ✅ Push the code (I've already fixed Terraform)
4. ✅ Wait for deployment
5. ✅ SSH to servers using your `.pem` file

---

**Status**: 🟢 **SSH KEY SUPPORT ADDED - JUST ADD GITHUB SECRET AND DEPLOY!** 🔑
