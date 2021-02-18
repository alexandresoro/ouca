import { Age } from "@ou-ca/ouca-model";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import { COLUMN_LIBELLE, ORDER_ASC, TABLE_AGE } from "../utils/constants";
import { queryToFindNumberOfDonneesByDonneeEntityId } from "./sql-queries-donnee";
import { queryToFindAllEntities } from "./sql-queries-utils";

export const queryToFindAllAges = async (): Promise<Age[]> => {
  return queryToFindAllEntities<Age>(TABLE_AGE, COLUMN_LIBELLE, ORDER_ASC);
};

export const queryToFindNumberOfDonneesByAgeId = async (
  ageId?: number
): Promise<NumberOfObjectsById[]> => {
  return queryToFindNumberOfDonneesByDonneeEntityId("age_id", ageId);
};
