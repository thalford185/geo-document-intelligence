import { getVercelOidcToken } from "@vercel/functions/oidc";
import { GoogleAuth } from "google-auth-library";

export function getVercelFederatedGoogleAuthClient(): GoogleAuth {
  const serviceAccountEmail = process.env.GCP_RUNNER_SERVICE_ACCOUNT_EMAIL;
  if (serviceAccountEmail === undefined) {
    throw Error("Env var GCP_RUNNER_SERVICE_ACCOUNT_EMAIL is not set");
  }
  const workloadIdentityProviderName =
    process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_NAME;
  if (workloadIdentityProviderName === undefined) {
    throw Error("Env var GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_NAME is not set");
  }
  const audience = `//iam.googleapis.com/${workloadIdentityProviderName}`;
  const serviceAccountImpersonationUrl = `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccountEmail}:generateAccessToken`;
  return new GoogleAuth({
    credentials: {
      type: "external_account",
      audience,
      subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
      token_url: "https://sts.googleapis.com/v1/token",
      service_account_impersonation_url: serviceAccountImpersonationUrl,
      subject_token_supplier: {
        getSubjectToken: getVercelOidcToken,
      },
    },
  });
}
