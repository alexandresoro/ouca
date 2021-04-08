import { Departement } from "../model/types/departement.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import { COLUMN_CODE, ORDER_ASC, TABLE_DEPARTEMENT } from "../utils/constants";
import { getFirstResult, prepareStringForSqlQuery, query, queryToFindAllEntities } from "./sql-queries-utils";

export const queryToCreateDepartementTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS departement (" +
    " id SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT," +
    " code VARCHAR(100) NOT NULL," +
    " PRIMARY KEY (id)," +
    " UNIQUE KEY `unique_code` (code)" +
    " )");
}

export const queryToFindAllDepartements = async (): Promise<Departement[]> => {
  return queryToFindAllEntities<Departement>(
    TABLE_DEPARTEMENT,
    COLUMN_CODE,
    ORDER_ASC
  );
};

export const queryToFindDepartementByCode = async (
  code: string
): Promise<Departement> => {
  code = prepareStringForSqlQuery(code)
  const results = await query<Departement[]>(
    `SELECT * FROM departement WHERE code="${code}"`
  );
  return getFirstResult<Departement>(results);
};

export const queryToFindNumberOfDonneesByDepartementId = async (
  departementId?: number
): Promise<NumberOfObjectsById[]> => {
  let queryStr: string =
    "SELECT c.departement_id as id, count(*) as nb" +
    " FROM donnee d, inventaire i, commune c, lieudit l" +
    " WHERE d.inventaire_id=i.id AND i.lieudit_id=l.id AND c.id=l.commune_id";
  if (departementId) {
    queryStr = queryStr +
      ` AND c.departement_id=${departementId}`;
  } else {
    queryStr = queryStr +
      " GROUP BY c.departement_id";
  }
  return query<NumberOfObjectsById[]>(queryStr);
};

export const queryToFindNumberOfCommunesByDepartementId = async (
  departementId?: number
): Promise<NumberOfObjectsById[]> => {
  let queryStr = "SELECT c.departement_id as id, count(*) as nb FROM commune c";
  if (departementId) {
    queryStr = queryStr +
      ` WHERE c.departement_id=${departementId}`;
  } else {
    queryStr = queryStr +
      " GROUP BY c.departement_id";
  }
  return query<NumberOfObjectsById[]>(queryStr);
};

export const queryToFindNumberOfLieuxDitsByDepartementId = async (
  departementId?: number
): Promise<NumberOfObjectsById[]> => {
  let queryStr =
    "SELECT c.departement_id as id, count(*) as nb" +
    " FROM commune c, lieudit l" +
    " WHERE c.id=l.commune_id";
  if (departementId) {
    queryStr = queryStr +
      ` AND c.departement_id=${departementId}`;
  } else {
    queryStr = queryStr +
      " GROUP BY c.departement_id";
  }
  return query<NumberOfObjectsById[]>(queryStr);
};
