import { type Department } from "@domain/department/department.js";
import { OucaError } from "@domain/errors/ouca-error.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { type DepartmentsSearchParams, type UpsertDepartmentInput } from "@ou-ca/common/api/department";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { mock } from "vitest-mock-extended";
import { type CommuneRepository } from "../../../repositories/commune/commune-repository.js";
import { type DepartementCreateInput } from "../../../repositories/departement/departement-repository-types.js";
import { type DepartementRepository } from "../../../repositories/departement/departement-repository.js";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { type LieuditRepository } from "../../../repositories/lieudit/lieudit-repository.js";
import { mockVi } from "../../../utils/mock.js";
import { buildDepartmentService } from "./department-service.js";

const departmentRepository = mockVi<DepartementRepository>();
const townRepository = mockVi<CommuneRepository>();
const localityRepository = mockVi<LieuditRepository>();
const entryRepository = mockVi<DonneeRepository>();

const departmentService = buildDepartmentService({
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
    const departmentData = mock<Department>();
    const loggedUser = loggedUserFactory.build();

    departmentRepository.findDepartementById.mockResolvedValueOnce(departmentData);

    await departmentService.findDepartement(12, loggedUser);

    expect(departmentRepository.findDepartementById).toHaveBeenCalledTimes(1);
    expect(departmentRepository.findDepartementById).toHaveBeenLastCalledWith(12);
  });

  test("should handle department not found", async () => {
    departmentRepository.findDepartementById.mockResolvedValueOnce(null);
    const loggedUser = loggedUserFactory.build();

    await expect(departmentService.findDepartement(10, loggedUser)).resolves.toBe(null);

    expect(departmentRepository.findDepartementById).toHaveBeenCalledTimes(1);
    expect(departmentRepository.findDepartementById).toHaveBeenLastCalledWith(10);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(departmentService.findDepartement(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(departmentRepository.findDepartementById).not.toHaveBeenCalled();
  });
});

describe("Cities count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await departmentService.getCommunesCountByDepartement("12", loggedUser);

    expect(townRepository.getCountByDepartementId).toHaveBeenCalledTimes(1);
    expect(townRepository.getCountByDepartementId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(departmentService.getCommunesCountByDepartement("12", null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
  });
});

