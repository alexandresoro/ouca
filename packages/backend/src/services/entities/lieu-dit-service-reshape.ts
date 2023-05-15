import { type UpsertLocalityInput } from "@ou-ca/common/api/locality";
import { type LieuditCreateInput } from "../../repositories/lieudit/lieudit-repository-types.js";

export const reshapeInputLieuditUpsertData = (data: UpsertLocalityInput): LieuditCreateInput => {
  const { townId, coordinatesSystem, ...rest } = data;
  return {
    ...rest,
    commune_id: parseInt(townId),
    coordinates_system: coordinatesSystem,
  };
};
