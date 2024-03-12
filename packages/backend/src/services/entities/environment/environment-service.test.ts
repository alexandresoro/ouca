import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import type { LoggedUser } from "@domain/user/logged-user.js";
import { environmentFactory } from "@fixtures/domain/environment/environment.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertEnvironmentInputFactory } from "@fixtures/services/environment/environment-service.fixtures.js";
import type { EnvironmentsSearchParams } from "@ou-ca/common/api/environment";
import { err, ok } from "neverthrow";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import type { DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import type { MilieuRepository } from "../../../repositories/milieu/milieu-repository.js";
import { mock } from "../../../utils/mock.js";
import { buildEnvironmentService } from "./environment-service.js";

const environmentRepository = mock<MilieuRepository>();
const entryRepository = mock<DonneeRepository>();

const environmentService = buildEnvironmentService({
  environmentRepository,
  entryRepository,
});

const uniqueConstraintFailedError = new UniqueIntegrityConstraintViolationError(
  new Error("errorMessage"),
  "constraint",
);

const uniqueConstraintFailed = () => {
  throw uniqueConstraintFailedError;
};

beforeEach(() => {
  environmentRepository.findMilieuById.mock.resetCalls();
  environmentRepository.findMilieux.mock.resetCalls();
  environmentRepository.createMilieu.mock.resetCalls();
  environmentRepository.createMilieux.mock.resetCalls();
  environmentRepository.updateMilieu.mock.resetCalls();
  environmentRepository.deleteMilieuById.mock.resetCalls();
  environmentRepository.getCount.mock.resetCalls();
  environmentRepository.findMilieuxOfDonneeId.mock.resetCalls();
  entryRepository.getCountByMilieuId.mock.resetCalls();
});

describe("Find environment", () => {
  test("should handle a matching environment", async () => {
    const environmentData = environmentFactory.build();
    const loggedUser = loggedUserFactory.build();

    environmentRepository.findMilieuById.mock.mockImplementationOnce(() => Promise.resolve(environmentData));

    await environmentService.findEnvironment(12, loggedUser);

    assert.strictEqual(environmentRepository.findMilieuById.mock.callCount(), 1);
    assert.deepStrictEqual(environmentRepository.findMilieuById.mock.calls[0].arguments, [12]);
  });

  test("should handle environment not found", async () => {
    environmentRepository.findMilieuById.mock.mockImplementationOnce(() => Promise.resolve(null));
    const loggedUser = loggedUserFactory.build();

    assert.deepStrictEqual(await environmentService.findEnvironment(10, loggedUser), ok(null));

    assert.strictEqual(environmentRepository.findMilieuById.mock.callCount(), 1);
    assert.deepStrictEqual(environmentRepository.findMilieuById.mock.calls[0].arguments, [10]);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await environmentService.findEnvironment(11, null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
    assert.strictEqual(environmentRepository.findMilieuById.mock.callCount(), 0);
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await environmentService.getEntriesCountByEnvironment("12", loggedUser);

    assert.strictEqual(entryRepository.getCountByMilieuId.mock.callCount(), 1);
    assert.deepStrictEqual(entryRepository.getCountByMilieuId.mock.calls[0].arguments, [12]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await environmentService.getEntriesCountByEnvironment("12", null);

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

describe("Find environments by inventary ID", () => {
  test("should handle environments found", async () => {
    const environmentsData = environmentFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    environmentRepository.findMilieuxOfDonneeId.mock.mockImplementationOnce(() => Promise.resolve(environmentsData));

    const environmentsResult = await environmentService.findEnvironmentsOfEntryId("43", loggedUser);

    assert.strictEqual(environmentRepository.findMilieuxOfDonneeId.mock.callCount(), 1);
    assert.deepStrictEqual(environmentRepository.findMilieuxOfDonneeId.mock.calls[0].arguments, [43]);
    assert.ok(environmentsResult.isOk());
    assert.strictEqual(environmentsResult._unsafeUnwrap().length, environmentsData.length);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const findResult = await environmentService.findEnvironmentsOfEntryId("12", null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
  });
});

test("Find all environments", async () => {
  const environmentsData = environmentFactory.buildList(3);

  environmentRepository.findMilieux.mock.mockImplementationOnce(() => Promise.resolve(environmentsData));

  await environmentService.findAllEnvironments();

  assert.strictEqual(environmentRepository.findMilieux.mock.callCount(), 1);
  assert.deepStrictEqual(environmentRepository.findMilieux.mock.calls[0].arguments, [{ orderBy: "libelle" }]);
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const environmentsData = environmentFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    environmentRepository.findMilieux.mock.mockImplementationOnce(() => Promise.resolve(environmentsData));

    await environmentService.findPaginatedEnvironments(loggedUser, {});

    assert.strictEqual(environmentRepository.findMilieux.mock.callCount(), 1);
    assert.deepStrictEqual(environmentRepository.findMilieux.mock.calls[0].arguments, [
      {
        limit: undefined,
        offset: undefined,
        orderBy: undefined,
        q: undefined,
        sortOrder: undefined,
      },
    ]);
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

    environmentRepository.findMilieux.mock.mockImplementationOnce(() => Promise.resolve([environmentsData[0]]));

    await environmentService.findPaginatedEnvironments(loggedUser, searchParams);

    assert.strictEqual(environmentRepository.findMilieux.mock.callCount(), 1);
    assert.deepStrictEqual(environmentRepository.findMilieux.mock.calls[0].arguments, [
      {
        q: "Bob",
        orderBy: "libelle",
        sortOrder: "desc",
        offset: 0,
        limit: searchParams.pageSize,
      },
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesPaginatedResult = await environmentService.findPaginatedEnvironments(null, {});

    assert.deepStrictEqual(entitiesPaginatedResult, err("notAllowed"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await environmentService.getEnvironmentsCount(loggedUser);

    assert.strictEqual(environmentRepository.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(environmentRepository.getCount.mock.calls[0].arguments, [undefined]);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await environmentService.getEnvironmentsCount(loggedUser, "test");

    assert.strictEqual(environmentRepository.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(environmentRepository.getCount.mock.calls[0].arguments, ["test"]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await environmentService.getEnvironmentsCount(null);

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

describe("Update of an environment", () => {
  test("should be allowed when requested by an admin", async () => {
    const environmentData = upsertEnvironmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    await environmentService.updateEnvironment(12, environmentData, loggedUser);

    assert.strictEqual(environmentRepository.updateMilieu.mock.callCount(), 1);
    assert.deepStrictEqual(environmentRepository.updateMilieu.mock.calls[0].arguments, [12, environmentData]);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = environmentFactory.build({
      ownerId: "notAdmin",
    });

    const environmentData = upsertEnvironmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    environmentRepository.findMilieuById.mock.mockImplementationOnce(() => Promise.resolve(existingData));

    await environmentService.updateEnvironment(12, environmentData, loggedUser);

    assert.strictEqual(environmentRepository.updateMilieu.mock.callCount(), 1);
    assert.deepStrictEqual(environmentRepository.updateMilieu.mock.calls[0].arguments, [12, environmentData]);
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

    environmentRepository.findMilieuById.mock.mockImplementationOnce(() => Promise.resolve(existingData));

    const updateResult = await environmentService.updateEnvironment(12, environmentData, user);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(environmentRepository.updateMilieu.mock.callCount(), 0);
  });

  test("should not be allowed when trying to update to an environment that exists", async () => {
    const environmentData = upsertEnvironmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    environmentRepository.updateMilieu.mock.mockImplementationOnce(uniqueConstraintFailed);

    const updateResult = await environmentService.updateEnvironment(12, environmentData, loggedUser);

    assert.deepStrictEqual(updateResult, err("alreadyExists"));
    assert.strictEqual(environmentRepository.updateMilieu.mock.callCount(), 1);
    assert.deepStrictEqual(environmentRepository.updateMilieu.mock.calls[0].arguments, [12, environmentData]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const environmentData = upsertEnvironmentInputFactory.build();

    const updateResult = await environmentService.updateEnvironment(12, environmentData, null);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(environmentRepository.updateMilieu.mock.callCount(), 0);
  });
});

describe("Creation of an environment", () => {
  test("should create new environment", async () => {
    const environmentData = upsertEnvironmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "a" });

    await environmentService.createEnvironment(environmentData, loggedUser);

    assert.strictEqual(environmentRepository.createMilieu.mock.callCount(), 1);
    assert.deepStrictEqual(environmentRepository.createMilieu.mock.calls[0].arguments, [
      {
        ...environmentData,
        owner_id: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when trying to create an environment that already exists", async () => {
    const environmentData = upsertEnvironmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "a" });

    environmentRepository.createMilieu.mock.mockImplementationOnce(uniqueConstraintFailed);

    const createResult = await environmentService.createEnvironment(environmentData, loggedUser);

    assert.deepStrictEqual(createResult, err("alreadyExists"));
    assert.strictEqual(environmentRepository.createMilieu.mock.callCount(), 1);
    assert.deepStrictEqual(environmentRepository.createMilieu.mock.calls[0].arguments, [
      {
        ...environmentData,
        owner_id: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const environmentData = upsertEnvironmentInputFactory.build();

    const createResult = await environmentService.createEnvironment(environmentData, null);

    assert.deepStrictEqual(createResult, err("notAllowed"));
    assert.strictEqual(environmentRepository.createMilieu.mock.callCount(), 0);
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

    environmentRepository.findMilieuById.mock.mockImplementationOnce(() => Promise.resolve(environment));

    await environmentService.deleteEnvironment(11, loggedUser);

    assert.strictEqual(environmentRepository.deleteMilieuById.mock.callCount(), 1);
    assert.deepStrictEqual(environmentRepository.deleteMilieuById.mock.calls[0].arguments, [11]);
  });

  test("hould handle the deletion of any environment if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    environmentRepository.findMilieuById.mock.mockImplementationOnce(() => Promise.resolve(environmentFactory.build()));

    await environmentService.deleteEnvironment(11, loggedUser);

    assert.strictEqual(environmentRepository.deleteMilieuById.mock.callCount(), 1);
    assert.deepStrictEqual(environmentRepository.deleteMilieuById.mock.calls[0].arguments, [11]);
  });

  test("should not be allowed when deleting a non-owned environment as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "contributor",
    });

    environmentRepository.findMilieuById.mock.mockImplementationOnce(() => Promise.resolve(environmentFactory.build()));

    const deleteResult = await environmentService.deleteEnvironment(11, loggedUser);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(environmentRepository.deleteMilieuById.mock.callCount(), 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await environmentService.deleteEnvironment(11, null);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(environmentRepository.deleteMilieuById.mock.callCount(), 0);
  });
});

test("Create multiple environments", async () => {
  const environmentsData = upsertEnvironmentInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  environmentRepository.createMilieux.mock.mockImplementationOnce(() => Promise.resolve([]));

  await environmentService.createEnvironments(environmentsData, loggedUser);

  assert.strictEqual(environmentRepository.createMilieux.mock.callCount(), 1);
  assert.deepStrictEqual(environmentRepository.createMilieux.mock.calls[0].arguments, [
    environmentsData.map((environment) => {
      return {
        ...environment,
        owner_id: loggedUser.id,
      };
    }),
  ]);
});
