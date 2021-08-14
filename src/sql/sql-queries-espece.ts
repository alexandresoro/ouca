import { EspeceDb } from "../objects/db/espece-db.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import {
  COLUMN_CODE,
  COLUMN_ESPECE_ID
} from "../utils/constants";
import prisma from "./prisma";
import { queryToFindNumberOfDonneesByDonneeEntityId } from "./sql-queries-donnee";
import { getFirstResult, prepareStringForSqlQuery, query, queryParametersToFindAllEntities } from "./sql-queries-utils";

export const queryToCreateEspeceTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS espece (" +
    " id MEDIUMINT(8) UNSIGNED NOT NULL AUTO_INCREMENT," +
    " classe_id SMALLINT(5) UNSIGNED DEFAULT NULL," +
    " code VARCHAR(20) NOT NULL," +
    " nom_francais VARCHAR(100) NOT NULL," +
    " nom_latin VARCHAR(100) NOT NULL," +
    " PRIMARY KEY (id)," +
    " UNIQUE KEY `unique_code` (code)," +
    " UNIQUE KEY `unique_nom_francais` (nom_francais)," +
    " UNIQUE KEY `unique_nom_latin` (nom_latin)," +
    " CONSTRAINT `fk_espece_classe_id` FOREIGN KEY (classe_id) REFERENCES classe (id) ON DELETE CASCADE" +
    " )");
}

export const queryToFindAllEspeces = async (): Promise<EspeceDb[]> => {
  return prisma.espece.findMany(queryParametersToFindAllEntities(COLUMN_CODE));
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
