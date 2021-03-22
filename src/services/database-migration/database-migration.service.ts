import { checkIfTableObservateurExists } from "../../sql-api/sql-api-observateur";
import { findVersion, updateVersion } from "../../sql-api/sql-api-version";
import { logger } from "../../utils/logger";

const LAST_VERSION = 1;

const checkAndInitializeDatabase = async (): Promise<boolean> => {
  const tableObservateurExists = await checkIfTableObservateurExists();
  if (!tableObservateurExists) {
    logger.info("Initializing database : creating all tables.");
    // TO DO
    await updateVersion(LAST_VERSION);
  }
  return tableObservateurExists;
}

export const executeDatabaseMigration = async (): Promise<void> => {
  const wasDatabaseAlreadyExisting = await checkAndInitializeDatabase();
  if (!wasDatabaseAlreadyExisting) {
    // Database wasn't existing and has been fully initialized
    return;
  }

  const currentVersion = await findVersion();
  logger.info(`Current database version is v${currentVersion}, last database version is v${LAST_VERSION}.`);
  for (let version = currentVersion + 1; version <= LAST_VERSION; version++) {
    logger.info(`Migrating database from version v${version - 1} to version v${version}.`);
    await MIGRATION[`migration${version}`]();
    await updateVersion(version);
  }
};

const migrationFromV0toV1 = async () => {
  // TO DO
}

const MIGRATION: {
  [path: string]: () => Promise<void>;
} = {
  "migration1": migrationFromV0toV1
};