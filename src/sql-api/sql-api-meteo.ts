import { Meteo } from "../model/types/meteo.object";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { queryToFindAllMeteos, queryToFindNumberOfDonneesByMeteoId } from "../sql/sql-queries-meteo";
import { DB_SAVE_MAPPING } from "../sql/sql-queries-utils";
import { TABLE_METEO } from "../utils/constants";
import { getNbByEntityId } from "../utils/utils";
import { findEntityByLibelle, persistEntity } from "./sql-api-common";

export const findAllMeteos = async (): Promise<Meteo[]> => {
  const [meteos, nbDonneesByMeteo] = await Promise.all([
    queryToFindAllMeteos(),
    queryToFindNumberOfDonneesByMeteoId()
  ]);

  meteos.forEach((meteo: Meteo) => {
    meteo.nbDonnees = getNbByEntityId(meteo, nbDonneesByMeteo);
  });

  return meteos;
};

export const findMeteoByLibelle = async (
  observateurLibelle: string
): Promise<Meteo> => {
  return findEntityByLibelle<Meteo>(observateurLibelle, TABLE_METEO);
};

export const persistMeteo = async (meteo: Meteo): Promise<SqlSaveResponse> => {
  return persistEntity(TABLE_METEO, meteo, DB_SAVE_MAPPING.get("meteo"));
};
