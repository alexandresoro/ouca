import * as _ from "lodash";
import { Meteo } from "ouca-common/meteo.object";
import {
  queryToFindAllMeteos,
  queryToFindNumberOfDonneesByMeteoId
} from "../sql/sql-queries-meteo";
import { TABLE_METEO } from "../utils/constants";
import { getNbByEntityId } from "../utils/utils";
import { getEntityByLibelle } from "./sql-api-common";

export const findAllMeteos = async (): Promise<Meteo[]> => {
  const [meteos, nbDonneesByMeteo] = await Promise.all([
    queryToFindAllMeteos(),
    queryToFindNumberOfDonneesByMeteoId()
  ]);

  _.forEach(meteos, (meteo: Meteo) => {
    meteo.nbDonnees = getNbByEntityId(meteo, nbDonneesByMeteo);
  });

  return meteos;
};

export const findMeteoByLibelle = async (
  observateurLibelle: string
): Promise<Meteo | null> => {
  return await getEntityByLibelle<Meteo>(observateurLibelle, TABLE_METEO);
};
