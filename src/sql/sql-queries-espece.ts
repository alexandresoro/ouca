import { EspeceDb } from "../objects/db/espece-db.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import {
  COLUMN_CODE,
  COLUMN_ESPECE_ID,
  ORDER_ASC,
  TABLE_ESPECE
} from "../utils/constants";
import { queryToFindNumberOfDonneesByDonneeEntityId } from "./sql-queries-donnee";
import { getFirstResult, prepareStringForSqlQuery, query, queryToFindAllEntities } from "./sql-queries-utils";

export const queryToFindAllEspeces = async (): Promise<EspeceDb[]> => {
  return queryToFindAllEntities<EspeceDb>(TABLE_ESPECE, COLUMN_CODE, ORDER_ASC);
};

export const queryToFindEspeceByCode = async (
  code: string
): Promise<EspeceDb> => {
  code = prepareStringForSqlQuery(code);
  const results = await query<EspeceDb[]>(
    `SELECT * FROM espece WHERE code="${code}"`
  );
  return getFirstResult<EspeceDb>(results);
};

export const queryToFindEspeceByNomFrancais = async (
  nomFrancais: string
): Promise<EspeceDb> => {
  nomFrancais = prepareStringForSqlQuery(nomFrancais);
  const results = await query<EspeceDb[]>(
    `SELECT * FROM espece WHERE nom_francais="${nomFrancais}"`
  );
  return getFirstResult<EspeceDb>(results);
};

export const queryToFindEspeceByNomLatin = async (
  nomLatin: string
): Promise<EspeceDb> => {
  nomLatin = prepareStringForSqlQuery(nomLatin);
  const results = await query<EspeceDb[]>(
    `SELECT * FROM espece WHERE nom_latin="${nomLatin}"`
  );
  return getFirstResult<EspeceDb>(results);
};

export const queryToFindNumberOfDonneesByEspeceId = async (
  especeId?: number
): Promise<NumberOfObjectsById[]> => {
  return queryToFindNumberOfDonneesByDonneeEntityId(COLUMN_ESPECE_ID, especeId);
};
