import { Coordinates } from "../model/types/coordinates.object";
import { Inventaire } from "../model/types/inventaire.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import { getFirstResult, query } from "./sql-queries-utils";

export const queryToFindNumberOfDonneesByInventaireEntityId = async (
  entityIdAttribute: string,
  id?: number
): Promise<NumberOfObjectsById[]> => {
  let queryStr: string =
    `SELECT i.${entityIdAttribute} as id, count(*) as nb` +
    " FROM donnee d, inventaire i " +
    " WHERE d.inventaire_id=i.id";
  if (id) {
    queryStr = queryStr +
      ` AND i.${entityIdAttribute}=${id}`;
  } else {
    queryStr = queryStr +
      ` GROUP BY i.${entityIdAttribute}`;
  }
  return query<NumberOfObjectsById[]>(queryStr);
};

export const queryToFindInventaireIdById = async (
  id: number
): Promise<{ id: number }[]> => {
  return query<{ id: number }[]>(`SELECT id FROM inventaire WHERE id=${id}`);
};

/**
 * Note: Coordinates longitude and latitude are excluded from this search
 * because they can be in different coordinates systems
 */
export const queryToFindInventairesIdsByAllAttributes = async (
  inventaire: Inventaire
): Promise<{ id: number }[]> => {
  let queryStr: string =
    "SELECT i.id as id" +
    " FROM inventaire i" +
    ` WHERE i.observateur_id=${inventaire.observateurId}` +
    ` AND i.date=STR_TO_DATE('${inventaire.date}', '%Y-%m-%d')` +
    ` AND i.lieudit_id=${inventaire.lieuditId}`;

  queryStr =
    queryStr +
    " AND i.heure" +
    (!inventaire.heure ? " is null" : `="${inventaire.heure}"`);

  queryStr =
    queryStr +
    " AND i.duree" +
    (!inventaire.duree ? " is null" : `="${inventaire.duree}"`);

  queryStr =
    queryStr +
    " AND i.altitude" +
    ((inventaire.customizedAltitude == null)
      ? " is null"
      : `=${inventaire.customizedAltitude}`);

  queryStr =
    queryStr +
    " AND i.temperature" +
    ((inventaire.temperature == null)
      ? " is null"
      : `=${inventaire.temperature}`);

  return query<{ id: number }[]>(queryStr);
};

export const queryToFindCoordinatesByInventaireId = async (
  inventaireId: number
): Promise<
  Coordinates
> => {
  const queryStr: string =
    "SELECT longitude, latitude, coordinates_system as system" +
    " FROM inventaire" +
    ` WHERE id=${inventaireId}`;

  const results = await query<Coordinates[]>(queryStr);
  return getFirstResult(results);
};
