# 🎓 AWS Learner's Lab - IAM Constraints & Solutions

## ⚠️ Critical Constraint

**In AWS Learner's Lab: You CANNOT create or edit IAM roles!**

This means:
- ❌ No `aws_iam_role` resources
- ❌ No `aws_iam_policy` resources  
- ❌ No `aws_iam_role_policy_attachment` resources
- ❌ No `aws_iam_instance_profile` resources
- ✅ MUST use existing roles provided by Learner's Lab

---

## ✅ How We Solved It

### 1. **ECS Tasks - Use Existing LabRole**

**Problem:** Fargate requires an execution role ARN

**Solution:** Use the existing `LabRole` provided by Learner's Lab

```hcl
variable "lab_role_arn" {
  description = "Existing ARN for LabRole in Learners Lab"
}

resource "aws_ecs_task_definition" "api" {
  execution_role_arn = var.lab_role_arn  # ← Use existing role
  task_role_arn      = var.lab_role_arn  # ← Use existing role
}
```

**Where to Find LabRole ARN:**
1. Go to AWS Console → IAM → Roles
2. Find `LabRole` (already exists)
3. Copy the ARN (looks like: `arn:aws:iam::123456789012:role/LabRole`)
4. Add to GitHub Secrets as `LAB_ROLE_ARN`

---

### 2. **EC2 PostgreSQL - No IAM Role Needed**

**Problem:** EC2 instances often use IAM roles for AWS access

**Solution:** PostgreSQL doesn't need AWS API access, so no IAM role required!

```hcl
resource "aws_instance" "postgres" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  # NO iam_instance_profile - not needed!
  
  user_data = <<-EOF
              #!/bin/bash
              # Install and configure PostgreSQL
              # Runs completely locally, no AWS API calls needed
              EOF
}
```

**Why This Works:**
- PostgreSQL stores data locally on EBS volume
- Database connections come from ECS tasks via network
- No need to access S3, CloudWatch, or other AWS services
- Simpler and more secure!

---

### 3. **All Other Resources - IAM-Free**

**Resources that DON'T need IAM roles:**
- ✅ VPC, Subnets, Route Tables
- ✅ Security Groups
- ✅ ECS Cluster & Services
- ✅ ECS Task Definitions (use existing role)
- ✅ EC2 Instances (for PostgreSQL)
- ✅ ElastiCache Redis

**Resources that DO need IAM (but we use existing):**
- ✅ ECS Task Execution → Uses `LabRole`
- ✅ ECS Task Role → Uses `LabRole`

---

## 🔍 What LabRole Provides

The Learner's Lab `LabRole` typically includes these permissions:

### ✅ Included Permissions:
- **ECR** - Pull Docker images
- **CloudWatch Logs** - Write application logs
- **ECS** - Full ECS management
- **EC2** - Instance management
- **VPC** - Network management
- **ELB/ALB** - Load balancers
- **RDS** - Database management (if needed)
- **S3** - Object storage
- **DynamoDB** - NoSQL database
- **Lambda** - Serverless functions

### 📋 How to Verify LabRole Permissions:

```bash
# Get the role details
aws iam get-role --role-name LabRole

# List attached policies
aws iam list-attached-role-policies --role-name LabRole

# Get inline policies
aws iam list-role-policies --role-name LabRole
```

---

## 🚫 What We Removed

### Removed IAM Resources:

1. ❌ `aws_iam_role.ecs_execution_role` - Not needed, use LabRole
2. ❌ `aws_iam_role.ec2_postgres_role` - Not needed for PostgreSQL
3. ❌ `aws_iam_role_policy_attachment.ecs_execution_role_policy` - Not needed
4. ❌ `aws_iam_role_policy_attachment.ec2_ssm` - Not needed
5. ❌ `aws_iam_instance_profile.ec2_postgres` - Not needed

**Result:** 0 IAM resources created! ✅

---

## 📝 Required GitHub Secrets

For Learner's Lab deployment:

