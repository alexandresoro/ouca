import { type Config } from "@domain/config/config.js";
import { pino } from "pino";
import { z } from "zod";
import { dbConfig } from "./database-config.js";
import { loggerConfig } from "./logger-config.js";
import { nodeEnvConfig } from "./node-env-config.js";

const initLogger = pino({
  level: "warn",
  base: undefined,
});

const envSchema = z.object({
  OUCA_SERVER_HOST: z.string().default("localhost"),
  OUCA_SERVER_PORT: z.coerce.number().min(1).max(65535).multipleOf(1).default(4000),
  REDIS_URL: z.string().default("redis://localhost:6379/0"),
  OIDC_ISSUER: z.string(),
  OIDC_INTROSPECTION_PATH: z.string().default("/oauth/v2/introspect"),
  OIDC_CLIENT_ID: z.string(),
  OIDC_CLIENT_SECRET: z.string(),
  SENTRY_DSN: z.string().optional(),
  SENTRY_ENV: z.string().optional(),
  SENTRY_RELEASE: z.string().trim().min(1).optional(),
});

export const getConfig = (): Config => {
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
    log: loggerConfig,
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
    ...nodeEnvConfig,
  };
};

export const config = getConfig();
