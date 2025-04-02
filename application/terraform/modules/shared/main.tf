data "google_client_config" "current" {
  provider = google
}

# Raw documents buckets

resource "google_storage_bucket" "raw_documents" {
  name                        = var.raw_documents_bucket_name
  location                    = data.google_client_config.current.region
  storage_class               = "STANDARD"
  uniform_bucket_level_access = true
  force_destroy               = var.raw_documents_bucket_force_destroy
  cors {
    origin          = var.raw_documents_bucket_cors_origin
    method          = ["GET", "PUT"]
    response_header = ["Content-Type"]
  }
}
