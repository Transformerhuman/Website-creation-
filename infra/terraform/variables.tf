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
