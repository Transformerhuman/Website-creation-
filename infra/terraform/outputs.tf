# ============================================
# Application URLs
# ============================================

output "application_url" {
  value       = module.docker_deployment.application_url
  description = "Frontend website URL (open this in browser)"
}

output "api_url" {
  value       = module.docker_deployment.api_url
  description = "Backend API URL"
}

# ============================================
# Server Access
# ============================================

output "web_server_public_ip" {
  value       = module.docker_deployment.web_server_public_ip
  description = "Web server public IP (frontend)"
}

output "api_server_public_ip" {
  value       = module.docker_deployment.api_server_public_ip
  description = "API server public IP (backend)"
}

output "bastion_public_ip" {
  value       = module.docker_deployment.bastion_public_ip
  description = "Bastion host public IP (SSH jump box)"
}

# ============================================
# Internal IPs (for reference)
# ============================================

output "redis_server_private_ip" {
  value       = module.docker_deployment.redis_server_private_ip
  description = "Redis server private IP (not publicly accessible)"
}

output "db_server_private_ip" {
  value       = module.docker_deployment.db_server_private_ip
  description = "Database server private IP (not publicly accessible)"
}
