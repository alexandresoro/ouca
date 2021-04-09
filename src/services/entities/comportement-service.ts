
import { Comportement } from "../../model/types/comportement.object";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { buildComportementDbFromComportement, buildComportementsFromComportementsDb } from "../../sql/entities-mapping/comportement-mapping";
import { queryToFindAllComportements, queryToFindNumberOfDonneesByComportementId } from "../../sql/sql-queries-comportement";
import { TABLE_COMPORTEMENT } from "../../utils/constants";
import { getNbByEntityId } from "../../utils/utils";
import { insertMultipleEntitiesNoCheck, persistEntityNoCheck } from "./entity-service";

export const findAllComportements = async (): Promise<Comportement[]> => {
  const [comportementsDb, nbDonneesByComportement] = await Promise.all([
    queryToFindAllComportements(),
    queryToFindNumberOfDonneesByComportementId()
  ]);

  const comportements = buildComportementsFromComportementsDb(comportementsDb);

  comportements.forEach((comportement: Comportement) => {
    comportement.nbDonnees = getNbByEntityId(
      comportement,
      nbDonneesByComportement
    );
  });

  return comportements;
};

export const persistComportement = async (
  comportement: Comportement
): Promise<SqlSaveResponse> => {
  const comportementDb = buildComportementDbFromComportement(comportement);
  return persistEntityNoCheck(TABLE_COMPORTEMENT, comportementDb);
};

export const insertComportements = (
  comportements: Comportement[]
): Promise<SqlSaveResponse> => {
  const comportementsDb = comportements.map(buildComportementDbFromComportement);
  return insertMultipleEntitiesNoCheck(TABLE_COMPORTEMENT, comportementsDb);
};
