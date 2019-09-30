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
