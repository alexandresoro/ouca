import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { InventoryExtended } from "@ou-ca/common/api/entities/inventory";
import { Result, err, ok } from "neverthrow";
import type { Inventaire } from "../repositories/inventaire/inventaire-repository-types.js";
import type { Services } from "../services/services.js";
import { enrichedLocality } from "./localities-enricher.js";

export const enrichedInventory = async (
  services: Services,
  inventory: Inventaire,
  user: LoggedUser | null,
): Promise<Result<InventoryExtended, AccessFailureReason | "extendedDataNotFound">> => {
  const enrichedResult = Result.combine([
    await services.observerService.findObserverOfInventoryId(Number.parseInt(inventory.id), user),
    await services.observerService.findAssociatesOfInventoryId(Number.parseInt(inventory.id), user),
    await services.localityService.findLocalityOfInventoryId(Number.parseInt(inventory.id), user),
    await services.weatherService.findWeathersOfInventoryId(Number.parseInt(inventory.id), user),
  ]);

  if (enrichedResult.isErr()) {
    return err(enrichedResult.error);
  }

  const [observer, associates, locality, weathers] = enrichedResult.value;

  if (!observer || !locality) {
    return Promise.reject("Missing data for enriched inventory");
  }

  const localityEnrichedResult = await enrichedLocality(services, locality, user);

  if (localityEnrichedResult.isErr()) {
    return err(localityEnrichedResult.error);
  }

  return ok({
    ...inventory,
    observer,
    associates,
    locality: localityEnrichedResult.value,
    weathers,
  });
};
