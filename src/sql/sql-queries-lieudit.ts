import { query } from "./sql-queries-utils";

export const queryToCreateLieuDitTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS lieudit (" +
    " id MEDIUMINT(8) UNSIGNED NOT NULL AUTO_INCREMENT," +
    " commune_id SMALLINT(5) UNSIGNED NOT NULL," +
    " nom varchar(150) NOT NULL," +
    " altitude SMALLINT(5) UNSIGNED NOT NULL," +
    " longitude DECIMAL(13,6) NOT NULL," +
    " latitude DECIMAL(16,6) NOT NULL," +
    " coordinates_system VARCHAR (20) NOT NULL," +
    " PRIMARY KEY (id)," +
    " UNIQUE KEY `unique_commune_nom` (commune_id,nom)," +
    " CONSTRAINT `fk_lieudit_commune_id` FOREIGN KEY (commune_id) REFERENCES commune (id) ON DELETE CASCADE" +
    " )");
}
