import { getQuery } from "./sql-queries-utils";
import { Inventaire } from "basenaturaliste-model/inventaire.object";
import moment from "moment";

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

export const getQueryToFindInventaireByAllAttributes = (
  inventaire: Inventaire
): string => {
  let query: string =
    "SELECT i.id" +
    " FROM inventaire i" +
    " WHERE i.observateur_id=" +
    inventaire.observateurId +
    " AND i.date=" +
    moment(inventaire.date).format("YYYY-MM-DD") +
    " AND i.lieudit_id=" +
    inventaire.lieuditId;

  query =
    query + "AND i.heure" + !inventaire.heure
      ? " is null"
      : '="' + inventaire.heure + '"';

  query =
    query + "AND i.duree" + !inventaire.duree
      ? " is null"
      : '="' + inventaire.duree + '"';

  query =
    query + "AND i.altitude" + !inventaire.altitude
      ? " is null"
      : "=" + inventaire.altitude;

  query =
    query + "AND i.longitude" + !inventaire.longitude
      ? " is null"
      : "=" + inventaire.longitude;

  query =
    query + "AND i.latitude" + !inventaire.latitude
      ? " is null"
      : "=" + inventaire.latitude;

  query =
    query + "AND i.temperature" + !inventaire.temperature
      ? " is null"
      : "=" + inventaire.temperature;

  return getQuery(query);
};
