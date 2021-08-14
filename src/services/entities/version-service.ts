import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import prisma from "../../sql/prisma";
import { queryToUpdateVersion } from "../../sql/sql-queries-version";

export const findVersion = async (): Promise<number> => {
  return prisma.version.findFirst().then(version => version.version);
};

export const updateVersion = async (version: number): Promise<SqlSaveResponse> => {
  return queryToUpdateVersion(version);
};
