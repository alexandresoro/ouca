import { OucaError } from "@domain/errors/ouca-error.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type NumberEstimate } from "@ou-ca/common/api/entities/number-estimate";
import { type NumberEstimatesSearchParams, type UpsertNumberEstimateInput } from "@ou-ca/common/api/number-estimate";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { validateAuthorization } from "../../../application/services/authorization/authorization-utils.js";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { type EstimationNombreCreateInput } from "../../../repositories/estimation-nombre/estimation-nombre-repository-types.js";
import { type EstimationNombreRepository } from "../../../repositories/estimation-nombre/estimation-nombre-repository.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "../entities-utils.js";
import { reshapeInputEstimationNombreUpsertData } from "./number-estimate-service-reshape.js";

type NumberEstimateServiceDependencies = {
  numberEstimateRepository: EstimationNombreRepository;
  entryRepository: DonneeRepository;
};

export const buildNumberEstimateService = ({
  numberEstimateRepository,
  entryRepository,
}: NumberEstimateServiceDependencies) => {
  const findEstimationNombre = async (id: number, loggedUser: LoggedUser | null): Promise<NumberEstimate | null> => {
    validateAuthorization(loggedUser);

    const numberEstimate = await numberEstimateRepository.findEstimationNombreById(id);
    return enrichEntityWithEditableStatus(numberEstimate, loggedUser);
  };

  const findEstimationNombreOfDonneeId = async (
    entryId: string | undefined,
    loggedUser: LoggedUser | null
  ): Promise<NumberEstimate | null> => {
    validateAuthorization(loggedUser);

    const numberEstimate = await numberEstimateRepository.findEstimationNombreByDonneeId(
      entryId ? parseInt(entryId) : undefined
    );
    return enrichEntityWithEditableStatus(numberEstimate, loggedUser);
  };

  const getDonneesCountByEstimationNombre = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return entryRepository.getCountByEstimationNombreId(parseInt(id));
  };

  const findAllEstimationsNombre = async (): Promise<NumberEstimate[]> => {
    const estimationNombres = await numberEstimateRepository.findEstimationsNombre({
      orderBy: "libelle",
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

    const estimationNombres = await numberEstimateRepository.findEstimationsNombre({
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

    return numberEstimateRepository.getCount(q);
  };

  const createEstimationNombre = async (
    input: UpsertNumberEstimateInput,
    loggedUser: LoggedUser | null
  ): Promise<NumberEstimate> => {
    validateAuthorization(loggedUser);

    try {
      const createdEstimationNombre = await numberEstimateRepository.createEstimationNombre({
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
      const existingData = await numberEstimateRepository.findEstimationNombreById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      const updatedEstimationNombre = await numberEstimateRepository.updateEstimationNombre(
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
      const existingData = await numberEstimateRepository.findEstimationNombreById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    const deletedNumberEstimate = await numberEstimateRepository.deleteEstimationNombreById(id);
    return enrichEntityWithEditableStatus(deletedNumberEstimate, loggedUser);
  };

  const createEstimationsNombre = async (
    estimationsNombre: Omit<EstimationNombreCreateInput[], "owner_id">,
    loggedUser: LoggedUser
  ): Promise<readonly NumberEstimate[]> => {
    const createdNumberEstimates = await numberEstimateRepository.createEstimationsNombre(
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

export type NumberEstimateService = ReturnType<typeof buildNumberEstimateService>;
