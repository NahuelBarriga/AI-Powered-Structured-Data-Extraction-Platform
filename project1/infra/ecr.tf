resource "aws_ecr_repository" "llm_api" {
  name = "llm-api"

  image_scanning_configuration {
    scan_on_push = true
  }
}

