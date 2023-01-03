import dotenv from "dotenv";
import { get } from "env-var";
import path from "node:path";

dotenv.config({
  path: path.join(process.cwd(), "../.env"),
});

export default {
  server: {
    host: get("OUCA_SERVER_HOST").default("localhost").asString(),
    port: get("OUCA_SERVER_PORT").default("4000").asPortNumber(),
  },
  database: {
    url: get("DATABASE_URL")
      .default("postgresql://basenaturaliste:basenaturaliste@127.0.0.1:5432/basenaturaliste")
      .asString(),
    migrator: {
      runMigrations: get("OUCA_DATABASE_RUN_MIGRATIONS").default("true").asBoolStrict(),
      migrationTableSchema: get("OUCA_DATABASE_MIGRATION_SCHEMA").default("public").asString(),
      migrationTableName: get("OUCA_DATABASE_MIGRATION_TABLE").default("base_naturaliste_umzug_migrations").asString(),
      migrationsPath: get("OUCA_DATABASE_MIGRATIONS_PATH").default("../migrations").asString(),
    },
  },
  admin: {
    signupsAllowed: get("OUCA_SIGNUPS_ALLOWED").default("false").asBoolStrict(),
    defaultAdminPassword: get("OUCA_DEFAULT_ADMIN_PASSWORD").asString(),
  },
  log: {
    level: get("OUCA_LOG_LEVEL").default("warn").asEnum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]),
    logToFile: get("OUCA_LOG_TO_FILE").default("false").asBoolStrict(),
  },
  jwt: {
    signingKey: get("OUCA_JWT_SIGNING_KEY").asString(),
    cookie: {
      sameSite: get("OUCA_JWT_COOKIE_SAME_SITE").default("true").asBoolStrict(),
      secure: get("OUCA_JWT_COOKIE_SECURE").default("true").asBoolStrict(),
    },
  },
  isProduction: get("NODE_ENV").asString() === "production",
};
