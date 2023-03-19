import dotenv from "dotenv";
import path from "node:path";
import { pino } from "pino";
import { z } from "zod";

dotenv.config({
  path: path.join(process.cwd(), "../.env"),
});

const zodStringToBoolean = (input: string | undefined): boolean => {
  return input?.toLowerCase() === "true" || input === "1";
};

const envSchema = z.object({
  OUCA_SERVER_HOST: z.string().default("localhost"),
  OUCA_SERVER_PORT: z.coerce.number().min(1).max(65535).multipleOf(1).default(4000),
  DATABASE_URL: z.string().default("postgresql://basenaturaliste:basenaturaliste@127.0.0.1:5432/basenaturaliste"),
  OUCA_DATABASE_RUN_MIGRATIONS: z.string().default("true").transform(zodStringToBoolean),
  OUCA_DATABASE_MIGRATION_SCHEMA: z.string().default("public"),
  OUCA_DATABASE_MIGRATION_TABLE: z.string().default("base_naturaliste_umzug_migrations"),
  OUCA_DATABASE_MIGRATIONS_PATH: z.string().default("../migrations"),
  OUCA_SIGNUPS_ALLOWED: z.string().default("false").transform(zodStringToBoolean),
  OUCA_DEFAULT_ADMIN_PASSWORD: z.string().optional(),
  OUCA_LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("warn"),
  OUCA_LOG_TO_FILE: z.string().default("false").transform(zodStringToBoolean),
  OUCA_JWT_SIGNING_KEY: z.string().optional(),
  OUCA_JWT_COOKIE_SAME_SITE: z.string().default("true").transform(zodStringToBoolean),
  OUCA_JWT_COOKIE_SECURE: z.string().default("true").transform(zodStringToBoolean),
  SENTRY_DSN: z.string().optional(),
  NODE_ENV: z.string().optional(),
});

const initLogger = pino({
  level: "warn",
  base: undefined,
});

const envParseResult = envSchema.safeParse(process.env);
if (!envParseResult.success) {
  initLogger.fatal({ error: envParseResult.error }, "An error has occurred when trying to parse the environment");
  process.exit(1);
}

const env = envParseResult.data;

export default {
  server: {
    host: env.OUCA_SERVER_HOST,
    port: env.OUCA_SERVER_PORT,
  },
  database: {
    url: env.DATABASE_URL,
    migrator: {
      runMigrations: env.OUCA_DATABASE_RUN_MIGRATIONS,
      migrationTableSchema: env.OUCA_DATABASE_MIGRATION_SCHEMA,
      migrationTableName: env.OUCA_DATABASE_MIGRATION_TABLE,
      migrationsPath: env.OUCA_DATABASE_MIGRATIONS_PATH,
    },
  },
  admin: {
    signupsAllowed: env.OUCA_SIGNUPS_ALLOWED,
    defaultAdminPassword: env.OUCA_DEFAULT_ADMIN_PASSWORD,
  },
  log: {
    level: env.OUCA_LOG_LEVEL,
    logToFile: env.OUCA_LOG_TO_FILE,
  },
  jwt: {
    signingKey: env.OUCA_JWT_SIGNING_KEY,
    cookie: {
      sameSite: env.OUCA_JWT_COOKIE_SAME_SITE,
      secure: env.OUCA_JWT_COOKIE_SECURE,
    },
  },
  sentry: {
    dsn: env.SENTRY_DSN,
  },
  isProduction: env.NODE_ENV,
};
