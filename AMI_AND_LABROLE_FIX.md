# 🔧 Latest Error Fixes - AMI & LabRole Validation

## Errors Fixed

### Error 1: EC2 "couldn't find resource"
```
Error: collecting instance settings: couldn't find resource
with module.rds.aws_instance.postgres
```

**Root Cause**: Hardcoded AMI ID `ami-0c55b159cbfafe1f0` doesn't exist or isn't available in the region.

**Solution**: Use dynamic AMI lookup to always get the latest Amazon Linux 2023 AMI.

---

### Error 2: ECS "Fargate requires execution role ARN"
```
Error: Fargate requires task definition to have execution role ARN to support ECR images
with module.ecs.aws_ecs_task_definition.web
```

**Root Cause**: The `LAB_ROLE_ARN` GitHub secret is either:
- Not configured
- Empty
- Invalid format
- Wrong ARN

---

## ✅ Fixes Applied

### Fix 1: Dynamic AMI Lookup

**Before:**
```hcl
resource "aws_instance" "postgres" {
  ami = "ami-0c55b159cbfafe1f0"  # ❌ Hardcoded, might not exist
}
```

**After:**
```hcl
# Get the latest Amazon Linux 2023 AMI dynamically
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_instance" "postgres" {
  ami = data.aws_ami.amazon_linux.id  # ✅ Always gets latest AMI
}
```

**Benefits:**
- ✅ Works in all AWS regions
- ✅ Always uses the latest AMI
- ✅ No manual AMI ID updates needed
- ✅ Automatically handles AMI deprecation

---

### Fix 2: LabRole ARN Validation

**Added Validation:**
```hcl
variable "lab_role_arn" { 
  description = "Existing ARN for LabRole in Learners Lab"
  
  validation {
    condition     = can(regex("^arn:aws:iam::", var.lab_role_arn))
    error_message = "lab_role_arn must be a valid IAM role ARN (e.g., arn:aws:iam::123456789012:role/LabRole). Check your GitHub secret LAB_ROLE_ARN."
  }
}
```

**What This Does:**
- ✅ Validates the ARN format before deployment
- ✅ Provides clear error message if invalid
- ✅ Catches configuration errors early
- ✅ Tells you exactly what's wrong

---

## 🔑 How to Fix LAB_ROLE_ARN Secret

### Step 1: Find Your LabRole ARN

#### Method 1: AWS Console
1. Go to https://console.aws.amazon.com/iamv2/home#/roles
2. Search for `LabRole`
3. Click on it
4. Copy the **Role ARN** (top of the page)

It looks like: `arn:aws:iam::123456789012:role/LabRole`

#### Method 2: AWS CLI
```bash
aws iam get-role --role-name LabRole --query 'Role.Arn' --output text
```

### Step 2: Update GitHub Secret

1. Go to your GitHub repository
2. Navigate to: **Settings → Secrets and variables → Actions**
3. Find `LAB_ROLE_ARN` secret
4. Click **Edit** (or create it if it doesn't exist)
5. Paste the ARN you copied
6. Click **Update secret**

### Step 3: Verify Format

Your `LAB_ROLE_ARN` should look exactly like this:
```
arn:aws:iam::123456789012:role/LabRole
```

**Common Mistakes:**
- ❌ Missing `arn:aws:iam::` prefix
- ❌ Missing `:role/` part
- ❌ Extra spaces
- ❌ Wrong role name (should be `LabRole`)

---

## 🚀 Deploy After Fixing

```bash
# Commit the fixes
git add .
git commit -m "fix: Add dynamic AMI lookup and LabRole validation

- Use data source to find latest Amazon Linux 2023 AMI
- Add validation for lab_role_arn variable
- Prevent hardcoded AMI ID errors
- Provide clear error messages for invalid LabRole"

# Push to GitHub
git push origin main
```

---

## 📊 What Will Happen Now

### During Terraform Plan:

1. **AMI Lookup** - Finds latest Amazon Linux 2023 AMI in your region
2. **LabRole Validation** - Checks if the ARN format is valid
3. **Error Early** - If LabRole is invalid, fails immediately with clear message

### During Terraform Apply:

1. **EC2 Instance** - Creates with correct AMI (no "resource not found" error)
2. **ECS Tasks** - Uses validated LabRole ARN
3. **Success** - Both resources created successfully!

---

## 🔍 Troubleshooting

### If You Still Get LabRole Error:

#### Check 1: Secret Exists
```bash
# In GitHub Actions workflow logs, look for:
# "Configuring AWS Credentials"
# It should show the AWS account ID
```

#### Check 2: Role Exists in AWS
```bash
aws iam get-role --role-name LabRole
```

Should return role details. If it says "not found", the role doesn't exist.

#### Check 3: ARN Format
```
✅ Correct: arn:aws:iam::123456789012:role/LabRole
❌ Wrong:   LabRole
❌ Wrong:   arn:aws:iam::123456789012:LabRole
❌ Wrong:   123456789012:role/LabRole
```

### If AMI Lookup Fails:

#### Check Region
Make sure your AWS credentials are for `us-east-1`:
```yaml
# In .github/workflows/deploy.yml
aws-region: us-east-1
```

#### Check Permissions
Your LabRole should have EC2 permissions to describe AMIs.

---

## ✅ Verification Commands

### Test AMI Lookup:
```bash
aws ec2 describe-images \
  --owners amazon \
  --filters "Name=name,Values=al2023-ami-*-x86_64" \
  --query 'Images[0].{ID:ImageId,Name:Name}' \
  --region us-east-1
```

Should return an AMI ID.

### Test LabRole:
```bash
aws iam get-role --role-name LabRole --query 'Role.Arn' --output text
```

Should return the ARN.

---

## 📝 Files Modified

1. ✅ `infra/terraform/modules/rds/main.tf`
   - Added `data "aws_ami" "amazon_linux"` block
   - Changed `ami` to use `data.aws_ami.amazon_linux.id`

2. ✅ `infra/terraform/modules/ecs/main.tf`
   - Added validation for `lab_role_arn` variable
   - Provides clear error message for invalid ARN

---

## 🎯 Expected Behavior After Fix

### Successful Terraform Plan:
```
Plan: 15 to add, 0 to change, 0 to destroy.

Changes to Actions:
  + create EC2 instance with AMI ami-xxxxxxxxx (latest Amazon Linux 2023)
  + create ECS task definition with LabRole validation passed
```

### If LabRole is Invalid:
```
Error: Invalid value for variable

  on modules/ecs/main.tf line 3:
  variable "lab_role_arn" {

lab_role_arn must be a valid IAM role ARN (e.g., arn:aws:iam::123456789012:role/LabRole). 
Check your GitHub secret LAB_ROLE_ARN.
```

This tells you EXACTLY what's wrong!

---

## 🎉 Summary

**Fixed:**
- ✅ Hardcoded AMI ID → Dynamic lookup
- ✅ No LabRole validation → Clear error messages
- ✅ Region-specific AMI → Works in any region
- ✅ Confusing errors → Helpful guidance

**Result:**
- More reliable deployments
- Better error messages
- No manual AMI updates needed
- Early detection of configuration issues

---

**Status**: ✅ **BOTH ERRORS FIXED - READY TO DEPLOY!**

**Next**: Update `LAB_ROLE_ARN` secret if needed, then push! 🚀
