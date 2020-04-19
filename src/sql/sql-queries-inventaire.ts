import * as _ from "lodash";
import { Coordinates } from "ouca-common/coordinates.object";
import { Inventaire } from "ouca-common/inventaire.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import { query } from "./sql-queries-utils";

export const queryToFindNumberOfDonneesByInventaireEntityId = async (
  entityIdAttribute: string,
  id?: number
): Promise<NumberOfObjectsById[]> => {
  let queryStr: string =
    "SELECT i." +
    entityIdAttribute +
    " as id, count(*) as nb FROM donnee d, inventaire i WHERE d.inventaire_id=i.id";
  if (id) {
    queryStr = queryStr + " AND i." + entityIdAttribute + "=" + id;
  } else {
    queryStr = queryStr + " GROUP BY i." + entityIdAttribute;
  }
  return query<NumberOfObjectsById[]>(queryStr);
};

export const queryToFindInventaireIdById = async (
  id: number
): Promise<{ id: number }[]> => {
  return query<{ id: number }[]>("SELECT id FROM inventaire WHERE id=" + id);
};

export const queryToFindInventaireIdByAllAttributes = async (
  inventaire: Inventaire
): Promise<{ id: number }[]> => {
  let queryStr: string =
    "SELECT i.id as id" +
    " FROM inventaire i" +
    " WHERE i.observateur_id=" +
    inventaire.observateurId +
    " AND i.date=STR_TO_DATE('" +
    inventaire.date +
    "', '%Y-%m-%d')" +
    " AND i.lieudit_id=" +
    inventaire.lieuditId;

  queryStr =
    queryStr +
    " AND i.heure" +
    (!inventaire.heure ? " is null" : '="' + inventaire.heure + '"');

  queryStr =
    queryStr +
    " AND i.duree" +
    (!inventaire.duree ? " is null" : '="' + inventaire.duree + '"');

  queryStr =
    queryStr +
    " AND i.altitude" +
    (!inventaire.customizedAltitude
      ? " is null"
      : "=" + inventaire.customizedAltitude);

  let coordinates: Coordinates = {
    system: null,
    longitude: null,
    latitude: null,
    isTransformed: null
  };

  if (inventaire.coordinates) {
    coordinates = inventaire.coordinates;
  }

  queryStr =
    queryStr +
    " AND i.longitude" +
    (_.isNil(coordinates.longitude) ? " is null" : "=" + coordinates.longitude);

  queryStr =
    queryStr +
    " AND i.latitude" +
    (_.isNil(coordinates.latitude) ? " is null" : "=" + coordinates.latitude);

  queryStr =
    queryStr +
    " AND i.temperature" +
    (!inventaire.temperature ? " is null" : "=" + inventaire.temperature);

  return query<{ id: number }[]>(queryStr);
};

export const queryToFindAssociesIdsByInventaireId = async (
  inventaireId: number
): Promise<{ observateur_id: number }[]> => {
  const queryStr: string =
    "SELECT observateur_id" +
    " FROM inventaire_associe" +
    " WHERE inventaire_id=" +
    inventaireId;

  return query<{ observateur_id: number }[]>(queryStr);
};

export const queryToFindMeteosIdsByInventaireId = async (
  inventaireId: number
): Promise<{ meteo_id: number }[]> => {
  const queryStr: string =
    "SELECT meteo_id" +
    " FROM inventaire_meteo" +
    " WHERE inventaire_id=" +
    inventaireId;

  return query<{ meteo_id: number }[]>(queryStr);
};
