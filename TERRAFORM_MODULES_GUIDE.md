# 🏗️ Terraform Modular Architecture

## Overview

This infrastructure is built using **reusable Terraform modules** for maximum flexibility and maintainability.

---

## 📦 Module Structure

```
infra/terraform/modules/
├── vpc/                    # VPC with public & private subnets
├── security-group/         # Reusable security group module
├── ec2-instance/           # Reusable EC2 instance module
├── docker-container/       # Docker container configuration helper
├── docker/                 # Orchestrates app deployment (uses sub-modules)
├── rds/                    # EC2 running PostgreSQL in Docker
└── elasticache/            # Redis cache (if needed)
```

---

## 🔧 Reusable Modules

### 1. **Security Group Module** (`modules/security-group/`)

**Purpose**: Create security groups with dynamic ingress/egress rules

**Features**:
- ✅ Dynamic ingress rules (CIDR-based)
- ✅ Security group-based ingress
- ✅ Configurable egress rules
- ✅ Custom tags
- ✅ Fully reusable

**Usage Example**:

```hcl
module "web_server_sg" {
  source = "./modules/security-group"
  name   = "web-server-sg"
  vpc_id = module.vpc.vpc_id
  
  ingress_rules = [
    {
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    },
    {
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  ]
}

module "db_server_sg" {
  source = "./modules/security-group"
  name   = "db-server-sg"
  vpc_id = module.vpc.vpc_id
  
  ingress_with_security_groups = [
    {
      from_port       = 5432
      to_port         = 5432
      protocol        = "tcp"
      security_group_ids = [module.web_server_sg.id]
    }
  ]
}
```

**Variables**:
| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | string | ✅ | - | Security group name |
| `vpc_id` | string | ✅ | - | VPC ID |
| `description` | string | ❌ | "Managed by Terraform" | Description |
| `ingress_rules` | list(object) | ❌ | [] | CIDR-based ingress rules |
| `ingress_with_security_groups` | list(object) | ❌ | [] | SG-based ingress rules |
| `egress_rules` | list(object) | ❌ | Allow all | Egress rules |
| `tags` | map(string) | ❌ | {} | Additional tags |

**Outputs**:
- `id` - Security group ID
- `arn` - Security group ARN
- `name` - Security group name

---

### 2. **EC2 Instance Module** (`modules/ec2-instance/`)

**Purpose**: Launch EC2 instances with optional Docker installation

**Features**:
- ✅ Auto AMI lookup (Amazon Linux 2023)
- ✅ Optional Docker installation
- ✅ Custom user_data scripts
- ✅ Configurable volume size/type
- ✅ Public/private IP options
- ✅ Fully reusable

**Usage Example**:

```hcl
# Simple EC2 with Docker
module "app_server" {
  source = "./modules/ec2-instance"
  name   = "app-server"
  instance_type = "t3.medium"
  subnet_id = module.vpc.public_subnets[0]
  security_group_ids = [module.web_server_sg.id]
  associate_public_ip = true
  install_docker = true
}

# EC2 with custom user_data
module "db_server" {
  source = "./modules/ec2-instance"
  name   = "db-server"
  instance_type = "t3.micro"
  subnet_id = module.vpc.private_subnets[0]
  security_group_ids = [module.db_server_sg.id]
  associate_public_ip = false
  install_docker = true
  
  user_data = <<-EOF
              #!/bin/bash
              docker run -d --name postgres \
                -p 5432:5432 \
                -e POSTGRES_PASSWORD=mysecretpassword \
                postgres:15-alpine
              EOF
}
```

**Variables**:
| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | string | ✅ | - | Instance name |
| `ami_id` | string | ❌ | "" | AMI ID (auto-detects Amazon Linux 2023) |
| `instance_type` | string | ❌ | "t3.micro" | Instance type |
| `subnet_id` | string | ✅ | - | Subnet ID |
| `security_group_ids` | list(string) | ✅ | - | Security groups |
| `associate_public_ip` | bool | ❌ | false | Public IP |
| `root_volume_size` | number | ❌ | 20 | Volume size (GB) |
| `root_volume_type` | string | ❌ | "gp3" | Volume type |
| `user_data` | string | ❌ | "" | User data script |
| `install_docker` | bool | ❌ | false | Install Docker |
| `tags` | map(string) | ❌ | {} | Additional tags |

