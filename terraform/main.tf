module "notify" {
  source = "./aws-ecr-slack-notification"
  region = var.region

  namespace = "blog"

  lambda_version = "1.0.0"

  slack_endpoint = "https://hooks.slack.com/services/1234/BU4AYFMT8/abcdefghijklmn"

  ecr_repositories = ["arn:aws:ecr:eu-west-1:111111111111:repository/my-repo"]

  s3_bucket_name = "ecr-scanning-bucket"

  schedule_expression = "rate(1 minute)"
}
