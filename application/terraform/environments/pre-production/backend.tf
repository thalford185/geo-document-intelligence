terraform {
  backend "gcs" {
    bucket = "geo-document-intelligence-pre-terraform"
    prefix = "hitl-app"
  }
}
