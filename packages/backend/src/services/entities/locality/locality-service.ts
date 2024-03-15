import type { LocalityFailureReason } from "@domain/locality/locality.js";
import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { Locality } from "@ou-ca/common/api/entities/locality";
import type { LocalitiesSearchParams, UpsertLocalityInput } from "@ou-ca/common/api/locality";
import { type Result, err, ok } from "neverthrow";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import type { DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import type { InventaireRepository } from "../../../repositories/inventaire/inventaire-repository.js";
import type { LieuditWithCommuneAndDepartementCode } from "../../../repositories/lieudit/lieudit-repository-types.js";
import type { LieuditRepository } from "../../../repositories/lieudit/lieudit-repository.js";
import { getSqlPagination } from "../entities-utils.js";
import { reshapeInputLocalityUpsertData, reshapeLocalityRepositoryToApi } from "./locality-service-reshape.js";

type LocalityServiceDependencies = {
  localityRepository: LieuditRepository;
  inventoryRepository: InventaireRepository;
  entryRepository: DonneeRepository;
};

export const buildLocalityService = ({
  localityRepository,
  inventoryRepository,
  entryRepository,
}: LocalityServiceDependencies) => {
  const findLocality = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Locality | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const locality = await localityRepository.findLieuditById(id);
    return ok(reshapeLocalityRepositoryToApi(locality, loggedUser));
  };

  const getInventoriesCountByLocality = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await inventoryRepository.getCountByLocality(Number.parseInt(id)));
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
    inventoryId: number | undefined,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Locality | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const locality = await localityRepository.findLieuditByInventaireId(inventoryId);
    return ok(reshapeLocalityRepositoryToApi(locality, loggedUser));
  };

  const findAllLocalities = async (): Promise<Locality[]> => {
    const localities = await localityRepository.findLieuxdits({
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

    const localities = await localityRepository.findLieuxdits({
      q,
      ...getSqlPagination(pagination),
      townId: townId ? Number.parseInt(townId) : undefined,
      orderBy: orderByField,
      sortOrder,
    });

    const enrichedLocalities = localities.map((locality) => {
      return reshapeLocalityRepositoryToApi(locality, loggedUser);
    });

    return ok([...enrichedLocalities]);
  };

  const findAllLocalitiesWithTownAndDepartment = async (): Promise<LieuditWithCommuneAndDepartementCode[]> => {
    const localitiesWithTownAndDepartmentCode =
      await localityRepository.findAllLieuxDitsWithCommuneAndDepartementCode();
    return [...localitiesWithTownAndDepartmentCode];
  };

  const getLocalitiesCount = async (
    loggedUser: LoggedUser | null,
    { q, townId }: Pick<LocalitiesSearchParams, "q" | "townId">,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await localityRepository.getCount(q, townId ? Number.parseInt(townId) : undefined));
  };

  const createLocality = async (
    input: UpsertLocalityInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Locality, LocalityFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    try {
      const createdLocality = await localityRepository.createLieudit({
        ...reshapeInputLocalityUpsertData(input),
        owner_id: loggedUser.id,
      });

      return ok(reshapeLocalityRepositoryToApi(createdLocality, loggedUser));
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        return err("alreadyExists");
      }
      throw e;
    }
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
      const existingData = await localityRepository.findLieuditById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    try {
      const updatedLocality = await localityRepository.updateLieudit(id, reshapeInputLocalityUpsertData(input));

      return ok(reshapeLocalityRepositoryToApi(updatedLocality, loggedUser));
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        return err("alreadyExists");
      }
      throw e;
    }
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
      const existingData = await localityRepository.findLieuditById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const deletedLocality = await localityRepository.deleteLieuditById(id);
    return ok(reshapeLocalityRepositoryToApi(deletedLocality, loggedUser));
  };

  const createLocalities = async (localities: UpsertLocalityInput[], loggedUser: LoggedUser): Promise<Locality[]> => {
    const createdLocalities = await localityRepository.createLieuxdits(
      localities.map((locality) => {
        return {
          ...reshapeInputLocalityUpsertData(locality),
          owner_id: loggedUser.id,
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
