import { query } from "./sql-queries-utils";

export const queryToCreateMilieuTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS milieu (" +
    " id SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT," +
    " code VARCHAR(6) NOT NULL," +
    " libelle VARCHAR(100) NOT NULL," +
    " PRIMARY KEY (id)," +
    " UNIQUE KEY `unique_code` (code)," +
    " UNIQUE KEY `unique_libelle` (libelle)" +
    " )");
}
