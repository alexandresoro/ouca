import { OucaError } from "@domain/errors/ouca-error.js";
import { type Species } from "@domain/species/species.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type Species as SpeciesCommon } from "@ou-ca/common/api/entities/species";
import { type SpeciesSearchParams, type UpsertSpeciesInput } from "@ou-ca/common/api/species";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { validateAuthorization } from "../../../application/services/authorization/authorization-utils.js";
import { type SpeciesClassService } from "../../../application/services/species-class/species-class-service.js";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import {
  type EspeceCreateInput,
  type EspeceWithClasseLibelle,
} from "../../../repositories/espece/espece-repository-types.js";
import { type EspeceRepository } from "../../../repositories/espece/espece-repository.js";
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
  const enrichSpecies = async (species: Species, loggedUser: LoggedUser | null): Promise<SpeciesCommon> => {
    // TODO this can be called from import with loggedUser = null and will fail validation
    // Ideally, even import should have a user
    const speciesClass = (await classService.findSpeciesClassOfSpecies(species.id, loggedUser))._unsafeUnwrap();
    return enrichEntityWithEditableStatus({ ...species, speciesClass }, loggedUser);
  };

  const findSpecies = async (id: number, loggedUser: LoggedUser | null): Promise<SpeciesCommon | null> => {
    validateAuthorization(loggedUser);

    const species = await speciesRepository.findEspeceById(id);
    if (!species) {
      return null;
    }
    return enrichSpecies(species, loggedUser);
  };

  const getEntriesCountBySpecies = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return entryRepository.getCountByEspeceId(parseInt(id));
  };

  const findSpeciesOfEntryId = async (
    entryId: string | undefined,
    loggedUser: LoggedUser | null
  ): Promise<SpeciesCommon | null> => {
    validateAuthorization(loggedUser);

    const species = await speciesRepository.findEspeceByDonneeId(entryId ? parseInt(entryId) : undefined);
    if (!species) {
      return null;
    }
    return enrichSpecies(species, loggedUser);
  };

  const findAllSpecies = async (): Promise<SpeciesCommon[]> => {
    const species = await speciesRepository.findEspeces({
      orderBy: "code",
    });

    const enrichedSpecies = await Promise.all(
      species.map((species) => {
        return enrichSpecies(species, null);
      })
    );

    return [...enrichedSpecies];
  };

  const findAllSpeciesWithClasses = async (): Promise<EspeceWithClasseLibelle[]> => {
    const speciesWithClasses = await speciesRepository.findAllEspecesWithClasseLibelle();
    return [...speciesWithClasses];
  };

  const findPaginatedSpecies = async (
    loggedUser: LoggedUser | null,
    options: SpeciesSearchParams
  ): Promise<SpeciesCommon[]> => {
    validateAuthorization(loggedUser);

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

    const enrichedSpecies = await Promise.all(
      species.map((species) => {
        return enrichSpecies(species, loggedUser);
      })
    );

    return [...enrichedSpecies];
  };

  const getSpeciesCount = async (loggedUser: LoggedUser | null, options: SpeciesSearchParams): Promise<number> => {
    validateAuthorization(loggedUser);

    const reshapedSearchCriteria = reshapeSearchCriteria(options);

    return speciesRepository.getCount({
      q: options.q,
      searchCriteria: reshapedSearchCriteria,
    });
  };

  const createSpecies = async (input: UpsertSpeciesInput, loggedUser: LoggedUser | null): Promise<SpeciesCommon> => {
    validateAuthorization(loggedUser);

    try {
      const createdSpecies = await speciesRepository.createEspece({
        ...reshapeInputSpeciesUpsertData(input),
        owner_id: loggedUser?.id,
      });

      return enrichSpecies(createdSpecies, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const updateSpecies = async (
    id: number,
    input: UpsertSpeciesInput,
    loggedUser: LoggedUser | null
  ): Promise<SpeciesCommon> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await speciesRepository.findEspeceById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      const updatedSpecies = await speciesRepository.updateEspece(id, reshapeInputSpeciesUpsertData(input));

      return enrichSpecies(updatedSpecies, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const deleteSpecies = async (id: number, loggedUser: LoggedUser | null): Promise<SpeciesCommon | null> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await speciesRepository.findEspeceById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    const speciesClass = (await classService.findSpeciesClassOfSpecies(`${id}`, loggedUser))._unsafeUnwrap();

    if (!speciesClass) {
      return null;
    }

    const deletedSpecies = await speciesRepository.deleteEspeceById(id);

    if (!deletedSpecies) {
      return null;
    }

    return enrichEntityWithEditableStatus({ ...deletedSpecies, speciesClass }, loggedUser);
  };

  const createMultipleSpecies = async (
    species: Omit<EspeceCreateInput, "owner_id">[],
    loggedUser: LoggedUser
  ): Promise<readonly SpeciesCommon[]> => {
    const createdSpecies = await speciesRepository.createEspeces(
      species.map((species) => {
        return { ...species, owner_id: loggedUser.id };
      })
    );

    const enrichedCreatedSpecies = await Promise.all(
      createdSpecies.map((species) => {
        return enrichSpecies(species, loggedUser);
      })
    );

    return enrichedCreatedSpecies;
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
