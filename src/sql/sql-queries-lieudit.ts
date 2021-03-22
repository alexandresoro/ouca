import { LieuditDb } from "../objects/db/lieudit-db.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import { COLUMN_NOM, ORDER_ASC, TABLE_LIEUDIT } from "../utils/constants";
import { queryToFindNumberOfDonneesByInventaireEntityId } from "./sql-queries-inventaire";
import { prepareStringForSqlQuery, query, queryToFindAllEntities } from "./sql-queries-utils";

export const queryToFindAllLieuxDits = async (): Promise<LieuditDb[]> => {
  return queryToFindAllEntities<LieuditDb>(
    TABLE_LIEUDIT,
    COLUMN_NOM,
    ORDER_ASC
  );
};

export const queryToFindLieuDitByCommuneIdAndNom = async (
  communeId: number,
  nom: string
): Promise<LieuditDb[]> => {
  nom = prepareStringForSqlQuery(nom);
  return query<LieuditDb[]>(
    `SELECT * FROM lieudit WHERE commune_id=${communeId} AND nom="${nom}"`
  );
};

export const queryToFindNumberOfDonneesByLieuDitId = async (
  lieuditId?: number
): Promise<NumberOfObjectsById[]> => {
  return queryToFindNumberOfDonneesByInventaireEntityId(
    "lieudit_id",
    lieuditId
  );
};
