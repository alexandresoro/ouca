import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { mock } from "vitest-mock-extended";
import {
  DepartementsOrderBy,
  SortOrder,
  type MutationUpsertDepartementArgs,
  type QueryDepartementsArgs,
} from "../../graphql/generated/graphql-types.js";
import { type CommuneRepository } from "../../repositories/commune/commune-repository.js";
import {
  type Departement,
  type DepartementCreateInput,
} from "../../repositories/departement/departement-repository-types.js";
import { type DepartementRepository } from "../../repositories/departement/departement-repository.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type LieuditRepository } from "../../repositories/lieudit/lieudit-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { COLUMN_CODE } from "../../utils/constants.js";
import { OucaError } from "../../utils/errors.js";
import { buildDepartementService } from "./departement-service.js";

const departementRepository = mock<DepartementRepository>({});
const communeRepository = mock<CommuneRepository>({});
const lieuditRepository = mock<LieuditRepository>({});
const donneeRepository = mock<DonneeRepository>({});
const logger = mock<Logger>();

const departementService = buildDepartementService({
  logger,
  departementRepository,
  communeRepository,
  lieuditRepository,
  donneeRepository,
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

    departementRepository.findDepartementById.mockResolvedValueOnce(departmentData);

    await departementService.findDepartement(departmentData.id, loggedUser);

    expect(departementRepository.findDepartementById).toHaveBeenCalledTimes(1);
    expect(departementRepository.findDepartementById).toHaveBeenLastCalledWith(departmentData.id);
  });

  test("should handle department not found", async () => {
    departementRepository.findDepartementById.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(departementService.findDepartement(10, loggedUser)).resolves.toBe(null);

    expect(departementRepository.findDepartementById).toHaveBeenCalledTimes(1);
    expect(departementRepository.findDepartementById).toHaveBeenLastCalledWith(10);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(departementService.findDepartement(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(departementRepository.findDepartementById).not.toHaveBeenCalled();
  });
});

