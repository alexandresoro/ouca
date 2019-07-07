import { getQuery } from "./sql-queries-utils";

export function getQueryToFindAllMeteos() {
  const query: string =
    "SELECT d.id as donneeId, m.libelle" +
    " FROM inventaire_meteo i" +
    " INNER JOIN donnee d ON d.inventaire_id = i.inventaire_id" +
    " LEFT JOIN meteo m ON i.meteo_id = m.id";

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

export function getQueryToFindNumberOfDonneesByMeteoId(
  meteoId?: number
): string {
  let query: string =
    "SELECT im.meteo_id as id, count(*) as nbDonnees " +
    "FROM inventaire_meteo im, donnee d " +
    "WHERE d.inventaire_id=im.inventaire_id";
  if (!!meteoId) {
    query = query + " AND im.meteo_id=" + meteoId;
  } else {
    query = query + " GROUP BY im.meteo_id";
  }
  return getQuery(query);
}
