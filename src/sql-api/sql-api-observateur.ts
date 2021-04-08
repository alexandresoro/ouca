import { Observateur } from "../model/types/observateur.object";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { queryToFindAllObservateurs, queryToFindNumberOfDonneesByObservateurId } from "../sql/sql-queries-observateur";
import { createKeyValueMapWithSameName, queryToCheckIfTableExists } from "../sql/sql-queries-utils";
import { TABLE_OBSERVATEUR } from "../utils/constants";
import { getNbByEntityId } from "../utils/utils";
import { deleteEntityById, findEntityByLibelle, insertMultipleEntities, persistEntity } from "./sql-api-common";

const DB_SAVE_MAPPING_OBSERVATEUR = createKeyValueMapWithSameName("libelle");

export const checkIfTableObservateurExists = async (): Promise<boolean> => {
  return queryToCheckIfTableExists(TABLE_OBSERVATEUR);
}

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
    DB_SAVE_MAPPING_OBSERVATEUR
  );
};

export const deleteObservateur = async (
  id: number
): Promise<SqlSaveResponse> => {
  return deleteEntityById(TABLE_OBSERVATEUR, id);
};

export const insertObservateurs = async (
  observateurs: Observateur[]
): Promise<SqlSaveResponse> => {
  return insertMultipleEntities(TABLE_OBSERVATEUR, observateurs, DB_SAVE_MAPPING_OBSERVATEUR);
};
