import * as _ from "lodash";
import { EstimationNombre } from "ouca-common/estimation-nombre.object";
import { buildEstimationsNombreFromEstimationsNombreDb } from "../mapping/estimation-nombre-mapping";
import {
  queryToFindAllEstimationsNombre,
  queryToFindNumberOfDonneesByEstimationNombreId
} from "../sql/sql-queries-estimation-nombre";
import { getNbByEntityId } from "../utils/utils";

export const findAllEstimationsNombre = async (): Promise<
  EstimationNombre[]
> => {
  const [estimationsDb, nbDonneesByEstimation] = await Promise.all([
    queryToFindAllEstimationsNombre(),
    queryToFindNumberOfDonneesByEstimationNombreId()
  ]);

  const estimations: EstimationNombre[] = buildEstimationsNombreFromEstimationsNombreDb(
    estimationsDb
  );

  _.forEach(estimations, (estimation: EstimationNombre) => {
    estimation.nbDonnees = getNbByEntityId(estimation, nbDonneesByEstimation);
  });

  return estimations;
};
