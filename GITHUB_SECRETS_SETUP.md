# 🔧 GitHub Secrets Setup Guide for AWS Deployment

## ❌ Current Error

```
Error: Invalid Value
on -backend-config=... line 1:
The value cannot be empty or all whitespace
```

**Root Cause**: The `TERRAFORM_STATE_BUCKET` GitHub Secret is not configured or is empty.

---

## ✅ Step-by-Step Fix

### Step 1: Create S3 Bucket for Terraform State

Terraform needs a place to store the state file.

✅ **Already completed!** Your S3 bucket name: `agropulse-tftstate-storage`

---

### Step 2: Add GitHub Secrets

1. **Go to your GitHub repository**
   - Navigate to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`

2. **Click "New repository secret"**

3. **Add these required secrets:**

| Secret Name | Value | Description |
|------------|-------|-------------|
| `AWS_ACCESS_KEY_ID` | `AKIAXXXXXXXXXXXXXXXX` | Your AWS access key |
| `AWS_SECRET_ACCESS_KEY` | `your-secret-key-here` | Your AWS secret key |
| `AWS_SESSION_TOKEN` | `optional-session-token` | Only if using temporary credentials |
| `TERRAFORM_STATE_BUCKET` | `agropulse-tftstate-storage` | ✅ Your S3 bucket |
| `DB_PASSWORD` | `YourSecurePassword123!` | Password for RDS PostgreSQL |
| `LAB_ROLE_ARN` | `arn:aws:iam::123456789:role/ecs-task-role` | ECS task execution role ARN |

4. **Click "Add secret"** after each one

---

### Step 3: Verify Secrets Are Set

Go back to: `Settings → Secrets and variables → Actions`

You should see all 6 secrets listed (values will be hidden).

---

### Step 4: Re-run the Workflow

#### Option A: Trigger via Git Push
```bash
# Make a small change and push
git add .
git commit -m "fix: Add missing GitHub secret configuration"
git push origin main
```

#### Option B: Re-run Failed Workflow
1. Go to GitHub repository → **Actions** tab
2. Click on the failed workflow run
3. Click **"Re-run all jobs"** button (top right)

---

## 🔍 How to Get the Required Values

### AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY

1. Go to https://console.aws.amazon.com/iam/
2. Click **Users** → Select your user
3. Click **Security credentials** tab
4. Under **Access keys**, click **Create access key**
5. Choose **Command Line Interface (CLI)**
6. Copy and save both the Access Key ID and Secret Access Key
7. **IMPORTANT**: Store these securely, you can't view the secret key again!

### LAB_ROLE_ARN (ECS Task Role)

If you're using AWS Learner's Lab or have an existing ECS role:

```bash
# List IAM roles
aws iam list-roles --query 'Roles[?contains(RoleName, `ecs`)].Arn' --output text

# Or list all roles and find the ECS one
aws iam list-roles --query 'Roles[].RoleName' --output table
```

Common role names:
- `ecsTaskExecutionRole`
- `ecsTaskRole`
- `LabRole` (in Learner's Lab)

### DB_PASSWORD

Create a strong password:
- Minimum 16 characters
- Mix of uppercase, lowercase, numbers, and symbols
- Example: `AgroPulse2026!Secure#DB`

---

## 📋 Pre-Deployment Checklist

Before pushing again, verify:

- [x] S3 bucket created successfully (`agropulse-tftstate-storage`)
- [ ] All 6 GitHub secrets configured
- [ ] AWS credentials have necessary permissions (S3, ECS, RDS, EC2, VPC, IAM)
- [x] Bucket name in TERRAFORM_STATE_BUCKET matches your actual bucket (`agropulse-tftstate-storage`)
- [ ] DB_PASSWORD is strong (16+ characters)
- [ ] LAB_ROLE_ARN is a valid ARN format

---

## 🎯 Quick Test Commands

```bash
# Verify AWS CLI is configured
aws sts get-caller-identity

# Verify S3 bucket exists
aws s3 ls s3://agropulse-tftstate-storage

# List all your S3 buckets
aws s3 ls
```

---

## 🚨 Common Mistakes

1. ❌ **Empty secret value** - Make sure TERRAFORM_STATE_BUCKET has the value: `agropulse-tftstate-storage`
2. ❌ **Typos in bucket name** - Must exactly match your S3 bucket name
3. ❌ **Wrong region** - Bucket must be in us-east-1 (same as workflow)
4. ❌ **Missing permissions** - AWS credentials need S3, ECS, RDS, VPC permissions
5. ❌ **Expired credentials** - Learner's Lab credentials expire every 2 hours

---

## 📞 Still Having Issues?

If you still get errors after configuring secrets:

1. **Check the workflow logs** - The improved error message will tell you exactly what's missing
2. **Verify bucket exists**: `aws s3 ls`
3. **Verify credentials work**: `aws sts get-caller-identity`
4. **Check IAM permissions**: Make sure your IAM user/role has necessary permissions

---

**Next Step**: Create the S3 bucket → Add GitHub secrets → Push to main → Monitor deployment! 🚀
