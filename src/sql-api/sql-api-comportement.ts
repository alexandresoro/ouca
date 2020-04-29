import * as _ from "lodash";
import { Comportement } from "ouca-common/comportement.object";
import { buildComportementsFromComportementsDb } from "../mapping/comportement-mapping";
import {
  queryToFindAllComportements,
  queryToFindNumberOfDonneesByComportementId
} from "../sql/sql-queries-comportement";
import { getNbByEntityId } from "../utils/utils";

export const findAllComportements = async (): Promise<Comportement[]> => {
  const [comportementsDb, nbDonneesByComportement] = await Promise.all([
    queryToFindAllComportements(),
    queryToFindNumberOfDonneesByComportementId()
  ]);

  const comportements = buildComportementsFromComportementsDb(comportementsDb);

  _.forEach(comportements, (comportement: Comportement) => {
    comportement.nbDonnees = getNbByEntityId(
      comportement,
      nbDonneesByComportement
    );
  });

  return comportements;
};
