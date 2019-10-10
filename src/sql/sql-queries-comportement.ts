import { getQuery } from "./sql-queries-utils";

export function getQueryToFindAllComportements(donneesIds?: number[]): string {
  let query: string =
    "SELECT d.donnee_id as donneeId, c.code, c.libelle" +
    " FROM donnee_comportement d" +
    " INNER JOIN comportement c ON d.comportement_id = c.id";

  if (donneesIds && donneesIds.length) {
    query = query + " WHERE d.donnee_id IN (" + donneesIds.join(",") + ")";
  }

  return getQuery(query);
}

export function getQueryToFindComportementsIdsByDonneeId(
  donneeId: number
): string {
  return getQuery(
    "SELECT distinct comportement_id as comportementId FROM donnee_comportement WHERE donnee_id=" +
      donneeId
  );
}

export function getQueryToFindNumberOfDonneesByComportementId(
  comportementId?: number
): string {
  let query: string =
    "SELECT dc.comportement_id as id, count(*) as nb " +
    "FROM donnee_comportement dc ";
  if (comportementId) {
    query = query + " WHERE dc.comportement_id=" + comportementId;
  } else {
    query = query + " GROUP BY dc.comportement_id";
  }
  return getQuery(query);
}
