output "docker_registry_url" {
  value = module.ci_cd.docker_registry_url
}

output "hitl_app_runner_service_account_id" {
  value = module.hitl_app.runner_service_account_id
}

output "hitl_app_vercel_workload_identity_pool_provider_name" {
  value = module.hitl_app.vercel_workload_identity_pool_provider_name
}

output "ai_api_runner_service_account_id" {
  value = module.ai_api.runner_service_account_id
}