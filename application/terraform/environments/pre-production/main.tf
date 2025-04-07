data "google_client_config" "current" {
  provider = google
}

// Resources provisioned by the platform
data "google_service_account" "hitl_app_runner" {
  account_id = "hitl-app-runner"
}

data "google_service_account" "ai_api_runner" {
  account_id = "ai-api-runner"
}

data "google_service_account" "app_deployer" {
  account_id = "app-deployer"
}

data "google_cloud_run_v2_service" "ai_api" {
  name     = "ai-api"
  location = data.google_client_config.current.region
}

module "shared" {
  source                             = "../../modules/shared"
  raw_documents_bucket_name          = "geo-document-intelligence-pre"
  raw_documents_bucket_cors_origin   = ["*"]
  raw_documents_bucket_force_destroy = false
}

module "ai_api" {
  source                    = "../../modules/ai-api"
  raw_documents_bucket_name = module.shared.raw_documents_bucket_name
  runner_service_account_id = data.google_service_account.ai_api_runner.account_id
}

module "hitl_app" {
  source                               = "../../modules/hitl-app"
  vercel_project_id                    = "prj_QR8IPpEDx6fizKeU47u0xpDdp9oS"
  raw_documents_bucket_name            = module.shared.raw_documents_bucket_name
  deployer_service_account_id          = data.google_service_account.app_deployer.account_id
  runner_service_account_id            = data.google_service_account.hitl_app_runner.account_id
  workload_identity_pool_provider_name = "projects/505462349330/locations/global/workloadIdentityPools/hitl-app/providers/hitl-app-vercel"
  ai_api_service_name                  = data.google_cloud_run_v2_service.ai_api.name
  ai_api_service_uri                   = data.google_cloud_run_v2_service.ai_api.uri
  // Using Vercel production environment as pre-production because disabling deployment
  // protection for pre-production environments is a premium feature
  vercel_environments    = ["development", "preview", "production"]
  db_tier                = "db-g1-small"
  db_deletion_protection = true
}
