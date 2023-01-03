import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import {
  type AgeWithSpecimensCount,
  type MutationUpsertAgeArgs,
  type QueryAgesArgs,
} from "../../graphql/generated/graphql-types";
import { type AgeRepository } from "../../repositories/age/age-repository";
import { type Age, type AgeCreateInput } from "../../repositories/age/age-repository-types";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository";
import { type LoggedUser } from "../../types/User";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { validateAuthorization } from "./authorization-utils";
import { getSqlPagination } from "./entities-utils";

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

  const upsertAge = async (args: MutationUpsertAgeArgs, loggedUser: LoggedUser | null): Promise<Age> => {
    validateAuthorization(loggedUser);

    const { id, data } = args;

    let upsertedAge: Age;

    if (id) {
      // Check that the user is allowed to modify the existing data
      if (loggedUser?.role !== "admin") {
        const existingData = await ageRepository.findAgeById(id);

        if (existingData?.ownerId !== loggedUser?.id) {
          throw new OucaError("OUCA0001");
        }
      }

      try {
        upsertedAge = await ageRepository.updateAge(id, data);
      } catch (e) {
        if (e instanceof UniqueIntegrityConstraintViolationError) {
          throw new OucaError("OUCA0004", e);
        }
        throw e;
      }
    } else {
      try {
        upsertedAge = await ageRepository.createAge({
          ...data,
          owner_id: loggedUser.id,
        });
      } catch (e) {
        if (e instanceof UniqueIntegrityConstraintViolationError) {
          throw new OucaError("OUCA0004", e);
        }
        throw e;
      }
    }

    return upsertedAge;
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
    upsertAge,
    deleteAge,
    createAges,
  };
};

export type AgeService = ReturnType<typeof buildAgeService>;
