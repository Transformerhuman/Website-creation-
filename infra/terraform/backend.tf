# infra/terraform/backend.tf
terraform {
  backend "s3" {
    bucket = "your-tfstate-bucket"
    key    = "agropulse/terraform.tfstate"
    region = "us-east-1"
  }
}
