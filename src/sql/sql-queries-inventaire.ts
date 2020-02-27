import moment from "moment";
import { Inventaire } from "ouca-common/inventaire.object";
import { getQuery } from "./sql-queries-utils";

export function getQueryToFindNumberOfDonneesByInventaireEntityId(
  entityIdAttribute: string,
  id?: number
): string {
  let query: string =
    "SELECT i." +
    entityIdAttribute +
    " as id, count(*) as nb FROM donnee d, inventaire i WHERE d.inventaire_id=i.id";
  if (id) {
    query = query + " AND i." + entityIdAttribute + "=" + id;
  } else {
    query = query + " GROUP BY i." + entityIdAttribute;
  }
  return getQuery(query);
}

export const getQueryToFindInventaireIdById = (id: number): string => {
  return getQuery("SELECT id FROM inventaire WHERE id=" + id);
};

export const getQueryToFindInventaireIdByAllAttributes = (
  inventaire: Inventaire
): string => {
  let query: string =
    "SELECT i.id" +
    " FROM inventaire i" +
    " WHERE i.observateur_id=" +
    inventaire.observateurId +
    " AND i.date=STR_TO_DATE('" +
    moment(inventaire.date).format("YYYY-MM-DD") +
    "', '%Y-%m-%d')" +
    " AND i.lieudit_id=" +
    inventaire.lieuditId;

  query =
    query +
    " AND i.heure" +
    (!inventaire.heure ? " is null" : '="' + inventaire.heure + '"');

  query =
    query +
    " AND i.duree" +
    (!inventaire.duree ? " is null" : '="' + inventaire.duree + '"');

  query =
    query +
    " AND i.altitude" +
    (!inventaire.customizedCoordinatesL2E || !inventaire.customizedAltitude
      ? " is null"
      : "=" + inventaire.customizedAltitude);

  query =
    query +
    " AND i.longitude" +
    (!inventaire.customizedCoordinatesL2E ||
    !inventaire.customizedCoordinatesL2E.longitude
      ? " is null"
      : "=" + inventaire.customizedCoordinatesL2E.longitude);

  query =
    query +
    " AND i.latitude" +
    (!inventaire.customizedCoordinatesL2E ||
    !inventaire.customizedCoordinatesL2E.latitude
      ? " is null"
      : "=" + inventaire.customizedCoordinatesL2E.latitude);

  query =
    query +
    " AND i.temperature" +
    (!inventaire.temperature ? " is null" : "=" + inventaire.temperature);

  return getQuery(query);
};

export const getQueryToFindAssociesIdsByInventaireId = (
  inventaireId: number
): string => {
  const query: string =
    "SELECT observateur_id" +
    " FROM inventaire_associe" +
    " WHERE inventaire_id=" +
    inventaireId;

  return getQuery(query);
};

export const getQueryToFindMeteosIdsByInventaireId = (
  inventaireId: number
): string => {
  const query: string =
    "SELECT meteo_id" +
    " FROM inventaire_meteo" +
    " WHERE inventaire_id=" +
    inventaireId;

  return getQuery(query);
};
