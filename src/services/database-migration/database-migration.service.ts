import { logger } from "../../utils/logger";
import { findVersion, updateVersion } from "../entities/version-service";

export const APPLICATION_DATA_VERSION = 1;

export const executeDatabaseMigration = async (): Promise<void> => {

  const { database: currentVersion } = await findVersion();
  if (currentVersion < 0) {
    // That means the database is not even initialized
    return;
  }
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