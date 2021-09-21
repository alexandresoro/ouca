import { query } from "./sql-queries-utils";

export const queryToCreateCommuneTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS commune (" +
    " id SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT," +
    " departement_id SMALLINT(5) UNSIGNED NOT NULL," +
    " code SMALLINT(5) UNSIGNED NOT NULL," +
    " nom VARCHAR(100) NOT NULL," +
    " PRIMARY KEY (id)," +
    " UNIQUE KEY `unique_departement_code` (departement_id,code)," +
    " UNIQUE KEY `unique_departement_nom` (departement_id,nom)," +
    " CONSTRAINT `fk_commune_departement_id` FOREIGN KEY (departement_id) REFERENCES departement (id) ON DELETE CASCADE" +
    " )");
}
