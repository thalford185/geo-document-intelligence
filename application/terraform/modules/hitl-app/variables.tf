variable "raw_documents_bucket_name" {
  type = string
}

variable "runner_service_account_id" {
  type = string
}

variable "deployer_service_account_id" {
  type = string
}

variable "workload_identity_pool_provider_name" {
  type = string
}

variable "ai_api_service_name" {
  type = string
}

variable "ai_api_service_uri" {
  type = string
}

variable "vercel_project_id" {
  type = string
}

variable "vercel_environments" {
  type = list(string)
}

variable "db_tier" {
  type = string
}

variable "db_deletion_protection" {
  type = string
}
