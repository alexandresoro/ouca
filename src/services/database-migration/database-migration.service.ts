import { logger } from "../../utils/logger";
import { createAndInitializeAllTables } from "../entities/entity-service";
import { checkIfTableObservateurExists } from "../entities/observateur-service";
import { findVersion, updateVersion } from "../entities/version-service";

export const APPLICATION_DATA_VERSION = 1;

const checkAndInitializeDatabase = async (): Promise<boolean> => {
  const tableObservateurExists = await checkIfTableObservateurExists();

  if (!tableObservateurExists) {
    logger.info("Initializing database : creating all tables.");
    await createAndInitializeAllTables();
    await updateVersion(APPLICATION_DATA_VERSION);
  }

  return tableObservateurExists;
}

export const executeDatabaseMigration = async (): Promise<void> => {
  const wasDatabaseAlreadyExisting = await checkAndInitializeDatabase();
  if (!wasDatabaseAlreadyExisting) {
    // Database wasn't existing and has been fully initialized
    return;
  }

  const { database: currentVersion } = await findVersion();
  logger.info(`Current database version is v${currentVersion}, last database version is v${APPLICATION_DATA_VERSION}.`);
  for (let version = currentVersion + 1; version <= APPLICATION_DATA_VERSION; version++) {
    logger.info(`Migrating database from version v${version - 1} to version v${version}.`);
    await MIGRATION[version]?.();
    await updateVersion(version);
  }
};

const migrationFromV1toV2 = async () => {
  // To fill when a database migration script is required
}

const MIGRATION: {
  [path: string]: () => Promise<void>;
} = {
  2: migrationFromV1toV2
};