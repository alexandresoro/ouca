import { dbConfig } from "@infrastructure/config/database-config.js";
import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import { serializeError } from "serialize-error";
import { logger } from "../../utils/logger.js";
import { type Database } from "./database/Database.js";

const kyselyLogger = logger.child({ module: "kysely" });

const dialect = new PostgresDialect({
  // eslint-disable-next-line import/no-named-as-default-member
  pool: new pg.Pool({
    connectionString: dbConfig.url,
  }),
});

export const kysely = new Kysely<Database>({
  dialect,
  plugins: [new CamelCasePlugin()],
  log: (event) => {
    switch (event.level) {
      case "query":
        kyselyLogger.trace(
          {
            executionTime: event.queryDurationMillis,
            query: event.query.sql,
          },
          "query"
        );
        break;
      case "error":
        kyselyLogger.warn(
          {
            error: serializeError(event.error),
          },
          "query execution produced an error"
        );
        break;
      default:
        break;
    }
  },
});