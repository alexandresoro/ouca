import * as _ from "lodash";
import { Comportement } from "ouca-common/comportement.object";
import {
  queryToFindAllComportements,
  queryToFindNumberOfDonneesByComportementId
} from "../sql/sql-queries-comportement";
import { getNbByEntityId } from "../utils/utils";

export const findAllComportements = async (): Promise<Comportement[]> => {
  const [comportements, nbDonneesByComportement] = await Promise.all([
    queryToFindAllComportements(),
    queryToFindNumberOfDonneesByComportementId()
  ]);

  _.forEach(comportements, (comportement: Comportement) => {
    comportement.nbDonnees = getNbByEntityId(
      comportement,
      nbDonneesByComportement
    );
  });

  return comportements;
};
