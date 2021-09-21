import { query } from "./sql-queries-utils";

export const queryToCreateEspeceTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS espece (" +
    " id MEDIUMINT(8) UNSIGNED NOT NULL AUTO_INCREMENT," +
    " classe_id SMALLINT(5) UNSIGNED DEFAULT NULL," +
    " code VARCHAR(20) NOT NULL," +
    " nom_francais VARCHAR(100) NOT NULL," +
    " nom_latin VARCHAR(100) NOT NULL," +
    " PRIMARY KEY (id)," +
    " UNIQUE KEY `unique_code` (code)," +
    " UNIQUE KEY `unique_nom_francais` (nom_francais)," +
    " UNIQUE KEY `unique_nom_latin` (nom_latin)," +
    " CONSTRAINT `fk_espece_classe_id` FOREIGN KEY (classe_id) REFERENCES classe (id) ON DELETE CASCADE" +
    " )");
}
