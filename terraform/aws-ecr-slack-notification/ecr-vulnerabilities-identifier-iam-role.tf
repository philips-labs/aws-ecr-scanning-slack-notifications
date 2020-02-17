resource "aws_iam_role" "ecr_vulnerabilities_notifier_role" {
  name               = "${var.namespace}-ecr-vulnerabilities-notifier-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role_policy.json
}

resource "aws_iam_policy" "ecr_vulnerabilities_notifier_policy" {
  name        = "${var.namespace}-ecr-vulnerabilities-notifier-policy"
  description = "Policy to scan ECR images"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "dynamodb:GetRecords",
        "dynamodb:GetShardIterator",
        "dynamodb:DescribeStream",
        "dynamodb:ListStreams"
      ],
      "Effect": "Allow",
      "Resource": "${aws_dynamodb_table.docker_images_vulnerabilities.stream_arn}"
    },
    {
      "Effect": "Allow",
      "Action": [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
EOF
}

resource "aws_iam_policy_attachment" "ecr_vulnerabilities_notifier" {
  name       = "${var.namespace}-ecr-vulnerabilities-notifier"
  roles      = [aws_iam_role.ecr_vulnerabilities_notifier_role.name]
  policy_arn = aws_iam_policy.ecr_vulnerabilities_notifier_policy.arn
}