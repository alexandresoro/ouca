import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { GetEntryResponse } from "@ou-ca/common/api/entry";
import { Result, err, ok } from "neverthrow";
import type { Donnee } from "../repositories/donnee/donnee-repository-types.js";
import type { Services } from "../services/services.js";

export const enrichedEntry = async (
  services: Services,
  entry: Donnee,
  user: LoggedUser | null,
): Promise<Result<GetEntryResponse, AccessFailureReason | "extendedDataNotFound">> => {
  const enrichedResult = Result.combine([
    await services.ageService.findAgeOfEntryId(entry.id, user),
    await services.behaviorService.findBehaviorsOfEntryId(entry.id, user),
    await services.speciesService.findSpeciesOfEntryId(entry.id, user),
    await services.distanceEstimateService.findDistanceEstimateOfEntryId(entry.id, user),
    await services.numberEstimateService.findNumberEstimateOfEntryId(entry.id, user),
    await services.environmentService.findEnvironmentsOfEntryId(entry.id, user),
    await services.sexService.findSexOfEntryId(entry.id, user),
  ]);

  if (enrichedResult.isErr()) {
    return err(enrichedResult.error);
  }

  const [age, behaviors, species, distanceEstimate, numberEstimate, environments, sex] = enrichedResult.value;

  if (!age || !species || !numberEstimate || !sex) {
    return err("extendedDataNotFound");
  }

  return ok({
    ...entry,
    id: `${entry.id}`,
    inventoryId: `${entry.inventaireId}`,
    age,
    behaviors,
    species,
    distanceEstimate,
    numberEstimate,
    environments,
    sex,
    comment: entry.commentaire,
    number: entry.nombre,
    regroupment: entry.regroupement,
  });
};
