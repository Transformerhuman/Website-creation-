# AWS Deployment Guide for AgroPulse

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Docker installed
4. Terraform installed (v1.0+)
5. GitHub repository with this code

## Step 1: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these required secrets:
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key  
- `AWS_SESSION_TOKEN`: Your AWS session token (if using temporary credentials)
- `DB_PASSWORD`: Secure database password (min 16 characters)
- `LAB_ROLE_ARN`: AWS IAM Role ARN for ECS tasks
- `TERRAFORM_STATE_BUCKET`: S3 bucket name for Terraform state

## Step 2: Create S3 Bucket for Terraform State

```bash
aws s3api create-bucket --bucket your-terraform-state-bucket --region us-east-1
```

## Step 3: Configure Environment Variables

```bash
# Copy production environment template
cp .env.production .env

# Edit with your actual values
nano .env
```

## Step 4: Push to Main Branch

```bash
git add .
git commit -m "Prepare for AWS deployment"
git push origin main
```

## Step 5: Monitor GitHub Actions

1. Go to Actions tab in your GitHub repository
2. Click on the latest workflow run
3. Monitor the deployment progress
4. Check for any errors in the logs

## Step 6: Verify Deployment

After deployment completes:

1. Check ECS services in AWS Console
2. Verify ALB health checks are passing
3. Test your application URL
4. Check CloudWatch logs for any errors

## Manual Deployment (Alternative)

### Build and Push Docker Images

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and push API
docker build -t agropulse-api -f infra/docker/api.Dockerfile .
docker tag agropulse-api:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/agropulse-api:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/agropulse-api:latest

# Build and push Web
docker build -t agropulse-web -f infra/docker/web.Dockerfile .
docker tag agropulse-web:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/agropulse-web:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/agropulse-web:latest
```

### Deploy with Terraform

```bash
cd infra/terraform

# Initialize Terraform
terraform init -backend-config="bucket=your-terraform-state-bucket"

# Plan
terraform plan \
  -var="db_password=your_password" \
  -var="lab_role_arn=your_arn" \
  -var="api_image=YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/agropulse-api:latest" \
  -var="web_image=YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/agropulse-web:latest"

# Apply
terraform apply \
  -var="db_password=your_password" \
  -var="lab_role_arn=your_arn" \
  -var="api_image=YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/agropulse-api:latest" \
  -var="web_image=YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/agropulse-web:latest"
```

## Troubleshooting

### Common Issues

1. **Docker build fails**
   - Check that all file paths in Dockerfiles match your directory structure
   - Ensure .dockerignore is not excluding necessary files

2. **Terraform init fails**
   - Verify S3 bucket exists
   - Check AWS credentials are correct
   - Ensure you have permissions to create resources

3. **ECS tasks not starting**
   - Check CloudWatch logs for application errors
   - Verify security groups allow necessary traffic
   - Check IAM role permissions

4. **Database connection fails**
   - Verify RDS endpoint and security groups
   - Check database credentials
   - Ensure RDS is in the same VPC as ECS

### Useful Commands

```bash
# Check ECS task logs
aws logs get-log-events \
  --log-group-name /ecs/agropulse-api \
  --log-stream-name YOUR_STREAM_NAME \
  --region us-east-1

# Check Terraform state
cd infra/terraform
terraform state list

# Verify ECR images
aws ecr describe-images --repository-name agropulse-api --region us-east-1

# Check ECS services
aws ecs describe-services \
  --cluster agropulse \
  --services agropulse-api agropulse-web \
  --region us-east-1
```

## Post-Deployment Tasks

1. **Set up custom domain**
   - Configure Route 53 DNS records
   - Request SSL certificate with ACM
   - Update ALB listener to use HTTPS

2. **Configure monitoring**
   - Set up CloudWatch alarms for CPU, memory, errors
   - Enable RDS enhanced monitoring
   - Configure SNS notifications

3. **Set up backups**
   - Enable automated RDS backups
   - Create backup schedule for important data
   - Test restore procedures

4. **Optimize costs**
   - Right-size ECS tasks
   - Enable auto-scaling
   - Review unused resources
