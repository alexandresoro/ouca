import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import {
  type MutationUpsertEstimationDistanceArgs,
  type QueryEstimationsDistanceArgs,
} from "../../graphql/generated/graphql-types";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository";
import { type EstimationDistanceRepository } from "../../repositories/estimation-distance/estimation-distance-repository";
import {
  type EstimationDistance,
  type EstimationDistanceCreateInput,
} from "../../repositories/estimation-distance/estimation-distance-repository-types";
import { type LoggedUser } from "../../types/User";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { validateAuthorization } from "./authorization-utils";
import { getSqlPagination } from "./entities-utils";

type EstimationDistanceServiceDependencies = {
  logger: Logger;
  estimationDistanceRepository: EstimationDistanceRepository;
  donneeRepository: DonneeRepository;
};

export const buildEstimationDistanceService = ({
  estimationDistanceRepository,
  donneeRepository,
}: EstimationDistanceServiceDependencies) => {
  const findEstimationDistance = async (
    id: number,
    loggedUser: LoggedUser | null
  ): Promise<EstimationDistance | null> => {
    validateAuthorization(loggedUser);

    return estimationDistanceRepository.findEstimationDistanceById(id);
  };

  const getDonneesCountByEstimationDistance = async (id: number, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return donneeRepository.getCountByEstimationDistanceId(id);
  };

  const findAllEstimationsDistance = async (): Promise<EstimationDistance[]> => {
    const estimationDistances = await estimationDistanceRepository.findEstimationsDistance({
      orderBy: COLUMN_LIBELLE,
    });

    return [...estimationDistances];
  };

  const findPaginatedEstimationsDistance = async (
    loggedUser: LoggedUser | null,
    options: QueryEstimationsDistanceArgs = {}
  ): Promise<EstimationDistance[]> => {
    validateAuthorization(loggedUser);

    const { searchParams, orderBy: orderByField, sortOrder } = options;

    const estimationDistances = await estimationDistanceRepository.findEstimationsDistance({
      q: searchParams?.q,
      ...getSqlPagination(searchParams),
      orderBy: orderByField,
      sortOrder,
    });

    return [...estimationDistances];
  };

  const getEstimationsDistanceCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return estimationDistanceRepository.getCount(q);
  };

  const upsertEstimationDistance = async (
    args: MutationUpsertEstimationDistanceArgs,
    loggedUser: LoggedUser | null
  ): Promise<EstimationDistance> => {
    validateAuthorization(loggedUser);

    const { id, data } = args;

    let upsertedEstimationDistance: EstimationDistance;

    if (id) {
      // Check that the user is allowed to modify the existing data
      if (loggedUser?.role !== "admin") {
        const existingData = await estimationDistanceRepository.findEstimationDistanceById(id);

        if (existingData?.ownerId !== loggedUser?.id) {
          throw new OucaError("OUCA0001");
        }
      }

      try {
        upsertedEstimationDistance = await estimationDistanceRepository.updateEstimationDistance(id, data);
      } catch (e) {
        if (e instanceof UniqueIntegrityConstraintViolationError) {
          throw new OucaError("OUCA0004", e);
        }
        throw e;
      }
    } else {
      try {
        upsertedEstimationDistance = await estimationDistanceRepository.createEstimationDistance({
          ...data,
          owner_id: loggedUser.id,
        });
      } catch (e) {
        if (e instanceof UniqueIntegrityConstraintViolationError) {
          throw new OucaError("OUCA0004", e);
        }
        throw e;
      }
    }

    return upsertedEstimationDistance;
  };

  const deleteEstimationDistance = async (id: number, loggedUser: LoggedUser | null): Promise<EstimationDistance> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await estimationDistanceRepository.findEstimationDistanceById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    return estimationDistanceRepository.deleteEstimationDistanceById(id);
  };

  const createEstimationsDistance = async (
    estimationsDistance: Omit<EstimationDistanceCreateInput[], "owner_id">,
    loggedUser: LoggedUser
  ): Promise<readonly EstimationDistance[]> => {
    return estimationDistanceRepository.createEstimationsDistance(
      estimationsDistance.map((estimationDistance) => {
        return { ...estimationDistance, owner_id: loggedUser.id };
      })
    );
  };

  return {
    findEstimationDistance,
    getDonneesCountByEstimationDistance,
    findAllEstimationsDistance,
    findPaginatedEstimationsDistance,
    getEstimationsDistanceCount,
    upsertEstimationDistance,
    deleteEstimationDistance,
    createEstimationsDistance,
  };
};

export type EstimationDistanceService = ReturnType<typeof buildEstimationDistanceService>;
