module "infra" {
  source = "../../infra"

  namespace = "default"

  lambda_version = "1.0.0"

  slack_endpoint = "https://hooks.slack.com/services/ID_GENERATED_BY_SLACK/HASH_GENERATED_BY_SLACK"

  ecr_repositories = ["arn:aws:ecr:your-region:111111111111:repository/your_repository"]

  s3_bucket_name = "ecr-scanning-bucket"

}
