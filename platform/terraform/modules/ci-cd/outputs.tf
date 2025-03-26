output "docker_registry_url" {
  value = join("/", [
    "${google_artifact_registry_repository.docker.location}-docker.pkg.dev",
    google_artifact_registry_repository.docker.project,
    google_artifact_registry_repository.docker.name,
  ])
}
