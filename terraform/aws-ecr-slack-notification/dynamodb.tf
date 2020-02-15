resource "aws_dynamodb_table" "docker_images_vulnerabilities" {
  name             = "${var.namespace}-${var.dynamodb_table}"
  billing_mode     = "PAY_PER_REQUEST"
  hash_key         = "sha_digest"
  range_key        = "tag"
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  attribute {
    name = "sha_digest"
    type = "S"
  }

  attribute {
    name = "tag"
    type = "S"
  }
}