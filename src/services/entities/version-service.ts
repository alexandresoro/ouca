import { Version } from "../../model/graphql";
import prisma from "../../sql/prisma";
import { APPLICATION_DATA_VERSION } from "../database-migration/database-migration.service";

export const findVersion = async (): Promise<Version> => {
  const versionDb = await prisma.version.findFirst();
  return {
    database: versionDb?.version ?? -1,
    application: APPLICATION_DATA_VERSION
  }
};

export const updateVersion = async (version: number): Promise<void> => {

  const existingVersion = await prisma.version.findFirst();

  if (!existingVersion) {
    await prisma.version.create({
      data: {
        version: 0
      }
    })
  }

  await prisma.version.updateMany({
    data: {
      version
    }
  });
};
