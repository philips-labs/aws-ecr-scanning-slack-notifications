variable "region" {
  type        = string
  description = "AWS Region"
}

variable "lambda_version" {
  type        = string
  description = "ECR Scanning Lambda version"
}

variable "lambda_memory_size" {
  type        = number
  description = "Amount of RAM to be used in the Lambda functions"
  default     = 256
}

variable "slack_endpoint" {
  type        = string
  description = "Pre-configured Slack Endpoint"
}

variable "ecr_repositories" {
  type        = list(string)
  description = "ECR repositories which will be scanned. This variable is used to lock down IAM policies as much as possible, so Lambda functions only have access to the repositories it really needs"
}

variable "schedule_expression" {
  type        = string
  description = "The scheduling expression. For example, cron(0 20 * * ? *) or rate(5 minutes)."
  default     = "rate(1 hour)"
}

variable "provider_assume_role" {
  type    = string
  default = ""
}

variable "namespace" {
  type        = string
  description = "The namespace the infrastructure will be deployed to"
  default     = "default"
}

variable "s3_bucket_name" {
  type        = string
  description = "The s3 bucket to hold the ecr-repositories.json file"
}

variable "dynamodb_table" {
  type        = string
  description = "Table name to store the detected vulnerabilities"
  default     = "docker-images-vulnerabilities"
}











