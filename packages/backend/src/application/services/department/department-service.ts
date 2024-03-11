import type { DepartmentCreateInput, DepartmentFailureReason } from "@domain/department/department.js";
import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { DepartmentRepository } from "@interfaces/department-repository-interface.js";
import type { TownRepository } from "@interfaces/town-repository-interface.js";
import type { DepartmentsSearchParams, UpsertDepartmentInput } from "@ou-ca/common/api/department";
import type { Department } from "@ou-ca/common/api/entities/department";
import { type Result, err, ok } from "neverthrow";
import type { DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import type { LieuditRepository } from "../../../repositories/lieudit/lieudit-repository.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "../../../services/entities/entities-utils.js";

type DepartmentServiceDependencies = {
  departmentRepository: DepartmentRepository;
  townRepository: TownRepository;
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
    loggedUser: LoggedUser | null,
  ): Promise<Result<Department | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const department = await departmentRepository.findDepartmentById(id);
    return ok(enrichEntityWithEditableStatus(department, loggedUser));
  };

  const getEntriesCountByDepartment = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await entryRepository.getCountByDepartementId(Number.parseInt(id)));
  };

  const getLocalitiesCountByDepartment = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await localityRepository.getCountByDepartementId(Number.parseInt(id)));
  };

  const getTownsCountByDepartment = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await townRepository.getCount(undefined, id));
  };

  const findDepartmentOfTownId = async (
    communeId: string | undefined,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Department | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const department = await departmentRepository.findDepartmentByTownId(
      communeId ? Number.parseInt(communeId) : undefined,
    );
    return ok(enrichEntityWithEditableStatus(department, loggedUser));
  };

  const findAllDepartments = async (): Promise<Department[]> => {
    const departments = await departmentRepository.findDepartments({
      orderBy: "code",
    });

    const enrichedDepartments = departments.map((department) => {
      return enrichEntityWithEditableStatus(department, null);
    });

    return [...enrichedDepartments];
  };

  const findPaginatedDepartments = async (
    loggedUser: LoggedUser | null,
    options: DepartmentsSearchParams,
  ): Promise<Result<Department[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const departments = await departmentRepository.findDepartments({
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
    q?: string | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await departmentRepository.getCount(q));
  };

  const createDepartment = async (
    input: UpsertDepartmentInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Department, DepartmentFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const createdDepartmentResult = await departmentRepository.createDepartment({
      ...input,
      ownerId: loggedUser.id,
    });

    return createdDepartmentResult.map((createdDepartment) => {
      return enrichEntityWithEditableStatus(createdDepartment, loggedUser);
    });
  };

  const updateDepartment = async (
    id: number,
    input: UpsertDepartmentInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Department, DepartmentFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await departmentRepository.findDepartmentById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const updatedDepartmentResult = await departmentRepository.updateDepartment(id, input);

    return updatedDepartmentResult.map((updatedDepartment) => {
      return enrichEntityWithEditableStatus(updatedDepartment, loggedUser);
    });
  };

  const deleteDepartment = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Department | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await departmentRepository.findDepartmentById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const deletedDepartment = await departmentRepository.deleteDepartmentById(id);
    return ok(deletedDepartment ? enrichEntityWithEditableStatus(deletedDepartment, loggedUser) : null);
  };

  const createDepartments = async (
    departments: Omit<DepartmentCreateInput, "ownerId">[],
    loggedUser: LoggedUser,
  ): Promise<readonly Department[]> => {
    const createdDepartments = await departmentRepository.createDepartments(
      departments.map((department) => {
        return { ...department, ownerId: loggedUser.id };
      }),
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
