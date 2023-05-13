import { type UpsertClassInput } from "@ou-ca/common/api/species-class";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type QueryClassesArgs } from "../../graphql/generated/graphql-types.js";
import { type Classe, type ClasseCreateInput } from "../../repositories/classe/classe-repository-types.js";
import { type ClasseRepository } from "../../repositories/classe/classe-repository.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type EspeceRepository } from "../../repositories/espece/espece-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { COLUMN_LIBELLE } from "../../utils/constants.js";
import { OucaError } from "../../utils/errors.js";
import { validateAuthorization } from "./authorization-utils.js";
import { getSqlPagination } from "./entities-utils.js";

type ClasseServiceDependencies = {
  logger: Logger;
  classeRepository: ClasseRepository;
  especeRepository: EspeceRepository;
  donneeRepository: DonneeRepository;
};

export const buildClasseService = ({
  classeRepository,
  especeRepository,
  donneeRepository,
}: ClasseServiceDependencies) => {
  const findClasse = async (id: number, loggedUser: LoggedUser | null): Promise<Classe | null> => {
    validateAuthorization(loggedUser);

    return classeRepository.findClasseById(id);
  };

  const getEspecesCountByClasse = async (id: number, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return especeRepository.getCountByClasseId(id);
  };

  const getDonneesCountByClasse = async (id: number, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return donneeRepository.getCountByClasseId(id);
  };

  const findClasseOfEspeceId = async (
    especeId: number | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Classe | null> => {
    validateAuthorization(loggedUser);

    return classeRepository.findClasseByEspeceId(especeId);
  };

  const findAllClasses = async (): Promise<Classe[]> => {
    const classes = await classeRepository.findClasses({
      orderBy: COLUMN_LIBELLE,
    });

    return [...classes];
  };

  const findPaginatedClasses = async (
    loggedUser: LoggedUser | null,
    options: QueryClassesArgs = {}
  ): Promise<Classe[]> => {
    validateAuthorization(loggedUser);

    const { searchParams, orderBy: orderByField, sortOrder } = options;

    const classes = await classeRepository.findClasses({
      q: searchParams?.q,
      ...getSqlPagination(searchParams),
      orderBy: orderByField,
      sortOrder,
    });

    return [...classes];
  };

  const getClassesCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return classeRepository.getCount(q);
  };

  const createClasse = async (input: UpsertClassInput, loggedUser: LoggedUser | null): Promise<Classe> => {
    validateAuthorization(loggedUser);

    // Create a new class
    try {
      const upsertedClasse = await classeRepository.createClasse({
        ...input,
        owner_id: loggedUser?.id,
      });
      return upsertedClasse;
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const updateClasse = async (id: number, input: UpsertClassInput, loggedUser: LoggedUser | null): Promise<Classe> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser.role !== "admin") {
      const existingData = await classeRepository.findClasseById(id);

      if (existingData?.ownerId !== loggedUser.id) {
        throw new OucaError("OUCA0001");
      }
    }

    // Update an existing class
    try {
      const upsertedClasse = await classeRepository.updateClasse(id, input);

      return upsertedClasse;
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const deleteClasse = async (id: number, loggedUser: LoggedUser | null): Promise<Classe> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser.role !== "admin") {
      const existingData = await classeRepository.findClasseById(id);

      if (existingData?.ownerId !== loggedUser.id) {
        throw new OucaError("OUCA0001");
      }
    }

    return classeRepository.deleteClasseById(id);
  };

  const createClasses = async (
    classes: Omit<ClasseCreateInput, "owner_id">[],
    loggedUser: LoggedUser
  ): Promise<readonly Classe[]> => {
    return classeRepository.createClasses(
      classes.map((classe) => {
        return { ...classe, owner_id: loggedUser.id };
      })
    );
  };

  return {
    findClasse,
    getEspecesCountByClasse,
    getDonneesCountByClasse,
    findClasseOfEspeceId,
    findAllClasses,
    findPaginatedClasses,
    getClassesCount,
    createClasse,
    updateClasse,
    deleteClasse,
    createClasses,
  };
};

export type ClasseService = ReturnType<typeof buildClasseService>;
