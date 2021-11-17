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
