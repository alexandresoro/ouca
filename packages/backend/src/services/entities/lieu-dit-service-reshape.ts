import { type InputLieuDit } from "../../graphql/generated/graphql-types.js";
import { type LieuditCreateInput } from "../../repositories/lieudit/lieudit-repository-types.js";

export const reshapeInputLieuditUpsertData = (data: InputLieuDit): LieuditCreateInput => {
  const { communeId, coordinatesSystem, ...rest } = data;
  return {
    ...rest,
    commune_id: communeId,
    coordinates_system: coordinatesSystem,
  };
};
