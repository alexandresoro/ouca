import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import type { Species, SpeciesFailureReason } from "@domain/species/species.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { Species as SpeciesCommon } from "@ou-ca/common/api/entities/species";
import type { SpeciesSearchParams, UpsertSpeciesInput } from "@ou-ca/common/api/species";
import { Result, err, ok } from "neverthrow";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import type { SpeciesClassService } from "../../../application/services/species-class/species-class-service.js";
import type { DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import type {
  EspeceCreateInput,
  EspeceWithClasseLibelle,
} from "../../../repositories/espece/espece-repository-types.js";
import type { EspeceRepository } from "../../../repositories/espece/espece-repository.js";
import { reshapeSearchCriteria } from "../../../repositories/search-criteria.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "../entities-utils.js";
import { reshapeInputSpeciesUpsertData } from "./species-service-reshape.js";

type SpeciesServiceDependencies = {
  classService: SpeciesClassService;
  speciesRepository: EspeceRepository;
  entryRepository: DonneeRepository;
};

export const buildSpeciesService = ({
  speciesRepository,
  entryRepository,
  classService,
}: SpeciesServiceDependencies) => {
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

    const species = await speciesRepository.findEspeceById(id);
    if (!species) {
      return ok(null);
    }
    return enrichSpecies(species, loggedUser);
  };

  const getEntriesCountBySpecies = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await entryRepository.getCountByEspeceId(Number.parseInt(id)));
  };

  const findSpeciesOfEntryId = async (
    entryId: string | undefined,
    loggedUser: LoggedUser | null,
  ): Promise<Result<SpeciesCommon | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const species = await speciesRepository.findEspeceByDonneeId(entryId ? Number.parseInt(entryId) : undefined);
    if (!species) {
      return ok(null);
    }
    return enrichSpecies(species, loggedUser);
  };

  const findAllSpecies = async (): Promise<Result<SpeciesCommon[], AccessFailureReason>> => {
    const species = await speciesRepository.findEspeces({
      orderBy: "code",
    });

    return enrichSpeciesMultiple([...species], null);
  };

  const findAllSpeciesWithClasses = async (): Promise<EspeceWithClasseLibelle[]> => {
    const speciesWithClasses = await speciesRepository.findAllEspecesWithClasseLibelle();
    return [...speciesWithClasses];
  };

  const findPaginatedSpecies = async (
    loggedUser: LoggedUser | null,
    options: SpeciesSearchParams,
  ): Promise<Result<SpeciesCommon[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { q, orderBy: orderByField, sortOrder, pageSize, pageNumber, ...searchCriteria } = options;

    const reshapedSearchCriteria = reshapeSearchCriteria(searchCriteria);

    const species = await speciesRepository.findEspeces({
      q,
      searchCriteria: reshapedSearchCriteria,
      ...getSqlPagination({
        pageSize,
        pageNumber,
      }),
      orderBy: orderByField,
      sortOrder,
    });

    return enrichSpeciesMultiple([...species], loggedUser);
  };

  const getSpeciesCount = async (
    loggedUser: LoggedUser | null,
    options: SpeciesSearchParams,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const reshapedSearchCriteria = reshapeSearchCriteria(options);

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
    if (!loggedUser) {
      return err("notAllowed");
    }

    try {
      const createdSpecies = await speciesRepository.createEspece({
        ...reshapeInputSpeciesUpsertData(input),
        owner_id: loggedUser?.id,
      });

      return enrichSpecies(createdSpecies, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        return err("alreadyExists");
      }
      throw e;
    }
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
    if (loggedUser?.role !== "admin") {
      const existingData = await speciesRepository.findEspeceById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    try {
      const updatedSpecies = await speciesRepository.updateEspece(id, reshapeInputSpeciesUpsertData(input));

      return enrichSpecies(updatedSpecies, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        return err("alreadyExists");
      }
      throw e;
    }
  };

  const deleteSpecies = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<SpeciesCommon | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await speciesRepository.findEspeceById(id);

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

    const deletedSpecies = await speciesRepository.deleteEspeceById(id);

    if (!deletedSpecies) {
      return ok(null);
    }

    return ok(enrichEntityWithEditableStatus({ ...deletedSpecies, speciesClass }, loggedUser));
  };

  const createMultipleSpecies = async (
    species: Omit<EspeceCreateInput, "owner_id">[],
    loggedUser: LoggedUser,
  ): Promise<Result<SpeciesCommon[], AccessFailureReason>> => {
    const createdSpecies = await speciesRepository.createEspeces(
      species.map((species) => {
        return { ...species, owner_id: loggedUser.id };
      }),
    );

    return enrichSpeciesMultiple([...createdSpecies], loggedUser);
  };

  return {
    findSpecies,
    getEntriesCountBySpecies,
    findSpeciesOfEntryId,
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
