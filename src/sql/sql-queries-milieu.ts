import { getQuery } from "./sql-queries-utils";

export function getQueryToFindAllMilieux(): string {
  const query: string =
    "SELECT d.donnee_id as donneeId, m.code, m.libelle" +
    " FROM donnee_milieu d" +
    " INNER JOIN milieu m ON d.milieu_id = m.id";

  return getQuery(query);
}

export function getQueryToFindMilieuxIdsByDonneeId(donneeId: number): string {
  return getQuery(
    "SELECT distinct milieu_id as milieuId FROM donnee_milieu WHERE donnee_id=" +
      donneeId
  );
}

export function getQueryToFindNumberOfDonneesByMilieuId(
  milieuId?: number
): string {
  let query: string =
    "SELECT dc.milieu_id as id, count(*) as nb " + "FROM donnee_milieu dc ";
  if (milieuId) {
    query = query + " WHERE dc.milieu_id=" + milieuId;
  } else {
    query = query + " GROUP BY dc.milieu_id";
  }
  return getQuery(query);
}
