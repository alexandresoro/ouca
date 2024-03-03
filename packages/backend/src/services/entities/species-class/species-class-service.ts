import { type AccessFailureReason } from "@domain/shared/failure-reason.js";
import { type SpeciesClassFailureReason } from "@domain/species-class/species-class.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type SpeciesClass } from "@ou-ca/common/api/entities/species-class";
import { type ClassesSearchParams, type UpsertClassInput } from "@ou-ca/common/api/species-class";
import { err, ok, type Result } from "neverthrow";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type ClasseCreateInput } from "../../../repositories/classe/classe-repository-types.js";
import { type ClasseRepository } from "../../../repositories/classe/classe-repository.js";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { type EspeceRepository } from "../../../repositories/espece/espece-repository.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "../entities-utils.js";

type SpeciesClassServiceDependencies = {
  classRepository: ClasseRepository;
  speciesRepository: EspeceRepository;
  entryRepository: DonneeRepository;
};

export const buildSpeciesClassService = ({
  classRepository,
  speciesRepository,
  entryRepository,
}: SpeciesClassServiceDependencies) => {
  const findSpeciesClass = async (
    id: number,
    loggedUser: LoggedUser | null
  ): Promise<Result<SpeciesClass | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const speciesClass = await classRepository.findClasseById(id);
    return ok(enrichEntityWithEditableStatus(speciesClass, loggedUser));
  };

  const getSpeciesCountBySpeciesClass = async (
    id: string,
    loggedUser: LoggedUser | null
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await speciesRepository.getCountByClasseId(parseInt(id)));
  };

  const getEntriesCountBySpeciesClass = async (
    id: string,
    loggedUser: LoggedUser | null
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await entryRepository.getCountByClasseId(parseInt(id)));
  };

  const findSpeciesClassOfSpecies = async (
    especeId: string | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Result<SpeciesClass | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const speciesClass = await classRepository.findClasseByEspeceId(especeId ? parseInt(especeId) : undefined);
    return ok(enrichEntityWithEditableStatus(speciesClass, loggedUser));
  };

  const findAllSpeciesClasses = async (): Promise<SpeciesClass[]> => {
    const classes = await classRepository.findClasses({
      orderBy: "libelle",
    });

    const enrichedClasses = classes.map((speciesClass) => {
      return enrichEntityWithEditableStatus(speciesClass, null);
    });

    return [...enrichedClasses];
  };

  const findPaginatedSpeciesClasses = async (
    loggedUser: LoggedUser | null,
    options: ClassesSearchParams
  ): Promise<Result<SpeciesClass[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const classes = await classRepository.findClasses({
      q,
      ...getSqlPagination(pagination),
      orderBy: orderByField,
      sortOrder,
    });

    const enrichedClasses = classes.map((speciesClass) => {
      return enrichEntityWithEditableStatus(speciesClass, loggedUser);
    });

    return ok([...enrichedClasses]);
  };

  const getSpeciesClassesCount = async (
    loggedUser: LoggedUser | null,
    q?: string | null
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await classRepository.getCount(q));
  };

  const createSpeciesClass = async (
    input: UpsertClassInput,
    loggedUser: LoggedUser | null
  ): Promise<Result<SpeciesClass, SpeciesClassFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Create a new class
    try {
      const createdClass = await classRepository.createClasse({
        ...input,
        owner_id: loggedUser?.id,
      });

      return ok(enrichEntityWithEditableStatus(createdClass, loggedUser));
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        return err("alreadyExists");
      }
      throw e;
    }
  };

  const updateSpeciesClass = async (
    id: number,
    input: UpsertClassInput,
    loggedUser: LoggedUser | null
  ): Promise<Result<SpeciesClass, SpeciesClassFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser.role !== "admin") {
      const existingData = await classRepository.findClasseById(id);

      if (existingData?.ownerId !== loggedUser.id) {
        return err("notAllowed");
      }
    }

    // Update an existing class
    try {
      const updatedClass = await classRepository.updateClasse(id, input);

      return ok(enrichEntityWithEditableStatus(updatedClass, loggedUser));
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        return err("alreadyExists");
      }
      throw e;
    }
  };

  const deleteSpeciesClass = async (
    id: number,
    loggedUser: LoggedUser | null
  ): Promise<Result<SpeciesClass | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser.role !== "admin") {
      const existingData = await classRepository.findClasseById(id);

      if (existingData?.ownerId !== loggedUser.id) {
        return err("notAllowed");
      }
    }

    const deletedClass = await classRepository.deleteClasseById(id);
    return ok(enrichEntityWithEditableStatus(deletedClass, loggedUser));
  };

  const createMultipleSpeciesClasses = async (
    classes: Omit<ClasseCreateInput, "owner_id">[],
    loggedUser: LoggedUser
  ): Promise<readonly SpeciesClass[]> => {
    const createdClasses = await classRepository.createClasses(
      classes.map((speciesClass) => {
        return { ...speciesClass, owner_id: loggedUser.id };
      })
    );

    const enrichedCreatedClasses = createdClasses.map((speciesClass) => {
      return enrichEntityWithEditableStatus(speciesClass, loggedUser);
    });

    return enrichedCreatedClasses;
  };

  return {
    findSpeciesClass,
    getSpeciesCountBySpeciesClass,
    getEntriesCountBySpeciesClass,
    findSpeciesClassOfSpecies,
    findAllSpeciesClasses,
    findPaginatedSpeciesClasses,
    getSpeciesClassesCount,
    createSpeciesClass,
    updateSpeciesClass,
    deleteSpeciesClass,
    createMultipleSpeciesClasses,
  };
};

export type SpeciesClassService = ReturnType<typeof buildSpeciesClassService>;
