import { OucaError } from "@domain/errors/ouca-error.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { BehaviorsSearchParams, UpsertBehaviorInput } from "@ou-ca/common/api/behavior";
import type { Behavior } from "@ou-ca/common/api/entities/behavior";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { validateAuthorization } from "../../../application/services/authorization/authorization-utils.js";
import type { ComportementCreateInput } from "../../../repositories/comportement/comportement-repository-types.js";
import type { ComportementRepository } from "../../../repositories/comportement/comportement-repository.js";
import type { DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "../entities-utils.js";

type BehaviorServiceDependencies = {
  behaviorRepository: ComportementRepository;
  entryRepository: DonneeRepository;
};

export const buildBehaviorService = ({ behaviorRepository, entryRepository }: BehaviorServiceDependencies) => {
  const findBehavior = async (id: number, loggedUser: LoggedUser | null): Promise<Behavior | null> => {
    validateAuthorization(loggedUser);

    const behavior = await behaviorRepository.findComportementById(id);
    return enrichEntityWithEditableStatus(behavior, loggedUser);
  };

  const findBehaviorIdsOfEntryId = async (entryId: string): Promise<string[]> => {
    const behaviorIds = await behaviorRepository
      .findComportementsOfDonneeId(Number.parseInt(entryId))
      .then((behaviors) => behaviors.map(({ id }) => id));

    return [...behaviorIds];
  };

  const findBehaviorsOfEntryId = async (
    entryId: string | undefined,
    loggedUser: LoggedUser | null,
  ): Promise<Behavior[]> => {
    validateAuthorization(loggedUser);

    const behaviors = await behaviorRepository.findComportementsOfDonneeId(
      entryId ? Number.parseInt(entryId) : undefined,
    );

    const enrichedBehaviors = behaviors.map((behavior) => {
      return enrichEntityWithEditableStatus(behavior, loggedUser);
    });

    return [...enrichedBehaviors];
  };

  const getEntriesCountByBehavior = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return entryRepository.getCountByComportementId(Number.parseInt(id));
  };

  const findAllBehaviors = async (): Promise<Behavior[]> => {
    const behaviors = await behaviorRepository.findComportements({
      orderBy: "code",
    });

    const enrichedBehaviors = behaviors.map((behavior) => {
      return enrichEntityWithEditableStatus(behavior, null);
    });

    return [...enrichedBehaviors];
  };

  const findPaginatedBehaviors = async (
    loggedUser: LoggedUser | null,
    options: BehaviorsSearchParams,
  ): Promise<Behavior[]> => {
    validateAuthorization(loggedUser);

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const behaviors = await behaviorRepository.findComportements({
      q,
      ...getSqlPagination(pagination),
      orderBy: orderByField,
      sortOrder,
    });

    const enrichedBehaviors = behaviors.map((behavior) => {
      return enrichEntityWithEditableStatus(behavior, loggedUser);
    });

    return [...enrichedBehaviors];
  };

  const getBehaviorsCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return behaviorRepository.getCount(q);
  };

  const createBehavior = async (input: UpsertBehaviorInput, loggedUser: LoggedUser | null): Promise<Behavior> => {
    validateAuthorization(loggedUser);

    try {
      const createdBehavior = await behaviorRepository.createComportement({
        ...input,
        owner_id: loggedUser.id,
      });

      return enrichEntityWithEditableStatus(createdBehavior, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const updateBehavior = async (
    id: number,
    input: UpsertBehaviorInput,
    loggedUser: LoggedUser | null,
  ): Promise<Behavior> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await behaviorRepository.findComportementById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      const updatedBehavior = await behaviorRepository.updateComportement(id, input);

      return enrichEntityWithEditableStatus(updatedBehavior, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const deleteBehavior = async (id: number, loggedUser: LoggedUser | null): Promise<Behavior | null> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await behaviorRepository.findComportementById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    const deletedBehavior = await behaviorRepository.deleteComportementById(id);
    return enrichEntityWithEditableStatus(deletedBehavior, loggedUser);
  };

  const createBehaviors = async (
    behaviors: Omit<ComportementCreateInput[], "owner_id">,
    loggedUser: LoggedUser,
  ): Promise<readonly Behavior[]> => {
    const createdBehaviors = await behaviorRepository.createComportements(
      behaviors.map((behavior) => {
        return { ...behavior, owner_id: loggedUser.id };
      }),
    );

    const enrichedCreatedBehaviors = createdBehaviors.map((behavior) => {
      return enrichEntityWithEditableStatus(behavior, loggedUser);
    });

    return enrichedCreatedBehaviors;
  };

  return {
    findBehavior,
    findBehaviorIdsOfEntryId,
    findBehaviorsOfEntryId,
    getEntriesCountByBehavior,
    findAllBehaviors,
    findPaginatedBehaviors,
    getBehaviorsCount,
    createBehavior,
    updateBehavior,
    deleteBehavior,
    createBehaviors,
  };
};

export type BehaviorService = ReturnType<typeof buildBehaviorService>;
