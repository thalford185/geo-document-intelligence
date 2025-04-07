data "google_service_account" "runner" {
  account_id = var.runner_service_account_id
}

resource "google_storage_bucket_iam_member" "runner_raw_documents_viewer" {
  bucket = var.raw_documents_bucket_name
  role   = "roles/storage.objectViewer"
  member = "serviceAccount:${data.google_service_account.runner.email}"
}
