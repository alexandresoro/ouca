import { type SexesSearchParams, type UpsertSexInput } from "@ou-ca/common/api/sex";
import { type Sex } from "@ou-ca/common/entities/sex";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type SexeCreateInput } from "../../repositories/sexe/sexe-repository-types.js";
import { type SexeRepository } from "../../repositories/sexe/sexe-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { COLUMN_LIBELLE } from "../../utils/constants.js";
import { OucaError } from "../../utils/errors.js";
import { validateAuthorization } from "./authorization-utils.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "./entities-utils.js";

type SexeServiceDependencies = {
  logger: Logger;
  sexeRepository: SexeRepository;
  donneeRepository: DonneeRepository;
};

export const buildSexeService = ({ sexeRepository, donneeRepository }: SexeServiceDependencies) => {
  const findSexe = async (id: number, loggedUser: LoggedUser | null): Promise<Sex | null> => {
    validateAuthorization(loggedUser);

    const sex = await sexeRepository.findSexeById(id);
    return enrichEntityWithEditableStatus(sex, loggedUser);
  };

  const findSexeOfDonneeId = async (
    donneeId: string | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Sex | null> => {
    validateAuthorization(loggedUser);

    const sex = await sexeRepository.findSexeByDonneeId(donneeId ? parseInt(donneeId) : undefined);
    return enrichEntityWithEditableStatus(sex, loggedUser);
  };

  const getDonneesCountBySexe = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return donneeRepository.getCountBySexeId(parseInt(id));
  };

  const findAllSexes = async (): Promise<Sex[]> => {
    const sexes = await sexeRepository.findSexes({
      orderBy: COLUMN_LIBELLE,
    });

    const enrichedSexes = sexes.map((sex) => {
      return enrichEntityWithEditableStatus(sex, null);
    });

    return [...enrichedSexes];
  };

  const findPaginatedSexes = async (loggedUser: LoggedUser | null, options: SexesSearchParams): Promise<Sex[]> => {
    validateAuthorization(loggedUser);

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const sexes = await sexeRepository.findSexes({
      q,
      ...getSqlPagination(pagination),
      orderBy: orderByField,
      sortOrder,
    });

    const enrichedSexes = sexes.map((sex) => {
      return enrichEntityWithEditableStatus(sex, loggedUser);
    });

    return [...enrichedSexes];
  };

  const getSexesCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return sexeRepository.getCount(q);
  };

  const createSexe = async (input: UpsertSexInput, loggedUser: LoggedUser | null): Promise<Sex> => {
    validateAuthorization(loggedUser);

    try {
      const createdSex = await sexeRepository.createSexe({
        ...input,
        owner_id: loggedUser.id,
      });

      return enrichEntityWithEditableStatus(createdSex, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const updateSexe = async (id: number, input: UpsertSexInput, loggedUser: LoggedUser | null): Promise<Sex> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await sexeRepository.findSexeById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      const updatedSex = await sexeRepository.updateSexe(id, input);

      return enrichEntityWithEditableStatus(updatedSex, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const deleteSexe = async (id: number, loggedUser: LoggedUser | null): Promise<Sex> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await sexeRepository.findSexeById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    const deletedSex = await sexeRepository.deleteSexeById(id);
    return enrichEntityWithEditableStatus(deletedSex, loggedUser);
  };

  const createSexes = async (
    sexes: Omit<SexeCreateInput[], "owner_id">,
    loggedUser: LoggedUser
  ): Promise<readonly Sex[]> => {
    const createdSexes = await sexeRepository.createSexes(
      sexes.map((sexe) => {
        return { ...sexe, owner_id: loggedUser.id };
      })
    );

    const enrichedCreatedSexes = createdSexes.map((sex) => {
      return enrichEntityWithEditableStatus(sex, loggedUser);
    });

    return enrichedCreatedSexes;
  };

  return {
    findSexe,
    findSexeOfDonneeId,
    getDonneesCountBySexe,
    findAllSexes,
    findPaginatedSexes,
    getSexesCount,
    createSexe,
    updateSexe,
    deleteSexe,
    createSexes,
  };
};

export type SexeService = ReturnType<typeof buildSexeService>;
