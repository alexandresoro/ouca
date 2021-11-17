import { query } from "./sql-queries-utils";

export const queryToCreateMeteoTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS meteo (" +
    " id SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT," +
    " libelle VARCHAR(100) NOT NULL," +
    " PRIMARY KEY (id)," +
    " UNIQUE KEY `unique_libelle` (libelle)" +
    " )");
}

export const queryToFindMeteosByInventaireId = async (
  inventaireId: number
): Promise<{ meteoId: number }[]> => {
  return query<{ meteoId: number }[]>(
    "SELECT distinct meteo_id as meteoId" +
    " FROM inventaire_meteo" +
    ` WHERE inventaire_id=${inventaireId}`
  );
};
