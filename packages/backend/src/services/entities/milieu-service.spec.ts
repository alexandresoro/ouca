import { OucaError } from "@domain/errors/ouca-error.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type EnvironmentsSearchParams, type UpsertEnvironmentInput } from "@ou-ca/common/api/environment";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { mock } from "vitest-mock-extended";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type Milieu, type MilieuCreateInput } from "../../repositories/milieu/milieu-repository-types.js";
import { type MilieuRepository } from "../../repositories/milieu/milieu-repository.js";
import { mockVi } from "../../utils/mock.js";
import { buildMilieuService } from "./milieu-service.js";

const environmentRepository = mockVi<MilieuRepository>();
const entryRepository = mockVi<DonneeRepository>();

const milieuService = buildMilieuService({
  environmentRepository,
  entryRepository,
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

    environmentRepository.findMilieuById.mockResolvedValueOnce(environmentData);

    await milieuService.findMilieu(12, loggedUser);

    expect(environmentRepository.findMilieuById).toHaveBeenCalledTimes(1);
    expect(environmentRepository.findMilieuById).toHaveBeenLastCalledWith(12);
  });

  test("should handle environment not found", async () => {
    environmentRepository.findMilieuById.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(milieuService.findMilieu(10, loggedUser)).resolves.toBe(null);

    expect(environmentRepository.findMilieuById).toHaveBeenCalledTimes(1);
    expect(environmentRepository.findMilieuById).toHaveBeenLastCalledWith(10);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(milieuService.findMilieu(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(environmentRepository.findMilieuById).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await milieuService.getDonneesCountByMilieu("12", loggedUser);

    expect(entryRepository.getCountByMilieuId).toHaveBeenCalledTimes(1);
    expect(entryRepository.getCountByMilieuId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(milieuService.getDonneesCountByMilieu("12", null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Find environments by inventary ID", () => {
  test("should handle environments found", async () => {
    const environmentsData = [mock<Milieu>(), mock<Milieu>(), mock<Milieu>()];
    const loggedUser = mock<LoggedUser>();

    environmentRepository.findMilieuxOfDonneeId.mockResolvedValueOnce(environmentsData);

    const environments = await milieuService.findMilieuxOfDonneeId("43", loggedUser);

    expect(environmentRepository.findMilieuxOfDonneeId).toHaveBeenCalledTimes(1);
    expect(environmentRepository.findMilieuxOfDonneeId).toHaveBeenLastCalledWith(43);
    expect(environments.length).toEqual(environmentsData.length);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(milieuService.findMilieuxOfDonneeId("12", null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all environments", async () => {
  const environmentsData = [mock<Milieu>(), mock<Milieu>(), mock<Milieu>()];

  environmentRepository.findMilieux.mockResolvedValueOnce(environmentsData);

  await milieuService.findAllMilieux();

  expect(environmentRepository.findMilieux).toHaveBeenCalledTimes(1);
  expect(environmentRepository.findMilieux).toHaveBeenLastCalledWith({
    orderBy: "libelle",
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const environmentsData = [mock<Milieu>(), mock<Milieu>(), mock<Milieu>()];
    const loggedUser = mock<LoggedUser>();

    environmentRepository.findMilieux.mockResolvedValueOnce(environmentsData);

    await milieuService.findPaginatedMilieux(loggedUser, {});

    expect(environmentRepository.findMilieux).toHaveBeenCalledTimes(1);
    expect(environmentRepository.findMilieux).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated environments ", async () => {
    const environmentsData = [mock<Milieu>(), mock<Milieu>(), mock<Milieu>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: EnvironmentsSearchParams = {
      orderBy: "libelle",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    environmentRepository.findMilieux.mockResolvedValueOnce([environmentsData[0]]);

    await milieuService.findPaginatedMilieux(loggedUser, searchParams);

    expect(environmentRepository.findMilieux).toHaveBeenCalledTimes(1);
    expect(environmentRepository.findMilieux).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: "libelle",
      sortOrder: "desc",
      offset: 0,
      limit: searchParams.pageSize,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(milieuService.findPaginatedMilieux(null, {})).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await milieuService.getMilieuxCount(loggedUser);

    expect(environmentRepository.getCount).toHaveBeenCalledTimes(1);
    expect(environmentRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await milieuService.getMilieuxCount(loggedUser, "test");

    expect(environmentRepository.getCount).toHaveBeenCalledTimes(1);
    expect(environmentRepository.getCount).toHaveBeenLastCalledWith("test");
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

    expect(environmentRepository.updateMilieu).toHaveBeenCalledTimes(1);
    expect(environmentRepository.updateMilieu).toHaveBeenLastCalledWith(12, environmentData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = mock<Milieu>({
      ownerId: "notAdmin",
    });

    const environmentData = mock<UpsertEnvironmentInput>();

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    environmentRepository.findMilieuById.mockResolvedValueOnce(existingData);

    await milieuService.updateMilieu(12, environmentData, loggedUser);

    expect(environmentRepository.updateMilieu).toHaveBeenCalledTimes(1);
    expect(environmentRepository.updateMilieu).toHaveBeenLastCalledWith(12, environmentData);
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

    environmentRepository.findMilieuById.mockResolvedValueOnce(existingData);

    await expect(milieuService.updateMilieu(12, environmentData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

    expect(environmentRepository.updateMilieu).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to an environment that exists", async () => {
    const environmentData = mock<UpsertEnvironmentInput>();

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    environmentRepository.updateMilieu.mockImplementation(uniqueConstraintFailed);

    await expect(() => milieuService.updateMilieu(12, environmentData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(environmentRepository.updateMilieu).toHaveBeenCalledTimes(1);
    expect(environmentRepository.updateMilieu).toHaveBeenLastCalledWith(12, environmentData);
  });

  test("should throw an error when the requester is not logged", async () => {
    const environmentData = mock<UpsertEnvironmentInput>();

    await expect(milieuService.updateMilieu(12, environmentData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(environmentRepository.updateMilieu).not.toHaveBeenCalled();
  });
});

describe("Creation of an environment", () => {
  test("should create new environment", async () => {
    const environmentData = mock<UpsertEnvironmentInput>();

    const loggedUser = mock<LoggedUser>({ id: "a" });

    await milieuService.createMilieu(environmentData, loggedUser);

    expect(environmentRepository.createMilieu).toHaveBeenCalledTimes(1);
    expect(environmentRepository.createMilieu).toHaveBeenLastCalledWith({
      ...environmentData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when trying to create an environment that already exists", async () => {
    const environmentData = mock<UpsertEnvironmentInput>();

    const loggedUser = mock<LoggedUser>({ id: "a" });

    environmentRepository.createMilieu.mockImplementation(uniqueConstraintFailed);

    await expect(() => milieuService.createMilieu(environmentData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(environmentRepository.createMilieu).toHaveBeenCalledTimes(1);
    expect(environmentRepository.createMilieu).toHaveBeenLastCalledWith({
      ...environmentData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const environmentData = mock<UpsertEnvironmentInput>();

    await expect(milieuService.createMilieu(environmentData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(environmentRepository.createMilieu).not.toHaveBeenCalled();
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

    environmentRepository.findMilieuById.mockResolvedValueOnce(environment);

    await milieuService.deleteMilieu(11, loggedUser);

    expect(environmentRepository.deleteMilieuById).toHaveBeenCalledTimes(1);
    expect(environmentRepository.deleteMilieuById).toHaveBeenLastCalledWith(11);
  });

  test("hould handle the deletion of any environment if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "admin",
    });

    environmentRepository.findMilieuById.mockResolvedValueOnce(mock<Milieu>());

    await milieuService.deleteMilieu(11, loggedUser);

    expect(environmentRepository.deleteMilieuById).toHaveBeenCalledTimes(1);
    expect(environmentRepository.deleteMilieuById).toHaveBeenLastCalledWith(11);
  });

  test("should return an error when deleting a non-owned environment as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "contributor",
    });

    environmentRepository.findMilieuById.mockResolvedValueOnce(mock<Milieu>());

    await expect(milieuService.deleteMilieu(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(environmentRepository.deleteMilieuById).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(milieuService.deleteMilieu(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(environmentRepository.deleteMilieuById).not.toHaveBeenCalled();
  });
});

test("Create multiple environments", async () => {
  const environmentsData = [
    mock<Omit<MilieuCreateInput, "owner_id">>(),
    mock<Omit<MilieuCreateInput, "owner_id">>(),
    mock<Omit<MilieuCreateInput, "owner_id">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  environmentRepository.createMilieux.mockResolvedValueOnce([]);

  await milieuService.createMilieux(environmentsData, loggedUser);

  expect(environmentRepository.createMilieux).toHaveBeenCalledTimes(1);
  expect(environmentRepository.createMilieux).toHaveBeenLastCalledWith(
    environmentsData.map((environment) => {
      return {
        ...environment,
        owner_id: loggedUser.id,
      };
    })
  );
});
