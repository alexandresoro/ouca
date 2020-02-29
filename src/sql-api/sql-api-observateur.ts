import { Observateur } from "ouca-common/observateur.object";
import { TABLE_OBSERVATEUR } from "../utils/constants";
import { getEntityByLibelle } from "./sql-api-common";

export const findObservateurByLibelle = async (
  observateurLibelle: string
): Promise<Observateur | null> => {
  return await getEntityByLibelle<Observateur>(
    observateurLibelle,
    TABLE_OBSERVATEUR
  );
};
