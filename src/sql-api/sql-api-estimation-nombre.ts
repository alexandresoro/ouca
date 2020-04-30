import * as _ from "lodash";
import { EstimationNombre } from "ouca-common/estimation-nombre.object";
import { buildEstimationsNombreFromEstimationsNombreDb } from "../mapping/estimation-nombre-mapping";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import {
  queryToFindAllEstimationsNombre,
  queryToFindNumberOfDonneesByEstimationNombreId
} from "../sql/sql-queries-estimation-nombre";
import { DB_SAVE_MAPPING } from "../sql/sql-queries-utils";
import { TABLE_ESTIMATION_NOMBRE } from "../utils/constants";
import { getNbByEntityId } from "../utils/utils";
import { persistEntity } from "./sql-api-common";

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

export const persistEstimationNombre = async (
  estimation: EstimationNombre
): Promise<SqlSaveResponse> => {
  return persistEntity(
    TABLE_ESTIMATION_NOMBRE,
    estimation,
    DB_SAVE_MAPPING.estimationNombre
  );
};
