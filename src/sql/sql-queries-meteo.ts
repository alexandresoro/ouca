import { Meteo } from "@ou-ca/ouca-model";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import { COLUMN_LIBELLE, ORDER_ASC, TABLE_METEO } from "../utils/constants";
import { query, queryToFindAllEntities } from "./sql-queries-utils";

export const queryToFindAllMeteos = async (): Promise<Meteo[]> => {
  return queryToFindAllEntities<Meteo>(TABLE_METEO, COLUMN_LIBELLE, ORDER_ASC);
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
    queryStr = queryStr + " WHERE d.id IN (" + donneesIds.join(",") + ")";
  }

  return query<{ donneeId: number; libelle: string }[]>(queryStr);
};

export const queryToFindMetosByInventaireId = async (
  inventaireId: number
): Promise<{ meteoId: number }[]> => {
  return query<{ meteoId: number }[]>(
    "SELECT distinct meteo_id as meteoId" +
    " FROM inventaire_meteo" +
    " WHERE inventaire_id=" +
    inventaireId
  );
};

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
