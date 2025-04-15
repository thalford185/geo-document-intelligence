import { defineConfig } from "drizzle-kit";

const connectionUrl = process.env.POSTGRES_URL;
if (connectionUrl === undefined) {
  throw Error("Env var POSTGRES_URL is not set");
}
export default defineConfig({
  out: "./drizzle",
  schema: "./clients/db/postgres/schema.ts",
  dialect: "postgresql",
  verbose: true,
  dbCredentials: { url: connectionUrl },
});
