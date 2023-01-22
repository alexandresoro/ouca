import { type InputEstimationNombre } from "../../graphql/generated/graphql-types.js";
import { type EstimationNombreCreateInput } from "../../repositories/estimation-nombre/estimation-nombre-repository-types.js";

export const reshapeInputEstimationNombreUpsertData = (data: InputEstimationNombre): EstimationNombreCreateInput => {
  const { nonCompte, ...rest } = data;
  return {
    ...rest,
    non_compte: nonCompte,
  };
};
