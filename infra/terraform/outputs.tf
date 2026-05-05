output "api_service_dns" {
  value = "Check ECS console for the Public IP of the API service"
}

output "web_service_dns" {
  value = "Check ECS console for the Public IP of the Web service"
}

output "rds_endpoint" {
  value = module.rds.db_endpoint
}

output "redis_endpoint" {
  value = module.redis.redis_endpoint
}
