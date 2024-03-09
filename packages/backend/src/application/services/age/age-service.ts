import type { AgeCreateInput, AgeFailureReason } from "@domain/age/age.js";
import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { AgeRepository } from "@interfaces/age-repository-interface.js";
import type { AgesSearchParams, UpsertAgeInput } from "@ou-ca/common/api/age";
import type { AgeSimple } from "@ou-ca/common/api/entities/age";
import { type Result, err, ok } from "neverthrow";
import type { DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "../../../services/entities/entities-utils.js";

type AgeServiceDependencies = {
  ageRepository: AgeRepository;
  entryRepository: DonneeRepository;
};

export const buildAgeService = ({ ageRepository, entryRepository }: AgeServiceDependencies) => {
  const findAge = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<AgeSimple | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const age = await ageRepository.findAgeById(id);
    return ok(enrichEntityWithEditableStatus(age, loggedUser));
  };

  const findAgeOfEntryId = async (
    entryId: string | undefined,
    loggedUser: LoggedUser | null,
  ): Promise<Result<AgeSimple | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const age = await ageRepository.findAgeByEntryId(entryId ? Number.parseInt(entryId) : undefined);
    return ok(enrichEntityWithEditableStatus(age, loggedUser));
  };

  const getEntriesCountByAge = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await entryRepository.getCountByAgeId(Number.parseInt(id)));
  };

  const findAllAges = async (): Promise<AgeSimple[]> => {
    const ages = await ageRepository.findAges({
      orderBy: "libelle",
    });

    const enrichedAges = ages.map((age) => {
      return enrichEntityWithEditableStatus(age, null);
    });

    return [...enrichedAges];
  };

  const findPaginatedAges = async (
    loggedUser: LoggedUser | null,
    options: AgesSearchParams,
  ): Promise<Result<AgeSimple[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const ages = await ageRepository.findAges({
      q,
      ...getSqlPagination(pagination),
      orderBy: orderByField,
      sortOrder,
    });

    const enrichedAges = ages.map((age) => {
      return enrichEntityWithEditableStatus(age, loggedUser);
    });

    return ok([...enrichedAges]);
  };

  const getAgesCount = async (
    loggedUser: LoggedUser | null,
    q?: string | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await ageRepository.getCount(q));
  };

  const createAge = async (
    input: UpsertAgeInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<AgeSimple, AgeFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const createdAgeResult = await ageRepository.createAge({
      ...input,
      ownerId: loggedUser.id,
    });

    return createdAgeResult.map((createdAge) => {
      return enrichEntityWithEditableStatus(createdAge, loggedUser);
    });
  };

  const updateAge = async (
    id: number,
    input: UpsertAgeInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<AgeSimple, AgeFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await ageRepository.findAgeById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const upsertedAgeResult = await ageRepository.updateAge(id, input);

    return upsertedAgeResult.map((upsertedAge) => {
      return enrichEntityWithEditableStatus(upsertedAge, loggedUser);
    });
  };

  const deleteAge = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<AgeSimple | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await ageRepository.findAgeById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const deletedAge = await ageRepository.deleteAgeById(id);
    return ok(deletedAge ? enrichEntityWithEditableStatus(deletedAge, loggedUser) : null);
  };

  const createAges = async (
    ages: Omit<AgeCreateInput, "ownerId">[],
    loggedUser: LoggedUser,
  ): Promise<readonly AgeSimple[]> => {
    const createdAges = await ageRepository.createAges(
      ages.map((age) => {
        return { ...age, ownerId: loggedUser.id };
      }),
    );

    const enrichedCreatedAges = createdAges.map((age) => {
      return enrichEntityWithEditableStatus(age, loggedUser);
    });

    return enrichedCreatedAges;
  };

  return {
    findAge,
    findAgeOfEntryId,
    getEntriesCountByAge,
    findAllAges,
    findPaginatedAges,
    getAgesCount,
    createAge,
    updateAge,
    deleteAge,
    createAges,
  };
};

export type AgeService = ReturnType<typeof buildAgeService>;
