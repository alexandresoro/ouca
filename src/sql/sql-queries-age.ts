import { getQueryToFindNumberOfDonneesByDoneeeEntityId } from "./sql-queries-donnee";

export function getQueryToFindNumberOfDonneesByAgeId(ageId?: number): string {
  return getQueryToFindNumberOfDonneesByDoneeeEntityId("age_id", ageId);
}
