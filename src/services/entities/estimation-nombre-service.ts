import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import {
  type MutationUpsertEstimationNombreArgs,
  type QueryEstimationsNombreArgs,
} from "../../graphql/generated/graphql-types";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository";
import { type EstimationNombreRepository } from "../../repositories/estimation-nombre/estimation-nombre-repository";
import {
  type EstimationNombre,
  type EstimationNombreCreateInput,
} from "../../repositories/estimation-nombre/estimation-nombre-repository-types";
import { type LoggedUser } from "../../types/User";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { validateAuthorization } from "./authorization-utils";
import { getSqlPagination } from "./entities-utils";
import { reshapeInputEstimationNombreUpsertData } from "./estimation-nombre-service-reshape";

type EstimationNombreServiceDependencies = {
  logger: Logger;
  estimationNombreRepository: EstimationNombreRepository;
  donneeRepository: DonneeRepository;
};

export const buildEstimationNombreService = ({
  estimationNombreRepository,
  donneeRepository,
}: EstimationNombreServiceDependencies) => {
  const findEstimationNombre = async (id: number, loggedUser: LoggedUser | null): Promise<EstimationNombre | null> => {
    validateAuthorization(loggedUser);

    return estimationNombreRepository.findEstimationNombreById(id);
  };

  const findEstimationNombreOfDonneeId = async (
    donneeId: number | undefined,
    loggedUser: LoggedUser | null
  ): Promise<EstimationNombre | null> => {
    validateAuthorization(loggedUser);

    return estimationNombreRepository.findEstimationNombreByDonneeId(donneeId);
  };

  const getDonneesCountByEstimationNombre = async (id: number, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return donneeRepository.getCountByEstimationNombreId(id);
  };

  const findAllEstimationsNombre = async (): Promise<EstimationNombre[]> => {
    const estimationNombres = await estimationNombreRepository.findEstimationsNombre({
      orderBy: COLUMN_LIBELLE,
    });

    return [...estimationNombres];
  };

  const findPaginatedEstimationsNombre = async (
    loggedUser: LoggedUser | null,
    options: QueryEstimationsNombreArgs = {}
  ): Promise<EstimationNombre[]> => {
    validateAuthorization(loggedUser);

    const { searchParams, orderBy: orderByField, sortOrder } = options;

    const estimationNombres = await estimationNombreRepository.findEstimationsNombre({
      q: searchParams?.q,
      ...getSqlPagination(searchParams),
      orderBy: orderByField === "nonCompte" ? "non_compte" : orderByField,
      sortOrder,
    });

    return [...estimationNombres];
  };

  const getEstimationsNombreCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return estimationNombreRepository.getCount(q);
  };

  const upsertEstimationNombre = async (
    args: MutationUpsertEstimationNombreArgs,
    loggedUser: LoggedUser | null
  ): Promise<EstimationNombre> => {
    validateAuthorization(loggedUser);

    const { id, data } = args;

    let upsertedEstimationNombre: EstimationNombre;

    if (id) {
      // Check that the user is allowed to modify the existing data
      if (loggedUser?.role !== "admin") {
        const existingData = await estimationNombreRepository.findEstimationNombreById(id);

        if (existingData?.ownerId !== loggedUser?.id) {
          throw new OucaError("OUCA0001");
        }
      }

      try {
        upsertedEstimationNombre = await estimationNombreRepository.updateEstimationNombre(
          id,
          reshapeInputEstimationNombreUpsertData(data)
        );
      } catch (e) {
        if (e instanceof UniqueIntegrityConstraintViolationError) {
          throw new OucaError("OUCA0004", e);
        }
        throw e;
      }
    } else {
      try {
        upsertedEstimationNombre = await estimationNombreRepository.createEstimationNombre({
          ...reshapeInputEstimationNombreUpsertData(data),
          owner_id: loggedUser.id,
        });
      } catch (e) {
        if (e instanceof UniqueIntegrityConstraintViolationError) {
          throw new OucaError("OUCA0004", e);
        }
        throw e;
      }
    }

    return upsertedEstimationNombre;
  };

  const deleteEstimationNombre = async (id: number, loggedUser: LoggedUser | null): Promise<EstimationNombre> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await estimationNombreRepository.findEstimationNombreById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    return estimationNombreRepository.deleteEstimationNombreById(id);
  };

  const createEstimationsNombre = async (
    estimationsNombre: Omit<EstimationNombreCreateInput[], "owner_id">,
    loggedUser: LoggedUser
  ): Promise<readonly EstimationNombre[]> => {
    return estimationNombreRepository.createEstimationsNombre(
      estimationsNombre.map((estimationNombre) => {
        return { ...estimationNombre, owner_id: loggedUser.id };
      })
    );
  };

  return {
    findEstimationNombre,
    findEstimationNombreOfDonneeId,
    getDonneesCountByEstimationNombre,
    findAllEstimationsNombre,
    findPaginatedEstimationsNombre,
    getEstimationsNombreCount,
    upsertEstimationNombre,
    deleteEstimationNombre,
    createEstimationsNombre,
  };
};

export type EstimationNombreService = ReturnType<typeof buildEstimationNombreService>;
