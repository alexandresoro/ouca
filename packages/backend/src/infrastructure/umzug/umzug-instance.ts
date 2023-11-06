import fs from "node:fs";
import path from "node:path";
import { sql, type DatabasePool } from "slonik";
import { Umzug } from "umzug";
import { z } from "zod";
import { getDbConfig } from "../../config.js";
import { logger } from "../../utils/logger.js";

const dbConfig = getDbConfig();

export const getUmzugInstance = ({ slonik }: { slonik: DatabasePool }) =>
  new Umzug({
    migrations: {
      glob: `${dbConfig.migrator.migrationsPath}/*.sql`,
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
            dbConfig.migrator.migrationTableSchema,
            dbConfig.migrator.migrationTableName,
          ])}(name text, date timestamptz not null default now())`
        );
        const names = await context.slonik.anyFirst(
          sql.type(z.object({ name: z.string() }))`SELECT name from ${sql.identifier([
            dbConfig.migrator.migrationTableSchema,
            dbConfig.migrator.migrationTableName,
          ])}`
        );
        return [...names];
      },
      async logMigration({ name, context }) {
        await context.slonik.query(
          sql.unsafe`INSERT INTO ${sql.identifier([
            dbConfig.migrator.migrationTableSchema,
            dbConfig.migrator.migrationTableName,
          ])}(name) VALUES (${name})`
        );
      },
      async unlogMigration({ name, context }) {
        await context.slonik.query(
          sql.unsafe`DELETE FROM ${sql.identifier([
            dbConfig.migrator.migrationTableSchema,
            dbConfig.migrator.migrationTableName,
          ])} WHERE name = ${name}`
        );
      },
    },
    logger: logger.child({ module: "umzug" }),
    create: {
      folder: dbConfig.migrator.migrationsPath,
    },
  });
