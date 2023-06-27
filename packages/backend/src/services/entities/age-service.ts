import { type AgesSearchParams, type UpsertAgeInput } from "@ou-ca/common/api/age";
import { type Age } from "@ou-ca/common/entities/age";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type AgeCreateInput } from "../../repositories/age/age-repository-types.js";
import { type AgeRepository } from "../../repositories/age/age-repository.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { COLUMN_LIBELLE } from "../../utils/constants.js";
import { OucaError } from "../../utils/errors.js";
import { validateAuthorization } from "./authorization-utils.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "./entities-utils.js";

type AgeServiceDependencies = {
  logger: Logger;
  ageRepository: AgeRepository;
  donneeRepository: DonneeRepository;
};

export const buildAgeService = ({ ageRepository, donneeRepository }: AgeServiceDependencies) => {
  const findAge = async (id: number, loggedUser: LoggedUser | null): Promise<Age | null> => {
    validateAuthorization(loggedUser);

    const age = await ageRepository.findAgeById(id);
    return enrichEntityWithEditableStatus(age, loggedUser);
  };

  const findAgeOfDonneeId = async (
    donneeId: string | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Age | null> => {
    validateAuthorization(loggedUser);

    const age = await ageRepository.findAgeByDonneeId(donneeId ? parseInt(donneeId) : undefined);
    return enrichEntityWithEditableStatus(age, loggedUser);
  };

  const getDonneesCountByAge = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return donneeRepository.getCountByAgeId(parseInt(id));
  };

  const findAllAges = async (): Promise<Age[]> => {
    const ages = await ageRepository.findAges({
      orderBy: COLUMN_LIBELLE,
    });

    const enrichedAges = ages.map((age) => {
      return enrichEntityWithEditableStatus(age, null);
    });

    return [...enrichedAges];
  };

  const findPaginatedAges = async (loggedUser: LoggedUser | null, options: AgesSearchParams): Promise<Age[]> => {
    validateAuthorization(loggedUser);

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

    return [...enrichedAges];
  };

  const getAgesCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return ageRepository.getCount(q);
  };

  const createAge = async (input: UpsertAgeInput, loggedUser: LoggedUser | null): Promise<Age> => {
    validateAuthorization(loggedUser);

    try {
      const createdAge = await ageRepository.createAge({
        ...input,
        owner_id: loggedUser.id,
      });

      return enrichEntityWithEditableStatus(createdAge, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const updateAge = async (id: number, input: UpsertAgeInput, loggedUser: LoggedUser | null): Promise<Age> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await ageRepository.findAgeById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      const upsertedAge = await ageRepository.updateAge(id, input);

      return enrichEntityWithEditableStatus(upsertedAge, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const deleteAge = async (id: number, loggedUser: LoggedUser | null): Promise<Age> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await ageRepository.findAgeById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    const deletedAge = await ageRepository.deleteAgeById(id);
    return enrichEntityWithEditableStatus(deletedAge, loggedUser);
  };

  const createAges = async (
    ages: Omit<AgeCreateInput[], "owner_id">,
    loggedUser: LoggedUser
  ): Promise<readonly Age[]> => {
    const createdAges = await ageRepository.createAges(
      ages.map((age) => {
        return { ...age, owner_id: loggedUser.id };
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
