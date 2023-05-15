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
    inventaire_id: inventoryId,
    espece_id: speciesId,
    age_id: ageId,
    sexe_id: sexId,
    estimation_nombre_id: numberEstimateId,
    nombre: number,
    estimation_distance_id: distanceEstimateId,
    distance,
    regroupement: regroupment,
    commentaire: comment,
  };
};
