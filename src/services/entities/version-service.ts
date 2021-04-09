import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { queryToFindVersion, queryToUpdateVersion } from "../../sql/sql-queries-version";

export const findVersion = async (): Promise<number> => {
  return queryToFindVersion();
};

export const updateVersion = async (version: number): Promise<SqlSaveResponse> => {
  return queryToUpdateVersion(version);
};
