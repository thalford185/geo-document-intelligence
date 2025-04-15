import DocumentAiService from "@/document/core/services/document-ai";
import PostgresDocumentRepository from "@/document/adapters/driven/document-repository/postgres";
import GcsRawDocumentStorage from "@/document/adapters/driven/raw-document-storage/gcs";
import CloudRunRawDocumentAi from "@/document/adapters/driven/raw-document-ai/cloud-run";
import { getPostgresDbDrizzleClient } from "@/clients/drizzle/postgres";
import { getVercelFederatedGoogleAuthClient } from "@/clients/google-auth/vercel";
import DocumentUseCase from "@/document/core/ports/driving/document-use-case";
import DocumentBoundaryUseCase from "@/document/core/ports/driving/document-boundary-use-case";

async function getDocumentAiService(): Promise<DocumentAiService> {
  const gcpServiceAccountEmail = process.env.GCP_RUNNER_SERVICE_ACCOUNT_EMAIL;
  if (gcpServiceAccountEmail === undefined) {
    throw Error("Env var GCP_RUNNER_SERVICE_ACCOUNT_EMAIL is not set");
  }
  const aiApiServiceUri = process.env.AI_API_SERVICE_URI;
  if (aiApiServiceUri === undefined) {
    throw Error("Env var AI_API_SERVICE_URI is not set");
  }
  const gcsRawDocumentStorageBucketName =
    process.env.GCS_RAW_DOCUMENT_STORAGE_BUCKET_NAME;
  if (gcsRawDocumentStorageBucketName === undefined) {
    throw Error("Env var GCS_RAW_DOCUMENT_STORAGE_BUCKET_NAME is not set");
  }
  const postgresDbClient = await getPostgresDbDrizzleClient();
  const googleAuthClient = getVercelFederatedGoogleAuthClient();
  const documentRepository = new PostgresDocumentRepository(postgresDbClient);
  const rawDocumentAi = new CloudRunRawDocumentAi(
    googleAuthClient,
    gcpServiceAccountEmail,
    aiApiServiceUri
  );
  const rawDocumentStorage = new GcsRawDocumentStorage(
    googleAuthClient,
    gcsRawDocumentStorageBucketName
  );
  return new DocumentAiService(
    documentRepository,
    rawDocumentAi,
    rawDocumentStorage
  );
}

export async function getDocumentBoundaryUseCase(): Promise<DocumentBoundaryUseCase> {
  return await getDocumentAiService();
}
export async function getDocumentUseCase(): Promise<DocumentUseCase> {
  return await getDocumentAiService();
}