import type { UpsertEntryInput } from "@ou-ca/common/api/entry";
import type { DonneeCreateInput } from "../../repositories/donnee/donnee-repository-types.js";

export const reshapeInputEntryUpsertData = (data: UpsertEntryInput): DonneeCreateInput => {
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
    inventaire_id: Number.parseInt(inventoryId),
    espece_id: Number.parseInt(speciesId),
    age_id: Number.parseInt(ageId),
    sexe_id: Number.parseInt(sexId),
    estimation_nombre_id: Number.parseInt(numberEstimateId),
    nombre: number,
    estimation_distance_id: distanceEstimateId ? Number.parseInt(distanceEstimateId) : undefined,
    distance,
    regroupement: regroupment,
    commentaire: comment,
  };
};
