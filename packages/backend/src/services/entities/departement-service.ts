import { type DepartmentsSearchParams, type UpsertDepartmentInput } from "@ou-ca/common/api/department";
import { type Department } from "@ou-ca/common/entities/department";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type CommuneRepository } from "../../repositories/commune/commune-repository.js";
import { type DepartementCreateInput } from "../../repositories/departement/departement-repository-types.js";
import { type DepartementRepository } from "../../repositories/departement/departement-repository.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type LieuditRepository } from "../../repositories/lieudit/lieudit-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { COLUMN_CODE } from "../../utils/constants.js";
import { OucaError } from "../../utils/errors.js";
import { validateAuthorization } from "./authorization-utils.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "./entities-utils.js";

type DepartementServiceDependencies = {
  logger: Logger;
  departementRepository: DepartementRepository;
  communeRepository: CommuneRepository;
  lieuditRepository: LieuditRepository;
  donneeRepository: DonneeRepository;
};

export const buildDepartementService = ({
  departementRepository,
  communeRepository,
  lieuditRepository,
  donneeRepository,
}: DepartementServiceDependencies) => {
  const findDepartement = async (id: number, loggedUser: LoggedUser | null): Promise<Department | null> => {
    validateAuthorization(loggedUser);

    const department = await departementRepository.findDepartementById(id);
    return enrichEntityWithEditableStatus(department, loggedUser);
  };

  const getDonneesCountByDepartement = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return donneeRepository.getCountByDepartementId(parseInt(id));
  };

  const getLieuxDitsCountByDepartement = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return lieuditRepository.getCountByDepartementId(parseInt(id));
  };

  const getCommunesCountByDepartement = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return communeRepository.getCountByDepartementId(parseInt(id));
  };

  const findDepartementOfCommuneId = async (
    communeId: number | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Department | null> => {
    validateAuthorization(loggedUser);

    const department = await departementRepository.findDepartementByCommuneId(communeId);
    return enrichEntityWithEditableStatus(department, loggedUser);
  };

  const findAllDepartements = async (): Promise<Department[]> => {
    const departements = await departementRepository.findDepartements({
      orderBy: COLUMN_CODE,
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

    const departements = await departementRepository.findDepartements({
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

    return departementRepository.getCount(q);
  };

  const createDepartement = async (
    input: UpsertDepartmentInput,
    loggedUser: LoggedUser | null
  ): Promise<Department> => {
    validateAuthorization(loggedUser);

    try {
      const createdDepartement = await departementRepository.createDepartement({
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
      const existingData = await departementRepository.findDepartementById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      const updatedDepartement = await departementRepository.updateDepartement(id, input);

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
      const existingData = await departementRepository.findDepartementById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    const deletedDepartment = await departementRepository.deleteDepartementById(id);
    return enrichEntityWithEditableStatus(deletedDepartment, loggedUser);
  };

  const createDepartements = async (
    departements: Omit<DepartementCreateInput, "owner_id">[],
    loggedUser: LoggedUser
  ): Promise<readonly Department[]> => {
    const createdDepartments = await departementRepository.createDepartements(
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
