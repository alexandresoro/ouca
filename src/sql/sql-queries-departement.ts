import { getQuery } from "./sql-queries-utils";

export function getQueryToFindDepartementByCode(code: string): string {
  const query: string =
    "SELECT * " + " FROM departement " + ' WHERE code="' + code + '"';
  return getQuery(query);
}

export function getQueryToFindNumberOfDonneesByDepartementId(
  departementId?: number
): string {
  let query: string =
    "SELECT c.departement_id as id, count(*) as nbDonnees " +
    "FROM donnee d, inventaire i, commune c, lieudit l " +
    "WHERE d.inventaire_id=i.id AND i.lieudit_id=l.id AND c.id=l.commune_id";
  if (!!departementId) {
    query = query + " AND c.departement_id=" + departementId;
  } else {
    query = query + " GROUP BY c.departement_id";
  }
  return getQuery(query);
}

export function getQueryToFindNumberOfCommunesByDepartementId(
  departementId?: number
): string {
  let query: string =
    "SELECT c.departement_id as id, count(*) as nbCommunes FROM commune c";
  if (!!departementId) {
    query = query + " WHERE c.departement_id=" + departementId;
  } else {
    query = query + " GROUP BY c.departement_id";
  }
  return getQuery(query);
}

export function getQueryToFindNumberOfLieuxditsByDepartementId(
  departementId?: number
): string {
  let query: string =
    "SELECT c.departement_id as id, count(*) as nbLieuxdits FROM commune c, lieudit l WHERE c.id=l.commune_id";
  if (!!departementId) {
    query = query + " AND c.departement_id=" + departementId;
  } else {
    query = query + " GROUP BY c.departement_id";
  }
  return getQuery(query);
}
