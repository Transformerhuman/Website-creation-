variable "vpc_id" {}
variable "subnet_ids" { type = list(string) }

resource "aws_elasticache_subnet_group" "redis" {
  name       = "agropulse-redis-sng"
  subnet_ids = var.subnet_ids
}

resource "aws_security_group" "redis" {
  name   = "agropulse-redis-sg"
  vpc_id = var.vpc_id
  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "agropulse-redis"
  engine              = "redis"
  node_type           = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
  security_group_ids   = [aws_security_group.redis.id]
}

output "redis_endpoint" {
  value = aws_elasticache_cluster.redis.cache_nodes[0].address
}
