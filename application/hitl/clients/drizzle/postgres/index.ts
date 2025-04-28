import "dotenv/config";
import * as schema from "@/clients/drizzle/postgres/schema";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Connector, AuthTypes } from "@google-cloud/cloud-sql-connector";
import { Pool } from "pg";
import { getVercelFederatedGoogleAuthClient } from "@/clients/google-auth/vercel";

function getUsernameFromServiceAccountEmail(
  serviceAccountEmail: string,
): string {
  return serviceAccountEmail.replace(".gserviceaccount.com", "");
}

function getCloudSqlConnector(): Connector {
  const auth = getVercelFederatedGoogleAuthClient();
  const connector = new Connector({ auth });
  return connector;
}

async function getCloudSqlClientOptions(
  serviceAccountEmail: string,
): Promise<object> {
  const instanceConnectionName = process.env.GCP_CLOUDSQL_DATABASE_ID;
  if (instanceConnectionName === undefined) {
    throw Error("Env var GCP_CLOUDSQL_DATABASE_ID is not set");
  }
  const connector = getCloudSqlConnector();
  const connectorOptions = await connector.getOptions({
    instanceConnectionName,
    authType: AuthTypes.IAM,
  });
  return {
    ...connectorOptions,
    user: getUsernameFromServiceAccountEmail(serviceAccountEmail),
    database: "hitl-app",
  };
}

export async function getPostgresDbDrizzleClient(): Promise<
  NodePgDatabase<typeof schema>
> {
  const serviceAccountEmail = process.env.GCP_RUNNER_SERVICE_ACCOUNT_EMAIL;
  if (serviceAccountEmail === undefined) {
    throw Error("Env var GCP_RUNNER_SERVICE_ACCOUNT_EMAIL is not set");
  }
  const clientOptions = await getCloudSqlClientOptions(serviceAccountEmail);
  const client = new Pool(clientOptions);
  return drizzle({ client, schema });
}
