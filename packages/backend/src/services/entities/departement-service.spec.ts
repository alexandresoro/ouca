import { OucaError } from "@domain/errors/ouca-error.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type DepartmentsSearchParams, type UpsertDepartmentInput } from "@ou-ca/common/api/department";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { mock } from "vitest-mock-extended";
import { type CommuneRepository } from "../../repositories/commune/commune-repository.js";
import {
  type Departement,
  type DepartementCreateInput,
} from "../../repositories/departement/departement-repository-types.js";
import { type DepartementRepository } from "../../repositories/departement/departement-repository.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type LieuditRepository } from "../../repositories/lieudit/lieudit-repository.js";
import { mockVi } from "../../utils/mock.js";
import { buildDepartementService } from "./departement-service.js";

const departmentRepository = mockVi<DepartementRepository>();
const townRepository = mockVi<CommuneRepository>();
const localityRepository = mockVi<LieuditRepository>();
const entryRepository = mockVi<DonneeRepository>();

const departementService = buildDepartementService({
  departmentRepository,
  townRepository,
  localityRepository,
  entryRepository,
});

const uniqueConstraintFailedError = new UniqueIntegrityConstraintViolationError(
  new Error("errorMessage"),
  "constraint"
);

const uniqueConstraintFailed = () => {
  throw uniqueConstraintFailedError;
};

