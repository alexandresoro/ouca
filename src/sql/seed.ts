import { logger } from "../utils/logger";
import prisma from "./prisma";

export async function seedDatabase() {
  logger.info("Seeding the database...");

  // Create the default database version
  const existingVersion = await prisma.version.findFirst();
  if (existingVersion == null) {
    logger.info("Version is not set in the datase, setting it...");
    const version = await prisma.version.create({
      data: {
        version: 0
      }
    });
    logger.info(`Version has been initialized with version ${version?.version}`);
  } else {
    logger.debug("Version is set in the database, skipping...");
  }
}
