import { getQuery } from "./sql-queries-utils";

export function getQueryToFindConfigurationByLibelle(libelle: string): string {
  return getQuery(
    'SELECT * FROM configuration WHERE libelle="' + libelle + '"'
  );
}
