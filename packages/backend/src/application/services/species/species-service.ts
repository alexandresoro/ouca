import type { AccessFailureReason, DeletionFailureReason } from "@domain/shared/failure-reason.js";
import type { Species, SpeciesCreateInput, SpeciesFailureReason } from "@domain/species/species.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { SpeciesRepository } from "@interfaces/species-repository-interface.js";
import type { Species as SpeciesCommon } from "@ou-ca/common/api/entities/species";
import type { SpeciesSearchParams, UpsertSpeciesInput } from "@ou-ca/common/api/species";
import { Result, err, ok } from "neverthrow";
import { enrichEntityWithEditableStatus, getSqlPagination } from "../entities-utils.js";
import type { SpeciesClassService } from "../species-class/species-class-service.js";

type SpeciesServiceDependencies = {
  classService: SpeciesClassService;
  speciesRepository: SpeciesRepository;
};

export const buildSpeciesService = ({ speciesRepository, classService }: SpeciesServiceDependencies) => {
  const enrichSpecies = async (
    species: Species,
    loggedUser: LoggedUser | null,
  ): Promise<Result<SpeciesCommon, AccessFailureReason>> => {
    // TODO this can be called from import with loggedUser = null and will fail validation
    // Ideally, even import should have a user
    const speciesClassResult = await classService.findSpeciesClassOfSpecies(species.id, loggedUser);

    return speciesClassResult.map((speciesClass) => {
      return enrichEntityWithEditableStatus({ ...species, speciesClass }, loggedUser);
    });
  };

  const enrichSpeciesMultiple = async (
    species: Species[],
    loggedUser: LoggedUser | null,
  ): Promise<Result<SpeciesCommon[], AccessFailureReason>> => {
    return Result.combine(
      await Promise.all(
        species.map(async (species) => {
          return await enrichSpecies(species, loggedUser);
        }),
      ),
    );
  };

  const findSpecies = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<SpeciesCommon | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const species = await speciesRepository.findSpeciesById(id);
    if (!species) {
      return ok(null);
    }
    return enrichSpecies(species, loggedUser);
  };

  const getEntriesCountBySpecies = async (
    id: string,
    options: SpeciesSearchParams,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { q, orderBy, sortOrder, pageSize, pageNumber, ...searchCriteria } = options;

    return ok(await speciesRepository.getEntriesCountById(id, searchCriteria));
  };

  const isSpeciesUsed = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<boolean, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const totalEntriesWithSpecies = await speciesRepository.getEntriesCountById(id);

    return ok(totalEntriesWithSpecies > 0);
  };

  const findAllSpecies = async (loggedUser: LoggedUser): Promise<Result<SpeciesCommon[], AccessFailureReason>> => {
    const species = await speciesRepository.findSpecies({
      orderBy: "code",
    });

    return enrichSpeciesMultiple([...species], loggedUser);
  };

  const findAllSpeciesWithClasses = async (): Promise<(Species & { classLabel: string })[]> => {
    const speciesWithClasses = await speciesRepository.findAllSpeciesWithClassLabel();
    return speciesWithClasses;
  };

  const findPaginatedSpecies = async (
    loggedUser: LoggedUser | null,
    options: SpeciesSearchParams,
  ): Promise<Result<SpeciesCommon[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { q, orderBy: orderByField, sortOrder, pageSize, pageNumber, onlyOwnData, ...searchCriteria } = options;

    const reshapedSearchCriteria = onlyOwnData
      ? {
          ...searchCriteria,
          ownerId: loggedUser.id,
        }
      : searchCriteria;

    const species = await speciesRepository.findSpecies(
      {
        q,
        searchCriteria: reshapedSearchCriteria,
        ...getSqlPagination({
          pageSize,
          pageNumber,
        }),
        orderBy: orderByField,
        sortOrder,
      },
      loggedUser.id,
    );

    return enrichSpeciesMultiple([...species], loggedUser);
  };

  const getSpeciesCount = async (
    loggedUser: LoggedUser | null,
    options: SpeciesSearchParams,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { q, orderBy: orderByField, sortOrder, pageSize, pageNumber, onlyOwnData, ...searchCriteria } = options;

    const reshapedSearchCriteria = onlyOwnData
      ? {
          ...searchCriteria,
          ownerId: loggedUser.id,
        }
      : searchCriteria;

    return ok(
      await speciesRepository.getCount({
        q: options.q,
        searchCriteria: reshapedSearchCriteria,
      }),
    );
  };

  const createSpecies = async (
    input: UpsertSpeciesInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<SpeciesCommon, SpeciesFailureReason>> => {
    if (!loggedUser?.permissions.species.canCreate) {
      return err("notAllowed");
    }

    const createdSpeciesResult = await speciesRepository.createSpecies({
      ...input,
      ownerId: loggedUser?.id,
    });

    if (createdSpeciesResult.isErr()) {
      return err(createdSpeciesResult.error);
    }

    return enrichSpecies(createdSpeciesResult.value, loggedUser);
  };

  const updateSpecies = async (
    id: number,
    input: UpsertSpeciesInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<SpeciesCommon, SpeciesFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (!loggedUser.permissions.species.canEdit) {
      const existingData = await speciesRepository.findSpeciesById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const updatedSpeciesResult = await speciesRepository.updateSpecies(id, input);

    if (updatedSpeciesResult.isErr()) {
      return err(updatedSpeciesResult.error);
    }

    return enrichSpecies(updatedSpeciesResult.value, loggedUser);
  };

  const deleteSpecies = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<SpeciesCommon | null, DeletionFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await speciesRepository.findSpeciesById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const speciesClassResult = await classService.findSpeciesClassOfSpecies(`${id}`, loggedUser);

    if (speciesClassResult.isErr()) {
      return err(speciesClassResult.error);
    }

    const speciesClass = speciesClassResult.value;

    if (!speciesClass) {
      return ok(null);
    }

    const deletedSpecies = await speciesRepository.deleteSpeciesById(id);

    if (!deletedSpecies) {
      return ok(null);
    }

    return ok(enrichEntityWithEditableStatus({ ...deletedSpecies, speciesClass }, loggedUser));
  };

  const createMultipleSpecies = async (
    species: Omit<SpeciesCreateInput, "ownerId">[],
    loggedUser: LoggedUser,
  ): Promise<Result<SpeciesCommon[], AccessFailureReason>> => {
    const createdSpecies = await speciesRepository.createSpeciesMultiple(
      species.map((species) => {
        return { ...species, ownerId: loggedUser.id };
      }),
    );

    return enrichSpeciesMultiple(createdSpecies, loggedUser);
  };

  return {
    findSpecies,
    getEntriesCountBySpecies,
    isSpeciesUsed,
    findAllSpecies,
    findAllSpeciesWithClasses,
    findPaginatedSpecies,
    getSpeciesCount,
    createSpecies,
    updateSpecies,
    deleteSpecies,
    createMultipleSpecies,
  };
};

export type SpeciesService = ReturnType<typeof buildSpeciesService>;
