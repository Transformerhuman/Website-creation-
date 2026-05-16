variable "vpc_id" {}
variable "subnet_ids" { type = list(string) }
variable "lab_role_arn" { 
  description = "Existing ARN for LabRole in Learners Lab"
  
  validation {
    condition     = can(regex("^arn:aws:iam::", var.lab_role_arn))
    error_message = "lab_role_arn must be a valid IAM role ARN (e.g., arn:aws:iam::123456789012:role/LabRole). Check your GitHub secret LAB_ROLE_ARN."
  }
}
variable "api_image" {}
variable "web_image" {}
variable "db_url" {}
variable "redis_url" {}

# Get the latest Amazon Linux 2023 AMI for ECS container instances
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-ecs-hvm-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_ecs_cluster" "main" {
  name = "agropulse-cluster"
}

# Security Group for ECS container instances
resource "aws_security_group" "ecs_instances" {
  name   = "agropulse-ecs-instances-sg"
  vpc_id = var.vpc_id
  
  ingress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Launch template for ECS container instances
resource "aws_launch_template" "ecs_instances" {
  name_prefix   = "agropulse-ecs-"
  image_id      = data.aws_ami.amazon_linux.id
  instance_type = "t3.medium"
  
  iam_instance_profile {
    arn = var.lab_role_arn
  }
  
  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [aws_security_group.ecs_instances.id]
  }
  
  user_data = base64encode(<<-EOF
              #!/bin/bash
              echo "ECS_CLUSTER=agropulse-cluster" >> /etc/ecs/ecs.config
              EOF
  )
}

# Auto Scaling Group for ECS container instances
resource "aws_autoscaling_group" "ecs_instances" {
  name                = "agropulse-ecs-asg"
  min_size            = 2
  max_size            = 3
  desired_capacity    = 2
  vpc_zone_identifier = var.subnet_ids
  
  launch_template {
    id      = aws_launch_template.ecs_instances.id
    version = "$Latest"
  }
  
  tag {
    key                 = "Name"
    value               = "agropulse-ecs-container"
    propagate_at_launch = true
  }
}

# ECS Capacity Provider
resource "aws_ecs_capacity_provider" "ec2" {
  name = "agropulse-ec2-provider"
  
  auto_scaling_group_provider {
    auto_scaling_group_arn = aws_autoscaling_group.ecs_instances.arn
  }
}

# Attach capacity provider to cluster
resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name
  
  capacity_providers = [aws_ecs_capacity_provider.ec2.name]
  
  default_capacity_provider_strategy {
    capacity_provider = aws_ecs_capacity_provider.ec2.name
    weight            = 1
  }
}

resource "aws_security_group" "ecs_tasks" {
  name   = "agropulse-tasks-sg"
  vpc_id = var.vpc_id
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# API Task Definition
resource "aws_ecs_task_definition" "api" {
  family                   = "agropulse-api"
  network_mode             = "bridge"
  requires_compatibilities = ["EC2"]
  cpu                      = "256"
  memory                   = "512"

  container_definitions = jsonencode([{
    name      = "api"
    image     = var.api_image
    essential = true
    portMappings = [{ containerPort = 3000, hostPort = 3000 }]
    environment = [
      { name = "POSTGRES_URL", value = var.db_url },
      { name = "REDIS_URL", value = var.redis_url },
      { name = "NODE_ENV", value = "production" }
    ]
  }])
}

# Web (Frontend) Task Definition
resource "aws_ecs_task_definition" "web" {
  family                   = "agropulse-web"
  network_mode             = "bridge"
  requires_compatibilities = ["EC2"]
  cpu                      = "256"
  memory                   = "512"

  container_definitions = jsonencode([{
    name      = "web"
    image     = var.web_image
    essential = true
    portMappings = [{ containerPort = 80, hostPort = 80 }]
  }])
}

resource "aws_ecs_service" "api" {
  name            = "api-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 1
  launch_type     = "EC2"
}

resource "aws_ecs_service" "web" {
  name            = "web-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.web.arn
  desired_count   = 1
  launch_type     = "EC2"
}
