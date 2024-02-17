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
  const findMilieu = async (id: number, loggedUser: LoggedUser | null): Promise<Environment | null> => {
    validateAuthorization(loggedUser);

    const environment = await environmentRepository.findMilieuById(id);
    return enrichEntityWithEditableStatus(environment, loggedUser);
  };

  const findMilieuxIdsOfDonneeId = async (donneeId: string): Promise<string[]> => {
    const milieuxIds = await environmentRepository
      .findMilieuxOfDonneeId(parseInt(donneeId))
      .then((milieux) => milieux.map(({ id }) => id));

    return [...milieuxIds];
  };

  const findMilieuxOfDonneeId = async (
    donneeId: string | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Environment[]> => {
    validateAuthorization(loggedUser);

    const milieux = await environmentRepository.findMilieuxOfDonneeId(donneeId ? parseInt(donneeId) : undefined);

    const enrichedEnvironments = milieux.map((environment) => {
      return enrichEntityWithEditableStatus(environment, loggedUser);
    });

    return [...enrichedEnvironments];
  };

  const getDonneesCountByMilieu = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return entryRepository.getCountByMilieuId(parseInt(id));
  };

  const findAllMilieux = async (): Promise<Environment[]> => {
    const milieux = await environmentRepository.findMilieux({
      orderBy: "libelle",
    });

    const enrichedEnvironments = milieux.map((environment) => {
      return enrichEntityWithEditableStatus(environment, null);
    });

    return [...enrichedEnvironments];
  };

  const findPaginatedMilieux = async (
    loggedUser: LoggedUser | null,
    options: EnvironmentsSearchParams
  ): Promise<Environment[]> => {
    validateAuthorization(loggedUser);

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const milieux = await environmentRepository.findMilieux({
      q,
      ...getSqlPagination(pagination),
      orderBy: orderByField,
      sortOrder,
    });

    const enrichedEnvironments = milieux.map((environment) => {
      return enrichEntityWithEditableStatus(environment, loggedUser);
    });

    return [...enrichedEnvironments];
  };

  const getMilieuxCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return environmentRepository.getCount(q);
  };

  const createMilieu = async (input: UpsertEnvironmentInput, loggedUser: LoggedUser | null): Promise<Environment> => {
    validateAuthorization(loggedUser);

    try {
      const createdMilieu = await environmentRepository.createMilieu({
        ...input,
        owner_id: loggedUser.id,
      });

      return enrichEntityWithEditableStatus(createdMilieu, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const updateMilieu = async (
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
      const updatedMilieu = await environmentRepository.updateMilieu(id, input);

      return enrichEntityWithEditableStatus(updatedMilieu, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const deleteMilieu = async (id: number, loggedUser: LoggedUser | null): Promise<Environment> => {
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

  const createMilieux = async (
    milieux: Omit<MilieuCreateInput[], "owner_id">,
    loggedUser: LoggedUser
  ): Promise<readonly Environment[]> => {
    const createdEnvironments = await environmentRepository.createMilieux(
      milieux.map((milieu) => {
        return { ...milieu, owner_id: loggedUser.id };
      })
    );

    const enrichedCreatedEnvironments = createdEnvironments.map((environment) => {
      return enrichEntityWithEditableStatus(environment, loggedUser);
    });

    return enrichedCreatedEnvironments;
  };

  return {
    findMilieu,
    findMilieuxIdsOfDonneeId,
    findMilieuxOfDonneeId,
    getDonneesCountByMilieu,
    findAllMilieux,
    findPaginatedMilieux,
    getMilieuxCount,
    createMilieu,
    updateMilieu,
    deleteMilieu,
    createMilieux,
  };
};

export type EnvironmentService = ReturnType<typeof buildEnvironmentService>;
