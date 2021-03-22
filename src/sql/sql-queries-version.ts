import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { getFirstResult, query } from "./sql-queries-utils";

export const queryToFindVersion = async (): Promise<number> => {
  const queryStr =
    `SELECT * FROM version`;
  const results = await query<number[]>(queryStr);
  return getFirstResult<number>(results);
};

export const queryToUpdateVersion = async (version: number): Promise<SqlSaveResponse> => {
  const queryStr = `UPDATE version SET version=${version}`;
  return query<SqlSaveResponse>(queryStr);
};
