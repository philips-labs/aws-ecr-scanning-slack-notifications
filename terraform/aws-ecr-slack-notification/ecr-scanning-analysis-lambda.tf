data "aws_s3_bucket_object" "ecr_scanning_analysis_object" {
  bucket = aws_s3_bucket.ecr_scanning_bucket.bucket
  key    = "${var.lambda_version}.zip"
  depends_on = [aws_s3_bucket_object.code]
}

resource "aws_lambda_function" "ecr_scanning_analysis" {
  s3_bucket   = data.aws_s3_bucket_object.ecr_scanning_analysis_object.bucket
  s3_key      = data.aws_s3_bucket_object.ecr_scanning_analysis_object.key
  memory_size = var.lambda_memory_size

  function_name = "${var.namespace}-ecr-scanning-analysis"
  description   = "Lambda that analyses ECR images scans and outputs the results do DynamoDB (${var.lambda_version})"
  timeout       = 60
  handler       = "index.analyseScanResults"
  runtime       = "nodejs12.x"
  role          = aws_iam_role.ecr_scanning_analysis_role.arn

  environment {
    variables = {
      DOCKER_IMAGES_VULNERABILITIES_TABLE = aws_dynamodb_table.docker_images_vulnerabilities.name
      REGISTRY_ID                         = data.aws_caller_identity.current.account_id
      BUCKET                              = aws_s3_bucket.ecr_scanning_bucket.bucket
      KEY                                 = aws_s3_bucket_object.repositories.key
    }
  }

  lifecycle {
    ignore_changes = [last_modified]
  }
}

