# 🔄 ECS Launch Type Change: Fargate → EC2

## Why This Change?

**Problem**: AWS Learner's Lab has limitations with Fargate and may not support it properly.

**Solution**: Switch to EC2 launch type which gives you more control and works better in Learner's Lab environments.

---

## ✅ What Changed

### Before (Fargate):
```hcl
resource "aws_ecs_task_definition" "api" {
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = var.lab_role_arn  # Required for Fargate
  task_role_arn            = var.lab_role_arn  # Required for Fargate
}

resource "aws_ecs_service" "api" {
  launch_type     = "FARGATE"
  
  network_configuration {  # Required for Fargate
    subnets          = var.subnet_ids
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = true
  }
}
```

### After (EC2):
```hcl
resource "aws_ecs_task_definition" "api" {
  network_mode             = "bridge"  # Changed for EC2
  requires_compatibilities = ["EC2"]   # Changed to EC2
  # No execution_role_arn needed for EC2
  # No task_role_arn needed for EC2
}

resource "aws_ecs_service" "api" {
  launch_type     = "EC2"
  # No network_configuration needed for bridge mode
}
```

---

## 🆕 New Infrastructure Added

### ECS Container Instances (EC2):

Since we're using EC2 launch type, we need actual EC2 instances to run the containers:

```hcl
# Auto Scaling Group with 2-3 EC2 instances
resource "aws_autoscaling_group" "ecs_instances" {
  min_size         = 2
  max_size         = 3
  desired_capacity = 2
  
  # Uses Amazon Linux 2023 ECS-optimized AMI
  launch_template {
    id      = aws_launch_template.ecs_instances.id
    version = "$Latest"
  }
}

# Capacity Provider for automatic scaling
resource "aws_ecs_capacity_provider" "ec2" {
  name = "agropulse-ec2-provider"
  
  auto_scaling_group_provider {
    auto_scaling_group_arn = aws_autoscaling_group.ecs_instances.arn
  }
}
```

---

## 📊 Architecture Comparison

### Fargate (Serverless):
```
┌─────────────────────┐
│  ECS Services       │
│  (Managed by AWS)   │
│  - API Service      │
│  - Web Service      │
└─────────────────────┘
✅ No EC2 instances needed
✅ Pay per task
✅ Less management
```

### EC2 (Self-Managed):
```
┌──────────────────────────────┐
│  Auto Scaling Group          │
│  ┌────────┐  ┌────────┐     │
│  │ EC2 #1 │  │ EC2 #2 │     │
│  │(ECS    │  │(ECS    │     │
│  │ Agent) │  │ Agent) │     │
│  └────────┘  └────────┘     │
│         ECS Cluster           │
│  ┌──────────────────┐        │
│  │ API Container    │        │
│  │ Web Container    │        │
│  └──────────────────┘        │
└──────────────────────────────┘
✅ More control
✅ Potentially cheaper for 24/7 workloads
✅ Works better in Learner's Lab
```

---

## 🔧 Key Differences

### Network Mode:
- **Fargate**: `awsvpc` - Each task gets its own ENI and IP
- **EC2**: `bridge` - Tasks share the host's network namespace

### IAM Roles:
- **Fargate**: Requires `execution_role_arn` and `task_role_arn`
- **EC2**: Uses the EC2 instance's IAM role (LabRole)

### Network Configuration:
- **Fargate**: Must specify subnets and security groups per service
- **EC2**: Uses the EC2 instance's networking (no service-level config)

### Pricing:
- **Fargate**: Pay per vCPU and memory per second
- **EC2**: Pay for the EC2 instances (flat rate)

---

## 💰 Cost Comparison

### Fargate (Estimated):
- API: 256 CPU, 512 MB ≈ $0.04/hour
- Web: 256 CPU, 512 MB ≈ $0.04/hour
- **Total**: ~$58/month (24/7)

### EC2 (Estimated):
- 2x t3.medium instances: ~$0.0416/hour each
- **Total**: ~$60/month (24/7)
- **But**: Can run both containers on same instances

**Verdict**: Similar cost, but EC2 gives you more flexibility in Learner's Lab

---

## 📋 What Gets Created Now

### AWS Resources:

