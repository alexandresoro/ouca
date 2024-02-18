import { OucaError } from "@domain/errors/ouca-error.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type Locality } from "@ou-ca/common/api/entities/locality";
import { type LocalitiesSearchParams, type UpsertLocalityInput } from "@ou-ca/common/api/locality";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { validateAuthorization } from "../../../application/services/authorization/authorization-utils.js";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { type InventaireRepository } from "../../../repositories/inventaire/inventaire-repository.js";
import {
  type LieuditCreateInput,
  type LieuditWithCommuneAndDepartementCode,
} from "../../../repositories/lieudit/lieudit-repository-types.js";
import { type LieuditRepository } from "../../../repositories/lieudit/lieudit-repository.js";
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
  const findLocality = async (id: number, loggedUser: LoggedUser | null): Promise<Locality | null> => {
    validateAuthorization(loggedUser);

    const locality = await localityRepository.findLieuditById(id);
    return reshapeLocalityRepositoryToApi(locality, loggedUser);
  };

  const getInventoriesCountByLocality = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return inventoryRepository.getCountByLocality(parseInt(id));
  };

  const getEntriesCountByLocality = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return entryRepository.getCountByLieuditId(parseInt(id));
  };

  const findLocalityOfInventoryId = async (
    inventaireId: number | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Locality | null> => {
    validateAuthorization(loggedUser);

    const locality = await localityRepository.findLieuditByInventaireId(inventaireId);
    return reshapeLocalityRepositoryToApi(locality, loggedUser);
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
    options: LocalitiesSearchParams
  ): Promise<Locality[]> => {
    validateAuthorization(loggedUser);

    const { q, townId, orderBy: orderByField, sortOrder, ...pagination } = options;

    const localities = await localityRepository.findLieuxdits({
      q,
      ...getSqlPagination(pagination),
      townId: townId ? parseInt(townId) : undefined,
      orderBy: orderByField,
      sortOrder,
    });

    const enrichedLocalities = localities.map((locality) => {
      return reshapeLocalityRepositoryToApi(locality, loggedUser);
    });

    return [...enrichedLocalities];
  };

  const findAllLocalitiesWithTownAndDepartment = async (): Promise<LieuditWithCommuneAndDepartementCode[]> => {
    const localitiesWithTownAndDepartmentCode =
      await localityRepository.findAllLieuxDitsWithCommuneAndDepartementCode();
    return [...localitiesWithTownAndDepartmentCode];
  };

  const getLocalitiesCount = async (
    loggedUser: LoggedUser | null,
    { q, townId }: Pick<LocalitiesSearchParams, "q" | "townId">
  ): Promise<number> => {
    validateAuthorization(loggedUser);

    return localityRepository.getCount(q, townId ? parseInt(townId) : undefined);
  };

  const createLocality = async (input: UpsertLocalityInput, loggedUser: LoggedUser | null): Promise<Locality> => {
    validateAuthorization(loggedUser);

    try {
      const createdLocality = await localityRepository.createLieudit({
        ...reshapeInputLocalityUpsertData(input),
        owner_id: loggedUser.id,
      });

      return reshapeLocalityRepositoryToApi(createdLocality, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const updateLocality = async (
    id: number,
    input: UpsertLocalityInput,
    loggedUser: LoggedUser | null
  ): Promise<Locality> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await localityRepository.findLieuditById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      const updatedLocality = await localityRepository.updateLieudit(id, reshapeInputLocalityUpsertData(input));

      return reshapeLocalityRepositoryToApi(updatedLocality, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const deleteLocality = async (id: number, loggedUser: LoggedUser | null): Promise<Locality> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await localityRepository.findLieuditById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    const deletedLocality = await localityRepository.deleteLieuditById(id);
    return reshapeLocalityRepositoryToApi(deletedLocality, loggedUser);
  };

  const createLocalities = async (
    localities: Omit<LieuditCreateInput, "owner_id">[],
    loggedUser: LoggedUser
  ): Promise<readonly Locality[]> => {
    const createdLocalities = await localityRepository.createLieuxdits(
      localities.map((locality) => {
        return { ...locality, owner_id: loggedUser.id };
      })
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
