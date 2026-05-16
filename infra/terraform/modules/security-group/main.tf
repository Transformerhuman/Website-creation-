# Reusable Security Group Module
# Usage: Create security groups for any purpose (web servers, databases, bastion, etc.)

variable "name" {
  description = "Name of the security group"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where the security group will be created"
  type        = string
}

variable "description" {
  description = "Description of the security group"
  type        = string
  default     = "Managed by Terraform"
}

variable "ingress_rules" {
  description = "List of ingress rules"
  type = list(object({
    from_port   = number
    to_port     = number
    protocol    = string
    cidr_blocks = list(string)
  }))
  default = []
}

variable "ingress_with_security_groups" {
  description = "List of ingress rules allowing traffic from other security groups"
  type = list(object({
    from_port       = number
    to_port         = number
    protocol        = string
    security_group_ids = list(string)
  }))
  default = []
}

variable "egress_rules" {
  description = "List of egress rules"
  type = list(object({
    from_port   = number
    to_port     = number
    protocol    = string
    cidr_blocks = list(string)
  }))
  default = [{
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }]
}

variable "tags" {
  description = "Additional tags"
  type        = map(string)
  default     = {}
}

resource "aws_security_group" "this" {
  name        = var.name
  description = var.description
  vpc_id      = var.vpc_id

  dynamic "ingress" {
    for_each = var.ingress_rules
    content {
      from_port   = ingress.value.from_port
      to_port     = ingress.value.to_port
      protocol    = ingress.value.protocol
      cidr_blocks = ingress.value.cidr_blocks
    }
  }

  dynamic "ingress" {
    for_each = var.ingress_with_security_groups
    content {
      from_port       = ingress.value.from_port
      to_port         = ingress.value.to_port
      protocol        = ingress.value.protocol
      security_groups = ingress.value.security_group_ids
    }
  }

  dynamic "egress" {
    for_each = var.egress_rules
    content {
      from_port   = egress.value.from_port
      to_port     = egress.value.to_port
      protocol    = egress.value.protocol
      cidr_blocks = egress.value.cidr_blocks
    }
  }

  tags = merge({
    Name = var.name
  }, var.tags)
}

output "id" {
  value       = aws_security_group.this.id
  description = "Security group ID"
}

output "arn" {
  value       = aws_security_group.this.arn
  description = "Security group ARN"
}

output "name" {
  value       = aws_security_group.this.name
  description = "Security group name"
}
