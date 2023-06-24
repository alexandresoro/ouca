import { type ClassesSearchParams, type UpsertClassInput } from "@ou-ca/common/api/species-class";
import { type SpeciesClass } from "@ou-ca/common/entities/species-class";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type ClasseCreateInput } from "../../repositories/classe/classe-repository-types.js";
import { type ClasseRepository } from "../../repositories/classe/classe-repository.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type EspeceRepository } from "../../repositories/espece/espece-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { COLUMN_LIBELLE } from "../../utils/constants.js";
import { OucaError } from "../../utils/errors.js";
import { validateAuthorization } from "./authorization-utils.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "./entities-utils.js";

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
  const findClasse = async (id: number, loggedUser: LoggedUser | null): Promise<SpeciesClass | null> => {
    validateAuthorization(loggedUser);

    const speciesClass = await classeRepository.findClasseById(id);
    return enrichEntityWithEditableStatus(speciesClass, loggedUser);
  };

  const getEspecesCountByClasse = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return especeRepository.getCountByClasseId(parseInt(id));
  };

  const getDonneesCountByClasse = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return donneeRepository.getCountByClasseId(parseInt(id));
  };

  const findClasseOfEspeceId = async (
    especeId: number | undefined,
    loggedUser: LoggedUser | null
  ): Promise<SpeciesClass | null> => {
    validateAuthorization(loggedUser);

    const speciesClass = await classeRepository.findClasseByEspeceId(especeId);
    return enrichEntityWithEditableStatus(speciesClass, loggedUser);
  };

  const findAllClasses = async (): Promise<SpeciesClass[]> => {
    const classes = await classeRepository.findClasses({
      orderBy: COLUMN_LIBELLE,
    });

    const enrichedClasses = classes.map((speciesClass) => {
      return enrichEntityWithEditableStatus(speciesClass, null);
    });

    return [...enrichedClasses];
  };

  const findPaginatedClasses = async (
    loggedUser: LoggedUser | null,
    options: ClassesSearchParams
  ): Promise<SpeciesClass[]> => {
    validateAuthorization(loggedUser);

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const classes = await classeRepository.findClasses({
      q,
      ...getSqlPagination(pagination),
      orderBy: orderByField,
      sortOrder,
    });

    const enrichedClasses = classes.map((speciesClass) => {
      return enrichEntityWithEditableStatus(speciesClass, loggedUser);
    });

    return [...enrichedClasses];
  };

  const getClassesCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return classeRepository.getCount(q);
  };

  const createClasse = async (input: UpsertClassInput, loggedUser: LoggedUser | null): Promise<SpeciesClass> => {
    validateAuthorization(loggedUser);

    // Create a new class
    try {
      const createdClass = await classeRepository.createClasse({
        ...input,
        owner_id: loggedUser?.id,
      });

      return enrichEntityWithEditableStatus(createdClass, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const updateClasse = async (
    id: number,
    input: UpsertClassInput,
    loggedUser: LoggedUser | null
  ): Promise<SpeciesClass> => {
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
      const updatedClass = await classeRepository.updateClasse(id, input);

      return enrichEntityWithEditableStatus(updatedClass, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const deleteClasse = async (id: number, loggedUser: LoggedUser | null): Promise<SpeciesClass> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser.role !== "admin") {
      const existingData = await classeRepository.findClasseById(id);

      if (existingData?.ownerId !== loggedUser.id) {
        throw new OucaError("OUCA0001");
      }
    }

    const deletedClass = await classeRepository.deleteClasseById(id);
    return enrichEntityWithEditableStatus(deletedClass, loggedUser);
  };

  const createClasses = async (
    classes: Omit<ClasseCreateInput, "owner_id">[],
    loggedUser: LoggedUser
  ): Promise<readonly SpeciesClass[]> => {
    const createdClasses = await classeRepository.createClasses(
      classes.map((classe) => {
        return { ...classe, owner_id: loggedUser.id };
      })
    );

    const enrichedCreatedClasses = createdClasses.map((speciesClass) => {
      return enrichEntityWithEditableStatus(speciesClass, loggedUser);
    });

    return enrichedCreatedClasses;
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
