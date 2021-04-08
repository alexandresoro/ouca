import { Age } from "../model/types/age.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import { COLUMN_LIBELLE, ORDER_ASC, TABLE_AGE } from "../utils/constants";
import { queryToFindNumberOfDonneesByDonneeEntityId } from "./sql-queries-donnee";
import { query, queryToFindAllEntities } from "./sql-queries-utils";

export const queryToCreateAgeTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS age (" +
    " id SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT," +
    " libelle VARCHAR(100) NOT NULL," +
    " PRIMARY KEY (id)," +
    " UNIQUE KEY `unique_libelle` (libelle)" +
    " )");
}

export const queryToFindAllAges = async (): Promise<Age[]> => {
  return queryToFindAllEntities<Age>(TABLE_AGE, COLUMN_LIBELLE, ORDER_ASC);
};

export const queryToFindNumberOfDonneesByAgeId = async (
  ageId?: number
): Promise<NumberOfObjectsById[]> => {
  return queryToFindNumberOfDonneesByDonneeEntityId("age_id", ageId);
};
