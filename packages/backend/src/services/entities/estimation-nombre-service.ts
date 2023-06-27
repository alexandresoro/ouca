import { type NumberEstimatesSearchParams, type UpsertNumberEstimateInput } from "@ou-ca/common/api/number-estimate";
import { type NumberEstimate } from "@ou-ca/common/entities/number-estimate";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type EstimationNombreCreateInput } from "../../repositories/estimation-nombre/estimation-nombre-repository-types.js";
import { type EstimationNombreRepository } from "../../repositories/estimation-nombre/estimation-nombre-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { COLUMN_LIBELLE } from "../../utils/constants.js";
import { OucaError } from "../../utils/errors.js";
import { validateAuthorization } from "./authorization-utils.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "./entities-utils.js";
import { reshapeInputEstimationNombreUpsertData } from "./estimation-nombre-service-reshape.js";

type EstimationNombreServiceDependencies = {
  logger: Logger;
  estimationNombreRepository: EstimationNombreRepository;
  donneeRepository: DonneeRepository;
};

export const buildEstimationNombreService = ({
  estimationNombreRepository,
  donneeRepository,
}: EstimationNombreServiceDependencies) => {
  const findEstimationNombre = async (id: number, loggedUser: LoggedUser | null): Promise<NumberEstimate | null> => {
    validateAuthorization(loggedUser);

    const numberEstimate = await estimationNombreRepository.findEstimationNombreById(id);
    return enrichEntityWithEditableStatus(numberEstimate, loggedUser);
  };

  const findEstimationNombreOfDonneeId = async (
    donneeId: string | undefined,
    loggedUser: LoggedUser | null
  ): Promise<NumberEstimate | null> => {
    validateAuthorization(loggedUser);

    const numberEstimate = await estimationNombreRepository.findEstimationNombreByDonneeId(
      donneeId ? parseInt(donneeId) : undefined
    );
    return enrichEntityWithEditableStatus(numberEstimate, loggedUser);
  };

  const getDonneesCountByEstimationNombre = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return donneeRepository.getCountByEstimationNombreId(parseInt(id));
  };

  const findAllEstimationsNombre = async (): Promise<NumberEstimate[]> => {
    const estimationNombres = await estimationNombreRepository.findEstimationsNombre({
      orderBy: COLUMN_LIBELLE,
    });

    const enrichedNumberEstimates = estimationNombres.map((numberEstimate) => {
      return enrichEntityWithEditableStatus(numberEstimate, null);
    });

    return [...enrichedNumberEstimates];
  };

  const findPaginatedEstimationsNombre = async (
    loggedUser: LoggedUser | null,
    options: NumberEstimatesSearchParams
  ): Promise<NumberEstimate[]> => {
    validateAuthorization(loggedUser);

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const estimationNombres = await estimationNombreRepository.findEstimationsNombre({
      q: q,
      ...getSqlPagination(pagination),
      orderBy: orderByField === "nonCompte" ? "non_compte" : orderByField,
      sortOrder,
    });

    const enrichedNumberEstimates = estimationNombres.map((numberEstimate) => {
      return enrichEntityWithEditableStatus(numberEstimate, loggedUser);
    });

    return [...enrichedNumberEstimates];
  };

  const getEstimationsNombreCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return estimationNombreRepository.getCount(q);
  };

  const createEstimationNombre = async (
    input: UpsertNumberEstimateInput,
    loggedUser: LoggedUser | null
  ): Promise<NumberEstimate> => {
    validateAuthorization(loggedUser);

    try {
      const createdEstimationNombre = await estimationNombreRepository.createEstimationNombre({
        ...reshapeInputEstimationNombreUpsertData(input),
        owner_id: loggedUser.id,
      });

      return enrichEntityWithEditableStatus(createdEstimationNombre, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const updateEstimationNombre = async (
    id: number,
    input: UpsertNumberEstimateInput,
    loggedUser: LoggedUser | null
  ): Promise<NumberEstimate> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await estimationNombreRepository.findEstimationNombreById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      const updatedEstimationNombre = await estimationNombreRepository.updateEstimationNombre(
        id,
        reshapeInputEstimationNombreUpsertData(input)
      );

      return enrichEntityWithEditableStatus(updatedEstimationNombre, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const deleteEstimationNombre = async (id: number, loggedUser: LoggedUser | null): Promise<NumberEstimate> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await estimationNombreRepository.findEstimationNombreById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    const deletedNumberEstimate = await estimationNombreRepository.deleteEstimationNombreById(id);
    return enrichEntityWithEditableStatus(deletedNumberEstimate, loggedUser);
  };

  const createEstimationsNombre = async (
    estimationsNombre: Omit<EstimationNombreCreateInput[], "owner_id">,
    loggedUser: LoggedUser
  ): Promise<readonly NumberEstimate[]> => {
    const createdNumberEstimates = await estimationNombreRepository.createEstimationsNombre(
      estimationsNombre.map((estimationNombre) => {
        return { ...estimationNombre, owner_id: loggedUser.id };
      })
    );

    const enrichedCreatedNumberEstimates = createdNumberEstimates.map((numberEstimate) => {
      return enrichEntityWithEditableStatus(numberEstimate, loggedUser);
    });

    return enrichedCreatedNumberEstimates;
  };

  return {
    findEstimationNombre,
    findEstimationNombreOfDonneeId,
    getDonneesCountByEstimationNombre,
    findAllEstimationsNombre,
    findPaginatedEstimationsNombre,
    getEstimationsNombreCount,
    createEstimationNombre,
    updateEstimationNombre,
    deleteEstimationNombre,
    createEstimationsNombre,
  };
};

export type EstimationNombreService = ReturnType<typeof buildEstimationNombreService>;
