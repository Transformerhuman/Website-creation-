# Reusable EC2 Instance Module
# Usage: Create EC2 instances with optional Docker setup

variable "name" {
  description = "Name tag for the EC2 instance"
  type        = string
}

variable "ami_id" {
  description = "AMI ID for the EC2 instance"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "subnet_id" {
  description = "Subnet ID where the instance will be launched"
  type        = string
}

variable "security_group_ids" {
  description = "List of security group IDs"
  type        = list(string)
}

variable "associate_public_ip" {
  description = "Whether to associate a public IP address"
  type        = bool
  default     = false
}

variable "root_volume_size" {
  description = "Root volume size in GB"
  type        = number
  default     = 20
}

variable "root_volume_type" {
  description = "Root volume type"
  type        = string
  default     = "gp3"
}

variable "user_data" {
  description = "User data script to run on instance launch"
  type        = string
  default     = ""
}

variable "install_docker" {
  description = "Whether to install Docker"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Additional tags"
  type        = map(string)
  default     = {}
}

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

resource "aws_instance" "this" {
  ami                    = var.ami_id != "" ? var.ami_id : data.aws_ami.amazon_linux.id
  instance_type          = var.instance_type
  subnet_id              = var.subnet_id
  vpc_security_group_ids = var.security_group_ids
  associate_public_ip_address = var.associate_public_ip

  root_block_device {
    volume_size = var.root_volume_size
    volume_type = var.root_volume_type
  }

  user_data = var.install_docker && var.user_data == "" ? <<-EOF
              #!/bin/bash
              yum update -y
              yum install -y docker
              systemctl start docker
              systemctl enable docker
              EOF : var.user_data

  user_data_replace_on_change = true

  tags = merge({
    Name = var.name
  }, var.tags)
}

output "id" {
  value       = aws_instance.this.id
  description = "EC2 instance ID"
}

output "public_ip" {
  value       = aws_instance.this.public_ip
  description = "Public IP address"
}

output "private_ip" {
  value       = aws_instance.this.private_ip
  description = "Private IP address"
}

output "public_dns" {
  value       = aws_instance.this.public_dns
  description = "Public DNS name"
}

output "arn" {
  value       = aws_instance.this.arn
  description = "EC2 instance ARN"
}
