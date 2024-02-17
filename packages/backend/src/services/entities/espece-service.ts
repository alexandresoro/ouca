import { OucaError } from "@domain/errors/ouca-error.js";
import { type Species } from "@domain/species/species.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type Species as SpeciesCommon } from "@ou-ca/common/api/entities/species";
import { type SpeciesSearchParams, type UpsertSpeciesInput } from "@ou-ca/common/api/species";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { validateAuthorization } from "../../application/services/authorization/authorization-utils.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import {
  type EspeceCreateInput,
  type EspeceWithClasseLibelle,
} from "../../repositories/espece/espece-repository-types.js";
import { type EspeceRepository } from "../../repositories/espece/espece-repository.js";
import { reshapeSearchCriteria } from "../../repositories/search-criteria.js";
import { type ClasseService } from "./classe-service.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "./entities-utils.js";
import { reshapeInputEspeceUpsertData } from "./espece-service-reshape.js";

type EspeceServiceDependencies = {
  classService: ClasseService;
  speciesRepository: EspeceRepository;
  entryRepository: DonneeRepository;
};

export const buildEspeceService = ({ speciesRepository, entryRepository, classService }: EspeceServiceDependencies) => {
  const enrichSpecies = async (species: Species, loggedUser: LoggedUser | null): Promise<SpeciesCommon> => {
    // TODO this can be called from import with loggedUser = null and will fail validation
    // Ideally, even import should have a user
    const speciesClass = await classService.findClasseOfEspeceId(species.id, loggedUser);
    return enrichEntityWithEditableStatus({ ...species, speciesClass }, loggedUser);
  };

  const findEspece = async (id: number, loggedUser: LoggedUser | null): Promise<SpeciesCommon | null> => {
    validateAuthorization(loggedUser);

    const species = await speciesRepository.findEspeceById(id);
    if (!species) {
      return null;
    }
    return enrichSpecies(species, loggedUser);
  };

  const getDonneesCountByEspece = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return entryRepository.getCountByEspeceId(parseInt(id));
  };

  const findEspeceOfDonneeId = async (
    donneeId: string | undefined,
    loggedUser: LoggedUser | null
  ): Promise<SpeciesCommon | null> => {
    validateAuthorization(loggedUser);

    const species = await speciesRepository.findEspeceByDonneeId(donneeId ? parseInt(donneeId) : undefined);
    if (!species) {
      return null;
    }
    return enrichSpecies(species, loggedUser);
  };

  const findAllEspeces = async (): Promise<SpeciesCommon[]> => {
    const especes = await speciesRepository.findEspeces({
      orderBy: "code",
    });

    const enrichedSpecies = await Promise.all(
      especes.map((species) => {
        return enrichSpecies(species, null);
      })
    );

    return [...enrichedSpecies];
  };

  const findAllEspecesWithClasses = async (): Promise<EspeceWithClasseLibelle[]> => {
    const especesWithClasses = await speciesRepository.findAllEspecesWithClasseLibelle();
    return [...especesWithClasses];
  };

  const findPaginatedEspeces = async (
    loggedUser: LoggedUser | null,
    options: SpeciesSearchParams
  ): Promise<SpeciesCommon[]> => {
    validateAuthorization(loggedUser);

    const { q, orderBy: orderByField, sortOrder, pageSize, pageNumber, ...searchCriteria } = options;

    const reshapedSearchCriteria = reshapeSearchCriteria(searchCriteria);

    const especes = await speciesRepository.findEspeces({
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
      especes.map((species) => {
        return enrichSpecies(species, loggedUser);
      })
    );

    return [...enrichedSpecies];
  };

  const getEspecesCount = async (loggedUser: LoggedUser | null, options: SpeciesSearchParams): Promise<number> => {
    validateAuthorization(loggedUser);

    const reshapedSearchCriteria = reshapeSearchCriteria(options);

    return speciesRepository.getCount({
      q: options.q,
      searchCriteria: reshapedSearchCriteria,
    });
  };

  const createEspece = async (input: UpsertSpeciesInput, loggedUser: LoggedUser | null): Promise<SpeciesCommon> => {
    validateAuthorization(loggedUser);

    try {
      const createdEspece = await speciesRepository.createEspece({
        ...reshapeInputEspeceUpsertData(input),
        owner_id: loggedUser?.id,
      });

      return enrichSpecies(createdEspece, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const updateEspece = async (
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
      const updatedEspece = await speciesRepository.updateEspece(id, reshapeInputEspeceUpsertData(input));

      return enrichSpecies(updatedEspece, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const deleteEspece = async (id: number, loggedUser: LoggedUser | null): Promise<SpeciesCommon> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await speciesRepository.findEspeceById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    const speciesClass = await classService.findClasseOfEspeceId(`${id}`, loggedUser);

    const deletedSpecies = await speciesRepository.deleteEspeceById(id);
    return enrichEntityWithEditableStatus({ ...deletedSpecies, speciesClass }, loggedUser);
  };

  const createEspeces = async (
    especes: Omit<EspeceCreateInput, "owner_id">[],
    loggedUser: LoggedUser
  ): Promise<readonly SpeciesCommon[]> => {
    const createdSpecies = await speciesRepository.createEspeces(
      especes.map((espece) => {
        return { ...espece, owner_id: loggedUser.id };
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
    findEspece,
    getDonneesCountByEspece,
    findEspeceOfDonneeId,
    findAllEspeces,
    findAllEspecesWithClasses,
    findPaginatedEspeces,
    getEspecesCount,
    createEspece,
    updateEspece,
    deleteEspece,
    createEspeces,
  };
};

export type EspeceService = ReturnType<typeof buildEspeceService>;
