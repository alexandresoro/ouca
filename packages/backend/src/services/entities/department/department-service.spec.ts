import { type LoggedUser } from "@domain/user/logged-user.js";
import { departmentFactory } from "@fixtures/domain/department/department.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertDepartmentInputFactory } from "@fixtures/services/department/department-service.fixtures.js";
import { type DepartmentsSearchParams } from "@ou-ca/common/api/department";
import { err, ok } from "neverthrow";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type CommuneRepository } from "../../../repositories/commune/commune-repository.js";
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
    const departmentData = departmentFactory.build();
    const loggedUser = loggedUserFactory.build();

    departmentRepository.findDepartementById.mockResolvedValueOnce(departmentData);

    await departmentService.findDepartment(12, loggedUser);

    expect(departmentRepository.findDepartementById).toHaveBeenCalledTimes(1);
    expect(departmentRepository.findDepartementById).toHaveBeenLastCalledWith(12);
  });

  test("should handle department not found", async () => {
    departmentRepository.findDepartementById.mockResolvedValueOnce(null);
    const loggedUser = loggedUserFactory.build();

    await expect(departmentService.findDepartment(10, loggedUser)).resolves.toEqual(ok(null));

    expect(departmentRepository.findDepartementById).toHaveBeenCalledTimes(1);
    expect(departmentRepository.findDepartementById).toHaveBeenLastCalledWith(10);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await departmentService.findDepartment(11, null);

    expect(findResult).toEqual(err("notAllowed"));
    expect(departmentRepository.findDepartementById).not.toHaveBeenCalled();
  });
});

describe("Cities count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await departmentService.getTownsCountByDepartment("12", loggedUser);

    expect(townRepository.getCountByDepartementId).toHaveBeenCalledTimes(1);
    expect(townRepository.getCountByDepartementId).toHaveBeenLastCalledWith(12);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const townsCountResult = await departmentService.getTownsCountByDepartment("12", null);

    expect(townsCountResult).toEqual(err("notAllowed"));
  });
});

describe("Localities count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await departmentService.getLocalitiesCountByDepartment("12", loggedUser);

    expect(localityRepository.getCountByDepartementId).toHaveBeenCalledTimes(1);
    expect(localityRepository.getCountByDepartementId).toHaveBeenLastCalledWith(12);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const localitiesCountResult = await departmentService.getLocalitiesCountByDepartment("12", null);

    expect(localitiesCountResult).toEqual(err("notAllowed"));
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await departmentService.getEntriesCountByDepartment("12", loggedUser);

    expect(entryRepository.getCountByDepartementId).toHaveBeenCalledTimes(1);
    expect(entryRepository.getCountByDepartementId).toHaveBeenLastCalledWith(12);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entriesCountResult = await departmentService.getEntriesCountByDepartment("12", null);

    expect(entriesCountResult).toEqual(err("notAllowed"));
  });
});

describe("Find department by city ID", () => {
  test("should handle a found department", async () => {
    const departmentData = departmentFactory.build({
      id: "256",
    });
    const loggedUser = loggedUserFactory.build();

    departmentRepository.findDepartementByCommuneId.mockResolvedValueOnce(departmentData);

    const departmentResult = await departmentService.findDepartmentOfTownId("43", loggedUser);

    expect(departmentRepository.findDepartementByCommuneId).toHaveBeenCalledTimes(1);
    expect(departmentRepository.findDepartementByCommuneId).toHaveBeenLastCalledWith(43);
    expect(departmentResult.isOk()).toBeTruthy();
    expect(departmentResult._unsafeUnwrap()?.id).toEqual("256");
  });

  test("should not be allowed when the requester is not logged", async () => {
    const findResult = await departmentService.findDepartmentOfTownId("12", null);

    expect(findResult).toEqual(err("notAllowed"));
  });
});

