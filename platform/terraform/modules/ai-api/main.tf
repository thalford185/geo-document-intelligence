data "google_compute_default_service_account" "default" {}

data "google_service_account" "deployer" {
  account_id = var.deployer_service_account_id
}

resource "google_service_account" "runner" {
  account_id = "ai-api-runner"
}

resource "google_service_account_iam_member" "deployer_runner_service_account_user" {
  service_account_id = google_service_account.runner.name
  member = "serviceAccount:${data.google_service_account.deployer.email}"
  role = "roles/iam.serviceAccountUser"
}

resource "google_service_account_iam_member" "deployer_compute_default_service_account_user" {
  service_account_id = data.google_compute_default_service_account.default.name
  member = "serviceAccount:${data.google_service_account.deployer.email}"
  role = "roles/iam.serviceAccountUser"
}