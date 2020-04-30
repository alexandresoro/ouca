import * as _ from "lodash";
import { Milieu } from "ouca-common/milieu.object";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import {
  queryToFindAllMilieux,
  queryToFindNumberOfDonneesByMilieuId
} from "../sql/sql-queries-milieu";
import { DB_SAVE_MAPPING } from "../sql/sql-queries-utils";
import { TABLE_MILIEU } from "../utils/constants";
import { getNbByEntityId } from "../utils/utils";
import { persistEntity } from "./sql-api-common";

export const findAllMilieux = async (): Promise<Milieu[]> => {
  const [milieux, nbDonneesByMilieu] = await Promise.all([
    queryToFindAllMilieux(),
    queryToFindNumberOfDonneesByMilieuId()
  ]);

  _.forEach(milieux, (milieu: Milieu) => {
    milieu.nbDonnees = getNbByEntityId(milieu, nbDonneesByMilieu);
  });

  return milieux;
};

export const persistMilieu = async (
  milieu: Milieu
): Promise<SqlSaveResponse> => {
  return persistEntity(TABLE_MILIEU, milieu, DB_SAVE_MAPPING.milieu);
};
