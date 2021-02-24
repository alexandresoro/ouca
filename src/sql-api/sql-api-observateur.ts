import { Observateur } from "@ou-ca/ouca-model";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { queryToFindAllObservateurs, queryToFindNumberOfDonneesByObservateurId } from "../sql/sql-queries-observateur";
import { DB_SAVE_MAPPING } from "../sql/sql-queries-utils";
import { TABLE_OBSERVATEUR } from "../utils/constants";
import { getNbByEntityId } from "../utils/utils";
import { deleteEntityById, findEntityByLibelle, persistEntity } from "./sql-api-common";

export const findAllObservateurs = async (): Promise<Observateur[]> => {
  const [observateurs, nbDonneesByObservateur] = await Promise.all([
    queryToFindAllObservateurs(),
    queryToFindNumberOfDonneesByObservateurId()
  ]);

  observateurs.forEach((observateur: Observateur) => {
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
  return findEntityByLibelle<Observateur>(
    observateurLibelle,
    TABLE_OBSERVATEUR
  );
};

export const persistObservateur = async (
  observateur: Observateur
): Promise<SqlSaveResponse> => {
  return persistEntity(
    TABLE_OBSERVATEUR,
    observateur,
    DB_SAVE_MAPPING.get("observateur")
  );
};

export const deleteObservateur = async (
  id: number
): Promise<SqlSaveResponse> => {
  return deleteEntityById(TABLE_OBSERVATEUR, id);
};