describe("Localities count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await departmentService.getLieuxDitsCountByDepartement("12", loggedUser);

    expect(localityRepository.getCountByDepartementId).toHaveBeenCalledTimes(1);
    expect(localityRepository.getCountByDepartementId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(departmentService.getLieuxDitsCountByDepartement("12", null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await departmentService.getDonneesCountByDepartement("12", loggedUser);

    expect(entryRepository.getCountByDepartementId).toHaveBeenCalledTimes(1);
    expect(entryRepository.getCountByDepartementId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(departmentService.getDonneesCountByDepartement("12", null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Find department by city ID", () => {
  test("should handle a found department", async () => {
    const departmentData = mock<Department>({
      id: "256",
    });
    const loggedUser = loggedUserFactory.build();

    departmentRepository.findDepartementByCommuneId.mockResolvedValueOnce(departmentData);

    const department = await departmentService.findDepartementOfCommuneId("43", loggedUser);

    expect(departmentRepository.findDepartementByCommuneId).toHaveBeenCalledTimes(1);
    expect(departmentRepository.findDepartementByCommuneId).toHaveBeenLastCalledWith(43);
    expect(department?.id).toEqual("256");
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(departmentService.findDepartementOfCommuneId("12", null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all departments", async () => {
  const departementsData = [mock<Department>(), mock<Department>(), mock<Department>()];

  departmentRepository.findDepartements.mockResolvedValueOnce(departementsData);

  await departmentService.findAllDepartements();

  expect(departmentRepository.findDepartements).toHaveBeenCalledTimes(1);
  expect(departmentRepository.findDepartements).toHaveBeenLastCalledWith({
    orderBy: "code",
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const departementsData = [mock<Department>(), mock<Department>(), mock<Department>()];
    const loggedUser = loggedUserFactory.build();

    departmentRepository.findDepartements.mockResolvedValueOnce(departementsData);

    await departmentService.findPaginatedDepartements(loggedUser, {});

    expect(departmentRepository.findDepartements).toHaveBeenCalledTimes(1);
    expect(departmentRepository.findDepartements).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated departments ", async () => {
    const departementsData = [mock<Department>(), mock<Department>(), mock<Department>()];
    const loggedUser = loggedUserFactory.build();

    const searchParams: DepartmentsSearchParams = {
      orderBy: "code",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    departmentRepository.findDepartements.mockResolvedValueOnce([departementsData[0]]);

    await departmentService.findPaginatedDepartements(loggedUser, searchParams);

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
    await expect(departmentService.findPaginatedDepartements(null, {})).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await departmentService.getDepartementsCount(loggedUser);

    expect(departmentRepository.getCount).toHaveBeenCalledTimes(1);
    expect(departmentRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await departmentService.getDepartementsCount(loggedUser, "test");

    expect(departmentRepository.getCount).toHaveBeenCalledTimes(1);
    expect(departmentRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(departmentService.getDepartementsCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of a department", () => {
  test("should be allowed when requested by an admin", async () => {
    const departmentData = mock<UpsertDepartmentInput>();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    await departmentService.updateDepartement(12, departmentData, loggedUser);

    expect(departmentRepository.updateDepartement).toHaveBeenCalledTimes(1);
    expect(departmentRepository.updateDepartement).toHaveBeenLastCalledWith(12, departmentData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = mock<Department>({
      ownerId: "notAdmin",
    });

    const departmentData = mock<UpsertDepartmentInput>();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    departmentRepository.findDepartementById.mockResolvedValueOnce(existingData);

    await departmentService.updateDepartement(12, departmentData, loggedUser);

    expect(departmentRepository.updateDepartement).toHaveBeenCalledTimes(1);
    expect(departmentRepository.updateDepartement).toHaveBeenLastCalledWith(12, departmentData);
  });

  test("should throw an error when requested by an user that is nor owner nor admin", async () => {
    const existingData = mock<Department>({
      ownerId: "notAdmin",
    });

    const departmentData = mock<UpsertDepartmentInput>();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    departmentRepository.findDepartementById.mockResolvedValueOnce(existingData);

    await expect(departmentService.updateDepartement(12, departmentData, user)).rejects.toThrowError(
      new OucaError("OUCA0001")
    );

    expect(departmentRepository.updateDepartement).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to a department that exists", async () => {
    const departmentData = mock<UpsertDepartmentInput>();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    departmentRepository.updateDepartement.mockImplementation(uniqueConstraintFailed);

    await expect(() => departmentService.updateDepartement(12, departmentData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(departmentRepository.updateDepartement).toHaveBeenCalledTimes(1);
    expect(departmentRepository.updateDepartement).toHaveBeenLastCalledWith(12, departmentData);
  });

  test("should throw an error when the requester is not logged", async () => {
    const departmentData = mock<UpsertDepartmentInput>();

    await expect(departmentService.updateDepartement(12, departmentData, null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
    expect(departmentRepository.updateDepartement).not.toHaveBeenCalled();
  });
});

describe("Creation of a department", () => {
  test("should create new department", async () => {
    const departmentData = mock<UpsertDepartmentInput>();

    const loggedUser = loggedUserFactory.build({ id: "a" });

    await departmentService.createDepartement(departmentData, loggedUser);

    expect(departmentRepository.createDepartement).toHaveBeenCalledTimes(1);
    expect(departmentRepository.createDepartement).toHaveBeenLastCalledWith({
      ...departmentData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when trying to create a department that already exists", async () => {
    const departmentData = mock<UpsertDepartmentInput>();

    const loggedUser = loggedUserFactory.build({ id: "a" });

    departmentRepository.createDepartement.mockImplementation(uniqueConstraintFailed);

    await expect(() => departmentService.createDepartement(departmentData, loggedUser)).rejects.toThrowError(
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

    await expect(departmentService.createDepartement(departmentData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(departmentRepository.createDepartement).not.toHaveBeenCalled();
  });
});

describe("Deletion of a department", () => {
  test("hould handle the deletion of an owned department", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const department = mock<Department>({
      ownerId: loggedUser.id,
    });

    departmentRepository.findDepartementById.mockResolvedValueOnce(department);

    await departmentService.deleteDepartement(11, loggedUser);

    expect(departmentRepository.deleteDepartementById).toHaveBeenCalledTimes(1);
    expect(departmentRepository.deleteDepartementById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any department if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    departmentRepository.findDepartementById.mockResolvedValueOnce(mock<Department>());

    await departmentService.deleteDepartement(11, loggedUser);

    expect(departmentRepository.deleteDepartementById).toHaveBeenCalledTimes(1);
    expect(departmentRepository.deleteDepartementById).toHaveBeenLastCalledWith(11);
  });

  test("should return an error when deleting a non-owned department as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "contributor",
    });

    departmentRepository.findDepartementById.mockResolvedValueOnce(mock<Department>());

    await expect(departmentService.deleteDepartement(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(departmentRepository.deleteDepartementById).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(departmentService.deleteDepartement(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(departmentRepository.deleteDepartementById).not.toHaveBeenCalled();
  });
});

test("Create multiple departments", async () => {
  const departmentsData = [
    mock<Omit<DepartementCreateInput, "owner_id">>(),
    mock<Omit<DepartementCreateInput, "owner_id">>(),
    mock<Omit<DepartementCreateInput, "owner_id">>(),
  ];

  const loggedUser = loggedUserFactory.build();

  departmentRepository.createDepartements.mockResolvedValueOnce([]);

  await departmentService.createDepartements(departmentsData, loggedUser);

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
