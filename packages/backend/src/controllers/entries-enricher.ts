import type { Entry } from "@domain/entry/entry.js";
import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { GetEntryResponse } from "@ou-ca/common/api/entry";
import { Result, err, ok } from "neverthrow";
import type { Services } from "../application/services/services.js";

export const enrichedEntry = async (
  services: Services,
  entry: Entry,
  user: LoggedUser | null,
): Promise<Result<GetEntryResponse, AccessFailureReason | "extendedDataNotFound">> => {
  const enrichedResult = Result.combine([
    await services.ageService.findAge(Number.parseInt(entry.ageId), user),
    await services.behaviorService.findBehaviors(entry.behaviorIds, user),
    await services.speciesService.findSpecies(Number.parseInt(entry.speciesId), user),
    entry.distanceEstimateId != null
      ? await services.distanceEstimateService.findDistanceEstimate(Number(entry.distanceEstimateId), user)
      : ok(null),
    await services.numberEstimateService.findNumberEstimate(Number.parseInt(entry.numberEstimateId), user),
    await services.environmentService.findEnvironments(entry.environmentIds, user),
    await services.sexService.findSex(Number.parseInt(entry.sexId), user),
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
    inventoryId: `${entry.inventoryId}`,
    age,
    behaviors,
    species,
    distanceEstimate,
    numberEstimate,
    environments,
    sex,
    comment: entry.comment,
    number: entry.number,
    regroupment: entry.grouping,
  });
};
