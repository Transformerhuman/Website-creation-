variable "vpc_id" {}
variable "subnet_ids" { type = list(string) }
variable "db_password" {}

resource "aws_db_subnet_group" "rds" {
  name       = "agropulse-db-sng"
  subnet_ids = var.subnet_ids
}

resource "aws_security_group" "rds" {
  name   = "agropulse-rds-sg"
  vpc_id = var.vpc_id
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }
}

resource "aws_db_instance" "postgres" {
  identifier        = "agropulse-db"
  engine            = "postgres"
  engine_version    = "16.1"
  instance_class    = "db.t3.micro"
  allocated_storage = 20
  db_name           = "agropulse"
  username          = "postgres"
  password          = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.rds.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  skip_final_snapshot    = true
}

output "db_endpoint" {
  value = aws_db_instance.postgres.endpoint
}
