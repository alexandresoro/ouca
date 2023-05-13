import { type UpsertTownInput } from "@ou-ca/common/api/town";
import { type CommuneCreateInput } from "../../repositories/commune/commune-repository-types.js";

export const reshapeInputCommuneUpsertData = (data: UpsertTownInput): CommuneCreateInput => {
  const { departementId, ...rest } = data;
  return {
    ...rest,
    departement_id: departementId,
  };
};
