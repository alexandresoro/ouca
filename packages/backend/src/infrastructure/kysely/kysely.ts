import { dbConfig } from "@infrastructure/config/database-config.js";
import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import { serializeError } from "serialize-error";
import { logger } from "../../utils/logger.js";
import { type Age } from "./database/Age.js";
import { type Behavior } from "./database/Behavior.js";
import { type Department } from "./database/Department.js";
import { type Environment } from "./database/Environment.js";
import { type Observer } from "./database/Observer.js";
import { type Settings } from "./database/Settings.js";
import { type Sex } from "./database/Sex.js";
import { type SpeciesClass } from "./database/SpeciesClass.js";
import { type Town } from "./database/Town.js";
import { type User } from "./database/User.js";
import { type Weather } from "./database/Weather.js";

export type Database = {
  "basenaturaliste.age": Age;
  "basenaturaliste.classe": SpeciesClass;
  "basenaturaliste.commune": Town;
  "basenaturaliste.comportement": Behavior;
  "basenaturaliste.departement": Department;
  "basenaturaliste.meteo": Weather;
  "basenaturaliste.milieu": Environment;
  "basenaturaliste.observateur": Observer;
  "basenaturaliste.settings": Settings;
  "basenaturaliste.sexe": Sex;
  "basenaturaliste.user": User;
};

const kyselyLogger = logger.child({ module: "kysely" });

const dialect = new PostgresDialect({
  // eslint-disable-next-line import/no-named-as-default-member
  pool: new pg.Pool({
    connectionString: dbConfig.url,
  }),
});

export const getKyselyInstance = () => {
  return new Kysely<Database>({
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
};

export const kysely = getKyselyInstance();
