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

output "app_server_public_ip" {
  value       = module.docker_deployment.app_server_public_ip
  description = "App server public IP for SSH access"
}

output "bastion_public_ip" {
  value       = module.docker_deployment.bastion_public_ip
  description = "Bastion host public IP (SSH jump box to database)"
}

# ============================================
# Internal IPs (for reference)
# ============================================

output "db_server_private_ip" {
  value       = module.docker_deployment.db_server_private_ip
  description = "Database server private IP (not publicly accessible)"
}

output "app_server_private_ip" {
  value       = module.docker_deployment.app_server_private_ip
  description = "App server private IP"
}
