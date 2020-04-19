import * as _ from "lodash";
import { Observateur } from "ouca-common/observateur.object";
import {
  queryToFindAllObservateurs,
  queryToFindNumberOfDonneesByObservateurId
} from "../sql/sql-queries-observateur";
import { TABLE_OBSERVATEUR } from "../utils/constants";
import { getNbByEntityId } from "../utils/utils";
import { getEntityByLibelle } from "./sql-api-common";

export const findAllObservateurs = async (): Promise<Observateur[]> => {
  const [observateurs, nbDonneesByObservateur] = await Promise.all([
    queryToFindAllObservateurs(),
    queryToFindNumberOfDonneesByObservateurId()
  ]);

  _.forEach(observateurs, (observateur: Observateur) => {
    observateur.nbDonnees = getNbByEntityId(
      observateur,
      nbDonneesByObservateur
    );
  });

  return observateurs;
};

export const findObservateurByLibelle = async (
  observateurLibelle: string
): Promise<Observateur | null> => {
  return await getEntityByLibelle<Observateur>(
    observateurLibelle,
    TABLE_OBSERVATEUR
  );
};
