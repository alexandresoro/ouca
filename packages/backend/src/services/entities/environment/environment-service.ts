import { OucaError } from "@domain/errors/ouca-error.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type Environment } from "@ou-ca/common/api/entities/environment";
import { type EnvironmentsSearchParams, type UpsertEnvironmentInput } from "@ou-ca/common/api/environment";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { validateAuthorization } from "../../../application/services/authorization/authorization-utils.js";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { type MilieuCreateInput } from "../../../repositories/milieu/milieu-repository-types.js";
import { type MilieuRepository } from "../../../repositories/milieu/milieu-repository.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "../entities-utils.js";

type EnvironmentServiceDependencies = {
  environmentRepository: MilieuRepository;
  entryRepository: DonneeRepository;
};

export const buildEnvironmentService = ({ environmentRepository, entryRepository }: EnvironmentServiceDependencies) => {
  const findEnvironment = async (id: number, loggedUser: LoggedUser | null): Promise<Environment | null> => {
    validateAuthorization(loggedUser);

    const environment = await environmentRepository.findMilieuById(id);
    return enrichEntityWithEditableStatus(environment, loggedUser);
  };

  const findEnvironmentIdsOfEntryId = async (donneeId: string): Promise<string[]> => {
    const environmentIds = await environmentRepository
      .findMilieuxOfDonneeId(parseInt(donneeId))
      .then((environments) => environments.map(({ id }) => id));

    return [...environmentIds];
  };

  const findEnvironmentsOfEntryId = async (
    donneeId: string | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Environment[]> => {
    validateAuthorization(loggedUser);

    const environments = await environmentRepository.findMilieuxOfDonneeId(donneeId ? parseInt(donneeId) : undefined);

    const enrichedEnvironments = environments.map((environment) => {
      return enrichEntityWithEditableStatus(environment, loggedUser);
    });

    return [...enrichedEnvironments];
  };

  const getEntriesCountByEnvironment = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return entryRepository.getCountByMilieuId(parseInt(id));
  };

  const findAllEnvironments = async (): Promise<Environment[]> => {
    const environments = await environmentRepository.findMilieux({
      orderBy: "libelle",
    });

    const enrichedEnvironments = environments.map((environment) => {
      return enrichEntityWithEditableStatus(environment, null);
    });

    return [...enrichedEnvironments];
  };

  const findPaginatedEnvironments = async (
    loggedUser: LoggedUser | null,
    options: EnvironmentsSearchParams
  ): Promise<Environment[]> => {
    validateAuthorization(loggedUser);

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const environments = await environmentRepository.findMilieux({
      q,
      ...getSqlPagination(pagination),
      orderBy: orderByField,
      sortOrder,
    });

    const enrichedEnvironments = environments.map((environment) => {
      return enrichEntityWithEditableStatus(environment, loggedUser);
    });

    return [...enrichedEnvironments];
  };

  const getEnvironmentsCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return environmentRepository.getCount(q);
  };

  const createEnvironment = async (
    input: UpsertEnvironmentInput,
    loggedUser: LoggedUser | null
  ): Promise<Environment> => {
    validateAuthorization(loggedUser);

    try {
      const createdEnvironment = await environmentRepository.createMilieu({
        ...input,
        owner_id: loggedUser.id,
      });

      return enrichEntityWithEditableStatus(createdEnvironment, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const updateEnvironment = async (
    id: number,
    input: UpsertEnvironmentInput,
    loggedUser: LoggedUser | null
  ): Promise<Environment> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await environmentRepository.findMilieuById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      const updatedEnvironment = await environmentRepository.updateMilieu(id, input);

      return enrichEntityWithEditableStatus(updatedEnvironment, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const deleteEnvironment = async (id: number, loggedUser: LoggedUser | null): Promise<Environment> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await environmentRepository.findMilieuById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    const deletedEnvironment = await environmentRepository.deleteMilieuById(id);
    return enrichEntityWithEditableStatus(deletedEnvironment, loggedUser);
  };

  const createEnvironments = async (
    environments: Omit<MilieuCreateInput[], "owner_id">,
    loggedUser: LoggedUser
  ): Promise<readonly Environment[]> => {
    const createdEnvironments = await environmentRepository.createMilieux(
      environments.map((environment) => {
        return { ...environment, owner_id: loggedUser.id };
      })
    );

    const enrichedCreatedEnvironments = createdEnvironments.map((environment) => {
      return enrichEntityWithEditableStatus(environment, loggedUser);
    });

    return enrichedCreatedEnvironments;
  };

  return {
    findEnvironment,
    findEnvironmentIdsOfEntryId,
    findEnvironmentsOfEntryId,
    getEntriesCountByEnvironment,
    findAllEnvironments,
    findPaginatedEnvironments,
    getEnvironmentsCount,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    createEnvironments,
  };
};

export type EnvironmentService = ReturnType<typeof buildEnvironmentService>;
