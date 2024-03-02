import { type DistanceEstimateFailureReason } from "@domain/distance-estimate/distance-estimate.js";
import { type AccessFailureReason } from "@domain/shared/failure-reason.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import {
  type DistanceEstimatesSearchParams,
  type UpsertDistanceEstimateInput,
} from "@ou-ca/common/api/distance-estimate";
import { type DistanceEstimate } from "@ou-ca/common/api/entities/distance-estimate";
import { err, ok, type Result } from "neverthrow";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { type EstimationDistanceCreateInput } from "../../../repositories/estimation-distance/estimation-distance-repository-types.js";
import { type EstimationDistanceRepository } from "../../../repositories/estimation-distance/estimation-distance-repository.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "../entities-utils.js";

type DistanceEstimateServiceDependencies = {
  distanceEstimateRepository: EstimationDistanceRepository;
  entryRepository: DonneeRepository;
};

export const buildDistanceEstimateService = ({
  distanceEstimateRepository,
  entryRepository,
}: DistanceEstimateServiceDependencies) => {
  const findDistanceEstimate = async (
    id: number,
    loggedUser: LoggedUser | null
  ): Promise<Result<DistanceEstimate | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const distanceEstimate = await distanceEstimateRepository.findEstimationDistanceById(id);
    return ok(enrichEntityWithEditableStatus(distanceEstimate, loggedUser));
  };

  const findDistanceEstimateOfEntryId = async (
    entryId: string | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Result<DistanceEstimate | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const distanceEstimate = await distanceEstimateRepository.findEstimationDistanceByDonneeId(
      entryId ? parseInt(entryId) : undefined
    );
    return ok(enrichEntityWithEditableStatus(distanceEstimate, loggedUser));
  };

  const getEntriesCountByDistanceEstimate = async (
    id: string,
    loggedUser: LoggedUser | null
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await entryRepository.getCountByEstimationDistanceId(parseInt(id)));
  };

  const findAllDistanceEstimates = async (): Promise<DistanceEstimate[]> => {
    const distanceEstimates = await distanceEstimateRepository.findEstimationsDistance({
      orderBy: "libelle",
    });

    const enrichedDistanceEstimates = distanceEstimates.map((age) => {
      return enrichEntityWithEditableStatus(age, null);
    });

    return [...enrichedDistanceEstimates];
  };

  const findPaginatedDistanceEstimates = async (
    loggedUser: LoggedUser | null,
    options: DistanceEstimatesSearchParams
  ): Promise<Result<DistanceEstimate[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const distanceEstimates = await distanceEstimateRepository.findEstimationsDistance({
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
    q?: string | null
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await distanceEstimateRepository.getCount(q));
  };

  const createDistanceEstimate = async (
    input: UpsertDistanceEstimateInput,
    loggedUser: LoggedUser | null
  ): Promise<Result<DistanceEstimate, DistanceEstimateFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    try {
      const createdDistanceEstimate = await distanceEstimateRepository.createEstimationDistance({
        ...input,
        owner_id: loggedUser.id,
      });

      return ok(enrichEntityWithEditableStatus(createdDistanceEstimate, loggedUser));
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        return err("alreadyExists");
      }
      throw e;
    }
  };

  const updateDistanceEstimate = async (
    id: number,
    input: UpsertDistanceEstimateInput,
    loggedUser: LoggedUser | null
  ): Promise<Result<DistanceEstimate, DistanceEstimateFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await distanceEstimateRepository.findEstimationDistanceById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    try {
      const updateDistanceEstimate = await distanceEstimateRepository.updateEstimationDistance(id, input);

      return ok(enrichEntityWithEditableStatus(updateDistanceEstimate, loggedUser));
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        return err("alreadyExists");
      }
      throw e;
    }
  };

  const deleteDistanceEstimate = async (
    id: number,
    loggedUser: LoggedUser | null
  ): Promise<Result<DistanceEstimate | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await distanceEstimateRepository.findEstimationDistanceById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const deletedDistanceEstimate = await distanceEstimateRepository.deleteEstimationDistanceById(id);
    return ok(enrichEntityWithEditableStatus(deletedDistanceEstimate, loggedUser));
  };

  const createDistanceEstimates = async (
    distanceEstimates: Omit<EstimationDistanceCreateInput[], "owner_id">,
    loggedUser: LoggedUser
  ): Promise<readonly DistanceEstimate[]> => {
    const createdDistanceEstimates = await distanceEstimateRepository.createEstimationsDistance(
      distanceEstimates.map((distanceEstimate) => {
        return { ...distanceEstimate, owner_id: loggedUser.id };
      })
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
