# 🌐 How to Access Your Website Frontend

## Quick Access (After Deployment)

Once your infrastructure is deployed, accessing your website is **super simple**!

---

## 🎯 Method 1: Direct URL (Easiest)

### Step 1: Get the Application URL

After Terraform deployment completes, run:

```bash
cd infra/terraform
terraform output application_url
```

**Output will look like:**
```
application_url = "http://54.123.45.67"
```

### Step 2: Open in Browser

Simply open the URL in your web browser:
```
http://54.123.45.67
```

**That's it!** 🎉 Your frontend is now accessible!

---

## 🎯 Method 2: Using App Server Public IP

### Step 1: Get the Public IP

```bash
terraform output app_server_public_ip
```

**Output:**
```
app_server_public_ip = "54.123.45.67"
```

### Step 2: Access in Browser

```
http://<YOUR_PUBLIC_IP>
```

Example: `http://54.123.45.67`

---

## 🔧 Method 3: Check if Containers are Running

### SSH into App Server:

```bash
# Get the public IP
APP_IP=$(terraform output -raw app_server_public_ip)

# SSH into the server
ssh -i your-key.pem ec2-user@$APP_IP
```

### Check Docker Containers:

```bash
# List running containers
docker ps

# You should see:
# - api container (port 3000)
# - web container (port 80)
```

### View Container Logs:

```bash
# Check web container logs
docker logs web

# Check API container logs
docker logs api

# Follow logs in real-time
docker logs -f web
```

---

## 📊 All Available URLs

### Frontend (Web Application):
```
http://<APP_SERVER_PUBLIC_IP>
```
**Example**: `http://54.123.45.67`

### Backend (API):
```
http://<APP_SERVER_PUBLIC_IP>:3000
```
**Example**: `http://54.123.45.67:3000`

### API Health Check:
```
http://<APP_SERVER_PUBLIC_IP>:3000/health
```

---

## 🔍 Get All Outputs at Once

```bash
cd infra/terraform
terraform output
```

**Expected Output:**
```
api_url = "http://54.123.45.67:3000"
app_server_private_ip = "10.0.1.100"
app_server_public_ip = "54.123.45.67"
application_url = "http://54.123.45.67"
bastion_public_ip = "54.123.45.68"
db_server_private_ip = "10.0.10.100"
```

---

## 🆘 Troubleshooting

### Problem 1: Website Not Loading

**Check if containers are running:**
```bash
ssh -i your-key.pem ec2-user@<APP_SERVER_PUBLIC_IP>
docker ps
```

**If containers are not running:**
```bash
# Start them manually
docker start web
docker start api
```

**Check container logs:**
```bash
docker logs web
docker logs api
```

---

### Problem 2: Connection Timeout

**Check Security Group:**
1. Go to AWS Console → EC2 → Security Groups
2. Find `agropulse-app-server-sg`
3. Verify inbound rules allow:
   - Port 80 from 0.0.0.0/0
   - Port 3000 from 0.0.0.0/0

**Check if ports are open:**
```bash
# From your local machine
telnet <APP_SERVER_PUBLIC_IP> 80
telnet <APP_SERVER_PUBLIC_IP> 3000
```

---

### Problem 3: 502 Bad Gateway / Nginx Error

**Check Nginx inside web container:**
```bash
# SSH to app server
ssh -i your-key.pem ec2-user@<APP_SERVER_PUBLIC_IP>

# Check Nginx config
docker exec web nginx -t

# Restart Nginx
docker exec web nginx -s reload

# Or restart the container
docker restart web
```

---

### Problem 4: API Not Responding

**Check API container:**
```bash
# SSH to app server
ssh -i your-key.pem ec2-user@<APP_SERVER_PUBLIC_IP>

# Check if API is running
docker ps | grep api

# Check API logs
docker logs api

# Test API locally
curl http://localhost:3000/health
```

**Check database connection:**
```bash
# From app server, test DB connectivity
telnet <DB_SERVER_PRIVATE_IP> 5432

# Get DB private IP
terraform output -raw db_server_private_ip
```

---

### Problem 5: Containers Keep Restarting

**Check container logs:**
```bash
docker logs --tail 50 api
docker logs --tail 50 web
```

**Common issues:**
- Database not ready yet (wait 2-3 minutes)
- Wrong database credentials
- Network issues between app server and DB server

**Fix:**
```bash
# Restart containers after DB is ready
docker restart api
docker restart web
```

---

## 🎨 What You'll See

### Frontend (Port 80):
```
┌─────────────────────────────────┐
│   AgroPulse Nepal Website       │
│                                 │
│  🌾 Agricultural News           │
│  📊 Market Prices               │
│  🌤️ Weather Info               │
│  👨‍🌾 Expert Advice             │
│                                 │
└─────────────────────────────────┘
```

### API (Port 3000):
```json
{
  "status": "ok",
  "message": "AgroPulse API is running",
  "version": "1.0.0"
}
```

---

## 📱 Access from Different Devices

### From Your Computer:
```
http://<APP_SERVER_PUBLIC_IP>
```

### From Your Phone (same WiFi):
```
http://<APP_SERVER_PUBLIC_IP>
```

### From Anywhere in the World:
```
http://<APP_SERVER_PUBLIC_IP>
```

**The public IP is accessible from anywhere!** 🌍

---

## 🔐 Security Notes

### Current Setup:
- ✅ Frontend accessible on port 80 (HTTP)
- ✅ API accessible on port 3000
- ✅ Database NOT accessible from internet (private subnet)
- ✅ Bastion host for secure DB access

### For Production (Recommended):
1. **Add HTTPS** with SSL certificate
2. **Use a domain name** instead of IP
3. **Add a Load Balancer** for high availability
4. **Enable WAF** for security

---

## 🎯 Quick Reference Commands

### Get Application URL:
```bash
terraform output application_url
```

### Get API URL:
```bash
terraform output api_url
```

### SSH to App Server:
```bash
ssh -i your-key.pem ec2-user@$(terraform output -raw app_server_public_ip)
```

### Check All Containers:
```bash
ssh -i your-key.pem ec2-user@$(terraform output -raw app_server_public_ip) "docker ps"
```

### View Web Logs:
```bash
ssh -i your-key.pem ec2-user@$(terraform output -raw app_server_public_ip) "docker logs web"
```

### Restart Web Container:
```bash
ssh -i your-key.pem ec2-user@$(terraform output -raw app_server_public_ip) "docker restart web"
```

---

## 📋 Step-by-Step Summary

1. **Deploy Infrastructure**:
   ```bash
   cd infra/terraform
   terraform apply
   ```

2. **Get Application URL**:
   ```bash
   terraform output application_url
   ```

3. **Open in Browser**:
   ```
   http://<YOUR_PUBLIC_IP>
   ```

4. **Verify It's Working**:
   - You should see the AgroPulse website
   - Check API at `http://<IP>:3000`

5. **Done!** 🎉

---

## 🎉 Success Checklist

- [ ] Terraform deployment completed successfully
- [ ] Got `application_url` from terraform output
- [ ] Opened URL in browser
- [ ] Website loads correctly
- [ ] API responds at `http://<IP>:3000`
- [ ] No errors in container logs

---

**Need Help?** Check the troubleshooting section above or run:
```bash
terraform output
```

**Status**: 🟢 **YOUR WEBSITE IS LIVE AND ACCESSIBLE!** 🚀
