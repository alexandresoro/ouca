import { pino } from "pino";
import { z } from "zod";

const zodStringToBoolean = (input: string | undefined): boolean => {
  return input?.toLowerCase() === "true" || input === "1";
};

const envDbSchema = z.object({
  DATABASE_URL: z.string().default("postgresql://basenaturaliste:basenaturaliste@127.0.0.1:5432/basenaturaliste"),
  OUCA_DATABASE_RUN_MIGRATIONS: z.string().default("false").transform(zodStringToBoolean),
  OUCA_DATABASE_MIGRATION_SCHEMA: z.string().default("public"),
  OUCA_DATABASE_MIGRATION_TABLE: z.string().default("base_naturaliste_umzug_migrations"),
  OUCA_DATABASE_MIGRATIONS_PATH: z.string().default(new URL("../migrations/", import.meta.url).pathname),
});

type EnvDbSchemaType = z.infer<typeof envDbSchema>;

const envSchema = z.object({
  OUCA_SERVER_HOST: z.string().default("localhost"),
  OUCA_SERVER_PORT: z.coerce.number().min(1).max(65535).multipleOf(1).default(4000),
  REDIS_URL: z.string().default("redis://localhost:6379/0"),
  OUCA_LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("warn"),
  OIDC_ISSUER: z.string(),
  OIDC_INTROSPECTION_PATH: z.string().default("/oauth/v2/introspect"),
  OIDC_CLIENT_ID: z.string(),
  OIDC_CLIENT_SECRET: z.string(),
  SENTRY_DSN: z.string().optional(),
  SENTRY_ENV: z.string().optional(),
  SENTRY_RELEASE: z.string().trim().min(1).optional(),
  NODE_ENV: z.string().optional(),
});

type EnvSchemaType = z.infer<typeof envSchema>;

const initLogger = pino({
  level: "warn",
  base: undefined,
});

export type DbConfig = {
  url: EnvDbSchemaType["DATABASE_URL"];
  migrator: {
    runMigrations: EnvDbSchemaType["OUCA_DATABASE_RUN_MIGRATIONS"];
    migrationTableSchema: EnvDbSchemaType["OUCA_DATABASE_MIGRATION_SCHEMA"];
    migrationTableName: EnvDbSchemaType["OUCA_DATABASE_MIGRATION_TABLE"];
    migrationsPath: EnvDbSchemaType["OUCA_DATABASE_MIGRATIONS_PATH"];
  };
};

export type Config = {
  server: {
    host: EnvSchemaType["OUCA_SERVER_HOST"];
    port: EnvSchemaType["OUCA_SERVER_PORT"];
  };
  database: DbConfig;
  redis: {
    url: EnvSchemaType["REDIS_URL"];
  };
  log: {
    level: EnvSchemaType["OUCA_LOG_LEVEL"];
  };
  oidc: {
    issuer: EnvSchemaType["OIDC_ISSUER"];
    introspectionPath: EnvSchemaType["OIDC_INTROSPECTION_PATH"];
    clientId: EnvSchemaType["OIDC_CLIENT_ID"];
    clientSecret: EnvSchemaType["OIDC_CLIENT_SECRET"];
  };
  sentry: {
    dsn: EnvSchemaType["SENTRY_DSN"];
    environment: EnvSchemaType["SENTRY_ENV"];
    release: EnvSchemaType["SENTRY_RELEASE"];
  };
  isProduction: EnvSchemaType["NODE_ENV"];
};

export const getDbConfig = (): DbConfig => {
  const envDbParseResult = envDbSchema.safeParse(process.env);
  if (!envDbParseResult.success) {
    initLogger.fatal({ error: envDbParseResult.error }, "An error has occurred when trying to parse the environment");
    process.exit(1);
  }
  const env = envDbParseResult.data;
  return {
    url: env.DATABASE_URL,
    migrator: {
      runMigrations: env.OUCA_DATABASE_RUN_MIGRATIONS,
      migrationTableSchema: env.OUCA_DATABASE_MIGRATION_SCHEMA,
      migrationTableName: env.OUCA_DATABASE_MIGRATION_TABLE,
      migrationsPath: env.OUCA_DATABASE_MIGRATIONS_PATH,
    },
  };
};

export const getConfig = (): Config => {
  const dbConfig = getDbConfig();

  const envParseResult = envSchema.safeParse(process.env);
  if (!envParseResult.success) {
    initLogger.fatal({ error: envParseResult.error }, "An error has occurred when trying to parse the environment");
    process.exit(1);
  }
  const env = envParseResult.data;

  return {
    server: {
      host: env.OUCA_SERVER_HOST,
      port: env.OUCA_SERVER_PORT,
    },
    database: dbConfig,
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
      environment: env.SENTRY_ENV,
      release: env.SENTRY_RELEASE,
    },
    isProduction: env.NODE_ENV,
  };
};
