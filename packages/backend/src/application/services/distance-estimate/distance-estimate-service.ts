import type { DistanceEstimateFailureReason } from "@domain/distance-estimate/distance-estimate.js";
import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { DistanceEstimateRepository } from "@interfaces/distance-estimate-repository-interface.js";
import type { DistanceEstimatesSearchParams, UpsertDistanceEstimateInput } from "@ou-ca/common/api/distance-estimate";
import type { DistanceEstimate } from "@ou-ca/common/api/entities/distance-estimate";
import { type Result, err, ok } from "neverthrow";
import { enrichEntityWithEditableStatus, getSqlPagination } from "../entities-utils.js";

type DistanceEstimateServiceDependencies = {
  distanceEstimateRepository: DistanceEstimateRepository;
};

export const buildDistanceEstimateService = ({ distanceEstimateRepository }: DistanceEstimateServiceDependencies) => {
  const findDistanceEstimate = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<DistanceEstimate | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const distanceEstimate = await distanceEstimateRepository.findDistanceEstimateById(id);
    return ok(enrichEntityWithEditableStatus(distanceEstimate, loggedUser));
  };

  const findDistanceEstimateOfEntryId = async (
    entryId: string | undefined,
    loggedUser: LoggedUser | null,
  ): Promise<Result<DistanceEstimate | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const distanceEstimate = await distanceEstimateRepository.findDistanceEstimateByEntryId(
      entryId ? Number.parseInt(entryId) : undefined,
    );
    return ok(enrichEntityWithEditableStatus(distanceEstimate, loggedUser));
  };

  const getEntriesCountByDistanceEstimate = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await distanceEstimateRepository.getEntriesCountById(id));
  };

  const findAllDistanceEstimates = async (): Promise<DistanceEstimate[]> => {
    const distanceEstimates = await distanceEstimateRepository.findDistanceEstimates({
      orderBy: "libelle",
    });

    const enrichedDistanceEstimates = distanceEstimates.map((age) => {
      return enrichEntityWithEditableStatus(age, null);
    });

    return [...enrichedDistanceEstimates];
  };

  const findPaginatedDistanceEstimates = async (
    loggedUser: LoggedUser | null,
    options: DistanceEstimatesSearchParams,
  ): Promise<Result<DistanceEstimate[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const distanceEstimates = await distanceEstimateRepository.findDistanceEstimates({
      q,
      ...getSqlPagination(pagination),
      orderBy: orderByField,
      sortOrder,
    });

    const enrichedDistanceEstimates = distanceEstimates.map((age) => {
      return enrichEntityWithEditableStatus(age, loggedUser);
    });

    return ok([...enrichedDistanceEstimates]);
  };

  const getDistanceEstimatesCount = async (
    loggedUser: LoggedUser | null,
    q?: string | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await distanceEstimateRepository.getCount(q));
  };

  const createDistanceEstimate = async (
    input: UpsertDistanceEstimateInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<DistanceEstimate, DistanceEstimateFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const createdDistanceEstimateResult = await distanceEstimateRepository.createDistanceEstimate({
      ...input,
      ownerId: loggedUser.id,
    });

    return createdDistanceEstimateResult.map((createdDistanceEstimate) => {
      return enrichEntityWithEditableStatus(createdDistanceEstimate, loggedUser);
    });
  };

  const updateDistanceEstimate = async (
    id: number,
    input: UpsertDistanceEstimateInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<DistanceEstimate, DistanceEstimateFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await distanceEstimateRepository.findDistanceEstimateById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const updateDistanceEstimateResult = await distanceEstimateRepository.updateDistanceEstimate(id, input);

    return updateDistanceEstimateResult.map((updateDistanceEstimate) => {
      return enrichEntityWithEditableStatus(updateDistanceEstimate, loggedUser);
    });
  };

  const deleteDistanceEstimate = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<DistanceEstimate | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await distanceEstimateRepository.findDistanceEstimateById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const deletedDistanceEstimate = await distanceEstimateRepository.deleteDistanceEstimateById(id);
    return ok(enrichEntityWithEditableStatus(deletedDistanceEstimate, loggedUser));
  };

  const createDistanceEstimates = async (
    distanceEstimates: UpsertDistanceEstimateInput[],
    loggedUser: LoggedUser,
  ): Promise<readonly DistanceEstimate[]> => {
    const createdDistanceEstimates = await distanceEstimateRepository.createDistanceEstimates(
      distanceEstimates.map((distanceEstimate) => {
        return { ...distanceEstimate, ownerId: loggedUser.id };
      }),
    );

    const enrichedCreatedDistanceEstimates = createdDistanceEstimates.map((distanceEstimate) => {
      return enrichEntityWithEditableStatus(distanceEstimate, loggedUser);
    });

    return enrichedCreatedDistanceEstimates;
  };

  return {
    findDistanceEstimate,
    findDistanceEstimateOfEntryId,
    getEntriesCountByDistanceEstimate,
    findAllDistanceEstimates,
    findPaginatedDistanceEstimates,
    getDistanceEstimatesCount,
    createDistanceEstimate,
    updateDistanceEstimate,
    deleteDistanceEstimate,
    createDistanceEstimates,
  };
};

export type DistanceEstimateService = ReturnType<typeof buildDistanceEstimateService>;
