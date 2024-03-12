import type { EnvironmentCreateInput, EnvironmentFailureReason } from "@domain/environment/environment.js";
import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { EnvironmentRepository } from "@interfaces/environment-repository-interface.js";
import type { Environment } from "@ou-ca/common/api/entities/environment";
import type { EnvironmentsSearchParams, UpsertEnvironmentInput } from "@ou-ca/common/api/environment";
import { type Result, err, ok } from "neverthrow";
import type { DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "../../../services/entities/entities-utils.js";

type EnvironmentServiceDependencies = {
  environmentRepository: EnvironmentRepository;
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

    const environment = await environmentRepository.findEnvironmentById(id);
    return ok(enrichEntityWithEditableStatus(environment, loggedUser));
  };

  const findEnvironmentIdsOfEntryId = async (entryId: string): Promise<string[]> => {
    const environmentIds = await environmentRepository
      .findEnvironmentsByEntryId(entryId)
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

    const environments = await environmentRepository.findEnvironmentsByEntryId(entryId);

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
    const environments = await environmentRepository.findEnvironments({
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

    const environments = await environmentRepository.findEnvironments({
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

    const createdEnvironmentResult = await environmentRepository.createEnvironment({
      ...input,
      ownerId: loggedUser.id,
    });

    return createdEnvironmentResult.map((createdEnvironment) => {
      return enrichEntityWithEditableStatus(createdEnvironment, loggedUser);
    });
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
      const existingData = await environmentRepository.findEnvironmentById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const updatedEnvironmentResult = await environmentRepository.updateEnvironment(id, input);

    return updatedEnvironmentResult.map((updatedEnvironment) => {
      return enrichEntityWithEditableStatus(updatedEnvironment, loggedUser);
    });
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
      const existingData = await environmentRepository.findEnvironmentById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const deletedEnvironment = await environmentRepository.deleteEnvironmentById(id);
    return ok(enrichEntityWithEditableStatus(deletedEnvironment, loggedUser));
  };

  const createEnvironments = async (
    environments: Omit<EnvironmentCreateInput[], "ownerId">,
    loggedUser: LoggedUser,
  ): Promise<Environment[]> => {
    const createdEnvironments = await environmentRepository.createEnvironments(
      environments.map((environment) => {
        return { ...environment, ownerId: loggedUser.id };
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
