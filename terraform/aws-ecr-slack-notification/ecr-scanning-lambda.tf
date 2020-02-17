data "aws_s3_bucket_object" "ecr_scanning_object" {
  bucket = aws_s3_bucket.ecr_scanning_bucket.bucket
  key    = "${var.lambda_version}.zip"
  depends_on = [aws_s3_bucket_object.code]
}

resource "aws_lambda_function" "ecr_scanning" {
  s3_bucket = data.aws_s3_bucket_object.ecr_scanning_object.bucket
  s3_key    = data.aws_s3_bucket_object.ecr_scanning_object.key
  # source_code_hash = data.aws_s3_bucket_object.ecr_scanning_object.metadata["Base64sha256"]
  memory_size = var.lambda_memory_size

  function_name = "${var.namespace}-ecr-scanning"
  description   = "Lambda that scans ECR images every hour(${var.lambda_version})"
  timeout       = 60
  handler       = "index.startImageScan"
  runtime       = "nodejs12.x"
  role          = aws_iam_role.ecr_scanning_role.arn

  environment {
    variables = {
      REGISTRY_ID = data.aws_caller_identity.current.account_id
      BUCKET      = aws_s3_bucket.ecr_scanning_bucket.bucket
      KEY         = aws_s3_bucket_object.repositories.key
    }
  }

  lifecycle {
    ignore_changes = [last_modified]
  }
}