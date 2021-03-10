import { EstimationDistance } from "../model/types/estimation-distance.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import { COLUMN_LIBELLE, ORDER_ASC, TABLE_ESTIMATION_DISTANCE } from "../utils/constants";
import { queryToFindNumberOfDonneesByDonneeEntityId } from "./sql-queries-donnee";
import { queryToFindAllEntities } from "./sql-queries-utils";

export const queryToFindAllEstimationsDistance = async (): Promise<
  EstimationDistance[]
> => {
  return queryToFindAllEntities<EstimationDistance>(
    TABLE_ESTIMATION_DISTANCE,
    COLUMN_LIBELLE,
    ORDER_ASC
  );
};

export const getQueryToFindNumberOfDonneesByEstimationDistanceId = async (
  estimationDistanceId?: number
): Promise<NumberOfObjectsById[]> => {
  return queryToFindNumberOfDonneesByDonneeEntityId(
    "estimation_distance_id",
    estimationDistanceId
  );
};
