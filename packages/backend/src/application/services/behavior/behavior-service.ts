import type { BehaviorCreateInput, BehaviorFailureReason } from "@domain/behavior/behavior.js";
import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { BehaviorRepository } from "@interfaces/behavior-repository-interface.js";
import type { BehaviorsSearchParams, UpsertBehaviorInput } from "@ou-ca/common/api/behavior";
import type { Behavior } from "@ou-ca/common/api/entities/behavior";
import { type Result, err, ok } from "neverthrow";
import { enrichEntityWithEditableStatus, getSqlPagination } from "../entities-utils.js";

type BehaviorServiceDependencies = {
  behaviorRepository: BehaviorRepository;
};

export const buildBehaviorService = ({ behaviorRepository }: BehaviorServiceDependencies) => {
  const findBehavior = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Behavior | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const behavior = await behaviorRepository.findBehaviorById(id);
    return ok(enrichEntityWithEditableStatus(behavior, loggedUser));
  };

  const findBehaviors = async (
    ids: string[],
    loggedUser: LoggedUser | null,
  ): Promise<Result<Behavior[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    if (ids.length === 0) {
      return ok([]);
    }

    const behaviors = await behaviorRepository.findBehaviorsById(ids);
    return ok(behaviors.map((behavior) => enrichEntityWithEditableStatus(behavior, loggedUser)));
  };

  const getEntriesCountByBehavior = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await behaviorRepository.getEntriesCountById(id));
  };

  const findAllBehaviors = async (): Promise<Behavior[]> => {
    const behaviors = await behaviorRepository.findBehaviors({
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
  ): Promise<Result<Behavior[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const behaviors = await behaviorRepository.findBehaviors({
      q,
      ...getSqlPagination(pagination),
      orderBy: orderByField,
      sortOrder,
    });

    const enrichedBehaviors = behaviors.map((behavior) => {
      return enrichEntityWithEditableStatus(behavior, loggedUser);
    });

    return ok([...enrichedBehaviors]);
  };

  const getBehaviorsCount = async (
    loggedUser: LoggedUser | null,
    q?: string | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await behaviorRepository.getCount(q));
  };

  const createBehavior = async (
    input: UpsertBehaviorInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Behavior, BehaviorFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const createdBehaviorResult = await behaviorRepository.createBehavior({
      ...input,
      ownerId: loggedUser.id,
    });

    return createdBehaviorResult.map((createdBehavior) => {
      return enrichEntityWithEditableStatus(createdBehavior, loggedUser);
    });
  };

  const updateBehavior = async (
    id: number,
    input: UpsertBehaviorInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Behavior, BehaviorFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await behaviorRepository.findBehaviorById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const updatedBehaviorResult = await behaviorRepository.updateBehavior(id, input);

    return updatedBehaviorResult.map((updatedBehavior) => {
      return enrichEntityWithEditableStatus(updatedBehavior, loggedUser);
    });
  };

  const deleteBehavior = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Behavior | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await behaviorRepository.findBehaviorById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const deletedBehavior = await behaviorRepository.deleteBehaviorById(id);
    return ok(enrichEntityWithEditableStatus(deletedBehavior, loggedUser));
  };

  const createBehaviors = async (
    behaviors: Omit<BehaviorCreateInput[], "ownerId">,
    loggedUser: LoggedUser,
  ): Promise<readonly Behavior[]> => {
    const createdBehaviors = await behaviorRepository.createBehaviors(
      behaviors.map((behavior) => {
        return { ...behavior, ownerId: loggedUser.id };
      }),
    );

    const enrichedCreatedBehaviors = createdBehaviors.map((behavior) => {
      return enrichEntityWithEditableStatus(behavior, loggedUser);
    });

    return enrichedCreatedBehaviors;
  };

  return {
    findBehavior,
    findBehaviors,
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
