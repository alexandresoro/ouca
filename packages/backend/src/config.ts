import { pino } from "pino";
import { z } from "zod";

const zodStringToBoolean = (input: string | undefined): boolean => {
  return input?.toLowerCase() === "true" || input === "1";
};

const envSchema = z.object({
  OUCA_SERVER_HOST: z.string().default("localhost"),
  OUCA_SERVER_PORT: z.coerce.number().min(1).max(65535).multipleOf(1).default(4000),
  DATABASE_URL: z.string().default("postgresql://basenaturaliste:basenaturaliste@127.0.0.1:5432/basenaturaliste"),
  REDIS_URL: z.string().default("redis://localhost:6379/0"),
  OUCA_DATABASE_RUN_MIGRATIONS: z.string().default("true").transform(zodStringToBoolean),
  OUCA_DATABASE_MIGRATION_SCHEMA: z.string().default("public"),
  OUCA_DATABASE_MIGRATION_TABLE: z.string().default("base_naturaliste_umzug_migrations"),
  OUCA_DATABASE_MIGRATIONS_PATH: z.string().default(new URL("../migrations/", import.meta.url).pathname),
  OUCA_LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("warn"),
  OIDC_ISSUER: z.string(),
  OIDC_INTROSPECTION_PATH: z.string().default("/oauth/v2/introspect"),
  OIDC_CLIENT_ID: z.string(),
  OIDC_CLIENT_SECRET: z.string(),
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
  redis: {
    url: env.REDIS_URL,
  },
  log: {
    level: env.OUCA_LOG_LEVEL,
  },
  oidc: {
    issuer: env.OIDC_ISSUER,
    introspectionPath: env.OIDC_INTROSPECTION_PATH,
    clientId: env.OIDC_CLIENT_ID,
    clientSecret: env.OIDC_CLIENT_SECRET,
  },
  sentry: {
    dsn: env.SENTRY_DSN,
  },
  isProduction: env.NODE_ENV,
};
