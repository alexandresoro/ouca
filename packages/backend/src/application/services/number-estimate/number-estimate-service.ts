import type { NumberEstimateFailureReason } from "@domain/number-estimate/number-estimate.js";
import type { AccessFailureReason, DeletionFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { NumberEstimateRepository } from "@interfaces/number-estimate-repository-interface.js";
import type { NumberEstimate } from "@ou-ca/common/api/entities/number-estimate";
import type { NumberEstimatesSearchParams, UpsertNumberEstimateInput } from "@ou-ca/common/api/number-estimate";
import { type Result, err, ok } from "neverthrow";
import { enrichEntityWithEditableStatus, getSqlPagination } from "../entities-utils.js";

type NumberEstimateServiceDependencies = {
  numberEstimateRepository: NumberEstimateRepository;
};

export const buildNumberEstimateService = ({ numberEstimateRepository }: NumberEstimateServiceDependencies) => {
  const findNumberEstimate = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<NumberEstimate | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const numberEstimate = await numberEstimateRepository.findNumberEstimateById(id);
    return ok(enrichEntityWithEditableStatus(numberEstimate, loggedUser));
  };

  const getEntriesCountByNumberEstimate = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await numberEstimateRepository.getEntriesCountById(id, loggedUser.id));
  };

  const isNumberEstimateUsed = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<boolean, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const totalEntriesWithNumberEstimate = await numberEstimateRepository.getEntriesCountById(id);

    return ok(totalEntriesWithNumberEstimate > 0);
  };

  const findAllNumberEstimates = async (): Promise<NumberEstimate[]> => {
    const numberEstimates = await numberEstimateRepository.findNumberEstimates({
      orderBy: "libelle",
    });

    const enrichedNumberEstimates = numberEstimates.map((numberEstimate) => {
      return enrichEntityWithEditableStatus(numberEstimate, null);
    });

    return [...enrichedNumberEstimates];
  };

  const findPaginatesNumberEstimates = async (
    loggedUser: LoggedUser | null,
    options: NumberEstimatesSearchParams,
  ): Promise<Result<NumberEstimate[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { q, orderBy, sortOrder, ...pagination } = options;

    const numberEstimates = await numberEstimateRepository.findNumberEstimates(
      {
        q: q,
        ...getSqlPagination(pagination),
        orderBy,
        sortOrder,
      },
      loggedUser.id,
    );

    const enrichedNumberEstimates = numberEstimates.map((numberEstimate) => {
      return enrichEntityWithEditableStatus(numberEstimate, loggedUser);
    });

    return ok([...enrichedNumberEstimates]);
  };

  const getNumberEstimatesCount = async (
    loggedUser: LoggedUser | null,
    q?: string | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await numberEstimateRepository.getCount(q));
  };

  const createNumberEstimate = async (
    input: UpsertNumberEstimateInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<NumberEstimate, NumberEstimateFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const createdNumberEstimateResult = await numberEstimateRepository.createNumberEstimate({
      ...input,
      ownerId: loggedUser.id,
    });

    return createdNumberEstimateResult.map((createdNumberEstimate) => {
      return enrichEntityWithEditableStatus(createdNumberEstimate, loggedUser);
    });
  };

  const updateNumberEstimate = async (
    id: number,
    input: UpsertNumberEstimateInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<NumberEstimate, NumberEstimateFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await numberEstimateRepository.findNumberEstimateById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }
    const updatedNumberEstimateResult = await numberEstimateRepository.updateNumberEstimate(id, input);

    return updatedNumberEstimateResult.map((updatedNumberEstimate) => {
      return enrichEntityWithEditableStatus(updatedNumberEstimate, loggedUser);
    });
  };

  const deleteNumberEstimate = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<NumberEstimate | null, DeletionFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await numberEstimateRepository.findNumberEstimateById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const deletedNumberEstimate = await numberEstimateRepository.deleteNumberEstimateById(id);
    return ok(enrichEntityWithEditableStatus(deletedNumberEstimate, loggedUser));
  };

  const createNumberEstimates = async (
    numberEstimates: UpsertNumberEstimateInput[],
    loggedUser: LoggedUser,
  ): Promise<readonly NumberEstimate[]> => {
    const createdNumberEstimates = await numberEstimateRepository.createNumberEstimates(
      numberEstimates.map((numberEstimate) => {
        return { ...numberEstimate, ownerId: loggedUser.id };
      }),
    );

    const enrichedCreatedNumberEstimates = createdNumberEstimates.map((numberEstimate) => {
      return enrichEntityWithEditableStatus(numberEstimate, loggedUser);
    });

    return enrichedCreatedNumberEstimates;
  };

  return {
    findNumberEstimate,
    getEntriesCountByNumberEstimate,
    isNumberEstimateUsed,
    findAllNumberEstimates,
    findPaginatesNumberEstimates,
    getNumberEstimatesCount,
    createNumberEstimate,
    updateNumberEstimate,
    deleteNumberEstimate,
    createNumberEstimates,
  };
};

export type NumberEstimateService = ReturnType<typeof buildNumberEstimateService>;
