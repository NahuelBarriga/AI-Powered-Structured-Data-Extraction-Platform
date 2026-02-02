resource "aws_ecs_cluster" "main" {
  name = "llm-api-cluster"
}

resource "aws_ecs_task_definition" "api" {
  family                   = "llm-api-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]

  cpu    = "512"
  memory = "1024"

  execution_role_arn = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([
    {
      name  = "llm-api"
      image = "643040131520.dkr.ecr.us-east-1.amazonaws.com/llm-api:latest"

      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
        }
      ]

      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        }
      ]

      essential = true
    }
  ])
}

resource "aws_ecs_service" "api" {
  name            = "llm-api-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [aws_default_subnet.default_a.id]
    security_groups = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }
}

