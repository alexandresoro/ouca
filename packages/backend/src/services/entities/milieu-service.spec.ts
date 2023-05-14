import { type UpsertEnvironmentInput } from "@ou-ca/common/api/environment";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { mock } from "vitest-mock-extended";
import { MilieuxOrderBy, SortOrder, type QueryMilieuxArgs } from "../../graphql/generated/graphql-types.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type Milieu, type MilieuCreateInput } from "../../repositories/milieu/milieu-repository-types.js";
import { type MilieuRepository } from "../../repositories/milieu/milieu-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { COLUMN_LIBELLE } from "../../utils/constants.js";
import { OucaError } from "../../utils/errors.js";
import { buildMilieuService } from "./milieu-service.js";

const milieuRepository = mock<MilieuRepository>({});
const donneeRepository = mock<DonneeRepository>({});
const logger = mock<Logger>();

const milieuService = buildMilieuService({
  logger,
  milieuRepository,
  donneeRepository,
});

const uniqueConstraintFailedError = new UniqueIntegrityConstraintViolationError(
  new Error("errorMessage"),
  "constraint"
);

const uniqueConstraintFailed = () => {
  throw uniqueConstraintFailedError;
};

describe("Find environment", () => {
  test("should handle a matching environment", async () => {
    const environmentData = mock<Milieu>();
    const loggedUser = mock<LoggedUser>();

    milieuRepository.findMilieuById.mockResolvedValueOnce(environmentData);

    await milieuService.findMilieu(environmentData.id, loggedUser);

    expect(milieuRepository.findMilieuById).toHaveBeenCalledTimes(1);
    expect(milieuRepository.findMilieuById).toHaveBeenLastCalledWith(environmentData.id);
  });

  test("should handle environment not found", async () => {
    milieuRepository.findMilieuById.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(milieuService.findMilieu(10, loggedUser)).resolves.toBe(null);

    expect(milieuRepository.findMilieuById).toHaveBeenCalledTimes(1);
    expect(milieuRepository.findMilieuById).toHaveBeenLastCalledWith(10);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(milieuService.findMilieu(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(milieuRepository.findMilieuById).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await milieuService.getDonneesCountByMilieu(12, loggedUser);

    expect(donneeRepository.getCountByMilieuId).toHaveBeenCalledTimes(1);
    expect(donneeRepository.getCountByMilieuId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(milieuService.getDonneesCountByMilieu(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Find environments by inventary ID", () => {
  test("should handle environments found", async () => {
    const environmentsData = [mock<Milieu>(), mock<Milieu>(), mock<Milieu>()];
    const loggedUser = mock<LoggedUser>();

    milieuRepository.findMilieuxOfDonneeId.mockResolvedValueOnce(environmentsData);

    const environments = await milieuService.findMilieuxOfDonneeId(43, loggedUser);

    expect(milieuRepository.findMilieuxOfDonneeId).toHaveBeenCalledTimes(1);
    expect(milieuRepository.findMilieuxOfDonneeId).toHaveBeenLastCalledWith(43);
    expect(environments).toEqual(environmentsData);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(milieuService.findMilieuxOfDonneeId(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all environments", async () => {
  const environmentsData = [mock<Milieu>(), mock<Milieu>(), mock<Milieu>()];

  milieuRepository.findMilieux.mockResolvedValueOnce(environmentsData);

  await milieuService.findAllMilieux();

  expect(milieuRepository.findMilieux).toHaveBeenCalledTimes(1);
  expect(milieuRepository.findMilieux).toHaveBeenLastCalledWith({
    orderBy: COLUMN_LIBELLE,
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const environmentsData = [mock<Milieu>(), mock<Milieu>(), mock<Milieu>()];
    const loggedUser = mock<LoggedUser>();

    milieuRepository.findMilieux.mockResolvedValueOnce(environmentsData);

    await milieuService.findPaginatedMilieux(loggedUser);

    expect(milieuRepository.findMilieux).toHaveBeenCalledTimes(1);
    expect(milieuRepository.findMilieux).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated environments ", async () => {
    const environmentsData = [mock<Milieu>(), mock<Milieu>(), mock<Milieu>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: QueryMilieuxArgs = {
      orderBy: MilieuxOrderBy.Libelle,
      sortOrder: SortOrder.Desc,
      searchParams: {
        q: "Bob",
        pageNumber: 0,
        pageSize: 10,
      },
    };

    milieuRepository.findMilieux.mockResolvedValueOnce([environmentsData[0]]);

    await milieuService.findPaginatedMilieux(loggedUser, searchParams);

    expect(milieuRepository.findMilieux).toHaveBeenCalledTimes(1);
    expect(milieuRepository.findMilieux).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: COLUMN_LIBELLE,
      sortOrder: SortOrder.Desc,
      offset: searchParams.searchParams?.pageNumber,
      limit: searchParams.searchParams?.pageSize,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(milieuService.findPaginatedMilieux(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await milieuService.getMilieuxCount(loggedUser);

    expect(milieuRepository.getCount).toHaveBeenCalledTimes(1);
    expect(milieuRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await milieuService.getMilieuxCount(loggedUser, "test");

    expect(milieuRepository.getCount).toHaveBeenCalledTimes(1);
    expect(milieuRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(milieuService.getMilieuxCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of an environment", () => {
  test("should be allowed when requested by an admin", async () => {
    const environmentData = mock<UpsertEnvironmentInput>();

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    await milieuService.updateMilieu(12, environmentData, loggedUser);

    expect(milieuRepository.updateMilieu).toHaveBeenCalledTimes(1);
    expect(milieuRepository.updateMilieu).toHaveBeenLastCalledWith(12, environmentData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = mock<Milieu>({
      ownerId: "notAdmin",
    });

    const environmentData = mock<UpsertEnvironmentInput>();

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    milieuRepository.findMilieuById.mockResolvedValueOnce(existingData);

    await milieuService.updateMilieu(12, environmentData, loggedUser);

    expect(milieuRepository.updateMilieu).toHaveBeenCalledTimes(1);
    expect(milieuRepository.updateMilieu).toHaveBeenLastCalledWith(12, environmentData);
  });

  test("should throw an error when requested by an user that is nor owner nor admin", async () => {
    const existingData = mock<Milieu>({
      ownerId: "notAdmin",
    });

    const environmentData = mock<UpsertEnvironmentInput>();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    milieuRepository.findMilieuById.mockResolvedValueOnce(existingData);

    await expect(milieuService.updateMilieu(12, environmentData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

    expect(milieuRepository.updateMilieu).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to an environment that exists", async () => {
    const environmentData = mock<UpsertEnvironmentInput>();

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    milieuRepository.updateMilieu.mockImplementation(uniqueConstraintFailed);

    await expect(() => milieuService.updateMilieu(12, environmentData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(milieuRepository.updateMilieu).toHaveBeenCalledTimes(1);
    expect(milieuRepository.updateMilieu).toHaveBeenLastCalledWith(12, environmentData);
  });

  test("should throw an error when the requester is not logged", async () => {
    const environmentData = mock<UpsertEnvironmentInput>();

    await expect(milieuService.updateMilieu(12, environmentData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(milieuRepository.updateMilieu).not.toHaveBeenCalled();
  });
});

describe("Creation of an environment", () => {
  test("should create new environment", async () => {
    const environmentData = mock<UpsertEnvironmentInput>();

    const loggedUser = mock<LoggedUser>({ id: "a" });

    await milieuService.createMilieu(environmentData, loggedUser);

    expect(milieuRepository.createMilieu).toHaveBeenCalledTimes(1);
    expect(milieuRepository.createMilieu).toHaveBeenLastCalledWith({
      ...environmentData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when trying to create an environment that already exists", async () => {
    const environmentData = mock<UpsertEnvironmentInput>();

    const loggedUser = mock<LoggedUser>({ id: "a" });

    milieuRepository.createMilieu.mockImplementation(uniqueConstraintFailed);

    await expect(() => milieuService.createMilieu(environmentData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(milieuRepository.createMilieu).toHaveBeenCalledTimes(1);
    expect(milieuRepository.createMilieu).toHaveBeenLastCalledWith({
      ...environmentData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const environmentData = mock<UpsertEnvironmentInput>();

    await expect(milieuService.createMilieu(environmentData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(milieuRepository.createMilieu).not.toHaveBeenCalled();
  });
});

describe("Deletion of an environment", () => {
  test("should handle the deletion of an owned environment", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const environment = mock<Milieu>({
      ownerId: loggedUser.id,
    });

    milieuRepository.findMilieuById.mockResolvedValueOnce(environment);

    await milieuService.deleteMilieu(11, loggedUser);

    expect(milieuRepository.deleteMilieuById).toHaveBeenCalledTimes(1);
    expect(milieuRepository.deleteMilieuById).toHaveBeenLastCalledWith(11);
  });

  test("hould handle the deletion of any environment if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "admin",
    });

    milieuRepository.findMilieuById.mockResolvedValueOnce(mock<Milieu>());

    await milieuService.deleteMilieu(11, loggedUser);

    expect(milieuRepository.deleteMilieuById).toHaveBeenCalledTimes(1);
    expect(milieuRepository.deleteMilieuById).toHaveBeenLastCalledWith(11);
  });

  test("should return an error when deleting a non-owned environment as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "contributor",
    });

    milieuRepository.findMilieuById.mockResolvedValueOnce(mock<Milieu>());

    await expect(milieuService.deleteMilieu(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(milieuRepository.deleteMilieuById).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(milieuService.deleteMilieu(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(milieuRepository.deleteMilieuById).not.toHaveBeenCalled();
  });
});

test("Create multiple environments", async () => {
  const environmentsData = [
    mock<Omit<MilieuCreateInput, "owner_id">>(),
    mock<Omit<MilieuCreateInput, "owner_id">>(),
    mock<Omit<MilieuCreateInput, "owner_id">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  await milieuService.createMilieux(environmentsData, loggedUser);

  expect(milieuRepository.createMilieux).toHaveBeenCalledTimes(1);
  expect(milieuRepository.createMilieux).toHaveBeenLastCalledWith(
    environmentsData.map((environment) => {
      return {
        ...environment,
        owner_id: loggedUser.id,
      };
    })
  );
});
