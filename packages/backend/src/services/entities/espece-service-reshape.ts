import { type UpsertSpeciesInput } from "@ou-ca/common/api/species";
import { type EspeceCreateInput } from "../../repositories/espece/espece-repository-types.js";

export const reshapeInputEspeceUpsertData = (data: UpsertSpeciesInput): EspeceCreateInput => {
  const { classId, nomFrancais, nomLatin, ...rest } = data;
  return {
    ...rest,
    classe_id: parseInt(classId),
    nom_francais: nomFrancais,
    nom_latin: nomLatin,
  };
};
