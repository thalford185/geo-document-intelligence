# Application

## Architecture
The application uses a [Hexagonal Architecture](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/hexagonal-architecture.html).
<p align="center"><img src="https://github.com/user-attachments/assets/7eadf4ed-7c98-4ca5-8be9-aa1a22622f90" height="750px" /></p>

Hexagonal architecture encourages the creation of components called Adapters which connect to the Infrastructure. Adapters communicate with the application Core components through abstract Ports, decoupling the Core of the application from the Infrastructure. The added complexity of this abstraction is traded-off for easier testing of components in isolation. For more details on software architecture see the [Artificial Intelligence README](ai/README.md).

## Infrastructure
The application Infrastructure is managed in Terraform and orchestrated by Github Actions.
<p align="center"><img src="https://github.com/user-attachments/assets/a811d20c-0d0c-4768-b7b9-ec5048966113"  height="500px" /></p>

### Security
Components of the Infrastructure authenticate to each other without long lived tokens. Authentication within Google Cloud Platform (GCP) is performed through IAM identity. Vercel impersonates GCP IAM Service accounts through OIDC.

Where long-lived tokens are mandatory, such as the CloudSQL admin user, write-only Terraform resources are used to ensure tokens are not stored in the statefile.
### Development
#### System Requirements
* Terraform. see the environment root module's `versions.tf` for required version.
* Google Cloud Platform (GCP) credentials with authorization to  impersonate the GCP project's `app-deployer` service account. See the environment root module's `providers.tf` for the GCP project id.
* Vercel project API token.

#### Bootstrapping
The platform uses Google Cloud Storage (GCS) buckets to store Terraform state remotely. These buckets must be created manually to bootstrap the Terraform configuration. See environment root module's `backend.tf` for the bucket name.

#### Code Quality
Code changes are blocked from being integrated until build checks pass. This trades-off some throughput for quality with the goal of maintaining developer efficiency as the application complexity and team size increases.

Code formatting checks are enforced to make code easier to read by the team (or yourself in a weeks time). Run code formatting checks with `terraform fmt -check`. Automatic code formatting is well supported by editors and so friction should be minimal.

## Artificial Intelligence Backend (AI)
See the [Artificial Intelligence README](ai/README.md) for detailed documentation of the AI backend.

## Human-in-the-loop Frontend (HitL)
A read-only prototype to prove the AI backend's application to a human-in-the-loop interface. Documentation and testing is limited whilst the concept is being proved.

### Development

#### System Dependencies
* NPM
* Vercel CLI

#### Run locally
* Login to Vercel with `vercel login`
* Start a local development server by running `vercel dev` in the repository root directory. The local server will have access to pre-production environment resources via Vercel OIDC identity.
