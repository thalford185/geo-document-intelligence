data "google_client_config" "current" {
  provider = google
}

data "google_service_account" "runner" {
  account_id = var.runner_service_account_id
}

resource "google_storage_bucket_iam_member" "runner_raw_documents_viewer" {
  bucket = var.raw_documents_bucket_name
  role   = "roles/storage.objectViewer"
  member = "serviceAccount:${data.google_service_account.runner.email}"
}

# resource "google_cloud_run_v2_service" "main" {
#   name     = "ai-api"
#   location = data.google_client_config.current.region
#   template {}
#   deletion_protection = false
#   lifecycle {
#     ignore_changes = [ template ]
#   }
# }
