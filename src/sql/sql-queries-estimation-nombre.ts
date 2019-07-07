import { getQueryToFindNumberOfDonneesByDoneeeEntityId } from "./sql-queries-donnee";

export function getQueryToFindNumberOfDonneesByEstimationNombreId(
  estimationId?: number
): string {
  return getQueryToFindNumberOfDonneesByDoneeeEntityId(
    "estimation_nombre_id",
    estimationId
  );
}
