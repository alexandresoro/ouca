import { LieuditDb } from "../objects/db/lieudit-db.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import { COLUMN_NOM, ORDER_ASC, TABLE_LIEUDIT } from "../utils/constants";
import { queryToFindNumberOfDonneesByInventaireEntityId } from "./sql-queries-inventaire";
import { getFirstResult, prepareStringForSqlQuery, query, queryToFindAllEntities } from "./sql-queries-utils";

export const queryToCreateLieuDitTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS lieudit (" +
    " id MEDIUMINT(8) UNSIGNED NOT NULL AUTO_INCREMENT," +
    " commune_id SMALLINT(5) UNSIGNED NOT NULL," +
    " nom varchar(150) NOT NULL," +
    " altitude SMALLINT(5) UNSIGNED NOT NULL," +
    " longitude DECIMAL(13,6) NOT NULL," +
    " latitude DECIMAL(16,6) NOT NULL," +
    " coordinates_system VARCHAR (20) NOT NULL," +
    " PRIMARY KEY (id)," +
    " UNIQUE KEY `unique_commune_nom` (commune_id,nom)," +
    " CONSTRAINT `fk_lieudit_commune_id` FOREIGN KEY (commune_id) REFERENCES commune (id) ON DELETE CASCADE" +
    " )");
}

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
): Promise<LieuditDb> => {
  nom = prepareStringForSqlQuery(nom);
  const results = await query<LieuditDb[]>(
    `SELECT * FROM lieudit WHERE commune_id=${communeId} AND nom="${nom}"`
  );
  return getFirstResult<LieuditDb>(results);
};

export const queryToFindNumberOfDonneesByLieuDitId = async (
  lieuditId?: number
): Promise<NumberOfObjectsById[]> => {
  return queryToFindNumberOfDonneesByInventaireEntityId(
    "lieudit_id",
    lieuditId
  );
};
