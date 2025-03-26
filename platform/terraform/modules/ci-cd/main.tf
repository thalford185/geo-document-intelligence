# Artifacts

resource "google_artifact_registry_repository" "docker" {
  repository_id = "docker"
  format        = "DOCKER"
}

# Github actions

resource "google_iam_workload_identity_pool" "main" {
  workload_identity_pool_id = "ci-cd"
}

resource "google_iam_workload_identity_pool_provider" "github_actions" {
  workload_identity_pool_provider_id = "ci-cd-github-actions"
  workload_identity_pool_id          = google_iam_workload_identity_pool.main.workload_identity_pool_id
  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.repository" = "assertion.repository"
    "attribute.ref"        = "assertion.ref"
  }
  attribute_condition = "assertion.repository == \"${var.github_team_name}/${var.github_repo_name}\""
  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_service_account_iam_member" "github_actions_platform_deployer" {
  service_account_id = var.platform_deployer_service_account_id
  role               = "roles/iam.workloadIdentityUser"
  member = join("/", [
    "principalSet://iam.googleapis.com",
    google_iam_workload_identity_pool.main.name,
    "attribute.ref/refs/heads/main"
  ])
}

resource "google_service_account_iam_member" "github_actions_app_deployer" {
  service_account_id = var.app_deployer_service_account_id
  role               = "roles/iam.workloadIdentityUser"
  member = join("/", [
    "principalSet://iam.googleapis.com",
    google_iam_workload_identity_pool.main.name,
    "attribute.ref/refs/heads/main"
  ])
}
