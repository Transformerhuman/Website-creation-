# Docker Deployment Module
# Uses reusable sub-modules for EC2, Security Groups, and Docker containers

variable "vpc_id" {}
variable "public_subnet_id" {}
variable "private_subnet_id" {}
variable "api_image" {}
variable "web_image" {}
variable "db_password" {}
variable "lab_role_arn" {}

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

module "app_server_sg" {
  source = "../security-group"
  name   = "agropulse-app-server-sg"
  vpc_id = var.vpc_id
  description = "Security group for application server (web + API)"

  ingress_rules = [
    {
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    },
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
      security_group_ids = [module.app_server_sg.id]
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
}

module "app_server" {
  source = "../ec2-instance"
  name   = "agropulse-app-server"
  ami_id = data.aws_ami.amazon_linux.id
  instance_type = "t3.medium"
  subnet_id = var.public_subnet_id
  security_group_ids = [module.app_server_sg.id]
  associate_public_ip = true
  root_volume_size = 30
  root_volume_type = "gp3"
  install_docker = true
  
  user_data = <<-EOF
              #!/bin/bash
              # Install Docker is handled by the module
              # Additional setup for application containers
              
              # Wait for Docker to be ready
              sleep 10
              
              # Create Docker network
              docker network create agropulse-network || true
              
              # Run API container
              docker run -d \
                --name api \
                --network agropulse-network \
                -p 3000:3000 \
                -e POSTGRES_URL=postgresql://postgres:${var.db_password}@${module.db_server.private_ip}:5432/agropulse \
                -e REDIS_URL=redis://${module.db_server.private_ip}:6379 \
                -e NODE_ENV=production \
                --restart unless-stopped \
                ${var.api_image}
              
              # Run Web container (Nginx)
              docker run -d \
                --name web \
                --network agropulse-network \
                -p 80:80 \
                --restart unless-stopped \
                ${var.web_image}
              
              # Wait for services to start
              sleep 10
              
              # Check if containers are running
              docker ps
              EOF
}

# ============================================
# OUTPUTS
# ============================================

output "app_server_public_ip" {
  value = module.app_server.public_ip
  description = "Public IP to access the application (http://<IP>)"
}

output "app_server_private_ip" {
  value = module.app_server.private_ip
}

output "db_server_private_ip" {
  value = module.db_server.private_ip
  description = "Database server private IP (accessible from app server and bastion)"
}

output "bastion_public_ip" {
  value = module.bastion.public_ip
  description = "Bastion host public IP (SSH here to access database)"
}

output "application_url" {
  value = "http://${module.app_server.public_ip}"
  description = "Application URL"
}

output "api_url" {
  value = "http://${module.app_server.public_ip}:3000"
  description = "API URL"
}
