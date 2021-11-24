import { query } from "./sql-queries-utils";

export const queryToCreateObservateurTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS observateur (" +
    " id SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT," +
    " libelle VARCHAR(100) NOT NULL," +
    " PRIMARY KEY (id)," +
    " UNIQUE KEY `unique_libelle` (libelle)" +
    " )");
}
