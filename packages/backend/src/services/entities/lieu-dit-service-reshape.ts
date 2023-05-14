import { type UpsertLocalityInput } from "@ou-ca/common/api/locality";
import { type LieuditCreateInput } from "../../repositories/lieudit/lieudit-repository-types.js";

export const reshapeInputLieuditUpsertData = (data: UpsertLocalityInput): LieuditCreateInput => {
  const { communeId, coordinatesSystem, ...rest } = data;
  return {
    ...rest,
    commune_id: communeId,
    coordinates_system: coordinatesSystem,
  };
};
