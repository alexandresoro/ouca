import { getQueryToFindNumberOfDonneesByInventaireEntityId } from "./sql-queries-inventaire";
import { getQuery } from "./sql-queries-utils";

export function getQueryToFindAssociesByInventaireId(
  inventaireId: number
): string {
  return getQuery(
    "SELECT distinct observateur_id as associeId FROM inventaire_associe WHERE inventaire_id=" +
      inventaireId
  );
}

export function getQueryToFindNumberOfDonneesByObservateurId(
  observateurId?: number
): string {
  return getQueryToFindNumberOfDonneesByInventaireEntityId(
    "observateur_id",
    observateurId
  );
}

export function getQueryToFindAllAssocies(donneesIds?: number[]): string {
  let query: string =
    "SELECT d.id as donneeId, o.libelle" +
    " FROM inventaire_associe i" +
    " INNER JOIN donnee d ON d.inventaire_id = i.inventaire_id" +
    " LEFT JOIN observateur o ON i.observateur_id = o.id";

  if (donneesIds && donneesIds.length) {
    query = query + " WHERE d.id IN (" + donneesIds.join(",") + ")";
  }

  return getQuery(query);
}
