import type { AccessFailureReason, DeletionFailureReason } from "@domain/shared/failure-reason.js";
import type { SpeciesClassFailureReason } from "@domain/species-class/species-class.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { SpeciesClassRepository } from "@interfaces/species-class-repository-interface.js";
import type { SpeciesRepository } from "@interfaces/species-repository-interface.js";
import type { SpeciesClass } from "@ou-ca/common/api/entities/species-class";
import type { ClassesSearchParams, UpsertClassInput } from "@ou-ca/common/api/species-class";
import { type Result, err, ok } from "neverthrow";
import { enrichEntityWithEditableStatus, getSqlPagination } from "../entities-utils.js";

type SpeciesClassServiceDependencies = {
  classRepository: SpeciesClassRepository;
  speciesRepository: SpeciesRepository;
};

export const buildSpeciesClassService = ({ classRepository, speciesRepository }: SpeciesClassServiceDependencies) => {
  const findSpeciesClass = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<SpeciesClass | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const speciesClass = await classRepository.findSpeciesClassById(id);
    return ok(enrichEntityWithEditableStatus(speciesClass, loggedUser));
  };

  const getSpeciesCountBySpeciesClass = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(
      await speciesRepository.getCount({
        searchCriteria: {
          classIds: [id],
        },
      }),
    );
  };

  const getEntriesCountBySpeciesClass = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await classRepository.getEntriesCountById(id, loggedUser.id));
  };

  const isSpeciesClassUsed = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<boolean, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const totalSpeciesWithSpeciesClass = await speciesRepository.getCount({
      searchCriteria: {
        classIds: [id],
      },
    });

    return ok(totalSpeciesWithSpeciesClass > 0);
  };

  const findSpeciesClassOfSpecies = async (
    especeId: string | undefined,
    loggedUser: LoggedUser | null,
  ): Promise<Result<SpeciesClass | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const speciesClass = await classRepository.findSpeciesClassBySpeciesId(
      especeId ? Number.parseInt(especeId) : undefined,
    );
    return ok(enrichEntityWithEditableStatus(speciesClass, loggedUser));
  };

  const findAllSpeciesClasses = async (): Promise<SpeciesClass[]> => {
    const classes = await classRepository.findSpeciesClasses({
      orderBy: "libelle",
    });

    const enrichedClasses = classes.map((speciesClass) => {
      return enrichEntityWithEditableStatus(speciesClass, null);
    });

    return [...enrichedClasses];
  };

  const findPaginatedSpeciesClasses = async (
    loggedUser: LoggedUser | null,
    options: ClassesSearchParams,
  ): Promise<Result<SpeciesClass[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const classes = await classRepository.findSpeciesClasses(
      {
        q,
        ...getSqlPagination(pagination),
        orderBy: orderByField,
        sortOrder,
      },
      loggedUser.id,
    );

    const enrichedClasses = classes.map((speciesClass) => {
      return enrichEntityWithEditableStatus(speciesClass, loggedUser);
    });

    return ok([...enrichedClasses]);
  };

  const getSpeciesClassesCount = async (
    loggedUser: LoggedUser | null,
    q?: string | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await classRepository.getCount(q));
  };

  const createSpeciesClass = async (
    input: UpsertClassInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<SpeciesClass, SpeciesClassFailureReason>> => {
    if (!loggedUser?.permissions.speciesClass.canCreate) {
      return err("notAllowed");
    }

    const createdClassResult = await classRepository.createSpeciesClass({
      ...input,
      ownerId: loggedUser?.id,
    });

    return createdClassResult.map((createdClass) => {
      return enrichEntityWithEditableStatus(createdClass, loggedUser);
    });
  };

  const updateSpeciesClass = async (
    id: number,
    input: UpsertClassInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<SpeciesClass, SpeciesClassFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (!loggedUser.permissions.speciesClass.canEdit) {
      const existingData = await classRepository.findSpeciesClassById(id);

      if (existingData?.ownerId !== loggedUser.id) {
        return err("notAllowed");
      }
    }

    const updatedClassResult = await classRepository.updateSpeciesClass(id, input);

    return updatedClassResult.map((updatedClass) => {
      return enrichEntityWithEditableStatus(updatedClass, loggedUser);
    });
  };

  const deleteSpeciesClass = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<SpeciesClass | null, DeletionFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser.role !== "admin") {
      const existingData = await classRepository.findSpeciesClassById(id);

      if (existingData?.ownerId !== loggedUser.id) {
        return err("notAllowed");
      }
    }

    const deletedClass = await classRepository.deleteSpeciesClassById(id);
    return ok(enrichEntityWithEditableStatus(deletedClass, loggedUser));
  };

  const createMultipleSpeciesClasses = async (
    classes: UpsertClassInput[],
    loggedUser: LoggedUser,
  ): Promise<SpeciesClass[]> => {
    const createdClasses = await classRepository.createSpeciesClasses(
      classes.map((speciesClass) => {
        return { ...speciesClass, ownerId: loggedUser.id };
      }),
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
    isSpeciesClassUsed,
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
