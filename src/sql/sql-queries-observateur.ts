import { Observateur } from "@ou-ca/ouca-model/observateur.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import { COLUMN_LIBELLE, OBSERVATEUR_ID, ORDER_ASC, TABLE_OBSERVATEUR } from "../utils/constants";
import { queryToFindNumberOfDonneesByInventaireEntityId } from "./sql-queries-inventaire";
import { query, queryToFindAllEntities } from "./sql-queries-utils";

export const queryToFindAllObservateurs = async (): Promise<Observateur[]> => {
  return queryToFindAllEntities<Observateur>(
    TABLE_OBSERVATEUR,
    COLUMN_LIBELLE,
    ORDER_ASC
  );
};

export const queryToFindAssociesByInventaireId = async (
  inventaireId: number
): Promise<{ associeId: number }[]> => {
  return query<{ associeId: number }[]>(
    "SELECT distinct observateur_id as associeId" +
    " FROM inventaire_associe" +
    " WHERE inventaire_id=" +
    inventaireId
  );
};

export const queryToFindNumberOfDonneesByObservateurId = async (
  observateurId?: number
): Promise<NumberOfObjectsById[]> => {
  return await queryToFindNumberOfDonneesByInventaireEntityId(
    OBSERVATEUR_ID,
    observateurId
  );
};

export const queryToFindAllAssociesByDonneeId = async (
  donneesIds?: number[]
): Promise<{ donneeId: number; libelle: string }[]> => {
  let queryStr: string =
    "SELECT d.id as donneeId, o.libelle" +
    " FROM inventaire_associe i" +
    " INNER JOIN donnee d ON d.inventaire_id = i.inventaire_id" +
    " LEFT JOIN observateur o ON i.observateur_id = o.id";

  if (donneesIds && donneesIds.length) {
    queryStr = queryStr + " WHERE d.id IN (" + donneesIds.join(",") + ")";
  }

  return query<{ donneeId: number; libelle: string }[]>(queryStr);
};
