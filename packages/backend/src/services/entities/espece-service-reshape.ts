import { type InputEspece } from "../../graphql/generated/graphql-types.js";
import { type EspeceCreateInput } from "../../repositories/espece/espece-repository-types.js";

export const reshapeInputEspeceUpsertData = (data: InputEspece): EspeceCreateInput => {
  const { classeId, nomFrancais, nomLatin, ...rest } = data;
  return {
    ...rest,
    classe_id: classeId,
    nom_francais: nomFrancais,
    nom_latin: nomLatin,
  };
};