1. ✅ **ECS Cluster** - `agropulse-cluster`
2. ✅ **Auto Scaling Group** - 2 EC2 instances (t3.medium)
3. ✅ **Launch Template** - ECS-optimized Amazon Linux 2023
4. ✅ **Capacity Provider** - Automatic scaling
5. ✅ **ECS Services** - API and Web containers
6. ✅ **Security Groups** - For EC2 instances and load balancer
7. ✅ **EC2 PostgreSQL** - Database server (from previous changes)

### EC2 Instances Created:
- **2x t3.medium** for ECS containers
- **1x t3.micro** for PostgreSQL
- **Total**: 3 EC2 instances

---

## ⚙️ Configuration Details

### ECS Container Instances:
```hcl
Instance Type: t3.medium (2 vCPU, 4 GB RAM)
AMI: Amazon Linux 2023 ECS-optimized
Min Instances: 2
Max Instances: 3
Desired: 2
```

### Container Placement:
- Both API and Web containers run on the EC2 instances
- ECS agent manages container lifecycle
- Containers use bridge networking

### Scaling:
- Auto Scaling Group monitors CPU/memory
- Can scale from 2 to 3 instances automatically
- Capacity provider handles task placement

---

## 🚀 Benefits of EC2 Launch Type

### For Learner's Lab:
✅ **More Compatible** - Works better with Learner's Lab permissions  
✅ **Fewer Restrictions** - Less dependency on Fargate-specific features  
✅ **More Control** - Can SSH into instances if needed  
✅ **Easier Debugging** - Direct access to containers  

### For Production:
✅ **Cost Effective** - Better for 24/7 workloads  
✅ **Custom AMIs** - Can use optimized images  
✅ **GPU Support** - If needed for ML workloads  
✅ **More Configurable** - Full control over infrastructure  

---

## 🔍 How It Works

### Container Deployment Flow:

1. **Terraform creates Auto Scaling Group**
   - Launches 2 EC2 instances
   - Installs ECS agent on boot
   - Registers instances with ECS cluster

2. **ECS Agent starts**
   - Connects to ECS control plane
   - Reports available resources (CPU, memory)

3. **Terraform creates ECS Services**
   - API service: 1 task desired
   - Web service: 1 task desired

4. **ECS Scheduler places tasks**
   - Finds EC2 instances with available resources
   - Pulls Docker images from ECR
   - Starts containers on EC2 instances

5. **Containers running**
   - API on port 3000
   - Web on port 80
   - Accessible via EC2 public IPs

---

## ✅ Verification Commands

### Check EC2 Instances:
```bash
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=agropulse-ecs-container" \
  --query 'Reservations[].Instances[].{ID:InstanceId,State:State.Name,IP:PublicIpAddress}'
```

### Check ECS Cluster:
```bash
aws ecs describe-clusters --cluster agropulse-cluster \
  --query 'clusters[0].{Registered:registeredContainerInstancesCount,Active:activeServicesCount}'
```

### Check Running Tasks:
```bash
aws ecs list-tasks --cluster agropulse-cluster
aws ecs describe-tasks --cluster agropulse-cluster --tasks <task-arn>
```

### Check Container Instances:
```bash
aws ecs list-container-instances --cluster agropulse-cluster
aws ecs describe-container-instances --cluster agropulse-cluster \
  --container-instances <container-arn>
```

---

## 🆘 Troubleshooting

### No Container Instances Registered:
**Wait 3-5 minutes** - EC2 instances are booting and registering with ECS

### Tasks Stuck in PENDING:
**Check resources** - EC2 instances might not have enough CPU/memory
```bash
aws ecs describe-container-instances --cluster agropulse-cluster \
  --container-instances <arn> \
  --query 'containerInstances[0].remainingResources'
```

### Service Not Starting:
**Check events**:
```bash
aws ecs describe-services --cluster agropulse-cluster \
  --services api-service web-service \
  --query 'services[].events'
```

---

## 📝 Files Modified

1. ✅ `infra/terraform/modules/ecs/main.tf`
   - Changed from Fargate to EC2 launch type
   - Added Auto Scaling Group for container instances
   - Added Capacity Provider
   - Added ECS-optimized AMI lookup
   - Removed execution_role_arn and task_role_arn
   - Removed network_configuration blocks

---

## 🎯 Summary

**Changed From**: Fargate (serverless)  
**Changed To**: EC2 (self-managed instances)  
**Why**: Better compatibility with Learner's Lab  
**Result**: More control, similar cost, easier debugging  

---

**Status**: ✅ **EC2 LAUNCH TYPE CONFIGURED - READY FOR LEARNER'S LAB!**
