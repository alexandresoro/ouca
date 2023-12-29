import { OucaError } from "@domain/errors/ouca-error.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type DepartmentsSearchParams, type UpsertDepartmentInput } from "@ou-ca/common/api/department";
import { type Department } from "@ou-ca/common/api/entities/department";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { validateAuthorization } from "../../application/services/authorization/authorization-utils.js";
import { type CommuneRepository } from "../../repositories/commune/commune-repository.js";
import { type DepartementCreateInput } from "../../repositories/departement/departement-repository-types.js";
import { type DepartementRepository } from "../../repositories/departement/departement-repository.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type LieuditRepository } from "../../repositories/lieudit/lieudit-repository.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "./entities-utils.js";

type DepartementServiceDependencies = {
  departmentRepository: DepartementRepository;
  townRepository: CommuneRepository;
  localityRepository: LieuditRepository;
  entryRepository: DonneeRepository;
};

export const buildDepartementService = ({
  departmentRepository,
  townRepository,
  localityRepository,
  entryRepository,
}: DepartementServiceDependencies) => {
  const findDepartement = async (id: number, loggedUser: LoggedUser | null): Promise<Department | null> => {
    validateAuthorization(loggedUser);

    const department = await departmentRepository.findDepartementById(id);
    return enrichEntityWithEditableStatus(department, loggedUser);
  };

  const getDonneesCountByDepartement = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return entryRepository.getCountByDepartementId(parseInt(id));
  };

  const getLieuxDitsCountByDepartement = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return localityRepository.getCountByDepartementId(parseInt(id));
  };

  const getCommunesCountByDepartement = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return townRepository.getCountByDepartementId(parseInt(id));
  };

  const findDepartementOfCommuneId = async (
    communeId: string | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Department | null> => {
    validateAuthorization(loggedUser);

    const department = await departmentRepository.findDepartementByCommuneId(
      communeId ? parseInt(communeId) : undefined
    );
    return enrichEntityWithEditableStatus(department, loggedUser);
  };

  const findAllDepartements = async (): Promise<Department[]> => {
    const departements = await departmentRepository.findDepartements({
      orderBy: "code",
    });

    const enrichedDepartments = departements.map((department) => {
      return enrichEntityWithEditableStatus(department, null);
    });

    return [...enrichedDepartments];
  };

  const findPaginatedDepartements = async (
    loggedUser: LoggedUser | null,
    options: DepartmentsSearchParams
  ): Promise<Department[]> => {
    validateAuthorization(loggedUser);

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const departements = await departmentRepository.findDepartements({
      q,
      ...getSqlPagination(pagination),
      orderBy: orderByField,
      sortOrder,
    });

    const enrichedDepartments = departements.map((department) => {
      return enrichEntityWithEditableStatus(department, loggedUser);
    });

    return [...enrichedDepartments];
  };

  const getDepartementsCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return departmentRepository.getCount(q);
  };

  const createDepartement = async (
    input: UpsertDepartmentInput,
    loggedUser: LoggedUser | null
  ): Promise<Department> => {
    validateAuthorization(loggedUser);

    try {
      const createdDepartement = await departmentRepository.createDepartement({
        ...input,
        owner_id: loggedUser.id,
      });

      return enrichEntityWithEditableStatus(createdDepartement, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const updateDepartement = async (
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
      const updatedDepartement = await departmentRepository.updateDepartement(id, input);

      return enrichEntityWithEditableStatus(updatedDepartement, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const deleteDepartement = async (id: number, loggedUser: LoggedUser | null): Promise<Department> => {
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

  const createDepartements = async (
    departements: Omit<DepartementCreateInput, "owner_id">[],
    loggedUser: LoggedUser
  ): Promise<readonly Department[]> => {
    const createdDepartments = await departmentRepository.createDepartements(
      departements.map((departement) => {
        return { ...departement, owner_id: loggedUser.id };
      })
    );

    const enrichedCreatedDepartments = createdDepartments.map((department) => {
      return enrichEntityWithEditableStatus(department, loggedUser);
    });

    return enrichedCreatedDepartments;
  };

  return {
    findDepartement,
    getDonneesCountByDepartement,
    getLieuxDitsCountByDepartement,
    getCommunesCountByDepartement,
    findDepartementOfCommuneId,
    findAllDepartements,
    findPaginatedDepartements,
    getDepartementsCount,
    createDepartement,
    updateDepartement,
    deleteDepartement,
    createDepartements,
  };
};

export type DepartementService = ReturnType<typeof buildDepartementService>;
