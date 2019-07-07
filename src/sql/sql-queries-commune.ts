import { getQuery } from "./sql-queries-utils";

export function getQueryToFindCommuneByDepartementIdAndCodeAndNom(
  departementId: number,
  code: number,
  nom: string
): string {
  const query: string =
    "SELECT * " +
    " FROM commune " +
    " WHERE departement_id=" +
    departementId +
    " AND code=" +
    code +
    ' AND nom="' +
    nom.trim() +
    '"';
  return getQuery(query);
}

export function getQueryToFindCommuneByDepartementIdAndCode(
  departementId: number,
  code: number
): string {
  const query: string =
    "SELECT * " +
    " FROM commune " +
    " WHERE departement_id=" +
    departementId +
    " AND code=" +
    code;
  return getQuery(query);
}

export function getQueryToFindCommuneByDepartementIdAndNom(
  departementId: number,
  nom: string
): string {
  const query: string =
    "SELECT * " +
    " FROM commune " +
    " WHERE departement_id=" +
    departementId +
    ' AND nom="' +
    nom.trim() +
    '"';
  return getQuery(query);
}

export function getQueryToFindNumberOfDonneesByCommuneId(
  communeId?: number
): string {
  let query: string =
    "SELECT l.commune_id as id, count(*) as nbDonnees " +
    "FROM donnee d, inventaire i, lieudit l WHERE d.inventaire_id=i.id AND i.lieudit_id=l.id";
  if (!!communeId) {
    query = query + " AND l.commune_id=" + communeId;
  } else {
    query = query + " GROUP BY l.commune_id";
  }
  return getQuery(query);
}

export function getQueryToFindNumberOfLieuxditsByCommuneId(
  communeId?: number
): string {
  let query: string =
    "SELECT l.commune_id as id, count(*) as nbLieuxdits FROM lieudit l";
  if (!!communeId) {
    query = query + " WHERE l.commune_id=" + communeId;
  } else {
    query = query + " GROUP BY l.commune_id";
  }
  return getQuery(query);
}
