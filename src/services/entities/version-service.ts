import { Version } from "../../model/graphql";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import prisma from "../../sql/prisma";
import { queryToUpdateVersion } from "../../sql/sql-queries-version";
import { APPLICATION_DATA_VERSION } from "../database-migration/database-migration.service";

export const findVersion = async (): Promise<Version> => {
  const versionDb = await prisma.version.findFirst();
  return {
    database: versionDb?.version ?? 0,
    application: APPLICATION_DATA_VERSION
  }
};

export const updateVersion = async (version: number): Promise<SqlSaveResponse> => {
  return queryToUpdateVersion(version);
};
