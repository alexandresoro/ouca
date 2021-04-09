import { Milieu } from "../../model/types/milieu.object";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { queryToFindAllMilieux, queryToFindNumberOfDonneesByMilieuId } from "../../sql/sql-queries-milieu";
import { createKeyValueMapWithSameName } from "../../sql/sql-queries-utils";
import { TABLE_MILIEU } from "../../utils/constants";
import { getNbByEntityId } from "../../utils/utils";
import { insertMultipleEntities, persistEntity } from "./entity-service";

const DB_SAVE_MAPPING_MILIEU = createKeyValueMapWithSameName(["code", "libelle"]);

export const findAllMilieux = async (): Promise<Milieu[]> => {
  const [milieux, nbDonneesByMilieu] = await Promise.all([
    queryToFindAllMilieux(),
    queryToFindNumberOfDonneesByMilieuId()
  ]);

  milieux.forEach((milieu: Milieu) => {
    milieu.nbDonnees = getNbByEntityId(milieu, nbDonneesByMilieu);
  });

  return milieux;
};

export const persistMilieu = async (
  milieu: Milieu
): Promise<SqlSaveResponse> => {
  return persistEntity(TABLE_MILIEU, milieu, DB_SAVE_MAPPING_MILIEU);
};

export const insertMilieux = (
  milieux: Milieu[]
): Promise<SqlSaveResponse> => {
  return insertMultipleEntities(TABLE_MILIEU, milieux, DB_SAVE_MAPPING_MILIEU);
};
