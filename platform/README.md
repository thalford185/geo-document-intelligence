# Platform

## Infrastructure
The platform Infrastructure is managed in Terraform and orchestrated by Github Actions.

<p align="center"><img src="https://github.com/user-attachments/assets/fa643b25-1c6c-4dea-b313-45eae8a1d3f3" /></p>

### Security
Components of the Infrastructure authenticate to each other without long lived tokens. Authentication within Google Cloud Platform (GCP) is performed through IAM identity. Vercel and GitHub impersonate GCP IAM Service accounts through OIDC.

Permissions are granted to application Service Accounts through the principle of least privilege.

### Development

#### Code Quality
Code changes are blocked from being integrated, via Pull Request, until build checks pass

Code formatting checks are enforced to make code easier to read by the team (or yourself in a weeks time). Run code formatting checks with `terraform fmt -check`. Automatic code formatting is well supported by editors and so friction should be minimal.

#### System Requirements
* Terraform. see the environment root module's `versions.tf` for required version.
* GCP project owner credentials. See the environment root module's `providers.tf` for project id.

#### Bootstrapping
The platform uses Google Cloud Storage (GCS) buckets to store Terraform state remotely. These buckets must be created manually to bootstrap the Terraform configuration. See environment root module's `backend.tf` for the bucket name.

Github Actions authenticates to Google Cloud Platform via OpenID Connect (OIDC) in order to manage the platform. Since OIDC configuration is managed by the platform itself, it requires bootstrapping before it can be managed by GitHub actions. Apply the terraform configuration in each environment root module locally to bootstrap the OIDC configuration.
