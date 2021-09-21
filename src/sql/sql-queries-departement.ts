import { query } from "./sql-queries-utils";

export const queryToCreateDepartementTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS departement (" +
    " id SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT," +
    " code VARCHAR(100) NOT NULL," +
    " PRIMARY KEY (id)," +
    " UNIQUE KEY `unique_code` (code)" +
    " )");
}
