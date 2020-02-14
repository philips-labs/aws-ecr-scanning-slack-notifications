resource "aws_iam_role" "ecr_scanning_analysis_role" {
  name               = "${var.namespace}-ecr-scanning-analysis-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role_policy.json
}

resource "aws_iam_policy" "ecr_scanning_analysis_policy" {
  name        = "${var.namespace}-ecr-scanning-analysis-policy"
  description = "Policy to scan ECR images"

  policy = templatefile("${path.module}/templates/ecr-scanning-analysis-iam-policy.tpl", {
    ecr_repositories = join("\",\"", var.ecr_repositories),
    s3_bucket        = aws_s3_bucket.ecr_scanning_bucket.arn,
    dynamodb_table   = aws_dynamodb_table.docker_images_vulnerabilities.arn
  })
}

resource "aws_iam_policy_attachment" "ecr_scanning_analysis" {
  name       = "${var.namespace}-ecr-scanning-analysis"
  roles      = [aws_iam_role.ecr_scanning_analysis_role.name]
  policy_arn = aws_iam_policy.ecr_scanning_analysis_policy.arn
}
