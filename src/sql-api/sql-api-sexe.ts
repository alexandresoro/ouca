import * as _ from "lodash";
import { Sexe } from "ouca-common/sexe.object";
import {
  queryToFindAllSexes,
  queryToFindNumberOfDonneesBySexeId
} from "../sql/sql-queries-sexe";
import { getNbByEntityId } from "../utils/utils";

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
