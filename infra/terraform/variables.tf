variable "aws_region" {
  default = "us-east-1"
}

variable "availability_zones" {
  description = "List of availability zones to use for subnets"
  type        = list(string)
  default     = []  # Empty list means use data source
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

variable "ssh_key_name" {
  description = "Name of the SSH key pair created in AWS EC2 Console"
  type        = string
}

variable "user_data" {
  description = "Additional user data script to append"
  type        = string
  default     = ""  # Empty by default
}