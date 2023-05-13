import { type UpsertSexInput } from "@ou-ca/common/api/sex";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type QuerySexesArgs, type SexeWithSpecimensCount } from "../../graphql/generated/graphql-types.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type Sexe, type SexeCreateInput } from "../../repositories/sexe/sexe-repository-types.js";
import { type SexeRepository } from "../../repositories/sexe/sexe-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { COLUMN_LIBELLE } from "../../utils/constants.js";
import { OucaError } from "../../utils/errors.js";
import { validateAuthorization } from "./authorization-utils.js";
import { getSqlPagination } from "./entities-utils.js";

type SexeServiceDependencies = {
  logger: Logger;
  sexeRepository: SexeRepository;
  donneeRepository: DonneeRepository;
};

export const buildSexeService = ({ sexeRepository, donneeRepository }: SexeServiceDependencies) => {
  const findSexe = async (id: number, loggedUser: LoggedUser | null): Promise<Sexe | null> => {
    validateAuthorization(loggedUser);

    return sexeRepository.findSexeById(id);
  };

  const findSexeOfDonneeId = async (
    donneeId: number | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Sexe | null> => {
    validateAuthorization(loggedUser);

    return sexeRepository.findSexeByDonneeId(donneeId);
  };

  const getDonneesCountBySexe = async (id: number, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return donneeRepository.getCountBySexeId(id);
  };

  const findAllSexes = async (): Promise<Sexe[]> => {
    const sexes = await sexeRepository.findSexes({
      orderBy: COLUMN_LIBELLE,
    });

    return [...sexes];
  };

  const findPaginatedSexes = async (loggedUser: LoggedUser | null, options: QuerySexesArgs = {}): Promise<Sexe[]> => {
    validateAuthorization(loggedUser);

    const { searchParams, orderBy: orderByField, sortOrder } = options;

    const sexes = await sexeRepository.findSexes({
      q: searchParams?.q,
      ...getSqlPagination(searchParams),
      orderBy: orderByField,
      sortOrder,
    });

    return [...sexes];
  };

  const getSexesCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return sexeRepository.getCount(q);
  };

  const getSexesWithNbSpecimensForEspeceId = async (
    especeId: number,
    loggedUser: LoggedUser | null
  ): Promise<SexeWithSpecimensCount[]> => {
    validateAuthorization(loggedUser);

    const result = await sexeRepository.getSexesWithNbSpecimensForEspeceId(especeId);

    return result.map(({ nbSpecimens, ...rest }) => {
      return {
        ...rest,
        nbSpecimens: nbSpecimens ?? 0,
      };
    });
  };

  const createSexe = async (input: UpsertSexInput, loggedUser: LoggedUser | null): Promise<Sexe> => {
    validateAuthorization(loggedUser);

    try {
      const upsertedSexe = await sexeRepository.createSexe({
        ...input,
        owner_id: loggedUser.id,
      });

      return upsertedSexe;
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const updateSexe = async (id: number, input: UpsertSexInput, loggedUser: LoggedUser | null): Promise<Sexe> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await sexeRepository.findSexeById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      const upsertedSexe = await sexeRepository.updateSexe(id, input);

      return upsertedSexe;
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const deleteSexe = async (id: number, loggedUser: LoggedUser | null): Promise<Sexe> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await sexeRepository.findSexeById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    return sexeRepository.deleteSexeById(id);
  };

  const createSexes = async (
    sexes: Omit<SexeCreateInput[], "owner_id">,
    loggedUser: LoggedUser
  ): Promise<readonly Sexe[]> => {
    return sexeRepository.createSexes(
      sexes.map((sexe) => {
        return { ...sexe, owner_id: loggedUser.id };
      })
    );
  };

  return {
    findSexe,
    findSexeOfDonneeId,
    getDonneesCountBySexe,
    findAllSexes,
    findPaginatedSexes,
    getSexesCount,
    getSexesWithNbSpecimensForEspeceId,
    createSexe,
    updateSexe,
    deleteSexe,
    createSexes,
  };
};

export type SexeService = ReturnType<typeof buildSexeService>;
