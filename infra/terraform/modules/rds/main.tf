variable "vpc_id" {}
variable "subnet_ids" { type = list(string) }
variable "db_password" {}
variable "lab_role_arn" {}

# Security Group for PostgreSQL EC2 instance
resource "aws_security_group" "postgres_ec2" {
  name   = "agropulse-postgres-ec2-sg"
  vpc_id = var.vpc_id
  
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]  # Allow from VPC
  }
  
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # SSH access (restrict in production)
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# EC2 Instance for PostgreSQL
resource "aws_instance" "postgres" {
  ami           = "ami-0c55b159cbfafe1f0"  # Amazon Linux 2023 (us-east-1)
  instance_type = "t3.micro"
  subnet_id     = var.subnet_ids[0]
  vpc_security_group_ids = [aws_security_group.postgres_ec2.id]
  iam_instance_profile = aws_iam_instance_profile.ec2_postgres.name
  
  root_block_device {
    volume_size = 30
    volume_type = "gp3"
  }
  
  tags = {
    Name = "agropulse-postgres-db"
  }
  
  # Install PostgreSQL on boot
  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install -y postgresql15-server postgresql15
              
              # Initialize database
              /usr/bin/postgresql-setup --initdb || true
              
              # Configure PostgreSQL
              sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /var/lib/pgsql/data/postgresql.conf
              echo "host all all 0.0.0.0/0 md5" >> /var/lib/pgsql/data/pg_hba.conf
              echo "host all all ::0/0 md5" >> /var/lib/pgsql/data/pg_hba.conf
              
              # Start and enable PostgreSQL
              systemctl enable postgresql
              systemctl start postgresql
              
              # Set password for postgres user
              sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '${var.db_password}';"
              
              # Create database
              sudo -u postgres createdb agropulse || true
              
              # Restart to apply all changes
              systemctl restart postgresql
              EOF
}

# IAM Role for EC2 to access ECR and SSM
resource "aws_iam_role" "ec2_postgres_role" {
  name = "agropulse-ec2-postgres-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# Attach SSM Managed Instance Core policy for remote management
resource "aws_iam_role_policy_attachment" "ec2_ssm" {
  role       = aws_iam_role.ec2_postgres_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Instance Profile
resource "aws_iam_instance_profile" "ec2_postgres" {
  name = "agropulse-ec2-postgres-profile"
  role = aws_iam_role.ec2_postgres_role.name
}

# Output the private IP for database connection
output "db_endpoint" {
  value = "${aws_instance.postgres.private_ip}:5432"
}

# Output the public IP for SSH access (if needed)
output "db_public_ip" {
  value = aws_instance.postgres.public_ip
}
