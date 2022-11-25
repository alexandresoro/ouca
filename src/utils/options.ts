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
      .default("mysql://basenaturaliste:basenaturaliste@127.0.0.1:3306/basenaturaliste")
      .asString(),
    usePg: get("OUCA_TMP_USE_PG").default("false").asBoolStrict(),
    pgUrl: get("OUCA_DATABASE_URL")
      .default("postgresql://basenaturaliste:basenaturaliste@127.0.0.1:5432/basenaturaliste")
      .asString(),
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
