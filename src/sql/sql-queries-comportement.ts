import { query } from "./sql-queries-utils";

export const queryToCreateComportementTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS comportement (" +
    " id SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT," +
    " code VARCHAR(6) NOT NULL," +
    " libelle VARCHAR(100) NOT NULL," +
    " nicheur VARCHAR(10) NULL DEFAULT NULL," +
    " PRIMARY KEY (id)," +
    " UNIQUE KEY `unique_code` (code)," +
    " UNIQUE KEY `unique_libelle` (libelle)" +
    " )");
}
