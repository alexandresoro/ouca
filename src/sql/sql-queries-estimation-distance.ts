import { getQueryToFindNumberOfDonneesByDoneeeEntityId } from "./sql-queries-donnee";

export function getQueryToFindNumberOfDonneesByEstimationDistanceId(
  estimationDistanceId?: number
): string {
  return getQueryToFindNumberOfDonneesByDoneeeEntityId(
    "estimation_distance_id",
    estimationDistanceId
  );
}
