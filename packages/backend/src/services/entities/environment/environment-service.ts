import type { EnvironmentFailureReason } from "@domain/environment/environment.js";
import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { Environment } from "@ou-ca/common/api/entities/environment";
import type { EnvironmentsSearchParams, UpsertEnvironmentInput } from "@ou-ca/common/api/environment";
import { type Result, err, ok } from "neverthrow";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import type { DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import type { MilieuCreateInput } from "../../../repositories/milieu/milieu-repository-types.js";
import type { MilieuRepository } from "../../../repositories/milieu/milieu-repository.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "../entities-utils.js";

type EnvironmentServiceDependencies = {
  environmentRepository: MilieuRepository;
  entryRepository: DonneeRepository;
};

export const buildEnvironmentService = ({ environmentRepository, entryRepository }: EnvironmentServiceDependencies) => {
  const findEnvironment = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Environment | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const environment = await environmentRepository.findMilieuById(id);
    return ok(enrichEntityWithEditableStatus(environment, loggedUser));
  };

  const findEnvironmentIdsOfEntryId = async (entryId: string): Promise<string[]> => {
    const environmentIds = await environmentRepository
      .findMilieuxOfDonneeId(Number.parseInt(entryId))
      .then((environments) => environments.map(({ id }) => id));

    return [...environmentIds];
  };

  const findEnvironmentsOfEntryId = async (
    entryId: string | undefined,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Environment[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const environments = await environmentRepository.findMilieuxOfDonneeId(
      entryId ? Number.parseInt(entryId) : undefined,
    );

    const enrichedEnvironments = environments.map((environment) => {
      return enrichEntityWithEditableStatus(environment, loggedUser);
    });

    return ok([...enrichedEnvironments]);
  };

  const getEntriesCountByEnvironment = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await entryRepository.getCountByMilieuId(Number.parseInt(id)));
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
    options: EnvironmentsSearchParams,
  ): Promise<Result<Environment[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

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

    return ok([...enrichedEnvironments]);
  };

  const getEnvironmentsCount = async (
    loggedUser: LoggedUser | null,
    q?: string | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await environmentRepository.getCount(q));
  };

  const createEnvironment = async (
    input: UpsertEnvironmentInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Environment, EnvironmentFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    try {
      const createdEnvironment = await environmentRepository.createMilieu({
        ...input,
        owner_id: loggedUser.id,
      });

      return ok(enrichEntityWithEditableStatus(createdEnvironment, loggedUser));
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        return err("alreadyExists");
      }
      throw e;
    }
  };

  const updateEnvironment = async (
    id: number,
    input: UpsertEnvironmentInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Environment, EnvironmentFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await environmentRepository.findMilieuById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    try {
      const updatedEnvironment = await environmentRepository.updateMilieu(id, input);

      return ok(enrichEntityWithEditableStatus(updatedEnvironment, loggedUser));
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        return err("alreadyExists");
      }
      throw e;
    }
  };

  const deleteEnvironment = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Environment | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await environmentRepository.findMilieuById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const deletedEnvironment = await environmentRepository.deleteMilieuById(id);
    return ok(enrichEntityWithEditableStatus(deletedEnvironment, loggedUser));
  };

  const createEnvironments = async (
    environments: Omit<MilieuCreateInput[], "owner_id">,
    loggedUser: LoggedUser,
  ): Promise<Environment[]> => {
    const createdEnvironments = await environmentRepository.createMilieux(
      environments.map((environment) => {
        return { ...environment, owner_id: loggedUser.id };
      }),
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
