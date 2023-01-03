import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type MutationUpsertClasseArgs, type QueryClassesArgs } from "../../graphql/generated/graphql-types";
import { type ClasseRepository } from "../../repositories/classe/classe-repository";
import { type Classe, type ClasseCreateInput } from "../../repositories/classe/classe-repository-types";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository";
import { type EspeceRepository } from "../../repositories/espece/espece-repository";
import { type LoggedUser } from "../../types/User";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { validateAuthorization } from "./authorization-utils";
import { getSqlPagination } from "./entities-utils";

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

  const upsertClasse = async (args: MutationUpsertClasseArgs, loggedUser: LoggedUser | null): Promise<Classe> => {
    validateAuthorization(loggedUser);

    const { id, data } = args;

    let upsertedClasse: Classe;

    if (id) {
      // Check that the user is allowed to modify the existing data
      if (loggedUser.role !== "admin") {
        const existingData = await classeRepository.findClasseById(id);

        if (existingData?.ownerId !== loggedUser.id) {
          throw new OucaError("OUCA0001");
        }
      }

      // Update an existing observer
      try {
        upsertedClasse = await classeRepository.updateClasse(id, data);
      } catch (e) {
        if (e instanceof UniqueIntegrityConstraintViolationError) {
          throw new OucaError("OUCA0004", e);
        }
        throw e;
      }
    } else {
      // Create a new observer
      try {
        upsertedClasse = await classeRepository.createClasse({
          ...data,
          owner_id: loggedUser?.id,
        });
      } catch (e) {
        if (e instanceof UniqueIntegrityConstraintViolationError) {
          throw new OucaError("OUCA0004", e);
        }
        throw e;
      }
    }

    return upsertedClasse;
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
    upsertClasse,
    deleteClasse,
    createClasses,
  };
};

export type ClasseService = ReturnType<typeof buildClasseService>;
