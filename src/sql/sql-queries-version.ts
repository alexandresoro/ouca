import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { query } from "./sql-queries-utils";

export const queryToCreateVersionTable = async (): Promise<void> => {
  await query<void>("CREATE TABLE IF NOT EXISTS version (" +
    " version SMALLINT(5) UNSIGNED NOT NULL," +
    " PRIMARY KEY(version)" +
    " )");

  await query<void>("INSERT INTO version VALUES (0)");
}

export const queryToUpdateVersion = async (version: number): Promise<SqlSaveResponse> => {
  const queryStr = `UPDATE version SET version=${version}`;
  return query<SqlSaveResponse>(queryStr);
};
