import { Classe } from "../model/types/classe.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import { COLUMN_LIBELLE, ORDER_ASC, TABLE_CLASSE } from "../utils/constants";
import { query, queryToFindAllEntities } from "./sql-queries-utils";

export const queryToCreateClasseTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS classe (" +
    " id SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT," +
    " libelle VARCHAR(100) NOT NULL," +
    " PRIMARY KEY (id)," +
    " UNIQUE KEY `unique_libelle` (libelle)" +
    " )");
}

export const queryToFindAllClasses = async (): Promise<Classe[]> => {
  return queryToFindAllEntities<Classe>(
    TABLE_CLASSE,
    COLUMN_LIBELLE,
    ORDER_ASC
  );
};

export const queryToFindNumberOfEspecesByClasseId = async (
  classeId?: number
): Promise<NumberOfObjectsById[]> => {
  let queryStr = "SELECT classe_id as id, count(*) as nb FROM espece";
  if (classeId) {
    queryStr = queryStr +
      ` WHERE classe_id=${classeId}`;
  } else {
    queryStr = queryStr +
      " GROUP BY classe_id";
  }
  return query<NumberOfObjectsById[]>(queryStr);
};

export const queryToFindNumberOfDonneesByClasseId = async (
  classeId?: number
): Promise<NumberOfObjectsById[]> => {
  let queryStr =
    "SELECT e.classe_id as id, count(*) as nb FROM espece e, donnee d WHERE d.espece_id=e.id";
  if (classeId) {
    queryStr = queryStr +
      ` AND e.classe_id=${classeId}`;
  } else {
    queryStr = queryStr +
      " GROUP BY classe_id";
  }
  return query<NumberOfObjectsById[]>(queryStr);
};
