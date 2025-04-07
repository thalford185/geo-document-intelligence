data "google_service_account" "runner" {
  account_id = var.runner_service_account_id
}

data "google_service_account" "deployer" {
  account_id = var.deployer_service_account_id
}

data "google_project" "current" {
  provider = google
}

# Runner service account roles

resource "google_project_iam_member" "runner_cloudsql_client" {
  project = data.google_project.current.project_id
  member  = "serviceAccount:${data.google_service_account.runner.email}"
  role    = "roles/cloudsql.client"
}

resource "google_project_iam_member" "runner_cloudsql_instance_user" {
  project = data.google_project.current.project_id
  member  = "serviceAccount:${data.google_service_account.runner.email}"
  role    = "roles/cloudsql.instanceUser"
}

resource "google_storage_bucket_iam_member" "runner_raw_documents_viewer" {
  bucket = var.raw_documents_bucket_name
  role   = "roles/storage.objectCreator"
  member = "serviceAccount:${data.google_service_account.runner.email}"
}
resource "google_storage_bucket_iam_member" "runner_raw_documents_creator" {
  bucket = var.raw_documents_bucket_name
  role   = "roles/storage.objectViewer"
  member = "serviceAccount:${data.google_service_account.runner.email}"
}

resource "google_cloud_run_v2_service_iam_member" "runner_ai_api_run_invoker" {
  name   = var.ai_api_service_name
  member = "serviceAccount:${data.google_service_account.runner.email}"
  role   = "roles/run.invoker"
}

# CloudSQL

resource "google_sql_database_instance" "main" {
  name                = "hitl-app"
  database_version    = "POSTGRES_15"
  deletion_protection = var.db_deletion_protection

  settings {
    tier = var.db_tier
    database_flags {
      name  = "cloudsql.iam_authentication"
      value = "on"
    }
  }
}

# By default, CloudSQL will only automatically grant admin privileges to built-in users with passwords
ephemeral "random_password" "postgres_migrations_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "google_sql_user" "migrations" {
  instance            = google_sql_database_instance.main.id
  name                = "migrations"
  password_wo         = ephemeral.random_password.postgres_migrations_password.result
  password_wo_version = 1
  type                = "CLOUD_IAM_SERVICE_ACCOUNT"
}

resource "google_secret_manager_secret" "postgres_migrations_password" {
  secret_id = "hitl-app-postgres-migrations-password"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "postgres_migrations_password" {
  secret                 = google_secret_manager_secret.postgres_migrations_password.name
  secret_data_wo         = ephemeral.random_password.postgres_migrations_password.result
  secret_data_wo_version = 1
}

resource "google_sql_user" "runner_service_account" {
  name     = trimsuffix(data.google_service_account.runner.email, ".gserviceaccount.com")
  instance = google_sql_database_instance.main.name
  type     = "CLOUD_IAM_SERVICE_ACCOUNT"
}

resource "google_sql_user" "deployer_service_account" {
  name     = trimsuffix(data.google_service_account.deployer.email, ".gserviceaccount.com")
  instance = google_sql_database_instance.main.name
  type     = "CLOUD_IAM_SERVICE_ACCOUNT"
}

# Vercel environment

resource "vercel_project_environment_variable" "gcp_project_id" {
  project_id = var.vercel_project_id
  key        = "GCP_PROJECT_ID"
  value      = data.google_project.current.project_id
  target     = var.vercel_environments
}

resource "vercel_project_environment_variable" "gcp_runner_service_account_email" {
  project_id = var.vercel_project_id
  key        = "GCP_RUNNER_SERVICE_ACCOUNT_EMAIL"
  value      = data.google_service_account.runner.email
  target     = var.vercel_environments
}

resource "vercel_project_environment_variable" "gcp_deployer_service_account_email" {
  project_id = var.vercel_project_id
  key        = "GCP_DEPLOYER_SERVICE_ACCOUNT_EMAIL"
  value      = data.google_service_account.deployer.email
  target     = var.vercel_environments
}

resource "vercel_project_environment_variable" "gcp_workload_identity_pool_provider_name" {
  project_id = var.vercel_project_id
  key        = "GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_NAME"
  value      = var.workload_identity_pool_provider_name
  target     = var.vercel_environments
}

resource "vercel_project_environment_variable" "ai_api_service_uri" {
  project_id = var.vercel_project_id
  key        = "AI_API_SERVICE_URI"
  value      = var.ai_api_service_uri
  target     = var.vercel_environments
}

resource "vercel_project_environment_variable" "raw_documents_bucket_name" {
  project_id = var.vercel_project_id
  key        = "GCS_RAW_DOCUMENT_STORAGE_BUCKET_NAME"
  value      = var.raw_documents_bucket_name
  target     = var.vercel_environments
}
resource "vercel_project_environment_variable" "gcp_cloudsql_database_id" {
  project_id = var.vercel_project_id
  key        = "GCP_CLOUDSQL_DATABASE_ID"
  value      = google_sql_database_instance.main.connection_name
  target     = var.vercel_environments
}
