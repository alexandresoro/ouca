import { type UpsertEntryInput } from "@ou-ca/common/api/entry";
import { type DonneeCreateInput } from "../../repositories/donnee/donnee-repository-types.js";

export const reshapeInputDonneeUpsertData = (data: UpsertEntryInput): DonneeCreateInput => {
  const {
    ageId,
    speciesId,
    numberEstimateId,
    number,
    distanceEstimateId,
    distance,
    inventoryId,
    sexId,
    regroupment,
    comment,
  } = data;
  return {
    inventaire_id: parseInt(inventoryId),
    espece_id: parseInt(speciesId),
    age_id: parseInt(ageId),
    sexe_id: parseInt(sexId),
    estimation_nombre_id: parseInt(numberEstimateId),
    nombre: number,
    estimation_distance_id: distanceEstimateId ? parseInt(distanceEstimateId) : undefined,
    distance,
    regroupement: regroupment,
    commentaire: comment,
  };
};
