import * as _ from "lodash";
import { Age } from "ouca-common/age.object";
import {
  queryToFindAllAges,
  queryToFindNumberOfDonneesByAgeId
} from "../sql/sql-queries-age";
import { getNbByEntityId } from "../utils/utils";

export const findAllAges = async (): Promise<Age[]> => {
  const [ages, nbDonneesByAge] = await Promise.all([
    queryToFindAllAges(),
    queryToFindNumberOfDonneesByAgeId()
  ]);

  _.forEach(ages, (age: Age) => {
    age.nbDonnees = getNbByEntityId(age, nbDonneesByAge);
  });

  return ages;
};
