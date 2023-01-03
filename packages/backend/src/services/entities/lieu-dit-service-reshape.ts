import { type InputLieuDit } from "../../graphql/generated/graphql-types";
import { type LieuditCreateInput } from "../../repositories/lieudit/lieudit-repository-types";

export const reshapeInputLieuditUpsertData = (data: InputLieuDit): LieuditCreateInput => {
  const { communeId, coordinatesSystem, ...rest } = data;
  return {
    ...rest,
    commune_id: communeId,
    coordinates_system: coordinatesSystem,
  };
};
