import { OucaError } from "@domain/errors/ouca-error.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type DepartmentsSearchParams, type UpsertDepartmentInput } from "@ou-ca/common/api/department";
import { type Department } from "@ou-ca/common/api/entities/department";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { validateAuthorization } from "../../../application/services/authorization/authorization-utils.js";
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
  const findDepartment = async (id: number, loggedUser: LoggedUser | null): Promise<Department | null> => {
    validateAuthorization(loggedUser);

    const department = await departmentRepository.findDepartementById(id);
    return enrichEntityWithEditableStatus(department, loggedUser);
  };

  const getEntriesCountByDepartment = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return entryRepository.getCountByDepartementId(parseInt(id));
  };

  const getLocalitiesCountByDepartment = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return localityRepository.getCountByDepartementId(parseInt(id));
  };

  const getTownsCountByDepartment = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return townRepository.getCountByDepartementId(parseInt(id));
  };

  const findDepartmentOfTownId = async (
    communeId: string | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Department | null> => {
    validateAuthorization(loggedUser);

    const department = await departmentRepository.findDepartementByCommuneId(
      communeId ? parseInt(communeId) : undefined
    );
    return enrichEntityWithEditableStatus(department, loggedUser);
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
  ): Promise<Department[]> => {
    validateAuthorization(loggedUser);

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

    return [...enrichedDepartments];
  };

  const getDepartmentsCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return departmentRepository.getCount(q);
  };

  const createDepartment = async (input: UpsertDepartmentInput, loggedUser: LoggedUser | null): Promise<Department> => {
    validateAuthorization(loggedUser);

    try {
      const createdDepartment = await departmentRepository.createDepartement({
        ...input,
        owner_id: loggedUser.id,
      });

      return enrichEntityWithEditableStatus(createdDepartment, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const updateDepartment = async (
    id: number,
    input: UpsertDepartmentInput,
    loggedUser: LoggedUser | null
  ): Promise<Department> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await departmentRepository.findDepartementById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      const updatedDepartment = await departmentRepository.updateDepartement(id, input);

      return enrichEntityWithEditableStatus(updatedDepartment, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const deleteDepartment = async (id: number, loggedUser: LoggedUser | null): Promise<Department> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await departmentRepository.findDepartementById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    const deletedDepartment = await departmentRepository.deleteDepartementById(id);
    return enrichEntityWithEditableStatus(deletedDepartment, loggedUser);
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
