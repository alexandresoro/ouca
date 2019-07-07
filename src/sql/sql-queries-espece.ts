import { COLUMN_ESPECE_ID } from "../utils/constants";
import {
  getFindNumberOfDonneesByDoneeeEntityIdQuery,
  getQuery
} from "./sql-queries-utils";

export function getQueryToFindEspeceByCode(code: string): string {
  const query: string =
    "SELECT * " + " FROM espece " + ' WHERE code="' + code.trim() + '"';
  return getQuery(query);
}

export function getQueryToFindEspeceByNomFrancais(nomFrancais: string): string {
  const query: string =
    "SELECT * " +
    " FROM espece " +
    ' WHERE nom_francais="' +
    nomFrancais.trim() +
    '"';
  return getQuery(query);
}

export function getQueryToFindEspeceByNomLatin(nomLatin: string): string {
  const query: string =
    "SELECT * " +
    " FROM espece " +
    ' WHERE nom_latin="' +
    nomLatin.trim() +
    '"';
  return getQuery(query);
}

export function getQueryToFindNumberOfDonneesByEspeceId(
  especeId?: number
): string {
  return getFindNumberOfDonneesByDoneeeEntityIdQuery(
    COLUMN_ESPECE_ID,
    especeId
  );
}
