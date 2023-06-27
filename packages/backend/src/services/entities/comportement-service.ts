import { type BehaviorsSearchParams, type UpsertBehaviorInput } from "@ou-ca/common/api/behavior";
import { type Behavior } from "@ou-ca/common/entities/behavior";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type ComportementCreateInput } from "../../repositories/comportement/comportement-repository-types.js";
import { type ComportementRepository } from "../../repositories/comportement/comportement-repository.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { COLUMN_CODE } from "../../utils/constants.js";
import { OucaError } from "../../utils/errors.js";
import { validateAuthorization } from "./authorization-utils.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "./entities-utils.js";

type ComportementServiceDependencies = {
  logger: Logger;
  comportementRepository: ComportementRepository;
  donneeRepository: DonneeRepository;
};

export const buildComportementService = ({
  comportementRepository,
  donneeRepository,
}: ComportementServiceDependencies) => {
  const findComportement = async (id: number, loggedUser: LoggedUser | null): Promise<Behavior | null> => {
    validateAuthorization(loggedUser);

    const behavior = await comportementRepository.findComportementById(id);
    return enrichEntityWithEditableStatus(behavior, loggedUser);
  };

  const findComportementsIdsOfDonneeId = async (donneeId: string): Promise<string[]> => {
    const comportementsIds = await comportementRepository
      .findComportementsOfDonneeId(parseInt(donneeId))
      .then((comportements) => comportements.map(({ id }) => id));

    return [...comportementsIds];
  };

  const findComportementsOfDonneeId = async (
    donneeId: string | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Behavior[]> => {
    validateAuthorization(loggedUser);

    const comportements = await comportementRepository.findComportementsOfDonneeId(
      donneeId ? parseInt(donneeId) : undefined
    );

    const enrichedBehaviors = comportements.map((behavior) => {
      return enrichEntityWithEditableStatus(behavior, loggedUser);
    });

    return [...enrichedBehaviors];
  };

  const getDonneesCountByComportement = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return donneeRepository.getCountByComportementId(parseInt(id));
  };

  const findAllComportements = async (): Promise<Behavior[]> => {
    const comportements = await comportementRepository.findComportements({
      orderBy: COLUMN_CODE,
    });

    const enrichedBehaviors = comportements.map((behavior) => {
      return enrichEntityWithEditableStatus(behavior, null);
    });

    return [...enrichedBehaviors];
  };

  const findPaginatedComportements = async (
    loggedUser: LoggedUser | null,
    options: BehaviorsSearchParams
  ): Promise<Behavior[]> => {
    validateAuthorization(loggedUser);

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const comportements = await comportementRepository.findComportements({
      q,
      ...getSqlPagination(pagination),
      orderBy: orderByField,
      sortOrder,
    });

    const enrichedBehaviors = comportements.map((behavior) => {
      return enrichEntityWithEditableStatus(behavior, loggedUser);
    });

    return [...enrichedBehaviors];
  };

  const getComportementsCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return comportementRepository.getCount(q);
  };

  const createComportement = async (input: UpsertBehaviorInput, loggedUser: LoggedUser | null): Promise<Behavior> => {
    validateAuthorization(loggedUser);

    try {
      const createdComportement = await comportementRepository.createComportement({
        ...input,
        owner_id: loggedUser.id,
      });

      return enrichEntityWithEditableStatus(createdComportement, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const updateComportement = async (
    id: number,
    input: UpsertBehaviorInput,
    loggedUser: LoggedUser | null
  ): Promise<Behavior> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await comportementRepository.findComportementById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      const updatedComportement = await comportementRepository.updateComportement(id, input);

      return enrichEntityWithEditableStatus(updatedComportement, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const deleteComportement = async (id: number, loggedUser: LoggedUser | null): Promise<Behavior> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await comportementRepository.findComportementById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    const deletedComportement = await comportementRepository.deleteComportementById(id);
    return enrichEntityWithEditableStatus(deletedComportement, loggedUser);
  };

  const createComportements = async (
    comportements: Omit<ComportementCreateInput[], "owner_id">,
    loggedUser: LoggedUser
  ): Promise<readonly Behavior[]> => {
    const createdBehaviors = await comportementRepository.createComportements(
      comportements.map((comportement) => {
        return { ...comportement, owner_id: loggedUser.id };
      })
    );

    const enrichedCreatedBehaviors = createdBehaviors.map((behavior) => {
      return enrichEntityWithEditableStatus(behavior, loggedUser);
    });

    return enrichedCreatedBehaviors;
  };

  return {
    findComportement,
    findComportementsIdsOfDonneeId,
    findComportementsOfDonneeId,
    getDonneesCountByComportement,
    findAllComportements,
    findPaginatedComportements,
    getComportementsCount,
    createComportement,
    updateComportement,
    deleteComportement,
    createComportements,
  };
};

export type ComportementService = ReturnType<typeof buildComportementService>;
