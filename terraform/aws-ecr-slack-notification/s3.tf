resource "aws_s3_bucket" "ecr_scanning_bucket" {
  bucket = "${data.aws_caller_identity.current.account_id}-${var.s3_bucket_name}"
  acl    = "private"
  force_destroy = true
}

resource "aws_s3_bucket_object" "repositories" {
  bucket = aws_s3_bucket.ecr_scanning_bucket.bucket
  key    = "repositories.json"
  source = "./ecr-repositories.json"
  etag   = filemd5("./ecr-repositories.json")
}

resource "aws_s3_bucket_object" "code" {
  bucket = aws_s3_bucket.ecr_scanning_bucket.bucket
  key    = "${var.lambda_version}.zip"
  source = "./${var.lambda_version}.zip"
  etag   = filemd5("./${var.lambda_version}.zip")
}

