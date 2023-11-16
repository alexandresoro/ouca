import { dbConfig } from "@infrastructure/config/database-config.js";
import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import { serializeError } from "serialize-error";
import { logger } from "../../utils/logger.js";
import { type Age } from "./database/Age.js";
import { type Behavior } from "./database/Behavior.js";
import { type Department } from "./database/Department.js";
import { type DistanceEstimate } from "./database/DistanceEstimate.js";
import { type Entry } from "./database/Entry.js";
import { type EntryBehavior } from "./database/EntryBehavior.js";
import { type EntryEnvironment } from "./database/EntryEnvironment.js";
import { type Environment } from "./database/Environment.js";
import { type Inventory } from "./database/Inventory.js";
import { type InventoryAssociate } from "./database/InventoryAssociate.js";
import { type InventoryWeather } from "./database/InventoryWeather.js";
import { type Locality } from "./database/Locality.js";
import { type NumberEstimate } from "./database/NumberEstimate.js";
import { type Observer } from "./database/Observer.js";
import { type Settings } from "./database/Settings.js";
import { type Sex } from "./database/Sex.js";
import { type Species } from "./database/Species.js";
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
  "basenaturaliste.donnee": Entry;
  "basenaturaliste.donnee_comportement": EntryBehavior;
  "basenaturaliste.donnee_milieu": EntryEnvironment;
  "basenaturaliste.espece": Species;
  "basenaturaliste.estimation_distance": DistanceEstimate;
  "basenaturaliste.estimation_nombre": NumberEstimate;
  "basenaturaliste.inventaire": Inventory;
  "basenaturaliste.inventaire_associe": InventoryAssociate;
  "basenaturaliste.inventaire_meteo": InventoryWeather;
  "basenaturaliste.lieudit": Locality;
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
