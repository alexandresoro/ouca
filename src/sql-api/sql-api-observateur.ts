import { Observateur } from "basenaturaliste-model/observateur.object";
import { getEntityByLibelle } from "./sql-api-common";
import { TABLE_OBSERVATEUR } from "../utils/constants";

export const findObservateurByLibelle = async (
  observateurLibelle: string
): Promise<Observateur | null> => {
  return (await getEntityByLibelle(
    observateurLibelle,
    TABLE_OBSERVATEUR
  )) as Observateur;
};
