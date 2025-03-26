resource "google_iam_workload_identity_pool" "main" {
  workload_identity_pool_id = "hitl-app"
}


resource "google_iam_workload_identity_pool_provider" "vercel" {
  workload_identity_pool_provider_id = "hitl-app-vercel"
  workload_identity_pool_id          = google_iam_workload_identity_pool.main.workload_identity_pool_id
  attribute_mapping = {
    "google.subject" = "assertion.sub"
  }
  oidc {
    issuer_uri        = "https://oidc.vercel.com/${var.vercel_team_slug}"
    allowed_audiences = ["https://vercel.com/${var.vercel_team_slug}"]
  }
}


resource "google_service_account" "hitl_app_runner" {
  account_id = "hitl-app-runner"
}

# Required for federated service account impersonation
resource "google_service_account_iam_member" "hitl_app_runner_self_token_creator" {
  service_account_id = google_service_account.hitl_app_runner.name
  role               = "roles/iam.serviceAccountTokenCreator"
  member             = "serviceAccount:${google_service_account.hitl_app_runner.email}"
}

resource "google_service_account_iam_member" "vercel_hitl_app_runner" {
  service_account_id = google_service_account.hitl_app_runner.name
  role               = "roles/iam.workloadIdentityUser"
  member = join("/", [
    "principal://iam.googleapis.com",
    google_iam_workload_identity_pool.main.name,
    "subject",
    "owner:${var.vercel_team_slug}:project:${var.vercel_project_name}:environment:${each.value}"
  ])
  for_each = toset(var.vercel_environments)
}

resource "google_service_account" "hitl_app_deployer" {
  account_id = "hitl-app-deployer"
}

resource "google_service_account_iam_member" "vercel_hitl_app_deployer" {
  service_account_id = google_service_account.hitl_app_deployer.name
  role               = "roles/iam.workloadIdentityUser"
  member = join("/", [
    "principal://iam.googleapis.com",
    google_iam_workload_identity_pool.main.name,
    "subject",
    "owner:${var.vercel_team_slug}:project:${var.vercel_project_name}:environment:${each.value}"
  ])
  for_each = toset(var.vercel_environments)
}
