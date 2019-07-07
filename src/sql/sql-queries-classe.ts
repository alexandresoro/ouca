import { getQuery } from "./sql-queries-utils";

export function getQueryToFindNumberOfEspecesByClasseId(
  classeId?: number
): string {
  let query: string =
    "SELECT classe_id as id, count(*) as nbEspeces FROM espece";
  if (!!classeId) {
    query = query + " WHERE classe_id=" + classeId;
  } else {
    query = query + " GROUP BY classe_id";
  }
  return getQuery(query);
}

export function getQueryToFindNumberOfDonneesByClasseId(
  classeId?: number
): string {
  let query: string =
    "SELECT e.classe_id as id, count(*) as nbDonnees FROM espece e, donnee d WHERE d.espece_id=e.id";
  if (!!classeId) {
    query = query + " AND e.classe_id=" + classeId;
  } else {
    query = query + " GROUP BY classe_id";
  }
  return getQuery(query);
}
