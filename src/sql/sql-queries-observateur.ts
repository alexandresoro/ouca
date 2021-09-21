import { query } from "./sql-queries-utils";

export const queryToCreateObservateurTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS observateur (" +
    " id SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT," +
    " libelle VARCHAR(100) NOT NULL," +
    " PRIMARY KEY (id)," +
    " UNIQUE KEY `unique_libelle` (libelle)" +
    " )");
}

export const queryToFindAssociesByInventaireId = async (
  inventaireId: number
): Promise<{ associeId: number }[]> => {
  return query<{ associeId: number }[]>(
    "SELECT distinct observateur_id as associeId" +
    " FROM inventaire_associe" +
    ` WHERE inventaire_id=${inventaireId}`
  );
};

export const queryToFindAllAssociesByDonneeId = async (
  donneesIds?: number[]
): Promise<{ donneeId: number; libelle: string }[]> => {
  let queryStr: string =
    "SELECT d.id as donneeId, o.libelle" +
    " FROM inventaire_associe i" +
    " INNER JOIN donnee d ON d.inventaire_id = i.inventaire_id" +
    " LEFT JOIN observateur o ON i.observateur_id = o.id";

  if (donneesIds && donneesIds.length) {
    queryStr = queryStr +
      ` WHERE d.id IN (${donneesIds.join(",")})`;
  }

  return query<{ donneeId: number; libelle: string }[]>(queryStr);
};
