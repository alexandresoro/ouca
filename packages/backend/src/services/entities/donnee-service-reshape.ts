import { type InputDonnee } from "../../graphql/generated/graphql-types.js";
import { type DonneeCreateInput } from "../../repositories/donnee/donnee-repository-types.js";

export const reshapeInputDonneeUpsertData = (data: InputDonnee): DonneeCreateInput => {
  const {
    ageId,
    especeId,
    estimationNombreId,
    estimationDistanceId,
    inventaireId,
    sexeId,
    comportementsIds,
    milieuxIds,
    ...rest
  } = data;
  return {
    ...rest,
    inventaire_id: inventaireId,
    espece_id: especeId,
    age_id: ageId,
    sexe_id: sexeId,
    estimation_nombre_id: estimationNombreId,
    estimation_distance_id: estimationDistanceId,
  };
};
