import { CommuneDb } from "../objects/db/commune-db.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import { COLUMN_NOM, ORDER_ASC, TABLE_COMMUNE } from "../utils/constants";
import { getFirstResult, prepareStringForSqlQuery, query, queryToFindAllEntities } from "./sql-queries-utils";

export const queryToCreateCommuneTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS commune (" +
    " id SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT," +
    " departement_id SMALLINT(5) UNSIGNED NOT NULL," +
    " code SMALLINT(5) UNSIGNED NOT NULL," +
    " nom VARCHAR(100) NOT NULL," +
    " PRIMARY KEY (id)," +
    " UNIQUE KEY `unique_departement_code` (departement_id,code)," +
    " UNIQUE KEY `unique_departement_nom` (departement_id,nom)," +
    " CONSTRAINT `fk_commune_departement_id` FOREIGN KEY (departement_id) REFERENCES departement (id) ON DELETE CASCADE" +
    " )");
}

export const queryToFindAllCommunes = async (): Promise<CommuneDb[]> => {
  return queryToFindAllEntities<CommuneDb>(
    TABLE_COMMUNE,
    COLUMN_NOM,
    ORDER_ASC
  );
};

export const queryToFindCommuneByDepartementIdAndCodeAndNom = async (
  departementId: number,
  code: number,
  nom: string
): Promise<CommuneDb> => {
  nom = prepareStringForSqlQuery(nom);
  const results = await query<CommuneDb[]>(
    `SELECT * FROM commune WHERE departement_id=${departementId} AND code=${code} AND nom="${nom}"`
  );
  return getFirstResult<CommuneDb>(results);
};

export const queryToFindCommuneByDepartementIdAndCode = async (
  departementId: number,
  code: number
): Promise<CommuneDb> => {
  const results = await query<CommuneDb[]>(
    `SELECT * FROM commune WHERE departement_id=${departementId} AND code=${code}`
  );
  return getFirstResult<CommuneDb>(results);
};

export const queryToFindCommuneByDepartementIdAndNom = async (
  departementId: number,
  nom: string
): Promise<CommuneDb> => {
  nom = prepareStringForSqlQuery(nom);
  const results = await query<CommuneDb[]>(
    `SELECT * FROM commune WHERE departement_id=${departementId} AND nom="${nom}"`
  );
  return getFirstResult<CommuneDb>(results);
};

export const queryToFindNumberOfDonneesByCommuneId = async (
  communeId?: number
): Promise<NumberOfObjectsById[]> => {
  let queryStr: string =
    "SELECT l.commune_id as id, count(*) as nb" +
    " FROM donnee d, inventaire i, lieudit l" +
    " WHERE d.inventaire_id=i.id AND i.lieudit_id=l.id";
  if (communeId) {
    queryStr = queryStr +
      ` AND l.commune_id=${communeId}`;
  } else {
    queryStr = queryStr +
      " GROUP BY l.commune_id";
  }
  return query<NumberOfObjectsById[]>(queryStr);
};

export const queryToFindNumberOfLieuxDitsByCommuneId = async (
  communeId?: number
): Promise<NumberOfObjectsById[]> => {
  let queryStr = "SELECT l.commune_id as id, count(*) as nb FROM lieudit l";
  if (communeId) {
    queryStr = queryStr +
      ` WHERE l.commune_id=${communeId}`;
  } else {
    queryStr = queryStr +
      " GROUP BY l.commune_id";
  }
  return query<NumberOfObjectsById[]>(queryStr);
};
