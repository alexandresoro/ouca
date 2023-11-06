import { type DbConfig } from "./database-config.js";
import { type LoggerConfig } from "./logger-config.js";
import { type NodeEnvConfig } from "./node-env-config.js";

export type Config = {
  server: {
    host: string;
    port: number;
  };
  database: DbConfig;
  redis: {
    url: string;
  };
  log: LoggerConfig;
  oidc: {
    issuer: string;
    introspectionPath: string;
    clientId: string;
    clientSecret: string;
  };
  sentry: {
    dsn?: string;
    environment?: string;
    release?: string;
  };
} & NodeEnvConfig;
