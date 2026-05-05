terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "vpc" {
  source = "./modules/vpc"
}

module "rds" {
  source      = "./modules/rds"
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.public_subnets
  db_password = var.db_password
}

module "redis" {
  source     = "./modules/elasticache"
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.public_subnets
}

module "ecs" {
  source       = "./modules/ecs"
  vpc_id       = module.vpc.vpc_id
  subnet_ids   = module.vpc.public_subnets
  lab_role_arn = var.lab_role_arn
  api_image    = var.api_image
  web_image    = var.web_image
  db_url       = "postgres://postgres:${var.db_password}@${module.rds.db_endpoint}/agropulse"
  redis_url    = "redis://${module.redis.redis_endpoint}:6379"
}