**Outputs**:
- `id` - Instance ID
- `public_ip` - Public IP address
- `private_ip` - Private IP address
- `public_dns` - Public DNS
- `arn` - Instance ARN

---

### 3. **Docker Container Module** (`modules/docker-container/`)

**Purpose**: Generate Docker run commands for containers

**Features**:
- ✅ Environment variables
- ✅ Volume mappings
- ✅ Network configuration
- ✅ Port mappings
- ✅ Restart policies
- ✅ Helper module (generates commands)

**Usage Example**:

```hcl
module "api_container" {
  source = "./modules/docker-container"
  container_name = "api"
  image = "my-api:latest"
  container_port = 3000
  host_port = 3000
  network = "app-network"
  
  environment_variables = {
    NODE_ENV = "production"
    POSTGRES_URL = "postgresql://user:pass@db:5432/mydb"
  }
  
  restart_policy = "unless-stopped"
}

# Output: docker run command
output "api_docker_command" {
  value = module.api_container.docker_run_command
}
```

**Variables**:
| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `container_name` | string | ✅ | - | Container name |
| `image` | string | ✅ | - | Docker image |
| `container_port` | number | ✅ | - | Container port |
| `host_port` | number | ✅ | - | Host port |
| `environment_variables` | map(string) | ❌ | {} | Env vars |
| `volumes` | list(string) | ❌ | [] | Volume mappings |
| `network` | string | ❌ | "bridge" | Docker network |
| `restart_policy` | string | ❌ | "unless-stopped" | Restart policy |
| `extra_params` | string | ❌ | "" | Extra Docker params |

**Outputs**:
- `docker_run_command` - Complete docker run command

---

### 4. **Docker Deployment Module** (`modules/docker/`)

**Purpose**: Complete application deployment (orchestrates sub-modules)

**Features**:
- ✅ Uses security-group module
- ✅ Uses ec2-instance module
- ✅ Deploys 3 EC2 instances (App, DB, Bastion)
- ✅ Docker containers auto-configured
- ✅ Private subnet for database
- ✅ Bastion host for secure access

**What It Creates**:
1. **App Server** (Public) - Runs API + Web containers
2. **Database Server** (Private) - Runs PostgreSQL container
3. **Bastion Host** (Public) - SSH jump box

**Usage Example**:

```hcl
module "docker_deployment" {
  source = "./modules/docker"
  
  vpc_id            = module.vpc.vpc_id
  public_subnet_id  = module.vpc.public_subnets[0]
  private_subnet_id = module.vpc.private_subnets[0]
  
  api_image   = "123456789.dkr.ecr.us-east-1.amazonaws.com/api:latest"
  web_image   = "123456789.dkr.ecr.us-east-1.amazonaws.com/web:latest"
  db_password = "mysecretpassword123"
}
```

**Variables**:
| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `vpc_id` | string | ✅ | VPC ID |
| `public_subnet_id` | string | ✅ | Public subnet ID |
| `private_subnet_id` | string | ✅ | Private subnet ID |
| `api_image` | string | ✅ | API Docker image |
| `web_image` | string | ✅ | Web Docker image |
| `db_password` | string | ✅ | PostgreSQL password |

**Outputs**:
- `app_server_public_ip` - Application public IP
- `app_server_private_ip` - App server private IP
- `db_server_private_ip` - Database private IP
- `bastion_public_ip` - Bastion public IP
- `application_url` - Full application URL
- `api_url` - API URL

---

## 🏛️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                        VPC Module                        │
│  ┌─────────────────────┐    ┌──────────────────────┐   │
│  │  Public Subnets     │    │  Private Subnets     │   │
│  │  - Route to IGW     │    │  - Route to NAT GW   │   │
│  └─────────────────────┘    └──────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Docker Module                          │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Security Groups Module (3x)                     │  │
│  │  - App Server SG                                 │  │
│  │  - DB Server SG                                  │  │
│  │  - Bastion SG                                    │  │
│  └──────────────────────────────────────────────────┘  │
│                         │                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  EC2 Instance Module (3x)                        │  │
│  │  - App Server (t3.medium)                        │  │
│  │  - DB Server (t3.micro)                          │  │
│  │  - Bastion (t3.micro)                            │  │
│  └──────────────────────────────────────────────────┘  │
│                         │                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Docker Containers                               │  │
│  │  - API Container (port 3000)                     │  │
│  │  - Web Container (port 80)                       │  │
│  │  - PostgreSQL Container (port 5432)              │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Reusability Examples

