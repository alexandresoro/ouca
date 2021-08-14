import { Milieu } from "../model/types/milieu.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import { COLUMN_CODE } from "../utils/constants";
import prisma from "./prisma";
import { query, queryParametersToFindAllEntities } from "./sql-queries-utils";

export const queryToCreateMilieuTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS milieu (" +
    " id SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT," +
    " code VARCHAR(6) NOT NULL," +
    " libelle VARCHAR(100) NOT NULL," +
    " PRIMARY KEY (id)," +
    " UNIQUE KEY `unique_code` (code)," +
    " UNIQUE KEY `unique_libelle` (libelle)" +
    " )");
}

export const queryToFindAllMilieux = async (): Promise<Milieu[]> => {
  return prisma.milieu.findMany(queryParametersToFindAllEntities(COLUMN_CODE));
};

export const queryToFindAllMilieuxByDonneeId = async (
  donneesIds?: number[]
): Promise<{ donneeId: number; code: string; libelle: string }[]> => {
  let queryStr: string =
    "SELECT d.donnee_id as donneeId, m.code, m.libelle" +
    " FROM donnee_milieu d" +
    " INNER JOIN milieu m ON d.milieu_id = m.id";

  if (donneesIds && donneesIds.length) {
    queryStr =
      queryStr +
      ` WHERE d.donnee_id IN (${donneesIds.join(",")})`;
  }

  return query<{ donneeId: number; code: string; libelle: string }[]>(queryStr);
};

export const queryToFindMilieuxIdsByDonneeId = async (
  donneeId: number
): Promise<{ milieuId: number }[]> => {
  return query<{ milieuId: number }[]>(
    "SELECT distinct milieu_id as milieuId" +
    " FROM donnee_milieu" +
    ` WHERE donnee_id=${donneeId}`
  );
};

export const queryToFindNumberOfDonneesByMilieuId = async (
  milieuId?: number
): Promise<NumberOfObjectsById[]> => {
  let queryStr: string =
    "SELECT dc.milieu_id as id, count(*) as nb " + "FROM donnee_milieu dc ";
  if (milieuId) {
    queryStr = queryStr +
      ` WHERE dc.milieu_id=${milieuId}`;
  } else {
    queryStr = queryStr + " GROUP BY dc.milieu_id";
  }
  return query<NumberOfObjectsById[]>(queryStr);
};
