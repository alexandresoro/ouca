import * as _ from "lodash";
import { Milieu } from "ouca-common/milieu.object";
import {
  queryToFindAllMilieux,
  queryToFindNumberOfDonneesByMilieuId
} from "../sql/sql-queries-milieu";
import { getNbByEntityId } from "../utils/utils";

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
