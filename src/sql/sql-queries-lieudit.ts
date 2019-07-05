import {
  getFindNumberOfDonneesByInventaireEntityIdQuery,
  getQuery
} from "./sql-queries-utils";

export function getQueryToFindLieuditByCommuneIdAndNom(
  communeId: number,
  nom: string
): string {
  const query: string =
    "SELECT * " +
    " FROM lieudit " +
    " WHERE commune_id=" +
    communeId +
    ' AND nom="' +
    nom +
    '"';
  return getQuery(query);
}

export function getQueryToFindNumberOfDonneesByLieuditId(
  lieuditId?: number
): string {
  return getFindNumberOfDonneesByInventaireEntityIdQuery(
    "lieudit_id",
    lieuditId
  );
}
