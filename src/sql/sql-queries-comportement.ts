import { NicheurCode } from "../model/types/nicheur.model";
import { ComportementDb } from "../objects/db/comportement-db.model";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import { COLUMN_CODE } from "../utils/constants";
import prisma from "./prisma";
import { query, queryParametersToFindAllEntities } from "./sql-queries-utils";

export const queryToCreateComportementTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS comportement (" +
    " id SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT," +
    " code VARCHAR(6) NOT NULL," +
    " libelle VARCHAR(100) NOT NULL," +
    " nicheur VARCHAR(10) NULL DEFAULT NULL," +
    " PRIMARY KEY (id)," +
    " UNIQUE KEY `unique_code` (code)," +
    " UNIQUE KEY `unique_libelle` (libelle)" +
    " )");
}

export const queryToFindAllComportements = async (): Promise<
  ComportementDb[]
> => {
  return prisma.comportement.findMany(queryParametersToFindAllEntities(COLUMN_CODE));
};

export const queryToFindAllComportementsByDonneeId = async (
  donneesIds?: number[]
): Promise<{ donneeId: number; code: string; libelle: string, nicheur?: NicheurCode | null }[]> => {
  let queryStr: string =
    "SELECT d.donnee_id as donneeId, c.code, c.libelle, c.nicheur" +
    " FROM donnee_comportement d" +
    " INNER JOIN comportement c ON d.comportement_id = c.id";

  if (donneesIds && donneesIds.length) {
    queryStr = queryStr +
      ` WHERE d.donnee_id IN (${donneesIds.join(",")})`;
  }

  return query<
    { donneeId: number; code: string; libelle: string; nicheur?: NicheurCode | null }[]
  >(queryStr);
};

export const queryToFindComportementsIdsByDonneeId = async (
  donneeId: number
): Promise<{ comportementId: number }[]> => {
  return query<{ comportementId: number }[]>(
    "SELECT distinct comportement_id as comportementId" +
    " FROM donnee_comportement" +
    ` WHERE donnee_id=${donneeId}`
  );
};

export const queryToFindNumberOfDonneesByComportementId = async (
  comportementId?: number
): Promise<NumberOfObjectsById[]> => {
  let queryStr: string =
    "SELECT dc.comportement_id as id, count(*) as nb" +
    " FROM donnee_comportement dc ";
  if (comportementId) {
    queryStr = queryStr +
      ` WHERE dc.comportement_id=${comportementId}`;
  } else {
    queryStr = queryStr +
      " GROUP BY dc.comportement_id";
  }
  return query<NumberOfObjectsById[]>(queryStr);
};
