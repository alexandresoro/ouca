import { EspeceDb } from "../objects/db/espece-db.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import {
  COLUMN_CODE,
  COLUMN_ESPECE_ID,
  ORDER_ASC,
  TABLE_ESPECE
} from "../utils/constants";
import { queryToFindNumberOfDonneesByDoneeeEntityId } from "./sql-queries-donnee";
import { query, queryToFindAllEntities } from "./sql-queries-utils";
export const queryToFindAllEspeces = async (): Promise<EspeceDb[]> => {
  return queryToFindAllEntities<EspeceDb>(TABLE_ESPECE, COLUMN_CODE, ORDER_ASC);
};

export const queryToFindEspeceByCode = async (
  code: string
): Promise<EspeceDb[]> => {
  const queryStr: string =
    "SELECT * " + " FROM espece " + ' WHERE code="' + code.trim() + '"';
  return query(queryStr);
};

export const queryToFindEspeceByNomFrancais = async (
  nomFrancais: string
): Promise<EspeceDb[]> => {
  const queryStr: string =
    "SELECT * " +
    " FROM espece " +
    ' WHERE nom_francais="' +
    nomFrancais.trim() +
    '"';
  return query(queryStr);
};

export const queryToFindEspeceByNomLatin = async (
  nomLatin: string
): Promise<EspeceDb[]> => {
  const queryStr: string =
    "SELECT * " +
    " FROM espece " +
    ' WHERE nom_latin="' +
    nomLatin.trim() +
    '"';
  return query(queryStr);
};

export const queryToFindNumberOfDonneesByEspeceId = async (
  especeId?: number
): Promise<NumberOfObjectsById[]> => {
  return queryToFindNumberOfDonneesByDoneeeEntityId(COLUMN_ESPECE_ID, especeId);
};
