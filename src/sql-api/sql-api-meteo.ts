import { getEntityByLibelle } from "./sql-api-common";
import { TABLE_METEO } from "../utils/constants";
import { Meteo } from "basenaturaliste-model/meteo.object";

export const findMeteoByLibelle = async (
  observateurLibelle: string
): Promise<Meteo | null> => {
  return (await getEntityByLibelle(observateurLibelle, TABLE_METEO)) as Meteo;
};
