import { Sexe } from "../model/types/sexe.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import { COLUMN_LIBELLE } from "../utils/constants";
import prisma from "./prisma";
import { queryToFindNumberOfDonneesByDonneeEntityId } from "./sql-queries-donnee";
import { query, queryParametersToFindAllEntities } from "./sql-queries-utils";

export const queryToCreateSexeTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS sexe (" +
    " id SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT," +
    " libelle VARCHAR(100) NOT NULL," +
    " PRIMARY KEY (id)," +
    " UNIQUE KEY `unique_libelle` (libelle)" +
    " )");
}

export const queryToFindAllSexes = async (): Promise<Sexe[]> => {
  return prisma.sexe.findMany(queryParametersToFindAllEntities(COLUMN_LIBELLE));
};

export const queryToFindNumberOfDonneesBySexeId = async (
  sexeId?: number
): Promise<NumberOfObjectsById[]> => {
  return queryToFindNumberOfDonneesByDonneeEntityId("sexe_id", sexeId);
};
