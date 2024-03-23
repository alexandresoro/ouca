import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { Locality, LocalityExtended } from "@ou-ca/common/api/entities/locality";
import { type Result, err, ok } from "neverthrow";
import type { Services } from "../application/services/services.js";

export const enrichedLocality = async (
  services: Services,
  locality: Locality,
  user: LoggedUser | null,
): Promise<
  Result<Omit<LocalityExtended, "inventoriesCount" | "entriesCount">, AccessFailureReason | "extendedDataNotFound">
> => {
  const townResult = await services.townService.findTownOfLocalityId(locality.id, user);

  if (townResult.isErr()) {
    return err(townResult.error);
  }

  const town = townResult.value;

  if (!town) {
    return err("extendedDataNotFound");
  }

  const departmentResult = await services.departmentService.findDepartmentOfTownId(town.id, user);

  if (departmentResult.isErr()) {
    return err(departmentResult.error);
  }

  const department = departmentResult.value;

  if (!department) {
    return err("extendedDataNotFound");
  }

  return ok({
    ...locality,
    townCode: town.code,
    townName: town.nom,
    departmentCode: department.code,
  });
};
