# Reusable Docker Container Module
# Usage: Run Docker containers on EC2 instances

variable "container_name" {
  description = "Name of the Docker container"
  type        = string
}

variable "image" {
  description = "Docker image to run"
  type        = string
}

variable "container_port" {
  description = "Port exposed by the container"
  type        = number
}

variable "host_port" {
  description = "Port on the host machine"
  type        = number
}

variable "environment_variables" {
  description = "Environment variables for the container"
  type        = map(string)
  default     = {}
}

variable "volumes" {
  description = "Volume mappings (host:container)"
  type        = list(string)
  default     = []
}

variable "network" {
  description = "Docker network to connect to"
  type        = string
  default     = "bridge"
}

variable "restart_policy" {
  description = "Docker restart policy"
  type        = string
  default     = "unless-stopped"
}

variable "extra_params" {
  description = "Extra Docker run parameters"
  type        = string
  default     = ""
}

output "docker_run_command" {
  value = <<-EOF
          docker run -d \
            --name ${var.container_name} \
            ${var.network != "bridge" ? "--network ${var.network}" : ""} \
            -p ${var.host_port}:${var.container_port} \
            ${join(" \\\n            ", [for key, value in var.environment_variables : "-e ${key}=${value}"])} \
            ${join(" \\\n            ", [for volume in var.volumes : "-v ${volume}"])} \
            --restart ${var.restart_policy} \
            ${var.extra_params} \
            ${var.image}
          EOF
  description = "Docker run command"
}
