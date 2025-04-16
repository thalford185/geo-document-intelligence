# Geo Document Intelligence Application

## Architecture

## Infrastructure

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
See the [Artificial Intelligence README](application/ai/README.md) for detailed documentation of the AI backend.

## Human-in-the-loop Frontend (HitL)
A read-only prototype to prove the AI backend's application to a human-in-the-loop interface. Documentation and testing is limited whilst the concept is being proved.

### Development

#### System Dependencies
* NPM
* Vercel CLI

#### Run locally
* Login to Vercel with `vercel login`
* Start a local development server by running `vercel dev` in the repository root directory. The server will be run the in the Vercel Development environment and have access to required environment variables and OIDC identity.