test("Find all departments", async () => {
  const departmentsData = departmentFactory.buildList(3);

  departmentRepository.findDepartements.mockResolvedValueOnce(departmentsData);

  await departmentService.findAllDepartments();

  expect(departmentRepository.findDepartements).toHaveBeenCalledTimes(1);
  expect(departmentRepository.findDepartements).toHaveBeenLastCalledWith({
    orderBy: "code",
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const departmentsData = departmentFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    departmentRepository.findDepartements.mockResolvedValueOnce(departmentsData);

    await departmentService.findPaginatedDepartments(loggedUser, {});

    expect(departmentRepository.findDepartements).toHaveBeenCalledTimes(1);
    expect(departmentRepository.findDepartements).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated departments", async () => {
    const departmentsData = departmentFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: DepartmentsSearchParams = {
      orderBy: "code",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    departmentRepository.findDepartements.mockResolvedValueOnce([departmentsData[0]]);

    await departmentService.findPaginatedDepartments(loggedUser, searchParams);

    expect(departmentRepository.findDepartements).toHaveBeenCalledTimes(1);
    expect(departmentRepository.findDepartements).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: "code",
      sortOrder: "desc",
      offset: 0,
      limit: searchParams.pageSize,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesPaginatedResult = await departmentService.findPaginatedDepartments(null, {});

    expect(entitiesPaginatedResult).toEqual(err("notAllowed"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await departmentService.getDepartmentsCount(loggedUser);

    expect(departmentRepository.getCount).toHaveBeenCalledTimes(1);
    expect(departmentRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await departmentService.getDepartmentsCount(loggedUser, "test");

    expect(departmentRepository.getCount).toHaveBeenCalledTimes(1);
    expect(departmentRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await departmentService.getDepartmentsCount(null);

    expect(entitiesCountResult).toEqual(err("notAllowed"));
  });
});

describe("Update of a department", () => {
  test("should be allowed when requested by an admin", async () => {
    const departmentData = upsertDepartmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    await departmentService.updateDepartment(12, departmentData, loggedUser);

    expect(departmentRepository.updateDepartement).toHaveBeenCalledTimes(1);
    expect(departmentRepository.updateDepartement).toHaveBeenLastCalledWith(12, departmentData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = departmentFactory.build({
      ownerId: "notAdmin",
    });

    const departmentData = upsertDepartmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    departmentRepository.findDepartementById.mockResolvedValueOnce(existingData);

    await departmentService.updateDepartment(12, departmentData, loggedUser);

    expect(departmentRepository.updateDepartement).toHaveBeenCalledTimes(1);
    expect(departmentRepository.updateDepartement).toHaveBeenLastCalledWith(12, departmentData);
  });

  test("should not be allowed when requested by an user that is nor owner nor admin", async () => {
    const existingData = departmentFactory.build({
      ownerId: "notAdmin",
    });

    const departmentData = upsertDepartmentInputFactory.build();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    departmentRepository.findDepartementById.mockResolvedValueOnce(existingData);

    const updateResult = await departmentService.updateDepartment(12, departmentData, user);

    expect(updateResult).toEqual(err("notAllowed"));
    expect(departmentRepository.updateDepartement).not.toHaveBeenCalled();
  });

  test("should not be allowed when trying to update to a department that exists", async () => {
    const departmentData = upsertDepartmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    departmentRepository.updateDepartement.mockImplementation(uniqueConstraintFailed);

    const updateResult = await departmentService.updateDepartment(12, departmentData, loggedUser);

    expect(updateResult).toEqual(err("alreadyExists"));
    expect(departmentRepository.updateDepartement).toHaveBeenCalledTimes(1);
    expect(departmentRepository.updateDepartement).toHaveBeenLastCalledWith(12, departmentData);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const departmentData = upsertDepartmentInputFactory.build();

    const updateResult = await departmentService.updateDepartment(12, departmentData, null);

    expect(updateResult).toEqual(err("notAllowed"));
    expect(departmentRepository.updateDepartement).not.toHaveBeenCalled();
  });
});

describe("Creation of a department", () => {
  test("should create new department", async () => {
    const departmentData = upsertDepartmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "a" });

    await departmentService.createDepartment(departmentData, loggedUser);

    expect(departmentRepository.createDepartement).toHaveBeenCalledTimes(1);
    expect(departmentRepository.createDepartement).toHaveBeenLastCalledWith({
      ...departmentData,
      owner_id: loggedUser.id,
    });
  });

  test("should not be allowed when trying to create a department that already exists", async () => {
    const departmentData = upsertDepartmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "a" });

    departmentRepository.createDepartement.mockImplementation(uniqueConstraintFailed);

    const createResult = await departmentService.createDepartment(departmentData, loggedUser);

    expect(createResult).toEqual(err("alreadyExists"));
    expect(departmentRepository.createDepartement).toHaveBeenCalledTimes(1);
    expect(departmentRepository.createDepartement).toHaveBeenLastCalledWith({
      ...departmentData,
      owner_id: loggedUser.id,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    const departmentData = upsertDepartmentInputFactory.build();

    const createResult = await departmentService.createDepartment(departmentData, null);

    expect(createResult).toEqual(err("notAllowed"));
    expect(departmentRepository.createDepartement).not.toHaveBeenCalled();
  });
});

describe("Deletion of a department", () => {
  test("hould handle the deletion of an owned department", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const department = departmentFactory.build({
      ownerId: loggedUser.id,
    });

    departmentRepository.findDepartementById.mockResolvedValueOnce(department);

    await departmentService.deleteDepartment(11, loggedUser);

    expect(departmentRepository.deleteDepartementById).toHaveBeenCalledTimes(1);
    expect(departmentRepository.deleteDepartementById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any department if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    departmentRepository.findDepartementById.mockResolvedValueOnce(departmentFactory.build());

    await departmentService.deleteDepartment(11, loggedUser);

    expect(departmentRepository.deleteDepartementById).toHaveBeenCalledTimes(1);
    expect(departmentRepository.deleteDepartementById).toHaveBeenLastCalledWith(11);
  });

  test("should not be allowed when deleting a non-owned department as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
    });

    const deleteResult = await departmentService.deleteDepartment(11, loggedUser);

    expect(deleteResult).toEqual(err("notAllowed"));
    expect(departmentRepository.deleteDepartementById).not.toHaveBeenCalled();
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await departmentService.deleteDepartment(11, null);

    expect(deleteResult).toEqual(err("notAllowed"));
    expect(departmentRepository.deleteDepartementById).not.toHaveBeenCalled();
  });
});

test("Create multiple departments", async () => {
  const departmentsData = upsertDepartmentInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  departmentRepository.createDepartements.mockResolvedValueOnce([]);

  await departmentService.createDepartments(departmentsData, loggedUser);

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