### Example 1: Deploy Multiple Environments

```hcl
# Development
module "dev_deployment" {
  source = "./modules/docker"
  vpc_id = module.dev_vpc.vpc_id
  # ... other vars
}

# Production
module "prod_deployment" {
  source = "./modules/docker"
  vpc_id = module.prod_vpc.vpc_id
  # ... other vars
}
```

### Example 2: Custom EC2 Instances

```hcl
# Web Server
module "web_server" {
  source = "./modules/ec2-instance"
  name   = "web-server"
  instance_type = "t3.medium"
  install_docker = true
  # ... other vars
}

# API Server
module "api_server" {
  source = "./modules/ec2-instance"
  name   = "api-server"
  instance_type = "t3.large"
  install_docker = true
  # ... other vars
}
```

### Example 3: Custom Security Groups

```hcl
# Load Balancer SG
module "lb_sg" {
  source = "./modules/security-group"
  name   = "lb-sg"
  ingress_rules = [
    { from_port = 80, to_port = 80, protocol = "tcp", cidr_blocks = ["0.0.0.0/0"] },
    { from_port = 443, to_port = 443, protocol = "tcp", cidr_blocks = ["0.0.0.0/0"] }
  ]
}

# Backend SG
module "backend_sg" {
  source = "./modules/security-group"
  name   = "backend-sg"
  ingress_with_security_groups = [
    { from_port = 8080, to_port = 8080, protocol = "tcp", security_group_ids = [module.lb_sg.id] }
  ]
}
```

---

## 🎯 Benefits of Modular Design

### ✅ **Reusability**
- Write once, use everywhere
- Consistent infrastructure across environments
- Easy to duplicate for new projects

### ✅ **Maintainability**
- Changes in one place affect all uses
- Clear separation of concerns
- Easy to update and version

### ✅ **Testability**
- Test modules independently
- Validate before using in production
- Isolate issues quickly

### ✅ **Scalability**
- Easy to add new environments
- Reuse proven configurations
- Scale with confidence

### ✅ **Readability**
- Clear module structure
- Self-documenting code
- Easy to understand architecture

---

## 📋 Module Dependencies

```
vpc module
  └── (no dependencies)

security-group module
  └── vpc_id (from vpc module)

ec2-instance module
  ├── subnet_id (from vpc module)
  └── security_group_ids (from security-group module)

docker module
  ├── vpc_id (from vpc module)
  ├── subnet_ids (from vpc module)
  ├── security-group module
  └── ec2-instance module
```

---

## 🚀 How to Use

### 1. Deploy Infrastructure:

```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

### 2. Get Outputs:

```bash
terraform output
```

### 3. Access Application:

```bash
# Get application URL
terraform output application_url

# Get bastion IP for SSH
terraform output bastion_public_ip
```

---

## 🔧 Customization

### Add New Module:

1. Create directory: `modules/my-new-module/`
2. Create files:
   - `main.tf` - Resources
   - `variables.tf` - Input variables
   - `outputs.tf` - Output values
3. Use in root `main.tf`:

```hcl
module "my_new_module" {
  source = "./modules/my-new-module"
  # ... variables
}
```

### Extend Existing Module:

1. Add new variables to `variables.tf`
2. Add logic to `main.tf`
3. Add new outputs to `outputs.tf`
4. Update documentation

---

## 📚 Best Practices

### ✅ **Do**:
- Keep modules focused on one responsibility
- Use descriptive variable names
- Add descriptions to all variables/outputs
- Set sensible defaults
- Use types for validation
- Document with examples

### ❌ **Don't**:
- Make modules too large or complex
- Hard-code values
- Skip documentation
- Create circular dependencies
- Mix different concerns in one module

---

## 🎉 Summary

**Module Structure**:
- ✅ 3 core reusable modules (security-group, ec2-instance, docker-container)
- ✅ 1 orchestration module (docker)
- ✅ 1 network module (vpc)
- ✅ 100% reusable and composable

**Benefits**:
- ✅ Easy to maintain
- ✅ Easy to extend
- ✅ Easy to understand
- ✅ Production-ready

**Ready for**:
- ✅ Multiple environments (dev, staging, prod)
- ✅ Different projects
- ✅ Team collaboration
- ✅ Infrastructure scaling

---

**Status**: 🟢 **FULLY MODULAR AND REUSABLE!** 🚀
