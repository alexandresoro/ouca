import { buildEspeceFromEspeceDb, buildEspecesFromEspecesDb } from "../mapping/espece-mapping";
import { Espece } from "../model/types/espece.model";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { queryToFindAllEspeces, queryToFindEspeceByCode, queryToFindEspeceByNomFrancais, queryToFindEspeceByNomLatin, queryToFindNumberOfDonneesByEspeceId } from "../sql/sql-queries-espece";
import { DB_SAVE_MAPPING } from "../sql/sql-queries-utils";
import { TABLE_ESPECE } from "../utils/constants";
import { getNbByEntityId } from "../utils/utils";
import { persistEntity } from "./sql-api-common";

export const findAllEspeces = async (): Promise<Espece[]> => {
  const [especesDb, nbDonneesByEspece] = await Promise.all([
    queryToFindAllEspeces(),
    queryToFindNumberOfDonneesByEspeceId()
  ]);

  const especes: Espece[] = buildEspecesFromEspecesDb(especesDb);
  especes.forEach((espece: Espece) => {
    espece.nbDonnees = getNbByEntityId(espece, nbDonneesByEspece);
  });

  return especes;
};

export const findEspeceByCode = async (code: string): Promise<Espece> => {
  const especeDb = await queryToFindEspeceByCode(code);
  return buildEspeceFromEspeceDb(especeDb);
};

export const findEspeceByNomFrancais = async (
  nomFrancais: string
): Promise<Espece> => {
  const especeDb = await queryToFindEspeceByNomFrancais(nomFrancais);
  return buildEspeceFromEspeceDb(especeDb);
};

export const findEspeceByNomLatin = async (
  nomLatin: string
): Promise<Espece> => {
  const especeDb = await queryToFindEspeceByNomLatin(nomLatin);
  return buildEspeceFromEspeceDb(especeDb);
};

export const persistEspece = async (
  espece: Espece
): Promise<SqlSaveResponse> => {
  return persistEntity(TABLE_ESPECE, espece, DB_SAVE_MAPPING.get("espece"));
};
