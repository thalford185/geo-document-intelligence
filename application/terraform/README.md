# Application Infrastructure
The application Infrastructure is managed in Terraform and orchestrated by Github Actions.
<p align="center"><img src="https://github.com/user-attachments/assets/a811d20c-0d0c-4768-b7b9-ec5048966113"  height="500px" /></p>

## Security
Components of the Infrastructure authenticate to each other without long lived tokens. Authentication within Google Cloud Platform (GCP) is performed through IAM identity. Vercel impersonates GCP IAM Service accounts through OIDC.

Where long-lived tokens are mandatory, such as the CloudSQL admin user, write-only Terraform resources are used to ensure tokens are not stored in the statefile.
## Development
### System Requirements
* Terraform. see the environment root module's `versions.tf` for required version.
* Google Cloud Platform (GCP) credentials with authorization to  impersonate the GCP project's `app-deployer` service account. See the environment root module's `providers.tf` for the GCP project id.
* Vercel project API token.

### Bootstrapping
The platform uses Google Cloud Storage (GCS) buckets to store Terraform state remotely. These buckets must be created manually to bootstrap the Terraform configuration. See environment root module's `backend.tf` for the bucket name.

### Code Quality
Code changes are blocked from being integrated, via Pull Request, until build checks pass

Code formatting checks are enforced at build time, via Pull Request. Run code formatting checks with `terraform fmt -check`. Automatic code formatting is well supported by editors and so friction should be minimal.