import { Sexe } from "@ou-ca/ouca-model/sexe.object";
import * as _ from "lodash";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { queryToFindAllSexes, queryToFindNumberOfDonneesBySexeId } from "../sql/sql-queries-sexe";
import { DB_SAVE_MAPPING } from "../sql/sql-queries-utils";
import { TABLE_SEXE } from "../utils/constants";
import { getNbByEntityId } from "../utils/utils";
import { persistEntity } from "./sql-api-common";

export const findAllSexes = async (): Promise<Sexe[]> => {
  const [sexes, nbDonneesBySexe] = await Promise.all([
    queryToFindAllSexes(),
    queryToFindNumberOfDonneesBySexeId()
  ]);

  _.forEach(sexes, (sexe: Sexe) => {
    sexe.nbDonnees = getNbByEntityId(sexe, nbDonneesBySexe);
  });

  return sexes;
};

export const persistSexe = async (sexe: Sexe): Promise<SqlSaveResponse> => {
  return persistEntity(TABLE_SEXE, sexe, DB_SAVE_MAPPING.sexe);
};
