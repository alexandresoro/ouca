import { EspeceDb } from "../objects/db/espece-db.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import {
  COLUMN_CODE,

  COLUMN_ESPECE_ID,

  ORDER_ASC,
  TABLE_ESPECE
} from "../utils/constants";
import { queryToFindNumberOfDonneesByDonneeEntityId } from "./sql-queries-donnee";
import { prepareStringForSqlQuery, query, queryToFindAllEntities } from "./sql-queries-utils";
export const queryToFindAllEspeces = async (): Promise<EspeceDb[]> => {
  return queryToFindAllEntities<EspeceDb>(TABLE_ESPECE, COLUMN_CODE, ORDER_ASC);
};

export const queryToFindEspeceByCode = async (
  code: string
): Promise<EspeceDb[]> => {
  code = prepareStringForSqlQuery(code);
  return query(
    `SELECT * FROM espece WHERE code="${code}"`
  );
};

export const queryToFindEspeceByNomFrancais = async (
  nomFrancais: string
): Promise<EspeceDb[]> => {
  nomFrancais = prepareStringForSqlQuery(nomFrancais);
  return query(
    `SELECT * FROM espece WHERE nom_francais="${nomFrancais}"`
  );
};

export const queryToFindEspeceByNomLatin = async (
  nomLatin: string
): Promise<EspeceDb[]> => {
  nomLatin = prepareStringForSqlQuery(nomLatin);
  return query(
    `SELECT * FROM espece WHERE nom_latin="${nomLatin}"`
  );
};

export const queryToFindNumberOfDonneesByEspeceId = async (
  especeId?: number
): Promise<NumberOfObjectsById[]> => {
  return queryToFindNumberOfDonneesByDonneeEntityId(COLUMN_ESPECE_ID, especeId);
};
