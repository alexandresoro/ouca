import { type AgeCreateInput, type AgeFailureReason } from "@domain/age/age.js";
import { type AccessFailureReason } from "@domain/shared/failure-reason.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type AgeRepository } from "@interfaces/age-repository-interface.js";
import { type AgesSearchParams, type UpsertAgeInput } from "@ou-ca/common/api/age";
import { type AgeSimple } from "@ou-ca/common/api/entities/age";
import { err, ok, type Result } from "neverthrow";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "../../../services/entities/entities-utils.js";
import { COLUMN_LIBELLE } from "../../../utils/constants.js";

type AgeServiceDependencies = {
  ageRepository: AgeRepository;
  donneeRepository: DonneeRepository;
};

export const buildAgeService = ({ ageRepository, donneeRepository }: AgeServiceDependencies) => {
  const findAge = async (
    id: number,
    loggedUser: LoggedUser | null
  ): Promise<Result<AgeSimple | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const age = await ageRepository.findAgeById(id);
    return ok(enrichEntityWithEditableStatus(age, loggedUser));
  };

  const findAgeOfDonneeId = async (
    donneeId: string | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Result<AgeSimple | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const age = await ageRepository.findAgeByDonneeId(donneeId ? parseInt(donneeId) : undefined);
    return ok(enrichEntityWithEditableStatus(age, loggedUser));
  };

  const getDonneesCountByAge = async (
    id: string,
    loggedUser: LoggedUser | null
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await donneeRepository.getCountByAgeId(parseInt(id)));
  };

  const findAllAges = async (): Promise<AgeSimple[]> => {
    const ages = await ageRepository.findAges({
      orderBy: COLUMN_LIBELLE,
    });

    const enrichedAges = ages.map((age) => {
      return enrichEntityWithEditableStatus(age, null);
    });

    return [...enrichedAges];
  };

  const findPaginatedAges = async (
    loggedUser: LoggedUser | null,
    options: AgesSearchParams
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
    q?: string | null
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await ageRepository.getCount(q));
  };

  const createAge = async (
    input: UpsertAgeInput,
    loggedUser: LoggedUser | null
  ): Promise<Result<AgeSimple, AgeFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    try {
      const createdAgeResult = await ageRepository.createAge({
        ...input,
        ownerId: loggedUser.id,
      });

      return createdAgeResult.map((createdAge) => {
        return enrichEntityWithEditableStatus(createdAge, loggedUser);
      });
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        return err("alreadyExists");
      }
      throw e;
    }
  };

  const updateAge = async (
    id: number,
    input: UpsertAgeInput,
    loggedUser: LoggedUser | null
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

    try {
      const upsertedAge = await ageRepository.updateAge(id, input);

      return ok(enrichEntityWithEditableStatus(upsertedAge, loggedUser));
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        return err("alreadyExists");
      }
      throw e;
    }
  };

  const deleteAge = async (
    id: number,
    loggedUser: LoggedUser | null
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
    loggedUser: LoggedUser
  ): Promise<readonly AgeSimple[]> => {
    const createdAges = await ageRepository.createAges(
      ages.map((age) => {
        return { ...age, ownerId: loggedUser.id };
      })
    );

    const enrichedCreatedAges = createdAges.map((age) => {
      return enrichEntityWithEditableStatus(age, loggedUser);
    });

    return enrichedCreatedAges;
  };

  return {
    findAge,
    findAgeOfDonneeId,
    getDonneesCountByAge,
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
