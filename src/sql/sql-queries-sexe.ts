import { Sexe } from "../model/types/sexe.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import { COLUMN_LIBELLE, ORDER_ASC, TABLE_SEXE } from "../utils/constants";
import { queryToFindNumberOfDonneesByDonneeEntityId } from "./sql-queries-donnee";
import { queryToFindAllEntities } from "./sql-queries-utils";

export const queryToFindAllSexes = async (): Promise<Sexe[]> => {
  return queryToFindAllEntities<Sexe>(TABLE_SEXE, COLUMN_LIBELLE, ORDER_ASC);
};

export const queryToFindNumberOfDonneesBySexeId = async (
  sexeId?: number
): Promise<NumberOfObjectsById[]> => {
  return queryToFindNumberOfDonneesByDonneeEntityId("sexe_id", sexeId);
};
