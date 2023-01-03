import fs from "node:fs";
import path from "node:path";
import { type Logger } from "pino";
import { sql, type DatabasePool } from "slonik";
import { Umzug } from "umzug";
import { z } from "zod";
import config from "./config";
import getSlonikInstance from "./slonik/slonik-instance";
import { logger } from "./utils/logger";

const getUmzugInstance = ({ logger, slonik }: { logger: Logger; slonik: DatabasePool }) =>
  new Umzug({
    migrations: {
      glob: `${config.database.migrator.migrationsPath}/*.sql`,
      resolve: ({ name, path: pathFile, context }) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return {
          name,
          up: async () => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const sqlToRun = fs.readFileSync(pathFile!).toString();
            await context.slonik.query(sql.unsafe([sqlToRun]));
          },
          down: async () => {
            // Get the corresponding `down file` file to undo this migration
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const downPath = path.join(path.dirname(pathFile!), "down", path.basename(pathFile!));
            const sqlToRun = fs.readFileSync(downPath).toString();
            await context.slonik.query(sql.unsafe([sqlToRun]));
          },
        };
      },
    },
    context: {
      slonik,
    },
    storage: {
      async executed({ context }) {
        await context.slonik.query(
          sql.unsafe`CREATE TABLE IF NOT EXISTS ${sql.identifier([
            config.database.migrator.migrationTableSchema,
            config.database.migrator.migrationTableName,
          ])}(name text, date timestamptz not null default now())`
        );
        const names = await context.slonik.anyFirst(
          sql.type(z.object({ name: z.string() }))`SELECT name from ${sql.identifier([
            config.database.migrator.migrationTableSchema,
            config.database.migrator.migrationTableName,
          ])}`
        );
        return [...names];
      },
      async logMigration({ name, context }) {
        await context.slonik.query(
          sql.unsafe`INSERT INTO ${sql.identifier([
            config.database.migrator.migrationTableSchema,
            config.database.migrator.migrationTableName,
          ])}(name) VALUES (${name})`
        );
      },
      async unlogMigration({ name, context }) {
        await context.slonik.query(
          sql.unsafe`DELETE FROM ${sql.identifier([
            config.database.migrator.migrationTableSchema,
            config.database.migrator.migrationTableName,
          ])} WHERE name = ${name}`
        );
      },
    },
    logger,
    create: {
      folder: config.database.migrator.migrationsPath,
    },
  });

export const runDatabaseMigrations = async ({
  logger,
  slonik,
}: {
  logger: Logger;
  slonik: DatabasePool;
}): Promise<void> => {
  if (config.database.migrator.runMigrations) {
    logger.child({ module: "umzug" }).debug("Running database migrations");
    const umzug = getUmzugInstance({ logger, slonik });
    await umzug.up();
  } else {
    logger.child({ module: "umzug" }).debug("No migrations to run as feature is disabled");
  }
};

if (require.main === module) {
  void getSlonikInstance({ logger }).then((slonik) => {
    void getUmzugInstance({
      logger,
      slonik,
    }).runAsCLI();
  });
}
