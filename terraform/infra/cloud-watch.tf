resource "aws_cloudwatch_event_rule" "every_hour" {
  name                = "${var.namespace}-lambda-container-scanning"
  description         = "Trigger the lambda to initiate ECR container scanning."
  schedule_expression = var.schedule_expression
}

resource "aws_cloudwatch_event_target" "every_hour_ecr_scanning_target" {
  rule = aws_cloudwatch_event_rule.every_hour.name
  arn  = aws_lambda_function.ecr_scanning.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_lambda_ecr_scanning" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ecr_scanning.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.every_hour.arn
}

resource "aws_cloudwatch_event_target" "every_hour_ecr_scanning_analysis_target" {
  rule = aws_cloudwatch_event_rule.every_hour.name
  arn  = aws_lambda_function.ecr_scanning_analysis.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_lambda_ecr_scanning_analysis" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ecr_scanning_analysis.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.every_hour.arn
}
