import { Meteo } from "ouca-common/meteo.object";
import { TABLE_METEO } from "../utils/constants";
import { getEntityByLibelle } from "./sql-api-common";

export const findMeteoByLibelle = async (
  observateurLibelle: string
): Promise<Meteo | null> => {
  return (await getEntityByLibelle(observateurLibelle, TABLE_METEO)) as Meteo;
};
