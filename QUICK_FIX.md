# ⚡ Quick Fix: Terraform Backend Error

## The Problem
```
Error: The value cannot be empty or all whitespace
```

## The Solution (3 Steps)

### 1️⃣ Create S3 Bucket
✅ **Already done!** Your bucket name: `agropulse-tftstate-storage`

### 2️⃣ Add GitHub Secret

Go to: `GitHub Repo → Settings → Secrets and variables → Actions`

Add this secret:
- **Name**: `TERRAFORM_STATE_BUCKET`
- **Value**: `agropulse-tftstate-storage`

### 3️⃣ Re-run Workflow

```bash
git add .
git commit -m "fix: Configure Terraform backend bucket"
git push origin main
```

**OR** re-run the failed workflow from GitHub Actions tab.

---

## Other Required Secrets

Don't forget these are also needed:

| Secret | Where to Get |
|--------|--------------|
| `AWS_ACCESS_KEY_ID` | AWS IAM → Your User → Security Credentials |
| `AWS_SECRET_ACCESS_KEY` | Same as above |
| `AWS_SESSION_TOKEN` | Only if using temporary creds |
| `DB_PASSWORD` | Make one up (16+ chars) |
| `LAB_ROLE_ARN` | AWS IAM → Roles → Find ECS role |

---

## Verify It Works

```bash
# Check bucket exists
aws s3 ls s3://agropulse-tftstate-storage

# Check AWS creds work
aws sts get-caller-identity
```

---

**Status**: ✅ Workflow updated with better error checking
**Next**: Configure the secret and push again!
