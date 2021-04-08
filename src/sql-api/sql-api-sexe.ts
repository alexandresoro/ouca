import { Sexe } from "../model/types/sexe.object";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { queryToFindAllSexes, queryToFindNumberOfDonneesBySexeId } from "../sql/sql-queries-sexe";
import { createKeyValueMapWithSameName } from "../sql/sql-queries-utils";
import { TABLE_SEXE } from "../utils/constants";
import { getNbByEntityId } from "../utils/utils";
import { insertMultipleEntities, persistEntity } from "./sql-api-common";

const DB_SAVE_MAPPING_SEXE = createKeyValueMapWithSameName("libelle");

export const findAllSexes = async (): Promise<Sexe[]> => {
  const [sexes, nbDonneesBySexe] = await Promise.all([
    queryToFindAllSexes(),
    queryToFindNumberOfDonneesBySexeId()
  ]);

  sexes.forEach((sexe: Sexe) => {
    sexe.nbDonnees = getNbByEntityId(sexe, nbDonneesBySexe);
  });

  return sexes;
};

export const persistSexe = async (sexe: Sexe): Promise<SqlSaveResponse> => {
  return persistEntity(TABLE_SEXE, sexe, DB_SAVE_MAPPING_SEXE);
};

export const insertSexes = async (
  sexes: Sexe[]
): Promise<SqlSaveResponse> => {
  return insertMultipleEntities(TABLE_SEXE, sexes, DB_SAVE_MAPPING_SEXE);
};
