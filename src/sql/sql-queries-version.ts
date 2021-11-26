import { query } from "./sql-queries-utils";

export const queryToCreateVersionTable = async (): Promise<void> => {
  await query<void>("CREATE TABLE IF NOT EXISTS version (" +
    " version SMALLINT(5) UNSIGNED NOT NULL," +
    " PRIMARY KEY(version)" +
    " )");

  await query<void>("INSERT INTO version VALUES (0)");
}
