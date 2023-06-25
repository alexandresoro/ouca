import { type UpsertSpeciesInput } from "@ou-ca/common/api/species";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type QueryEspecesArgs, type SearchDonneeCriteria } from "../../graphql/generated/graphql-types.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import {
  type Espece,
  type EspeceCreateInput,
  type EspeceWithClasseLibelle,
} from "../../repositories/espece/espece-repository-types.js";
import { type EspeceRepository } from "../../repositories/espece/espece-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { COLUMN_CODE } from "../../utils/constants.js";
import { OucaError } from "../../utils/errors.js";
import { validateAuthorization } from "./authorization-utils.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "./entities-utils.js";
import { reshapeInputEspeceUpsertData } from "./espece-service-reshape.js";

type EspeceServiceDependencies = {
  logger: Logger;
  especeRepository: EspeceRepository;
  donneeRepository: DonneeRepository;
};

export const buildEspeceService = ({ especeRepository, donneeRepository }: EspeceServiceDependencies) => {
  const findEspece = async (id: number, loggedUser: LoggedUser | null): Promise<Espece | null> => {
    validateAuthorization(loggedUser);

    const species = await especeRepository.findEspeceById(id);
    return enrichEntityWithEditableStatus(species, loggedUser);
  };

  const getDonneesCountByEspece = async (id: number, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return donneeRepository.getCountByEspeceId(id);
  };

  const findEspeceOfDonneeId = async (
    donneeId: number | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Espece | null> => {
    validateAuthorization(loggedUser);

    const species = await especeRepository.findEspeceByDonneeId(donneeId);
    return enrichEntityWithEditableStatus(species, loggedUser);
  };

  const findAllEspeces = async (): Promise<Espece[]> => {
    const especes = await especeRepository.findEspeces({
      orderBy: COLUMN_CODE,
    });

    const enrichedSpecies = especes.map((species) => {
      return enrichEntityWithEditableStatus(species, null);
    });

    return [...enrichedSpecies];
  };

  const findAllEspecesWithClasses = async (): Promise<EspeceWithClasseLibelle[]> => {
    const especesWithClasses = await especeRepository.findAllEspecesWithClasseLibelle();
    return [...especesWithClasses];
  };

  const findPaginatedEspeces = async (
    loggedUser: LoggedUser | null,
    options: QueryEspecesArgs = {}
  ): Promise<Espece[]> => {
    validateAuthorization(loggedUser);

    const { searchParams, searchCriteria, orderBy: orderByField, sortOrder } = options;

    const especes = await especeRepository.findEspeces({
      q: searchParams?.q,
      searchCriteria: searchCriteria && Object.keys(searchCriteria).length ? searchCriteria : undefined,
      ...getSqlPagination(searchParams),
      orderBy: orderByField,
      sortOrder,
    });

    const enrichedSpecies = especes.map((species) => {
      return enrichEntityWithEditableStatus(species, loggedUser);
    });

    return [...enrichedSpecies];
  };

  const getEspecesCount = async (
    loggedUser: LoggedUser | null,
    {
      q,
      searchCriteria,
    }: {
      q?: string | null;
      searchCriteria?: SearchDonneeCriteria | null;
    } = {}
  ): Promise<number> => {
    validateAuthorization(loggedUser);

    return especeRepository.getCount({
      q,
      searchCriteria: searchCriteria && Object.keys(searchCriteria).length ? searchCriteria : undefined,
    });
  };

  const createEspece = async (input: UpsertSpeciesInput, loggedUser: LoggedUser | null): Promise<Espece> => {
    validateAuthorization(loggedUser);

    try {
      const createdEspece = await especeRepository.createEspece({
        ...reshapeInputEspeceUpsertData(input),
        owner_id: loggedUser?.id,
      });

      return enrichEntityWithEditableStatus(createdEspece, loggedUser);
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
  ): Promise<Espece> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await especeRepository.findEspeceById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      const updatedEspece = await especeRepository.updateEspece(id, reshapeInputEspeceUpsertData(input));

      return enrichEntityWithEditableStatus(updatedEspece, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const deleteEspece = async (id: number, loggedUser: LoggedUser | null): Promise<Espece> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await especeRepository.findEspeceById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    const deletedSpecies = await especeRepository.deleteEspeceById(id);
    return enrichEntityWithEditableStatus(deletedSpecies, loggedUser);
  };

  const createEspeces = async (
    especes: Omit<EspeceCreateInput, "owner_id">[],
    loggedUser: LoggedUser
  ): Promise<readonly Espece[]> => {
    const createdSpecies = await especeRepository.createEspeces(
      especes.map((espece) => {
        return { ...espece, owner_id: loggedUser.id };
      })
    );

    const enrichedCreatedSpecies = createdSpecies.map((species) => {
      return enrichEntityWithEditableStatus(species, loggedUser);
    });

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
