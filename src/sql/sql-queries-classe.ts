import { Classe } from "@ou-ca/ouca-model/classe.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import { COLUMN_LIBELLE, ORDER_ASC, TABLE_CLASSE } from "../utils/constants";
import { query, queryToFindAllEntities } from "./sql-queries-utils";

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
    queryStr = queryStr + " WHERE classe_id=" + classeId;
  } else {
    queryStr = queryStr + " GROUP BY classe_id";
  }
  return query<NumberOfObjectsById[]>(queryStr);
};

export const queryToFindNumberOfDonneesByClasseId = async (
  classeId?: number
): Promise<NumberOfObjectsById[]> => {
  let queryStr =
    "SELECT e.classe_id as id, count(*) as nb FROM espece e, donnee d WHERE d.espece_id=e.id";
  if (classeId) {
    queryStr = queryStr + " AND e.classe_id=" + classeId;
  } else {
    queryStr = queryStr + " GROUP BY classe_id";
  }
  return query<NumberOfObjectsById[]>(queryStr);
};
