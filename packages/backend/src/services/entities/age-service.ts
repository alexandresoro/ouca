import { type UpsertAgeInput } from "@ou-ca/common/api/age";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type AgeWithSpecimensCount, type QueryAgesArgs } from "../../graphql/generated/graphql-types.js";
import { type Age, type AgeCreateInput } from "../../repositories/age/age-repository-types.js";
import { type AgeRepository } from "../../repositories/age/age-repository.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { COLUMN_LIBELLE } from "../../utils/constants.js";
import { OucaError } from "../../utils/errors.js";
import { validateAuthorization } from "./authorization-utils.js";
import { getSqlPagination } from "./entities-utils.js";

type AgeServiceDependencies = {
  logger: Logger;
  ageRepository: AgeRepository;
  donneeRepository: DonneeRepository;
};

export const buildAgeService = ({ ageRepository, donneeRepository }: AgeServiceDependencies) => {
  const findAge = async (id: number, loggedUser: LoggedUser | null): Promise<Age | null> => {
    validateAuthorization(loggedUser);

    return ageRepository.findAgeById(id);
  };

  const findAgeOfDonneeId = async (
    donneeId: number | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Age | null> => {
    validateAuthorization(loggedUser);

    return ageRepository.findAgeByDonneeId(donneeId);
  };

  const getDonneesCountByAge = async (id: number, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return donneeRepository.getCountByAgeId(id);
  };

  const findAllAges = async (): Promise<Age[]> => {
    const ages = await ageRepository.findAges({
      orderBy: COLUMN_LIBELLE,
    });

    return [...ages];
  };

  const findPaginatedAges = async (loggedUser: LoggedUser | null, options: QueryAgesArgs = {}): Promise<Age[]> => {
    validateAuthorization(loggedUser);

    const { searchParams, orderBy: orderByField, sortOrder } = options;

    const ages = await ageRepository.findAges({
      q: searchParams?.q,
      ...getSqlPagination(searchParams),
      orderBy: orderByField,
      sortOrder,
    });

    return [...ages];
  };

  const getAgesCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return ageRepository.getCount(q);
  };

  const getAgesWithNbSpecimensForEspeceId = async (
    especeId: number,
    loggedUser: LoggedUser | null
  ): Promise<AgeWithSpecimensCount[]> => {
    validateAuthorization(loggedUser);

    const result = await ageRepository.getAgesWithNbSpecimensForEspeceId(especeId);

    return result.map(({ nbSpecimens, ...rest }) => {
      return {
        ...rest,
        nbSpecimens: nbSpecimens ?? 0,
      };
    });
  };

  const createAge = async (input: UpsertAgeInput, loggedUser: LoggedUser | null): Promise<Age> => {
    validateAuthorization(loggedUser);

    try {
      const createdAge = await ageRepository.createAge({
        ...input,
        owner_id: loggedUser.id,
      });

      return createdAge;
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

      return upsertedAge;
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

    return ageRepository.deleteAgeById(id);
  };

  const createAges = async (
    ages: Omit<AgeCreateInput[], "owner_id">,
    loggedUser: LoggedUser
  ): Promise<readonly Age[]> => {
    return ageRepository.createAges(
      ages.map((age) => {
        return { ...age, owner_id: loggedUser.id };
      })
    );
  };

  return {
    findAge,
    findAgeOfDonneeId,
    getDonneesCountByAge,
    findAllAges,
    findPaginatedAges,
    getAgesCount,
    getAgesWithNbSpecimensForEspeceId,
    createAge,
    updateAge,
    deleteAge,
    createAges,
  };
};

export type AgeService = ReturnType<typeof buildAgeService>;
