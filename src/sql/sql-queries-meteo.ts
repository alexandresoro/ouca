import { query } from "./sql-queries-utils";

export const queryToCreateMeteoTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS meteo (" +
    " id SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT," +
    " libelle VARCHAR(100) NOT NULL," +
    " PRIMARY KEY (id)," +
    " UNIQUE KEY `unique_libelle` (libelle)" +
    " )");
}

export const queryToFindAllMeteosByDonneeId = async (
  donneesIds?: number[]
): Promise<{ donneeId: number; libelle: string }[]> => {
  let queryStr: string =
    "SELECT d.id as donneeId, m.libelle" +
    " FROM inventaire_meteo i" +
    " INNER JOIN donnee d ON d.inventaire_id = i.inventaire_id" +
    " LEFT JOIN meteo m ON i.meteo_id = m.id";

  if (donneesIds && donneesIds.length) {
    queryStr = queryStr +
      ` WHERE d.id IN (${donneesIds.join(",")})`;
  }

  return query<{ donneeId: number; libelle: string }[]>(queryStr);
};

export const queryToFindMeteosByInventaireId = async (
  inventaireId: number
): Promise<{ meteoId: number }[]> => {
  return query<{ meteoId: number }[]>(
    "SELECT distinct meteo_id as meteoId" +
    " FROM inventaire_meteo" +
    ` WHERE inventaire_id=${inventaireId}`
  );
};
