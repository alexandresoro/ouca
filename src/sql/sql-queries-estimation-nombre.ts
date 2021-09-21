import { query } from "./sql-queries-utils";

export const queryToCreateEstimationNombreTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS estimation_nombre (" +
    " id SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT," +
    " libelle VARCHAR(100) NOT NULL," +
    " non_compte BIT(1) NOT NULL," +
    " PRIMARY KEY (id)," +
    " UNIQUE KEY `unique_libelle` (libelle)" +
    " )");
}
