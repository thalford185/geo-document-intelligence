data "google_project" "current" {}

# GCP Services

resource "google_project_service" "artifactregistry" {
  service            = "artifactregistry.googleapis.com"
  disable_on_destroy = true
}

resource "google_project_service" "run" {
  service            = "run.googleapis.com"
  disable_on_destroy = true
}

resource "google_project_service" "iam" {
  service            = "iam.googleapis.com"
  disable_on_destroy = true
}

resource "google_project_service" "cloudresourcemanager" {
  service            = "cloudresourcemanager.googleapis.com"
  disable_on_destroy = true
}

resource "google_project_service" "secretmanager" {
  service            = "secretmanager.googleapis.com"
  disable_on_destroy = true
}

resource "google_project_service" "sqladmin" {
  service            = "sqladmin.googleapis.com"
  disable_on_destroy = true
}

resource "google_project_service" "compute" {
  service            = "compute.googleapis.com"
  disable_on_destroy = true
}

# CI/CD platform

resource "google_service_account" "platform_deployer" {
  account_id = "platform-deployer"
}

resource "google_project_iam_member" "platform_deployer_owner" {
  member  = "serviceAccount:${google_service_account.platform_deployer.email}"
  role    = "roles/owner"
  project = data.google_project.current.project_id
}

module "ci_cd" {
  source                               = "../../modules/ci-cd"
  github_team_name                     = "thalford185"
  github_repo_name                     = "geo-document-intelligence"
  vercel_team_slug                     = "tims-projects-6f5a2af0"
  platform_deployer_service_account_id = google_service_account.platform_deployer.id
  app_deployer_service_account_id      = google_service_account.app_deployer.id

  depends_on = [
    google_project_service.artifactregistry
  ]
}

# App platform

resource "google_service_account" "app_deployer" {
  account_id = "app-deployer"
}

resource "google_project_iam_member" "app_deployer" {
  member  = "serviceAccount:${google_service_account.app_deployer.email}"
  role    = each.value
  project = data.google_project.current.project_id
  for_each = toset([
    "roles/cloudsql.admin",
    "roles/run.admin",
    "roles/storage.admin",
    "roles/iam.serviceAccountViewer",
    "roles/secretmanager.admin",
    "roles/artifactregistry.writer",
  ])
}

resource "google_project_iam_member" "app_deployer_project_iam_admin" {
  member  = "serviceAccount:${google_service_account.app_deployer.email}"
  role    = "roles/resourcemanager.projectIamAdmin"
  project = data.google_project.current.project_id
  condition {
    title      = "app-deployer-iam"
    expression = "api.getAttribute('iam.googleapis.com/modifiedGrantsByRole', []).hasOnly(['roles/cloudsql.instanceUser', 'roles/cloudsql.client'])"
  }
}

module "hitl_app" {
  source              = "../../modules/hitl-app"
  vercel_team_slug    = "tims-projects-6f5a2af0"
  vercel_project_name = "geo-document-intelligence"
  vercel_environments = ["development", "preview"]
}

module "ai_api" {
  source                      = "../../modules/ai-api"
  deployer_service_account_id = google_service_account.app_deployer.account_id
}