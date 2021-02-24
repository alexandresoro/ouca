import { EstimationDistance } from "@ou-ca/ouca-model";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { getQueryToFindNumberOfDonneesByEstimationDistanceId, queryToFindAllEstimationsDistance } from "../sql/sql-queries-estimation-distance";
import { DB_SAVE_MAPPING } from "../sql/sql-queries-utils";
import { TABLE_ESTIMATION_DISTANCE } from "../utils/constants";
import { getNbByEntityId } from "../utils/utils";
import { persistEntity } from "./sql-api-common";

export const findAllEstimationsDistance = async (): Promise<
  EstimationDistance[]
> => {
  const [estimations, nbDonneesByEstimation] = await Promise.all([
    queryToFindAllEstimationsDistance(),
    getQueryToFindNumberOfDonneesByEstimationDistanceId()
  ]);

  estimations.forEach((estimation: EstimationDistance) => {
    estimation.nbDonnees = getNbByEntityId(estimation, nbDonneesByEstimation);
  });

  return estimations;
};

export const persistEstimationDistance = async (
  estimation: EstimationDistance
): Promise<SqlSaveResponse> => {
  return persistEntity(
    TABLE_ESTIMATION_DISTANCE,
    estimation,
    DB_SAVE_MAPPING.get("estimationDistance")
  );
};
