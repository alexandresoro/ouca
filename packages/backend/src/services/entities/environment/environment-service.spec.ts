import { OucaError } from "@domain/errors/ouca-error.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { environmentFactory } from "@fixtures/domain/environment/environment.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertEnvironmentInputFactory } from "@fixtures/services/environment/environment-service.fixtures.js";
import { type EnvironmentsSearchParams } from "@ou-ca/common/api/environment";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { type MilieuRepository } from "../../../repositories/milieu/milieu-repository.js";
import { mockVi } from "../../../utils/mock.js";
import { buildEnvironmentService } from "./environment-service.js";

const environmentRepository = mockVi<MilieuRepository>();
const entryRepository = mockVi<DonneeRepository>();

const environmentService = buildEnvironmentService({
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
    const environmentData = environmentFactory.build();
    const loggedUser = loggedUserFactory.build();

    environmentRepository.findMilieuById.mockResolvedValueOnce(environmentData);

    await environmentService.findEnvironment(12, loggedUser);

    expect(environmentRepository.findMilieuById).toHaveBeenCalledTimes(1);
    expect(environmentRepository.findMilieuById).toHaveBeenLastCalledWith(12);
  });

  test("should handle environment not found", async () => {
    environmentRepository.findMilieuById.mockResolvedValueOnce(null);
    const loggedUser = loggedUserFactory.build();

    await expect(environmentService.findEnvironment(10, loggedUser)).resolves.toEqual(null);

    expect(environmentRepository.findMilieuById).toHaveBeenCalledTimes(1);
    expect(environmentRepository.findMilieuById).toHaveBeenLastCalledWith(10);
  });

  test("should not be allowed when the no login details are provided", async () => {
    await expect(environmentService.findEnvironment(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(environmentRepository.findMilieuById).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await environmentService.getEntriesCountByEnvironment("12", loggedUser);

    expect(entryRepository.getCountByMilieuId).toHaveBeenCalledTimes(1);
    expect(entryRepository.getCountByMilieuId).toHaveBeenLastCalledWith(12);
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(environmentService.getEntriesCountByEnvironment("12", null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
  });
});

describe("Find environments by inventary ID", () => {
  test("should handle environments found", async () => {
    const environmentsData = environmentFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    environmentRepository.findMilieuxOfDonneeId.mockResolvedValueOnce(environmentsData);

    const environments = await environmentService.findEnvironmentsOfEntryId("43", loggedUser);

    expect(environmentRepository.findMilieuxOfDonneeId).toHaveBeenCalledTimes(1);
    expect(environmentRepository.findMilieuxOfDonneeId).toHaveBeenLastCalledWith(43);
    expect(environments.length).toEqual(environmentsData.length);
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(environmentService.findEnvironmentsOfEntryId("12", null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all environments", async () => {
  const environmentsData = environmentFactory.buildList(3);

  environmentRepository.findMilieux.mockResolvedValueOnce(environmentsData);

  await environmentService.findAllEnvironments();

  expect(environmentRepository.findMilieux).toHaveBeenCalledTimes(1);
  expect(environmentRepository.findMilieux).toHaveBeenLastCalledWith({
    orderBy: "libelle",
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const environmentsData = environmentFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    environmentRepository.findMilieux.mockResolvedValueOnce(environmentsData);

    await environmentService.findPaginatedEnvironments(loggedUser, {});

    expect(environmentRepository.findMilieux).toHaveBeenCalledTimes(1);
    expect(environmentRepository.findMilieux).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated environments", async () => {
    const environmentsData = environmentFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: EnvironmentsSearchParams = {
      orderBy: "libelle",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    environmentRepository.findMilieux.mockResolvedValueOnce([environmentsData[0]]);

    await environmentService.findPaginatedEnvironments(loggedUser, searchParams);

    expect(environmentRepository.findMilieux).toHaveBeenCalledTimes(1);
    expect(environmentRepository.findMilieux).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: "libelle",
      sortOrder: "desc",
      offset: 0,
      limit: searchParams.pageSize,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(environmentService.findPaginatedEnvironments(null, {})).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await environmentService.getEnvironmentsCount(loggedUser);

    expect(environmentRepository.getCount).toHaveBeenCalledTimes(1);
    expect(environmentRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await environmentService.getEnvironmentsCount(loggedUser, "test");

    expect(environmentRepository.getCount).toHaveBeenCalledTimes(1);
    expect(environmentRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(environmentService.getEnvironmentsCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of an environment", () => {
  test("should be allowed when requested by an admin", async () => {
    const environmentData = upsertEnvironmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    await environmentService.updateEnvironment(12, environmentData, loggedUser);

    expect(environmentRepository.updateMilieu).toHaveBeenCalledTimes(1);
    expect(environmentRepository.updateMilieu).toHaveBeenLastCalledWith(12, environmentData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = environmentFactory.build({
      ownerId: "notAdmin",
    });

    const environmentData = upsertEnvironmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    environmentRepository.findMilieuById.mockResolvedValueOnce(existingData);

    await environmentService.updateEnvironment(12, environmentData, loggedUser);

    expect(environmentRepository.updateMilieu).toHaveBeenCalledTimes(1);
    expect(environmentRepository.updateMilieu).toHaveBeenLastCalledWith(12, environmentData);
  });

  test("should not be allowed when requested by an user that is nor owner nor admin", async () => {
    const existingData = environmentFactory.build({
      ownerId: "notAdmin",
    });

    const environmentData = upsertEnvironmentInputFactory.build();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    environmentRepository.findMilieuById.mockResolvedValueOnce(existingData);

    await expect(environmentService.updateEnvironment(12, environmentData, user)).rejects.toThrowError(
      new OucaError("OUCA0001")
    );

    expect(environmentRepository.updateMilieu).not.toHaveBeenCalled();
  });

  test("should not be allowed when trying to update to an environment that exists", async () => {
    const environmentData = upsertEnvironmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    environmentRepository.updateMilieu.mockImplementation(uniqueConstraintFailed);

    await expect(() => environmentService.updateEnvironment(12, environmentData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(environmentRepository.updateMilieu).toHaveBeenCalledTimes(1);
    expect(environmentRepository.updateMilieu).toHaveBeenLastCalledWith(12, environmentData);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const environmentData = upsertEnvironmentInputFactory.build();

    await expect(environmentService.updateEnvironment(12, environmentData, null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
    expect(environmentRepository.updateMilieu).not.toHaveBeenCalled();
  });
});

describe("Creation of an environment", () => {
  test("should create new environment", async () => {
    const environmentData = upsertEnvironmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "a" });

    await environmentService.createEnvironment(environmentData, loggedUser);

    expect(environmentRepository.createMilieu).toHaveBeenCalledTimes(1);
    expect(environmentRepository.createMilieu).toHaveBeenLastCalledWith({
      ...environmentData,
      owner_id: loggedUser.id,
    });
  });

  test("should not be allowed when trying to create an environment that already exists", async () => {
    const environmentData = upsertEnvironmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "a" });

    environmentRepository.createMilieu.mockImplementation(uniqueConstraintFailed);

    await expect(() => environmentService.createEnvironment(environmentData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(environmentRepository.createMilieu).toHaveBeenCalledTimes(1);
    expect(environmentRepository.createMilieu).toHaveBeenLastCalledWith({
      ...environmentData,
      owner_id: loggedUser.id,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    const environmentData = upsertEnvironmentInputFactory.build();

    await expect(environmentService.createEnvironment(environmentData, null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
    expect(environmentRepository.createMilieu).not.toHaveBeenCalled();
  });
});

describe("Deletion of an environment", () => {
  test("should handle the deletion of an owned environment", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const environment = environmentFactory.build({
      ownerId: loggedUser.id,
    });

    environmentRepository.findMilieuById.mockResolvedValueOnce(environment);

    await environmentService.deleteEnvironment(11, loggedUser);

    expect(environmentRepository.deleteMilieuById).toHaveBeenCalledTimes(1);
    expect(environmentRepository.deleteMilieuById).toHaveBeenLastCalledWith(11);
  });

  test("hould handle the deletion of any environment if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    environmentRepository.findMilieuById.mockResolvedValueOnce(environmentFactory.build());

    await environmentService.deleteEnvironment(11, loggedUser);

    expect(environmentRepository.deleteMilieuById).toHaveBeenCalledTimes(1);
    expect(environmentRepository.deleteMilieuById).toHaveBeenLastCalledWith(11);
  });

  test("should return an error when deleting a non-owned environment as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "contributor",
    });

    environmentRepository.findMilieuById.mockResolvedValueOnce(environmentFactory.build());

    await expect(environmentService.deleteEnvironment(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(environmentRepository.deleteMilieuById).not.toHaveBeenCalled();
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(environmentService.deleteEnvironment(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(environmentRepository.deleteMilieuById).not.toHaveBeenCalled();
  });
});

test("Create multiple environments", async () => {
  const environmentsData = upsertEnvironmentInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  environmentRepository.createMilieux.mockResolvedValueOnce([]);

  await environmentService.createEnvironments(environmentsData, loggedUser);

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