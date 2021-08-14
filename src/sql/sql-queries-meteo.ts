import { Meteo } from "../model/types/meteo.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import { COLUMN_LIBELLE } from "../utils/constants";
import prisma from "./prisma";
import { query, queryParametersToFindAllEntities } from "./sql-queries-utils";

export const queryToCreateMeteoTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS meteo (" +
    " id SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT," +
    " libelle VARCHAR(100) NOT NULL," +
    " PRIMARY KEY (id)," +
    " UNIQUE KEY `unique_libelle` (libelle)" +
    " )");
}

export const queryToFindAllMeteos = async (): Promise<Meteo[]> => {
  return prisma.meteo.findMany(queryParametersToFindAllEntities(COLUMN_LIBELLE));
};

export const queryToFindAllMeteosByDonneeId = async (
  donneesIds?: number[]
): Promise<{ donneeId: number; libelle: string }[]> => {
  let queryStr: string =
    "SELECT d.id as donneeId, m.libelle" +
    " FROM inventaire_meteo i" +
    " INNER JOIN donnee d ON d.inventaire_id = i.inventaire_id" +
    " LEFT JOIN meteo m ON i.meteo_id = m.id";

  if (donneesIds && donneesIds.length) {
    queryStr = queryStr +
      ` WHERE d.id IN (${donneesIds.join(",")})`;
  }

  return query<{ donneeId: number; libelle: string }[]>(queryStr);
};

export const queryToFindMeteosByInventaireId = async (
  inventaireId: number
): Promise<{ meteoId: number }[]> => {
  return query<{ meteoId: number }[]>(
    "SELECT distinct meteo_id as meteoId" +
    " FROM inventaire_meteo" +
    ` WHERE inventaire_id=${inventaireId}`
  );
};

export const queryToFindNumberOfDonneesByMeteoId = async (
  meteoId?: number
): Promise<NumberOfObjectsById[]> => {
  let queryStr: string =
    "SELECT im.meteo_id as id, count(*) as nb" +
    " FROM inventaire_meteo im, donnee d" +
    " WHERE d.inventaire_id=im.inventaire_id";
  if (meteoId) {
    queryStr = queryStr +
      ` AND im.meteo_id=${meteoId}`;
  } else {
    queryStr = queryStr +
      " GROUP BY im.meteo_id";
  }
  return query<NumberOfObjectsById[]>(queryStr);
};
