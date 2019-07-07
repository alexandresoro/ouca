import { getQueryToFindNumberOfDonneesByDoneeeEntityId } from "./sql-queries-donnee";

export function getQueryToFindNumberOfDonneesBySexeId(sexeId?: number): string {
  return getQueryToFindNumberOfDonneesByDoneeeEntityId("sexe_id", sexeId);
}
