import { type DbConfig } from "@domain/config/database-config.js";
import { pino } from "pino";
import { z } from "zod";

const initLogger = pino({
  level: "warn",
  base: undefined,
});

const zodStringToBoolean = (input: string | undefined): boolean => {
  return input?.toLowerCase() === "true" || input === "1";
};

const envDbSchema = z.object({
  DATABASE_URL: z.string().default("postgresql://basenaturaliste:basenaturaliste@127.0.0.1:5432/basenaturaliste"),
  OUCA_DATABASE_RUN_MIGRATIONS: z.string().default("false").transform(zodStringToBoolean),
  OUCA_DATABASE_MIGRATION_SCHEMA: z.string().default("public"),
  OUCA_DATABASE_MIGRATION_TABLE: z.string().default("base_naturaliste_umzug_migrations"),
  OUCA_DATABASE_MIGRATIONS_PATH: z.string().default(new URL("../../../migrations/", import.meta.url).pathname),
});

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

export const dbConfig = getDbConfig();
