import { type UpsertNumberEstimateInput } from "@ou-ca/common/api/number-estimate";
import { type EstimationNombreCreateInput } from "../../repositories/estimation-nombre/estimation-nombre-repository-types.js";

export const reshapeInputEstimationNombreUpsertData = (
  data: UpsertNumberEstimateInput
): EstimationNombreCreateInput => {
  const { nonCompte, ...rest } = data;
  return {
    ...rest,
    non_compte: nonCompte,
  };
};