describe("Cities count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await departementService.getCommunesCountByDepartement(12, loggedUser);

    expect(communeRepository.getCountByDepartementId).toHaveBeenCalledTimes(1);
    expect(communeRepository.getCountByDepartementId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(departementService.getCommunesCountByDepartement(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Localities count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await departementService.getLieuxDitsCountByDepartement(12, loggedUser);

    expect(lieuditRepository.getCountByDepartementId).toHaveBeenCalledTimes(1);
    expect(lieuditRepository.getCountByDepartementId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(departementService.getLieuxDitsCountByDepartement(12, null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await departementService.getDonneesCountByDepartement(12, loggedUser);

    expect(donneeRepository.getCountByDepartementId).toHaveBeenCalledTimes(1);
    expect(donneeRepository.getCountByDepartementId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(departementService.getDonneesCountByDepartement(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Find department by city ID", () => {
  test("should handle a found department", async () => {
    const departmentData = mock<Departement>({
      id: 256,
    });
    const loggedUser = mock<LoggedUser>();

    departementRepository.findDepartementByCommuneId.mockResolvedValueOnce(departmentData);

    const department = await departementService.findDepartementOfCommuneId(43, loggedUser);

    expect(departementRepository.findDepartementByCommuneId).toHaveBeenCalledTimes(1);
    expect(departementRepository.findDepartementByCommuneId).toHaveBeenLastCalledWith(43);
    expect(department?.id).toEqual(256);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(departementService.findDepartementOfCommuneId(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all departments", async () => {
  const departementsData = [mock<Departement>(), mock<Departement>(), mock<Departement>()];

  departementRepository.findDepartements.mockResolvedValueOnce(departementsData);

  await departementService.findAllDepartements();

  expect(departementRepository.findDepartements).toHaveBeenCalledTimes(1);
  expect(departementRepository.findDepartements).toHaveBeenLastCalledWith({
    orderBy: COLUMN_CODE,
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const departementsData = [mock<Departement>(), mock<Departement>(), mock<Departement>()];
    const loggedUser = mock<LoggedUser>();

    departementRepository.findDepartements.mockResolvedValueOnce(departementsData);

    await departementService.findPaginatedDepartements(loggedUser);

    expect(departementRepository.findDepartements).toHaveBeenCalledTimes(1);
    expect(departementRepository.findDepartements).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated departments ", async () => {
    const departementsData = [mock<Departement>(), mock<Departement>(), mock<Departement>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: QueryDepartementsArgs = {
      orderBy: DepartementsOrderBy.Code,
      sortOrder: SortOrder.Desc,
      searchParams: {
        q: "Bob",
        pageNumber: 0,
        pageSize: 10,
      },
    };

    departementRepository.findDepartements.mockResolvedValueOnce([departementsData[0]]);

    await departementService.findPaginatedDepartements(loggedUser, searchParams);

    expect(departementRepository.findDepartements).toHaveBeenCalledTimes(1);
    expect(departementRepository.findDepartements).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: COLUMN_CODE,
      sortOrder: SortOrder.Desc,
      offset: searchParams.searchParams?.pageNumber,
      limit: searchParams.searchParams?.pageSize,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(departementService.findPaginatedDepartements(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await departementService.getDepartementsCount(loggedUser);

    expect(departementRepository.getCount).toHaveBeenCalledTimes(1);
    expect(departementRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await departementService.getDepartementsCount(loggedUser, "test");

    expect(departementRepository.getCount).toHaveBeenCalledTimes(1);
    expect(departementRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(departementService.getDepartementsCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of a department", () => {
  test("should be allowed when requested by an admin", async () => {
    const departmentData = mock<MutationUpsertDepartementArgs>();

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    await departementService.upsertDepartement(departmentData, loggedUser);

    expect(departementRepository.updateDepartement).toHaveBeenCalledTimes(1);
    expect(departementRepository.updateDepartement).toHaveBeenLastCalledWith(departmentData.id, departmentData.data);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = mock<Departement>({
      ownerId: "notAdmin",
    });

    const departmentData = mock<MutationUpsertDepartementArgs>();

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    departementRepository.findDepartementById.mockResolvedValueOnce(existingData);

    await departementService.upsertDepartement(departmentData, loggedUser);

    expect(departementRepository.updateDepartement).toHaveBeenCalledTimes(1);
    expect(departementRepository.updateDepartement).toHaveBeenLastCalledWith(departmentData.id, departmentData.data);
  });

  test("should throw an error when requested by an user that is nor owner nor admin", async () => {
    const existingData = mock<Departement>({
      ownerId: "notAdmin",
    });

    const departmentData = mock<MutationUpsertDepartementArgs>();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    departementRepository.findDepartementById.mockResolvedValueOnce(existingData);

    await expect(departementService.upsertDepartement(departmentData, user)).rejects.toThrowError(
      new OucaError("OUCA0001")
    );

    expect(departementRepository.updateDepartement).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to a department that exists", async () => {
    const departmentData = mock<MutationUpsertDepartementArgs>({
      id: 12,
    });

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    departementRepository.updateDepartement.mockImplementation(uniqueConstraintFailed);

    await expect(() => departementService.upsertDepartement(departmentData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(departementRepository.updateDepartement).toHaveBeenCalledTimes(1);
    expect(departementRepository.updateDepartement).toHaveBeenLastCalledWith(departmentData.id, departmentData.data);
  });

  test("should throw an error when the requester is not logged", async () => {
    const departmentData = mock<MutationUpsertDepartementArgs>({
      id: 12,
    });

    await expect(departementService.upsertDepartement(departmentData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(departementRepository.updateDepartement).not.toHaveBeenCalled();
  });
});

describe("Creation of a department", () => {
  test("should create new department", async () => {
    const departmentData = mock<MutationUpsertDepartementArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    await departementService.upsertDepartement(departmentData, loggedUser);

    expect(departementRepository.createDepartement).toHaveBeenCalledTimes(1);
    expect(departementRepository.createDepartement).toHaveBeenLastCalledWith({
      ...departmentData.data,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when trying to create a department that already exists", async () => {
    const departmentData = mock<MutationUpsertDepartementArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    departementRepository.createDepartement.mockImplementation(uniqueConstraintFailed);

    await expect(() => departementService.upsertDepartement(departmentData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(departementRepository.createDepartement).toHaveBeenCalledTimes(1);
    expect(departementRepository.createDepartement).toHaveBeenLastCalledWith({
      ...departmentData.data,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const departmentData = mock<MutationUpsertDepartementArgs>({
      id: undefined,
    });

    await expect(departementService.upsertDepartement(departmentData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(departementRepository.createDepartement).not.toHaveBeenCalled();
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

    departementRepository.findDepartementById.mockResolvedValueOnce(department);

    await departementService.deleteDepartement(11, loggedUser);

    expect(departementRepository.deleteDepartementById).toHaveBeenCalledTimes(1);
    expect(departementRepository.deleteDepartementById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any department if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "admin",
    });

    departementRepository.findDepartementById.mockResolvedValueOnce(mock<Departement>());

    await departementService.deleteDepartement(11, loggedUser);

    expect(departementRepository.deleteDepartementById).toHaveBeenCalledTimes(1);
    expect(departementRepository.deleteDepartementById).toHaveBeenLastCalledWith(11);
  });

  test("should return an error when deleting a non-owned department as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "contributor",
    });

    departementRepository.findDepartementById.mockResolvedValueOnce(mock<Departement>());

    await expect(departementService.deleteDepartement(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(departementRepository.deleteDepartementById).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(departementService.deleteDepartement(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(departementRepository.deleteDepartementById).not.toHaveBeenCalled();
  });
});

test("Create multiple departments", async () => {
  const departmentsData = [
    mock<Omit<DepartementCreateInput, "owner_id">>(),
    mock<Omit<DepartementCreateInput, "owner_id">>(),
    mock<Omit<DepartementCreateInput, "owner_id">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  await departementService.createDepartements(departmentsData, loggedUser);

  expect(departementRepository.createDepartements).toHaveBeenCalledTimes(1);
  expect(departementRepository.createDepartements).toHaveBeenLastCalledWith(
    departmentsData.map((department) => {
      return {
        ...department,
        owner_id: loggedUser.id,
      };
    })
  );
});
