# 🔄 Architecture Change: RDS → EC2 with PostgreSQL

## Why This Change?

**Problem**: You don't have permissions to create RDS instances in your AWS account.

**Solution**: Use an EC2 instance with PostgreSQL installed instead of managed RDS.

---

## ✅ What Changed

### Before (RDS):
```hcl
resource "aws_db_instance" "postgres" {
  engine         = "postgres"
  engine_version = "16.3"
  instance_class = "db.t3.micro"
  # RDS-managed infrastructure
}
```

### After (EC2 + PostgreSQL):
```hcl
resource "aws_instance" "postgres" {
  ami           = "Amazon Linux 2023"
  instance_type = "t3.micro"
  
  # Auto-installs PostgreSQL on boot
  user_data = <<-EOF
              yum install -y postgresql15-server
              postgresql-setup --initdb
              systemctl start postgresql
              EOF
}
```

---

## 📋 Benefits of EC2 PostgreSQL

✅ **No RDS permissions required** - Only needs EC2 permissions  
✅ **Full control** - Can configure PostgreSQL as needed  
✅ **Cost effective** - Same t3.micro instance  
✅ **Flexible** - Can SSH in and manage directly  
✅ **SSM Support** - Can use AWS Systems Manager for remote access  

---

## 🔧 What's Configured Automatically

### PostgreSQL Installation (via user_data script):

1. **Install PostgreSQL 15**
   ```bash
   yum install -y postgresql15-server postgresql15
   ```

2. **Initialize Database**
   ```bash
   postgresql-setup --initdb
   ```

3. **Configure Remote Access**
   - Listen on all interfaces (not just localhost)
   - Allow connections from VPC (10.0.0.0/16)
   - Enable password authentication (md5)

4. **Set Password**
   ```bash
   ALTER USER postgres WITH PASSWORD 'your_password';
   ```

5. **Create Database**
   ```bash
   createdb agropulse
   ```

6. **Start Service**
   ```bash
   systemctl enable postgresql
   systemctl start postgresql
   ```

---

## 🔐 Security Configuration

### Security Group Rules:

| Port | Protocol | Source | Purpose |
|------|----------|--------|---------|
| 5432 | TCP | 10.0.0.0/16 | PostgreSQL (VPC only) |
| 22 | TCP | 0.0.0.0/0 | SSH access |

### IAM Permissions:
- ✅ AmazonSSMManagedInstanceCore - For Systems Manager access
- ✅ EC2 instance profile for remote management

---

## 🔗 Connection Details

### From ECS Tasks (within VPC):
```
Host: <private-ip>:5432
Database: agropulse
Username: postgres
Password: <your_db_password>
```

### Connection String (used by API):
```
postgres://postgres:PASSWORD@PRIVATE_IP:5432/agropulse
```

---

## 🚀 Deployment Impact

### Terraform Will Now Create:
1. ✅ VPC & Subnets (unchanged)
2. ✅ **EC2 Instance with PostgreSQL** (NEW - replaces RDS)
3. ✅ ElastiCache Redis (unchanged)
4. ✅ ECS Cluster (unchanged)
5. ✅ ECS Services - API & Web (unchanged)

### What's Different:
- ❌ No RDS instance
- ✅ EC2 instance named `agropulse-postgres-db`
- ✅ PostgreSQL 15 auto-installed
- ✅ Database endpoint is now: `<ec2-private-ip>:5432`

---

## 📊 Cost Comparison

| Service | Instance Type | Monthly Cost (approx) |
|---------|--------------|----------------------|
| RDS PostgreSQL | db.t3.micro | ~$15-20 |
| EC2 PostgreSQL | t3.micro | ~$8-10 |
| **Savings** | | **~40-50%** |

---

## 🛠️ Management

### SSH Access (if needed):
```bash
# Get the public IP from Terraform outputs
terraform output db_public_ip

# SSH into the instance
ssh -i your-key.pem ec2-user@<public-ip>
```

### Using AWS Systems Manager (Recommended):
```bash
# No SSH keys needed - use SSM Session Manager
aws ssm start-session --target <instance-id>

# Then access PostgreSQL
sudo -u postgres psql
```

### Check PostgreSQL Status:
```bash
sudo systemctl status postgresql
sudo journalctl -u postgresql -f
```

---

## 🔍 Terraform Outputs

After deployment, you'll see:

```bash
db_endpoint = "10.0.1.50:5432"      # Private IP for ECS
db_public_ip = "54.123.45.67"       # Public IP for management
```

---

## ⚠️ Important Notes

### PostgreSQL Version:
- Using **PostgreSQL 15** (stable, well-supported)
- Not 16.x (packages may not be available in all repos)

### Backups:
- **Manual backups required** (no automated RDS backups)
- Consider setting up:
  - EBS snapshots
  - pg_dump cron jobs
  - S3 backup storage

### High Availability:
- **Single instance** (no multi-AZ like RDS)
- For production, consider:
  - Read replicas
  - Streaming replication
  - Automated failover

### Monitoring:
- Use CloudWatch for EC2 metrics
- Check PostgreSQL logs: `/var/lib/pgsql/data/log/`
- Consider installing pgMonitor or similar

---

## 📝 Maintenance Tasks

### Update PostgreSQL:
```bash
sudo yum update postgresql15-server
sudo systemctl restart postgresql
```

### Backup Database:
```bash
pg_dump -U postgres agropulse > backup_$(date +%Y%m%d).sql
aws s3 cp backup_*.sql s3://your-backup-bucket/
```

### Restore Database:
```bash
psql -U postgres agropulse < backup_file.sql
```

---

## ✅ Testing After Deployment

### 1. Check EC2 Instance:
```bash
aws ec2 describe-instances --filters "Name=tag:Name,Values=agropulse-postgres-db"
```

### 2. Test PostgreSQL Connection:
```bash
# From within VPC (EC2 or ECS task)
psql -h <private-ip> -U postgres -d agropulse
```

### 3. Verify API Can Connect:
- Check ECS task logs
- Look for successful database connections
- Test API health endpoint

---

## 🎯 Next Steps

1. **Commit the changes:**
   ```bash
   git add .
   git commit -m "feat: Replace RDS with EC2 PostgreSQL instance"
   ```

2. **Push to GitHub:**
   ```bash
   git push origin main
   ```

3. **Monitor deployment:**
   - GitHub Actions will run Terraform
   - EC2 instance will be created
   - PostgreSQL will auto-install (takes ~3-5 minutes)
   - ECS services will connect to the new database

4. **Verify everything works:**
   - Check EC2 instance is running
   - Verify PostgreSQL is installed and running
   - Test API database connectivity
   - Check application logs

---

## 🆘 Troubleshooting

### PostgreSQL not starting?
```bash
# SSH into EC2 and check logs
sudo journalctl -u postgresql -n 50
sudo systemctl status postgresql
```

### Can't connect from ECS?
- Check security group allows port 5432 from VPC
- Verify PostgreSQL is listening on all interfaces
- Check pg_hba.conf allows connections

### Database not created?
```bash
# SSH and manually create
sudo -u postgres createdb agropulse
```

---

**Status**: ✅ **EC2 PostgreSQL configuration ready!**  
**Next**: Commit and push to deploy! 🚀
