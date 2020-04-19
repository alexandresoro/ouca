import * as _ from "lodash";
import { EstimationDistance } from "ouca-common/estimation-distance.object";
import {
  getQueryToFindNumberOfDonneesByEstimationDistanceId,
  queryToFindAllEstimationsDistance
} from "../sql/sql-queries-estimation-distance";
import { getNbByEntityId } from "../utils/utils";

export const findAllEstimationsDistance = async (): Promise<
  EstimationDistance[]
> => {
  const [estimations, nbDonneesByEstimation] = await Promise.all([
    queryToFindAllEstimationsDistance(),
    getQueryToFindNumberOfDonneesByEstimationDistanceId()
  ]);

  _.forEach(estimations, (estimation: EstimationDistance) => {
    estimation.nbDonnees = getNbByEntityId(estimation, nbDonneesByEstimation);
  });

  return estimations;
};
