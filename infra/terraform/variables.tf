variable "aws_region" {
  default = "us-east-1"
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "lab_role_arn" {
  type        = string
  description = "The ARN of the LabRole provided by AWS Academy"
}

variable "api_image" {
  type        = string
  description = "Docker image for the API"
}

variable "web_image" {
  type        = string
  description = "Docker image for the Web"
}

variable "lab_role_arn" {
  description = "IAM Role ARN FOR ECS Ececution"
  type        =  string
  default     = "arn:aws:iam::511675495090:role/LabRole" 
}
