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

resource "aws_ecs_cluster" "main" {
  name = "agropulse-cluster"
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
  execution_role_arn       = var.lab_role_arn
  task_role_arn            = var.lab_role_arn

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
  execution_role_arn       = var.lab_role_arn
  task_role_arn            = var.lab_role_arn

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

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = true
  }
}

resource "aws_ecs_service" "web" {
  name            = "web-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.web.arn
  desired_count   = 1
  launch_type     = "EC2"

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = true
  }
}
