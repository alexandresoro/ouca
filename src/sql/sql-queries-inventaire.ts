import { Coordinates } from "../model/types/coordinates.object";
import { Inventaire } from "../model/types/inventaire.object";
import { InventaireCompleteWithIds, InventaireDbWithJoins } from "../objects/db/inventaire-db.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import { getFirstResult, query } from "./sql-queries-utils";

export const queryToCreateInventaireTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS inventaire (" +
    " id MEDIUMINT(8) UNSIGNED NOT NULL AUTO_INCREMENT," +
    " observateur_id SMALLINT(5) UNSIGNED NOT NULL," +
    " date DATE NOT NULL," +
    " heure VARCHAR(5) DEFAULT NULL," +
    " duree VARCHAR(5) DEFAULT NULL," +
    " lieudit_id MEDIUMINT(8) UNSIGNED NOT NULL," +
    " altitude SMALLINT(5) UNSIGNED DEFAULT NULL," +
    " longitude DECIMAL(13,6) DEFAULT NULL," +
    " latitude DECIMAL(13,6) DEFAULT NULL," +
    " coordinates_system VARCHAR(20) DEFAULT NULL," +
    " temperature TINYINT(4) DEFAULT NULL," +
    " date_creation DATETIME NOT NULL," +
    " PRIMARY KEY (id)," +
    " CONSTRAINT `fk_inventaire_observateur_id` FOREIGN KEY (observateur_id) REFERENCES observateur (id) ON DELETE CASCADE," +
    " CONSTRAINT `fk_inventaire_lieudit_id` FOREIGN KEY (lieudit_id) REFERENCES lieudit (id) ON DELETE CASCADE" +
    " )");
}

export const queryToCreateInventaireAssocieTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS inventaire_associe (" +
    " inventaire_id MEDIUMINT(8) UNSIGNED NOT NULL," +
    " observateur_id SMALLINT(5) UNSIGNED NOT NULL," +
    " PRIMARY KEY (inventaire_id,observateur_id)," +
    " CONSTRAINT `fk_inventaire_associe_inventaire_id` FOREIGN KEY (inventaire_id) REFERENCES inventaire (id) ON DELETE CASCADE," +
    " CONSTRAINT `fk_inventaire_associe_observateur_id` FOREIGN KEY (observateur_id) REFERENCES observateur (id) ON DELETE CASCADE" +
    " )");
}

export const queryToCreateInventaireMeteoTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS inventaire_meteo (" +
    " inventaire_id MEDIUMINT(8) UNSIGNED NOT NULL," +
    " meteo_id SMALLINT(5) UNSIGNED NOT NULL," +
    " PRIMARY KEY (inventaire_id,meteo_id)," +
    " CONSTRAINT `fk_inventaire_meteo_inventaire_id` FOREIGN KEY (inventaire_id) REFERENCES inventaire (id) ON DELETE CASCADE," +
    " CONSTRAINT `fk_inventaire_meteo_meteo_id` FOREIGN KEY (meteo_id) REFERENCES meteo (id) ON DELETE CASCADE" +
    " )");
}

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

export const queryToGetAllInventairesWithIds = async (): Promise<InventaireCompleteWithIds[]> => {
  const inventairesWithJoins = await query<InventaireDbWithJoins[]>("SELECT i.id,i.observateur_id,i.date,i.heure,i.duree,i.lieudit_id,i.altitude,i.longitude,i.latitude,i.coordinates_system,i.temperature,i.date_creation" +
    ',GROUP_CONCAT(Distinct meteo_id SEPARATOR ",") as meteos_ids,GROUP_CONCAT(Distinct a.observateur_id SEPARATOR ",") as associes_ids' +
    " FROM inventaire i" +
    " LEFT JOIN inventaire_meteo m on i.id = m.inventaire_id" +
    " LEFT JOIN inventaire_associe a on i.id = a.inventaire_id" +
    " GROUP BY i.id"
  );

  const inventairesProper = inventairesWithJoins.map((inventaire) => {
    const { meteos_ids, associes_ids, ...otherFieldsInventaire } = inventaire;
    return {
      meteos_ids: new Set(meteos_ids?.split(",").map(meteoId => +meteoId) ?? []),
      associes_ids: new Set(associes_ids?.split(",").map(associeId => +associeId) ?? []),
      ...otherFieldsInventaire
    }
  });


  return inventairesProper;
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
