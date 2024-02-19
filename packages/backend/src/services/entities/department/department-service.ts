import { type DepartmentFailureReason } from "@domain/department/department.js";
import { type AccessFailureReason } from "@domain/shared/failure-reason.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type DepartmentsSearchParams, type UpsertDepartmentInput } from "@ou-ca/common/api/department";
import { type Department } from "@ou-ca/common/api/entities/department";
import { err, ok, type Result } from "neverthrow";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type CommuneRepository } from "../../../repositories/commune/commune-repository.js";
import { type DepartementCreateInput } from "../../../repositories/departement/departement-repository-types.js";
import { type DepartementRepository } from "../../../repositories/departement/departement-repository.js";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { type LieuditRepository } from "../../../repositories/lieudit/lieudit-repository.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "../entities-utils.js";

type DepartmentServiceDependencies = {
  departmentRepository: DepartementRepository;
  townRepository: CommuneRepository;
  localityRepository: LieuditRepository;
  entryRepository: DonneeRepository;
};

export const buildDepartmentService = ({
  departmentRepository,
  townRepository,
  localityRepository,
  entryRepository,
}: DepartmentServiceDependencies) => {
  const findDepartment = async (
    id: number,
    loggedUser: LoggedUser | null
  ): Promise<Result<Department | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const department = await departmentRepository.findDepartementById(id);
    return ok(enrichEntityWithEditableStatus(department, loggedUser));
  };

  const getEntriesCountByDepartment = async (
    id: string,
    loggedUser: LoggedUser | null
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await entryRepository.getCountByDepartementId(parseInt(id)));
  };

  const getLocalitiesCountByDepartment = async (
    id: string,
    loggedUser: LoggedUser | null
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await localityRepository.getCountByDepartementId(parseInt(id)));
  };

  const getTownsCountByDepartment = async (
    id: string,
    loggedUser: LoggedUser | null
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await townRepository.getCountByDepartementId(parseInt(id)));
  };

  const findDepartmentOfTownId = async (
    communeId: string | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Result<Department | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const department = await departmentRepository.findDepartementByCommuneId(
      communeId ? parseInt(communeId) : undefined
    );
    return ok(enrichEntityWithEditableStatus(department, loggedUser));
  };

  const findAllDepartments = async (): Promise<Department[]> => {
    const departments = await departmentRepository.findDepartements({
      orderBy: "code",
    });

    const enrichedDepartments = departments.map((department) => {
      return enrichEntityWithEditableStatus(department, null);
    });

    return [...enrichedDepartments];
  };

  const findPaginatedDepartments = async (
    loggedUser: LoggedUser | null,
    options: DepartmentsSearchParams
  ): Promise<Result<Department[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const departments = await departmentRepository.findDepartements({
      q,
      ...getSqlPagination(pagination),
      orderBy: orderByField,
      sortOrder,
    });

    const enrichedDepartments = departments.map((department) => {
      return enrichEntityWithEditableStatus(department, loggedUser);
    });

    return ok([...enrichedDepartments]);
  };

  const getDepartmentsCount = async (
    loggedUser: LoggedUser | null,
    q?: string | null
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await departmentRepository.getCount(q));
  };

  const createDepartment = async (
    input: UpsertDepartmentInput,
    loggedUser: LoggedUser | null
  ): Promise<Result<Department, DepartmentFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    try {
      const createdDepartment = await departmentRepository.createDepartement({
        ...input,
        owner_id: loggedUser.id,
      });

      return ok(enrichEntityWithEditableStatus(createdDepartment, loggedUser));
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        return err("alreadyExists");
      }
      throw e;
    }
  };

  const updateDepartment = async (
    id: number,
    input: UpsertDepartmentInput,
    loggedUser: LoggedUser | null
  ): Promise<Result<Department, DepartmentFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await departmentRepository.findDepartementById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    try {
      const updatedDepartment = await departmentRepository.updateDepartement(id, input);

      return ok(enrichEntityWithEditableStatus(updatedDepartment, loggedUser));
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        return err("alreadyExists");
      }
      throw e;
    }
  };

  const deleteDepartment = async (
    id: number,
    loggedUser: LoggedUser | null
  ): Promise<Result<Department | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await departmentRepository.findDepartementById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const deletedDepartment = await departmentRepository.deleteDepartementById(id);
    return ok(deletedDepartment ? enrichEntityWithEditableStatus(deletedDepartment, loggedUser) : null);
  };

  const createDepartments = async (
    departments: Omit<DepartementCreateInput, "owner_id">[],
    loggedUser: LoggedUser
  ): Promise<readonly Department[]> => {
    const createdDepartments = await departmentRepository.createDepartements(
      departments.map((department) => {
        return { ...department, owner_id: loggedUser.id };
      })
    );

    const enrichedCreatedDepartments = createdDepartments.map((department) => {
      return enrichEntityWithEditableStatus(department, loggedUser);
    });

    return enrichedCreatedDepartments;
  };

  return {
    findDepartment,
    getEntriesCountByDepartment,
    getLocalitiesCountByDepartment,
    getTownsCountByDepartment,
    findDepartmentOfTownId,
    findAllDepartments,
    findPaginatedDepartments,
    getDepartmentsCount,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    createDepartments,
  };
};

export type DepartmentService = ReturnType<typeof buildDepartmentService>;
