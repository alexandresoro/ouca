import { EstimationDistance } from "../model/types/estimation-distance.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import { COLUMN_LIBELLE, ORDER_ASC, TABLE_ESTIMATION_DISTANCE } from "../utils/constants";
import { queryToFindNumberOfDonneesByDonneeEntityId } from "./sql-queries-donnee";
import { query, queryToFindAllEntities } from "./sql-queries-utils";

export const queryToCreateEstimationDistanceTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS estimation_distance (" +
    " id SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT," +
    " libelle VARCHAR(100) NOT NULL," +
    " PRIMARY KEY (id)," +
    " UNIQUE KEY `unique_libelle` (libelle)" +
    " )");
}

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
