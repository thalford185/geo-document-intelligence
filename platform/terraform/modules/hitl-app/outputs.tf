output "runner_service_account_id" {
  value = google_service_account.hitl_app_runner.id
}

output "deployer_service_account_id" {
  value = google_service_account.hitl_app_deployer.id
}

output "vercel_workload_identity_pool_provider_name" {
  value = google_iam_workload_identity_pool_provider.vercel.name
}
