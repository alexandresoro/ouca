import { OucaError } from "@domain/errors/ouca-error.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import {
  type DistanceEstimatesSearchParams,
  type UpsertDistanceEstimateInput,
} from "@ou-ca/common/api/distance-estimate";
import { type DistanceEstimate } from "@ou-ca/common/api/entities/distance-estimate";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { validateAuthorization } from "../../application/services/authorization/authorization-utils.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type EstimationDistanceCreateInput } from "../../repositories/estimation-distance/estimation-distance-repository-types.js";
import { type EstimationDistanceRepository } from "../../repositories/estimation-distance/estimation-distance-repository.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "./entities-utils.js";

type EstimationDistanceServiceDependencies = {
  distanceEstimateRepository: EstimationDistanceRepository;
  entryRepository: DonneeRepository;
};

export const buildEstimationDistanceService = ({
  distanceEstimateRepository,
  entryRepository,
}: EstimationDistanceServiceDependencies) => {
  const findEstimationDistance = async (
    id: number,
    loggedUser: LoggedUser | null
  ): Promise<DistanceEstimate | null> => {
    validateAuthorization(loggedUser);

    const distanceEstimate = await distanceEstimateRepository.findEstimationDistanceById(id);
    return enrichEntityWithEditableStatus(distanceEstimate, loggedUser);
  };

  const findEstimationDistanceOfDonneeId = async (
    donneeId: string | undefined,
    loggedUser: LoggedUser | null
  ): Promise<DistanceEstimate | null> => {
    validateAuthorization(loggedUser);

    const distanceEstimate = await distanceEstimateRepository.findEstimationDistanceByDonneeId(
      donneeId ? parseInt(donneeId) : undefined
    );
    return enrichEntityWithEditableStatus(distanceEstimate, loggedUser);
  };

  const getDonneesCountByEstimationDistance = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return entryRepository.getCountByEstimationDistanceId(parseInt(id));
  };

  const findAllEstimationsDistance = async (): Promise<DistanceEstimate[]> => {
    const estimationDistances = await distanceEstimateRepository.findEstimationsDistance({
      orderBy: "libelle",
    });

    const enrichedDistanceEstimates = estimationDistances.map((age) => {
      return enrichEntityWithEditableStatus(age, null);
    });

    return [...enrichedDistanceEstimates];
  };

  const findPaginatedEstimationsDistance = async (
    loggedUser: LoggedUser | null,
    options: DistanceEstimatesSearchParams
  ): Promise<DistanceEstimate[]> => {
    validateAuthorization(loggedUser);

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const estimationDistances = await distanceEstimateRepository.findEstimationsDistance({
      q,
      ...getSqlPagination(pagination),
      orderBy: orderByField,
      sortOrder,
    });

    const enrichedDistanceEstimates = estimationDistances.map((age) => {
      return enrichEntityWithEditableStatus(age, loggedUser);
    });

    return [...enrichedDistanceEstimates];
  };

  const getEstimationsDistanceCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return distanceEstimateRepository.getCount(q);
  };

  const createEstimationDistance = async (
    input: UpsertDistanceEstimateInput,
    loggedUser: LoggedUser | null
  ): Promise<DistanceEstimate> => {
    validateAuthorization(loggedUser);

    try {
      const createdEstimationDistance = await distanceEstimateRepository.createEstimationDistance({
        ...input,
        owner_id: loggedUser.id,
      });

      return enrichEntityWithEditableStatus(createdEstimationDistance, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const updateEstimationDistance = async (
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
      const updatedEstimationDistance = await distanceEstimateRepository.updateEstimationDistance(id, input);

      return enrichEntityWithEditableStatus(updatedEstimationDistance, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const deleteEstimationDistance = async (id: number, loggedUser: LoggedUser | null): Promise<DistanceEstimate> => {
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

  const createEstimationsDistance = async (
    estimationsDistance: Omit<EstimationDistanceCreateInput[], "owner_id">,
    loggedUser: LoggedUser
  ): Promise<readonly DistanceEstimate[]> => {
    const createdDistanceEstimates = await distanceEstimateRepository.createEstimationsDistance(
      estimationsDistance.map((estimationDistance) => {
        return { ...estimationDistance, owner_id: loggedUser.id };
      })
    );

    const enrichedCreatedDistanceEstimates = createdDistanceEstimates.map((distanceEstimate) => {
      return enrichEntityWithEditableStatus(distanceEstimate, loggedUser);
    });

    return enrichedCreatedDistanceEstimates;
  };

  return {
    findEstimationDistance,
    findEstimationDistanceOfDonneeId,
    getDonneesCountByEstimationDistance,
    findAllEstimationsDistance,
    findPaginatedEstimationsDistance,
    getEstimationsDistanceCount,
    createEstimationDistance,
    updateEstimationDistance,
    deleteEstimationDistance,
    createEstimationsDistance,
  };
};

export type EstimationDistanceService = ReturnType<typeof buildEstimationDistanceService>;
