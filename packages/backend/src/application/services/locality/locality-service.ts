import type { Locality as LocalityDomain, LocalityFailureReason } from "@domain/locality/locality.js";
import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { InventoryRepository } from "@interfaces/inventory-repository-interface.js";
import type { LocalityRepository } from "@interfaces/locality-repository-interface.js";
import type { Locality } from "@ou-ca/common/api/entities/locality";
import type { LocalitiesSearchParams, UpsertLocalityInput } from "@ou-ca/common/api/locality";
import { type Result, err, ok } from "neverthrow";
import type { DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import type { InventaireRepository } from "../../../repositories/inventaire/inventaire-repository.js";
import { getSqlPagination } from "../entities-utils.js";
import { reshapeLocalityRepositoryToApi } from "./locality-service-reshape.js";

type LocalityServiceDependencies = {
  localityRepository: LocalityRepository;
  inventoryRepository: InventoryRepository;
  inventoryRepositoryLegacy: InventaireRepository;
  entryRepository: DonneeRepository;
};

export const buildLocalityService = ({
  localityRepository,
  inventoryRepository,
  inventoryRepositoryLegacy,
  entryRepository,
}: LocalityServiceDependencies) => {
  const findLocality = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Locality | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const locality = await localityRepository.findLocalityById(id);
    return ok(reshapeLocalityRepositoryToApi(locality, loggedUser));
  };

  const getInventoriesCountByLocality = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await inventoryRepositoryLegacy.getCountByLocality(Number.parseInt(id)));
  };

  const getEntriesCountByLocality = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await entryRepository.getCountByLieuditId(Number.parseInt(id)));
  };

  const findLocalityOfInventoryId = async (
    inventoryId: string | undefined,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Locality | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const locality = await localityRepository.findLocalityByInventoryId(inventoryId);
    return ok(reshapeLocalityRepositoryToApi(locality, loggedUser));
  };

  const findAllLocalities = async (): Promise<Locality[]> => {
    const localities = await localityRepository.findLocalities({
      orderBy: "nom",
    });

    const enrichedLocalities = localities.map((locality) => {
      return reshapeLocalityRepositoryToApi(locality, null);
    });

    return [...enrichedLocalities];
  };

  const findPaginatedLocalities = async (
    loggedUser: LoggedUser | null,
    options: LocalitiesSearchParams,
  ): Promise<Result<Locality[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { q, townId, orderBy: orderByField, sortOrder, ...pagination } = options;

    const localities = await localityRepository.findLocalities({
      q,
      ...getSqlPagination(pagination),
      townId: townId,
      orderBy: orderByField,
      sortOrder,
    });

    const enrichedLocalities = localities.map((locality) => {
      return reshapeLocalityRepositoryToApi(locality, loggedUser);
    });

    return ok([...enrichedLocalities]);
  };

  const findAllLocalitiesWithTownAndDepartment = async (): Promise<
    (LocalityDomain & {
      townCode: number;
      townName: string;
      departmentCode: string;
    })[]
  > => {
    return localityRepository.findAllLocalitiesWithTownAndDepartmentCode();
  };

  const getLocalitiesCount = async (
    loggedUser: LoggedUser | null,
    { q, townId }: Pick<LocalitiesSearchParams, "q" | "townId">,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await localityRepository.getCount(q, townId));
  };

  const createLocality = async (
    input: UpsertLocalityInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Locality, LocalityFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const createdLocalityResult = await localityRepository.createLocality({
      ...input,
      ownerId: loggedUser.id,
    });

    return createdLocalityResult.map((createdLocality) => {
      return reshapeLocalityRepositoryToApi(createdLocality, loggedUser);
    });
  };

  const updateLocality = async (
    id: number,
    input: UpsertLocalityInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Locality, LocalityFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await localityRepository.findLocalityById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const updatedLocalityResult = await localityRepository.updateLocality(id, input);

    return updatedLocalityResult.map((updatedLocality) => {
      return reshapeLocalityRepositoryToApi(updatedLocality, loggedUser);
    });
  };

  const deleteLocality = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Locality | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await localityRepository.findLocalityById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const deletedLocality = await localityRepository.deleteLocalityById(id);
    return ok(reshapeLocalityRepositoryToApi(deletedLocality, loggedUser));
  };

  const createLocalities = async (localities: UpsertLocalityInput[], loggedUser: LoggedUser): Promise<Locality[]> => {
    const createdLocalities = await localityRepository.createLocalities(
      localities.map((locality) => {
        return {
          ...locality,
          ownerId: loggedUser.id,
        };
      }),
    );

    const enrichedCreatedLocalities = createdLocalities.map((locality) => {
      return reshapeLocalityRepositoryToApi(locality, loggedUser);
    });

    return enrichedCreatedLocalities;
  };

  return {
    findLocality,
    getInventoriesCountByLocality,
    getEntriesCountByLocality,
    findLocalityOfInventoryId,
    findAllLocalities,
    findAllLocalitiesWithTownAndDepartment,
    findPaginatedLocalities,
    getLocalitiesCount,
    createLocality,
    updateLocality,
    deleteLocality,
    createLocalities,
  };
};

export type LocalityService = ReturnType<typeof buildLocalityService>;
