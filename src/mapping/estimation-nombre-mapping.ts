import { EstimationNombre } from "@ou-ca/ouca-model/estimation-nombre.object";
import * as _ from "lodash";
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
  return _.map(estimationsDb, (estimationDb) => {
    return buildEstimationNombreFromEstimationNombreDb(estimationDb);
  });
};
