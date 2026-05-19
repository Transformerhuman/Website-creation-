# Docker Deployment Module
# Uses reusable sub-modules for EC2, Security Groups, and Docker containers

variable "vpc_id" {}
variable "public_subnet_id" {}
variable "private_subnet_id" {}
variable "api_image" {}
variable "web_image" {}
variable "db_password" {}
variable "lab_role_arn" {}
variable "ssh_key_name" {}

# Get the latest Amazon Linux 2023 AMI
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

# ============================================
# SECURITY GROUPS (using reusable module)
# ============================================

module "api_server_sg" {
  source = "../security-group"
  name   = "agropulse-api-server-sg"
  vpc_id = var.vpc_id
  description = "Security group for API server"

  ingress_rules = [
    {
      from_port   = 3000
      to_port     = 3000
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    },
    {
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  ]
}

module "web_server_sg" {
  source = "../security-group"
  name   = "agropulse-web-server-sg"
  vpc_id = var.vpc_id
  description = "Security group for web server"

  ingress_rules = [
    {
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    },
    {
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  ]
}

module "redis_server_sg" {
  source = "../security-group"
  name   = "agropulse-redis-server-sg"
  vpc_id = var.vpc_id
  description = "Security group for Redis server"

  ingress_with_security_groups = [
    {
      from_port       = 6379
      to_port         = 6379
      protocol        = "tcp"
      security_group_ids = [module.api_server_sg.id]
    },
    {
      from_port       = 22
      to_port         = 22
      protocol        = "tcp"
      security_group_ids = [module.bastion_sg.id]
    }
  ]
}

module "db_server_sg" {
  source = "../security-group"
  name   = "agropulse-db-server-sg"
  vpc_id = var.vpc_id
  description = "Security group for database server (PostgreSQL)"

  ingress_with_security_groups = [
    {
      from_port       = 5432
      to_port         = 5432
      protocol        = "tcp"
      security_group_ids = [module.api_server_sg.id]
    },
    {
      from_port       = 22
      to_port         = 22
      protocol        = "tcp"
      security_group_ids = [module.bastion_sg.id]
    }
  ]
}

module "bastion_sg" {
  source = "../security-group"
  name   = "agropulse-bastion-sg"
  vpc_id = var.vpc_id
  description = "Security group for bastion host (SSH access)"

  ingress_rules = [
    {
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  ]
}

# ============================================
# EC2 INSTANCES (using reusable module)
# ============================================

module "api_server" {
  source = "../ec2-instance"
  name   = "agropulse-api-server"
  ami_id = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"
  subnet_id = var.public_subnet_id
  security_group_ids = [module.api_server_sg.id]
  associate_public_ip = true
  root_volume_size = 20
  root_volume_type = "gp3"
  install_docker = true
  key_name = var.ssh_key_name
  
  user_data = <<-EOF
              #!/bin/bash
              # Install Docker is handled by the module
              
              # Wait for Docker to be ready
              sleep 10
              
              # Run API container
              docker run -d \
                --name api \
                -p 3000:3000 \
                -e POSTGRES_URL=postgresql://postgres:${var.db_password}@${module.db_server.private_ip}:5432/agropulse \
                -e REDIS_URL=redis://${module.redis_server.private_ip}:6379 \
                -e NODE_ENV=production \
                --restart unless-stopped \
                ${var.api_image}
              EOF
}

module "web_server" {
  source = "../ec2-instance"
  name   = "agropulse-web-server"
  ami_id = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"
  subnet_id = var.public_subnet_id
  security_group_ids = [module.web_server_sg.id]
  associate_public_ip = true
  root_volume_size = 20
  root_volume_type = "gp3"
  install_docker = true
  key_name = var.ssh_key_name
  
  user_data = <<-EOF
              #!/bin/bash
              # Install Docker is handled by the module
              
              # Wait for Docker to be ready
              sleep 10
              
              # Run Web container (Nginx)
              docker run -d \
                --name web \
                -p 80:80 \
                --restart unless-stopped \
                ${var.web_image}
              EOF
}

module "redis_server" {
  source = "../ec2-instance"
  name   = "agropulse-redis-server"
  ami_id = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"
  subnet_id = var.private_subnet_id
  security_group_ids = [module.redis_server_sg.id]
  associate_public_ip = false
  root_volume_size = 20
  root_volume_type = "gp3"
  install_docker = true
  key_name = var.ssh_key_name
  
  user_data = <<-EOF
              #!/bin/bash
              # Install Docker is handled by the module
              
              # Wait for Docker to be ready
              sleep 10
              
              # Run Redis container
              docker run -d \
                --name redis \
                -p 6379:6379 \
                -v /data/redis:/data \
                --restart unless-stopped \
                redis:7-alpine
              EOF
}

module "db_server" {
  source = "../ec2-instance"
  name   = "agropulse-db-server"
  ami_id = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"
  subnet_id = var.private_subnet_id
  security_group_ids = [module.db_server_sg.id]
  associate_public_ip = false
  root_volume_size = 30
  root_volume_type = "gp3"
  install_docker = true
  key_name = var.ssh_key_name
  
  user_data = <<-EOF
              #!/bin/bash
              # Install Docker is handled by the module
              # Additional setup for PostgreSQL
              
              # Run PostgreSQL in Docker
              docker run -d \
                --name postgres \
                -p 5432:5432 \
                -e POSTGRES_PASSWORD=${var.db_password} \
                -e POSTGRES_DB=agropulse \
                -v /data/postgres:/var/lib/postgresql/data \
                --restart unless-stopped \
                postgres:15-alpine
              
              # Wait for PostgreSQL to be ready
              sleep 30
              
              # Initialize database if needed
              docker exec postgres psql -U postgres -c "CREATE EXTENSION IF NOT EXISTS \\"uuid-ossp\\";" || true
              EOF
}

module "bastion" {
  source = "../ec2-instance"
  name   = "agropulse-bastion"
  ami_id = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"
  subnet_id = var.public_subnet_id
  security_group_ids = [module.bastion_sg.id]
  associate_public_ip = true
  root_volume_size = 10
  root_volume_type = "gp3"
  install_docker = true
  key_name = var.ssh_key_name
}

# ============================================
# OUTPUTS
# ============================================

output "web_server_public_ip" {
  value = module.web_server.public_ip
  description = "Web server public IP (frontend website)"
}

output "api_server_public_ip" {
  value = module.api_server.public_ip
  description = "API server public IP (backend API)"
}

output "application_url" {
  value = "http://${module.web_server.public_ip}"
  description = "Frontend website URL (open this in browser)"
}

output "api_url" {
  value = "http://${module.api_server.public_ip}:3000"
  description = "Backend API URL"
}

output "redis_server_private_ip" {
  value = module.redis_server.private_ip
  description = "Redis server private IP (internal use)"
}

output "db_server_private_ip" {
  value = module.db_server.private_ip
  description = "Database server private IP (internal use)"
}

output "bastion_public_ip" {
  value = module.bastion.public_ip
  description = "Bastion host public IP (SSH jump box)"
}
