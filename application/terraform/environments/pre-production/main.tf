module "shared" {
  source                             = "../../modules/shared"
  raw_documents_bucket_name          = "geo-document-intelligence-pre"
  raw_documents_bucket_cors_origin   = ["*"]
  raw_documents_bucket_force_destroy = false
}

module "ai_api" {
  source                    = "../../modules/ai-api"
  raw_documents_bucket_name = module.shared.raw_documents_bucket_name
  min_instance_count        = 0
  max_instance_count        = 1
  runner_service_account_id = var.ai_api_runner_service_account_id
}
