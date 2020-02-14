{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "ecr:ListImages",
        "ecr:StartImageScan"
      ],
      "Effect": "Allow",
      "Resource": ["${ecr_repositories}"]
    },
    {
      "Effect": "Allow",
      "Action": [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
          "s3:GetObject"
      ],
      "Resource": "${s3_bucket}/*"
    }
  ]
}