import { EstimationNombre } from "@ou-ca/ouca-model";
import { EstimationNombreDb } from "../objects/db/estimation-nombre-db.object";

export const buildEstimationNombreFromEstimationNombreDb = (
  estimationDb: EstimationNombreDb
): EstimationNombre => {
  return {
    id: estimationDb.id,
    libelle: estimationDb.libelle,
    nonCompte: estimationDb.non_compte
  };
};

export const buildEstimationsNombreFromEstimationsNombreDb = (
  estimationsDb: EstimationNombreDb[]
): EstimationNombre[] => {
  return estimationsDb.map((estimationDb) => {
    return buildEstimationNombreFromEstimationNombreDb(estimationDb);
  });
};