describe("Find department", () => {
  test("should handle a matching department", async () => {
    const departmentData = mock<Departement>();
    const loggedUser = mock<LoggedUser>();

    departmentRepository.findDepartementById.mockResolvedValueOnce(departmentData);

    await departementService.findDepartement(12, loggedUser);

    expect(departmentRepository.findDepartementById).toHaveBeenCalledTimes(1);
    expect(departmentRepository.findDepartementById).toHaveBeenLastCalledWith(12);
  });

  test("should handle department not found", async () => {
    departmentRepository.findDepartementById.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(departementService.findDepartement(10, loggedUser)).resolves.toBe(null);

    expect(departmentRepository.findDepartementById).toHaveBeenCalledTimes(1);
    expect(departmentRepository.findDepartementById).toHaveBeenLastCalledWith(10);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(departementService.findDepartement(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(departmentRepository.findDepartementById).not.toHaveBeenCalled();
  });
});

describe("Cities count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await departementService.getCommunesCountByDepartement("12", loggedUser);

    expect(townRepository.getCountByDepartementId).toHaveBeenCalledTimes(1);
    expect(townRepository.getCountByDepartementId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(departementService.getCommunesCountByDepartement("12", null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
  });
});

describe("Localities count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await departementService.getLieuxDitsCountByDepartement("12", loggedUser);

    expect(localityRepository.getCountByDepartementId).toHaveBeenCalledTimes(1);
    expect(localityRepository.getCountByDepartementId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(departementService.getLieuxDitsCountByDepartement("12", null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await departementService.getDonneesCountByDepartement("12", loggedUser);

    expect(entryRepository.getCountByDepartementId).toHaveBeenCalledTimes(1);
    expect(entryRepository.getCountByDepartementId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(departementService.getDonneesCountByDepartement("12", null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
  });
});

describe("Find department by city ID", () => {
  test("should handle a found department", async () => {
    const departmentData = mock<Departement>({
      id: "256",
    });
    const loggedUser = mock<LoggedUser>();

    departmentRepository.findDepartementByCommuneId.mockResolvedValueOnce(departmentData);

    const department = await departementService.findDepartementOfCommuneId("43", loggedUser);

    expect(departmentRepository.findDepartementByCommuneId).toHaveBeenCalledTimes(1);
    expect(departmentRepository.findDepartementByCommuneId).toHaveBeenLastCalledWith(43);
    expect(department?.id).toEqual("256");
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(departementService.findDepartementOfCommuneId("12", null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all departments", async () => {
  const departementsData = [mock<Departement>(), mock<Departement>(), mock<Departement>()];

  departmentRepository.findDepartements.mockResolvedValueOnce(departementsData);

  await departementService.findAllDepartements();

  expect(departmentRepository.findDepartements).toHaveBeenCalledTimes(1);
  expect(departmentRepository.findDepartements).toHaveBeenLastCalledWith({
    orderBy: "code",
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const departementsData = [mock<Departement>(), mock<Departement>(), mock<Departement>()];
    const loggedUser = mock<LoggedUser>();

    departmentRepository.findDepartements.mockResolvedValueOnce(departementsData);

    await departementService.findPaginatedDepartements(loggedUser, {});

    expect(departmentRepository.findDepartements).toHaveBeenCalledTimes(1);
    expect(departmentRepository.findDepartements).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated departments ", async () => {
    const departementsData = [mock<Departement>(), mock<Departement>(), mock<Departement>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: DepartmentsSearchParams = {
      orderBy: "code",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    departmentRepository.findDepartements.mockResolvedValueOnce([departementsData[0]]);

    await departementService.findPaginatedDepartements(loggedUser, searchParams);

    expect(departmentRepository.findDepartements).toHaveBeenCalledTimes(1);
    expect(departmentRepository.findDepartements).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: "code",
      sortOrder: "desc",
      offset: 0,
      limit: searchParams.pageSize,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(departementService.findPaginatedDepartements(null, {})).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await departementService.getDepartementsCount(loggedUser);

    expect(departmentRepository.getCount).toHaveBeenCalledTimes(1);
    expect(departmentRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await departementService.getDepartementsCount(loggedUser, "test");

    expect(departmentRepository.getCount).toHaveBeenCalledTimes(1);
    expect(departmentRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(departementService.getDepartementsCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of a department", () => {
  test("should be allowed when requested by an admin", async () => {
    const departmentData = mock<UpsertDepartmentInput>();

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    await departementService.updateDepartement(12, departmentData, loggedUser);

    expect(departmentRepository.updateDepartement).toHaveBeenCalledTimes(1);
    expect(departmentRepository.updateDepartement).toHaveBeenLastCalledWith(12, departmentData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = mock<Departement>({
      ownerId: "notAdmin",
    });

    const departmentData = mock<UpsertDepartmentInput>();

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    departmentRepository.findDepartementById.mockResolvedValueOnce(existingData);

    await departementService.updateDepartement(12, departmentData, loggedUser);

    expect(departmentRepository.updateDepartement).toHaveBeenCalledTimes(1);
    expect(departmentRepository.updateDepartement).toHaveBeenLastCalledWith(12, departmentData);
  });

  test("should throw an error when requested by an user that is nor owner nor admin", async () => {
    const existingData = mock<Departement>({
      ownerId: "notAdmin",
    });

    const departmentData = mock<UpsertDepartmentInput>();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    departmentRepository.findDepartementById.mockResolvedValueOnce(existingData);

    await expect(departementService.updateDepartement(12, departmentData, user)).rejects.toThrowError(
      new OucaError("OUCA0001")
    );

    expect(departmentRepository.updateDepartement).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to a department that exists", async () => {
    const departmentData = mock<UpsertDepartmentInput>();

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    departmentRepository.updateDepartement.mockImplementation(uniqueConstraintFailed);

    await expect(() => departementService.updateDepartement(12, departmentData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(departmentRepository.updateDepartement).toHaveBeenCalledTimes(1);
    expect(departmentRepository.updateDepartement).toHaveBeenLastCalledWith(12, departmentData);
  });

  test("should throw an error when the requester is not logged", async () => {
    const departmentData = mock<UpsertDepartmentInput>();

    await expect(departementService.updateDepartement(12, departmentData, null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
    expect(departmentRepository.updateDepartement).not.toHaveBeenCalled();
  });
});

describe("Creation of a department", () => {
  test("should create new department", async () => {
    const departmentData = mock<UpsertDepartmentInput>();

    const loggedUser = mock<LoggedUser>({ id: "a" });

    await departementService.createDepartement(departmentData, loggedUser);

    expect(departmentRepository.createDepartement).toHaveBeenCalledTimes(1);
    expect(departmentRepository.createDepartement).toHaveBeenLastCalledWith({
      ...departmentData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when trying to create a department that already exists", async () => {
    const departmentData = mock<UpsertDepartmentInput>();

    const loggedUser = mock<LoggedUser>({ id: "a" });

    departmentRepository.createDepartement.mockImplementation(uniqueConstraintFailed);

    await expect(() => departementService.createDepartement(departmentData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(departmentRepository.createDepartement).toHaveBeenCalledTimes(1);
    expect(departmentRepository.createDepartement).toHaveBeenLastCalledWith({
      ...departmentData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const departmentData = mock<UpsertDepartmentInput>();

    await expect(departementService.createDepartement(departmentData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(departmentRepository.createDepartement).not.toHaveBeenCalled();
  });
});

describe("Deletion of a department", () => {
  test("hould handle the deletion of an owned department", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const department = mock<Departement>({
      ownerId: loggedUser.id,
    });

    departmentRepository.findDepartementById.mockResolvedValueOnce(department);

    await departementService.deleteDepartement(11, loggedUser);

    expect(departmentRepository.deleteDepartementById).toHaveBeenCalledTimes(1);
    expect(departmentRepository.deleteDepartementById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any department if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "admin",
    });

    departmentRepository.findDepartementById.mockResolvedValueOnce(mock<Departement>());

    await departementService.deleteDepartement(11, loggedUser);

    expect(departmentRepository.deleteDepartementById).toHaveBeenCalledTimes(1);
    expect(departmentRepository.deleteDepartementById).toHaveBeenLastCalledWith(11);
  });

  test("should return an error when deleting a non-owned department as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "contributor",
    });

    departmentRepository.findDepartementById.mockResolvedValueOnce(mock<Departement>());

    await expect(departementService.deleteDepartement(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(departmentRepository.deleteDepartementById).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(departementService.deleteDepartement(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(departmentRepository.deleteDepartementById).not.toHaveBeenCalled();
  });
});

test("Create multiple departments", async () => {
  const departmentsData = [
    mock<Omit<DepartementCreateInput, "owner_id">>(),
    mock<Omit<DepartementCreateInput, "owner_id">>(),
    mock<Omit<DepartementCreateInput, "owner_id">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  departmentRepository.createDepartements.mockResolvedValueOnce([]);

  await departementService.createDepartements(departmentsData, loggedUser);

  expect(departmentRepository.createDepartements).toHaveBeenCalledTimes(1);
  expect(departmentRepository.createDepartements).toHaveBeenLastCalledWith(
    departmentsData.map((department) => {
      return {
        ...department,
        owner_id: loggedUser.id,
      };
    })
  );
});
