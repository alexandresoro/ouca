import { Meteo } from "../../model/types/meteo.object";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { queryToFindAllMeteos, queryToFindNumberOfDonneesByMeteoId } from "../../sql/sql-queries-meteo";
import { createKeyValueMapWithSameName } from "../../sql/sql-queries-utils";
import { TABLE_METEO } from "../../utils/constants";
import { getNbByEntityId } from "../../utils/utils";
import { findEntityByLibelle, insertMultipleEntities, persistEntity } from "./entity-service";

const DB_SAVE_MAPPING_METEO = createKeyValueMapWithSameName("libelle");

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
  return persistEntity(TABLE_METEO, meteo, DB_SAVE_MAPPING_METEO);
};

export const insertMeteos = async (
  meteos: Meteo[]
): Promise<SqlSaveResponse> => {
  return insertMultipleEntities(TABLE_METEO, meteos, DB_SAVE_MAPPING_METEO);
};
