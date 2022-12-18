import { type InputCommune } from "../../graphql/generated/graphql-types";
import { type CommuneCreateInput } from "../../repositories/commune/commune-repository-types";

export const reshapeInputCommuneUpsertData = (data: InputCommune): CommuneCreateInput => {
  const { departementId, ...rest } = data;
  return {
    ...rest,
    departement_id: departementId,
  };
};
