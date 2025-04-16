# Geo Document Intelligence Platform

## Infrastructure
![infrastructure-platform drawio](https://github.com/user-attachments/assets/fa643b25-1c6c-4dea-b313-45eae8a1d3f3)


## Development

### System Requirements
* Terraform. see the environment root module's `versions.tf` for required version.
* GCP project owner credentials. See the environment root module's `providers.tf` for project id.

### Bootstrapping
The platform uses Google Cloud Storage (GCS) buckets to store Terraform state remotely. These buckets must be created manually to bootstrap the Terraform configuration. See environment root module's `backend.tf` for the bucket name.

Github Actions authenticate to Google Cloud Platform via OpenID Connect (OIDC) in order to manage the platform. Since OIDC configuration is managed by the platform itself, it requires bootstrapping before it can be managed by GitHub actions. Apply the terraform configuration in each environment root module locally to bootstrap the OIDC configuration.

### Code Quality
Code changes are blocked from being integrated until build checks pass. This trades-off some throughput for quality with the goal of maintaining developer efficiency as the application complexity and team size increases.

Code formatting checks are enforced to make code easier to read by the team (or yourself in a weeks time). Run code formatting checks with `terraform fmt -check`. Automatic code formatting is well supported by editors and so friction should be minimal.