| Secret | Where to Get | Required |
|--------|--------------|----------|
| `AWS_ACCESS_KEY_ID` | Learner's Lab credentials | ✅ Yes |
| `AWS_SECRET_ACCESS_KEY` | Learner's Lab credentials | ✅ Yes |
| `AWS_SESSION_TOKEN` | Learner's Lab credentials | ✅ Yes (temporary creds) |
| `LAB_ROLE_ARN` | IAM Console → LabRole → Copy ARN | ✅ Yes |
| `DB_PASSWORD` | Create your own (16+ chars) | ✅ Yes |
| `TERRAFORM_STATE_BUCKET` | Your S3 bucket name | ✅ Yes |

**Important:** Learner's Lab credentials expire every 2 hours!

---

## 🔧 How to Get LabRole ARN

### Method 1: AWS Console
1. Go to https://console.aws.amazon.com/iamv2/home#/roles
2. Search for `LabRole`
3. Click on it
4. Copy the **Role ARN** at the top

### Method 2: AWS CLI
```bash
aws iam get-role --role-name LabRole --query 'Role.Arn' --output text
```

### Method 3: AWS Console (Alternative)
1. Go to Learner's Lab dashboard
2. Look for "Role ARN" or "IAM Role"
3. It's often displayed in the lab details

---

## ✅ Verification Checklist

Before deploying, verify:

- [ ] No `aws_iam_role` resources in Terraform code
- [ ] No `aws_iam_policy` resources in Terraform code
- [ ] No `aws_iam_role_policy_attachment` resources
- [ ] No `aws_iam_instance_profile` resources
- [ ] ECS task definitions use `var.lab_role_arn`
- [ ] EC2 instances don't have `iam_instance_profile`
- [ ] `LAB_ROLE_ARN` secret is configured in GitHub

---

## 🎯 Deployment Architecture (Learner's Lab Compatible)

```
AWS Learner's Lab Environment
┌─────────────────────────────────────────┐
│                                         │
│  Existing Resources (Pre-created):      │
│  ├── LabRole (IAM) ← USE THIS!          │
│  ├── VPC                                │
│  └── Subnets                            │
│                                         │
│  Our Resources (No IAM creation):       │
│  ├── VPC & Networking ← CREATE          │
│  ├── Security Groups ← CREATE           │
│  ├── EC2 PostgreSQL ← CREATE            │
│  │   └── No IAM role needed             │
│  ├── ECS Cluster ← CREATE               │
│  ├── ECS Tasks ← CREATE                 │
│  │   └── Use LabRole (existing)         │
│  └── ElastiCache Redis ← CREATE         │
│                                         │
│  ❌ NO IAM Resources Created!           │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🆘 Troubleshooting

### Error: "Unauthorized to create IAM role"
**Solution:** Remove all IAM resource creation from Terraform (already done!)

### Error: "ECS task execution role not found"
**Solution:** Verify `LAB_ROLE_ARN` is correct and exists in IAM

### Error: "Access denied" during deployment
**Solution:** Check that LabRole has necessary permissions (it should by default)

### Credentials Expired
**Solution:** Get new credentials from Learner's Lab (they expire every 2 hours)

---

## 📋 What Makes This Work

### Key Principles:

1. **Use Existing Roles** - Don't create, just reference
2. **Minimize IAM Needs** - Only use IAM where absolutely required
3. **Local Processing** - PostgreSQL runs locally, no AWS API calls
4. **Leverage LabRole** - It has broad permissions already
5. **Simplify Architecture** - Fewer components = fewer IAM needs

---

## ✅ Success Criteria

Your Terraform is Learner's Lab compatible when:

- ✅ Zero IAM resources in code
- ✅ Uses only `LabRole` for ECS
- ✅ EC2 instances run without IAM profiles
- ✅ All other resources are IAM-free
- ✅ Deployment succeeds without IAM errors

---

## 🎉 Current Status

**Our Infrastructure:**
- ✅ **0 IAM roles created**
- ✅ **0 IAM policies created**
- ✅ **0 IAM attachments created**
- ✅ Uses existing `LabRole` for ECS
- ✅ EC2 PostgreSQL needs no IAM role
- ✅ **100% Learner's Lab compatible!**

---

**Ready to deploy in AWS Learner's Lab!** 🚀
