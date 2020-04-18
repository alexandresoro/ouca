import { LieuditDb } from "../objects/db/lieudit-db.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import { COLUMN_NOM, ORDER_ASC, TABLE_LIEUDIT } from "../utils/constants";
import { getQueryToFindNumberOfDonneesByInventaireEntityId } from "./sql-queries-inventaire";
import { query, queryToFindAllEntities } from "./sql-queries-utils";

export const queryToFindAllLieuxDits = async (): Promise<LieuditDb[]> => {
  return queryToFindAllEntities<LieuditDb>(
    TABLE_LIEUDIT,
    COLUMN_NOM,
    ORDER_ASC
  );
};

export const queryToFindLieuditByCommuneIdAndNom = async (
  communeId: number,
  nom: string
): Promise<LieuditDb[]> => {
  const queryStr: string =
    "SELECT * " +
    " FROM lieudit " +
    " WHERE commune_id=" +
    communeId +
    ' AND nom="' +
    nom.trim() +
    '"';
  return query<LieuditDb[]>(queryStr);
};

export const queryToFindNumberOfDonneesByLieuDitId = async (
  lieuditId?: number
): Promise<NumberOfObjectsById[]> => {
  return query<NumberOfObjectsById[]>(
    getQueryToFindNumberOfDonneesByInventaireEntityId("lieudit_id", lieuditId)
  );
};
