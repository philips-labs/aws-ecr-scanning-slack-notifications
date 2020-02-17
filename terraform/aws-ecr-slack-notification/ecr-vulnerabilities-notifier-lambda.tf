data "aws_s3_bucket_object" "ecr_vulnerabilities_notifier_object" {
  bucket = aws_s3_bucket.ecr_scanning_bucket.bucket
  key    = "${var.lambda_version}.zip"
  depends_on = [aws_s3_bucket_object.code]
}

resource "aws_lambda_function" "ecr_vulnerabilities_notifier" {
  s3_bucket = data.aws_s3_bucket_object.ecr_vulnerabilities_notifier_object.bucket
  s3_key    = data.aws_s3_bucket_object.ecr_vulnerabilities_notifier_object.key
  memory_size = var.lambda_memory_size

  function_name = "${var.namespace}-ecr-vulnerabilities-notifier"
  description   = "Lambda that notifies a Slack channel should there be any new vulnerabilities on the scanned images (${var.lambda_version})"
  timeout       = 60
  handler       = "index.notifyVulnerabilities"
  runtime       = "nodejs12.x"
  role          = aws_iam_role.ecr_vulnerabilities_notifier_role.arn

  environment {
    variables = {
      SLACK_ENDPOINT = var.slack_endpoint
    }
  }

  lifecycle {
    ignore_changes = [last_modified]
  }
}

resource "aws_lambda_event_source_mapping" "dynamo_db_stream_trigger" {
  event_source_arn  = aws_dynamodb_table.docker_images_vulnerabilities.stream_arn
  function_name     = aws_lambda_function.ecr_vulnerabilities_notifier.arn
  starting_position = "LATEST"
}