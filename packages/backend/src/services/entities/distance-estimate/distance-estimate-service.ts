import { OucaError } from "@domain/errors/ouca-error.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import {
  type DistanceEstimatesSearchParams,
  type UpsertDistanceEstimateInput,
} from "@ou-ca/common/api/distance-estimate";
import { type DistanceEstimate } from "@ou-ca/common/api/entities/distance-estimate";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { validateAuthorization } from "../../../application/services/authorization/authorization-utils.js";
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
  const findDistanceEstimate = async (id: number, loggedUser: LoggedUser | null): Promise<DistanceEstimate | null> => {
    validateAuthorization(loggedUser);

    const distanceEstimate = await distanceEstimateRepository.findEstimationDistanceById(id);
    return enrichEntityWithEditableStatus(distanceEstimate, loggedUser);
  };

  const findDistanceEstimateOfEntryId = async (
    entryId: string | undefined,
    loggedUser: LoggedUser | null
  ): Promise<DistanceEstimate | null> => {
    validateAuthorization(loggedUser);

    const distanceEstimate = await distanceEstimateRepository.findEstimationDistanceByDonneeId(
      entryId ? parseInt(entryId) : undefined
    );
    return enrichEntityWithEditableStatus(distanceEstimate, loggedUser);
  };

  const getEntriesCountByDistanceEstimate = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return entryRepository.getCountByEstimationDistanceId(parseInt(id));
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
  ): Promise<DistanceEstimate[]> => {
    validateAuthorization(loggedUser);

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

    return [...enrichedDistanceEstimates];
  };

  const getDistanceEstimatesCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return distanceEstimateRepository.getCount(q);
  };

  const createDistanceEstimate = async (
    input: UpsertDistanceEstimateInput,
    loggedUser: LoggedUser | null
  ): Promise<DistanceEstimate> => {
    validateAuthorization(loggedUser);

    try {
      const createdDistanceEstimate = await distanceEstimateRepository.createEstimationDistance({
        ...input,
        owner_id: loggedUser.id,
      });

      return enrichEntityWithEditableStatus(createdDistanceEstimate, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const updateDistanceEstimate = async (
    id: number,
    input: UpsertDistanceEstimateInput,
    loggedUser: LoggedUser | null
  ): Promise<DistanceEstimate> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await distanceEstimateRepository.findEstimationDistanceById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      const updateDistanceEstimate = await distanceEstimateRepository.updateEstimationDistance(id, input);

      return enrichEntityWithEditableStatus(updateDistanceEstimate, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const deleteDistanceEstimate = async (id: number, loggedUser: LoggedUser | null): Promise<DistanceEstimate> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await distanceEstimateRepository.findEstimationDistanceById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    const deletedDistanceEstimate = await distanceEstimateRepository.deleteEstimationDistanceById(id);
    return enrichEntityWithEditableStatus(deletedDistanceEstimate, loggedUser);
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
