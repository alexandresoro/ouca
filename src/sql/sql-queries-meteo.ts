import { Meteo } from "ouca-common/meteo.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import { COLUMN_LIBELLE, ORDER_ASC, TABLE_METEO } from "../utils/constants";
import { getQuery, query, queryToFindAllEntities } from "./sql-queries-utils";

export const queryToFindAllMeteos = async (): Promise<Meteo[]> => {
  return queryToFindAllEntities<Meteo>(TABLE_METEO, COLUMN_LIBELLE, ORDER_ASC);
};

export function getQueryToFindAllMeteos(donneesIds?: number[]): string {
  let query: string =
    "SELECT d.id as donneeId, m.libelle" +
    " FROM inventaire_meteo i" +
    " INNER JOIN donnee d ON d.inventaire_id = i.inventaire_id" +
    " LEFT JOIN meteo m ON i.meteo_id = m.id";

  if (donneesIds && donneesIds.length) {
    query = query + " WHERE d.id IN (" + donneesIds.join(",") + ")";
  }

  return getQuery(query);
}

export function getQueryToFindMetosByInventaireId(
  inventaireId: number
): string {
  return getQuery(
    "SELECT distinct meteo_id as meteoId FROM inventaire_meteo WHERE inventaire_id=" +
      inventaireId
  );
}

export const queryToFindNumberOfDonneesByMeteoId = async (
  meteoId?: number
): Promise<NumberOfObjectsById[]> => {
  let queryStr: string =
    "SELECT im.meteo_id as id, count(*) as nb " +
    "FROM inventaire_meteo im, donnee d " +
    "WHERE d.inventaire_id=im.inventaire_id";
  if (meteoId) {
    queryStr = queryStr + " AND im.meteo_id=" + meteoId;
  } else {
    queryStr = queryStr + " GROUP BY im.meteo_id";
  }
  return query<NumberOfObjectsById[]>(queryStr);
};
