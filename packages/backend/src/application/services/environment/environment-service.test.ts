import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import { environmentFactory } from "@fixtures/domain/environment/environment.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertEnvironmentInputFactory } from "@fixtures/services/environment/environment-service.fixtures.js";
import type { EnvironmentRepository } from "@interfaces/environment-repository-interface.js";
import type { EnvironmentsSearchParams } from "@ou-ca/common/api/environment";
import { err, ok } from "neverthrow";
import type { DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { mock } from "../../../utils/mock.js";
import { buildEnvironmentService } from "./environment-service.js";

const environmentRepository = mock<EnvironmentRepository>();
const entryRepository = mock<DonneeRepository>();

const environmentService = buildEnvironmentService({
  environmentRepository,
  entryRepository,
});

beforeEach(() => {
  environmentRepository.findEnvironmentById.mock.resetCalls();
  environmentRepository.findEnvironments.mock.resetCalls();
  environmentRepository.createEnvironment.mock.resetCalls();
  environmentRepository.createEnvironments.mock.resetCalls();
  environmentRepository.updateEnvironment.mock.resetCalls();
  environmentRepository.deleteEnvironmentById.mock.resetCalls();
  environmentRepository.getCount.mock.resetCalls();
  environmentRepository.findEnvironmentsByEntryId.mock.resetCalls();
  entryRepository.getCountByMilieuId.mock.resetCalls();
});

describe("Find environment", () => {
  test("should handle a matching environment", async () => {
    const environmentData = environmentFactory.build();
    const loggedUser = loggedUserFactory.build();

    environmentRepository.findEnvironmentById.mock.mockImplementationOnce(() => Promise.resolve(environmentData));

    await environmentService.findEnvironment(12, loggedUser);

    assert.strictEqual(environmentRepository.findEnvironmentById.mock.callCount(), 1);
    assert.deepStrictEqual(environmentRepository.findEnvironmentById.mock.calls[0].arguments, [12]);
  });

  test("should handle environment not found", async () => {
    environmentRepository.findEnvironmentById.mock.mockImplementationOnce(() => Promise.resolve(null));
    const loggedUser = loggedUserFactory.build();

    assert.deepStrictEqual(await environmentService.findEnvironment(10, loggedUser), ok(null));

    assert.strictEqual(environmentRepository.findEnvironmentById.mock.callCount(), 1);
    assert.deepStrictEqual(environmentRepository.findEnvironmentById.mock.calls[0].arguments, [10]);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await environmentService.findEnvironment(11, null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
    assert.strictEqual(environmentRepository.findEnvironmentById.mock.callCount(), 0);
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

    environmentRepository.findEnvironmentsByEntryId.mock.mockImplementationOnce(() =>
      Promise.resolve(environmentsData),
    );

    const environmentsResult = await environmentService.findEnvironmentsOfEntryId("43", loggedUser);

    assert.strictEqual(environmentRepository.findEnvironmentsByEntryId.mock.callCount(), 1);
    assert.deepStrictEqual(environmentRepository.findEnvironmentsByEntryId.mock.calls[0].arguments, ["43"]);
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

  environmentRepository.findEnvironments.mock.mockImplementationOnce(() => Promise.resolve(environmentsData));

  await environmentService.findAllEnvironments();

  assert.strictEqual(environmentRepository.findEnvironments.mock.callCount(), 1);
  assert.deepStrictEqual(environmentRepository.findEnvironments.mock.calls[0].arguments, [{ orderBy: "libelle" }]);
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const environmentsData = environmentFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    environmentRepository.findEnvironments.mock.mockImplementationOnce(() => Promise.resolve(environmentsData));

    await environmentService.findPaginatedEnvironments(loggedUser, {});

    assert.strictEqual(environmentRepository.findEnvironments.mock.callCount(), 1);
    assert.deepStrictEqual(environmentRepository.findEnvironments.mock.calls[0].arguments, [
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

    environmentRepository.findEnvironments.mock.mockImplementationOnce(() => Promise.resolve([environmentsData[0]]));

    await environmentService.findPaginatedEnvironments(loggedUser, searchParams);

    assert.strictEqual(environmentRepository.findEnvironments.mock.callCount(), 1);
    assert.deepStrictEqual(environmentRepository.findEnvironments.mock.calls[0].arguments, [
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

    environmentRepository.updateEnvironment.mock.mockImplementationOnce(() =>
      Promise.resolve(ok(environmentFactory.build())),
    );

    await environmentService.updateEnvironment(12, environmentData, loggedUser);

    assert.strictEqual(environmentRepository.updateEnvironment.mock.callCount(), 1);
    assert.deepStrictEqual(environmentRepository.updateEnvironment.mock.calls[0].arguments, [12, environmentData]);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = environmentFactory.build({
      ownerId: "notAdmin",
    });

    const environmentData = upsertEnvironmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    environmentRepository.findEnvironmentById.mock.mockImplementationOnce(() => Promise.resolve(existingData));
    environmentRepository.updateEnvironment.mock.mockImplementationOnce(() =>
      Promise.resolve(ok(environmentFactory.build())),
    );

    await environmentService.updateEnvironment(12, environmentData, loggedUser);

    assert.strictEqual(environmentRepository.updateEnvironment.mock.callCount(), 1);
    assert.deepStrictEqual(environmentRepository.updateEnvironment.mock.calls[0].arguments, [12, environmentData]);
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

    environmentRepository.findEnvironmentById.mock.mockImplementationOnce(() => Promise.resolve(existingData));

    const updateResult = await environmentService.updateEnvironment(12, environmentData, user);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(environmentRepository.updateEnvironment.mock.callCount(), 0);
  });

  test("should not be allowed when trying to update to an environment that exists", async () => {
    const environmentData = upsertEnvironmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    environmentRepository.updateEnvironment.mock.mockImplementationOnce(() => Promise.resolve(err("alreadyExists")));

    const updateResult = await environmentService.updateEnvironment(12, environmentData, loggedUser);

    assert.deepStrictEqual(updateResult, err("alreadyExists"));
    assert.strictEqual(environmentRepository.updateEnvironment.mock.callCount(), 1);
    assert.deepStrictEqual(environmentRepository.updateEnvironment.mock.calls[0].arguments, [12, environmentData]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const environmentData = upsertEnvironmentInputFactory.build();

    const updateResult = await environmentService.updateEnvironment(12, environmentData, null);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(environmentRepository.updateEnvironment.mock.callCount(), 0);
  });
});

describe("Creation of an environment", () => {
  test("should create new environment", async () => {
    const environmentData = upsertEnvironmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "a" });

    environmentRepository.createEnvironment.mock.mockImplementationOnce(() =>
      Promise.resolve(ok(environmentFactory.build())),
    );

    await environmentService.createEnvironment(environmentData, loggedUser);

    assert.strictEqual(environmentRepository.createEnvironment.mock.callCount(), 1);
    assert.deepStrictEqual(environmentRepository.createEnvironment.mock.calls[0].arguments, [
      {
        ...environmentData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when trying to create an environment that already exists", async () => {
    const environmentData = upsertEnvironmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "a" });

    environmentRepository.createEnvironment.mock.mockImplementationOnce(() => Promise.resolve(err("alreadyExists")));

    const createResult = await environmentService.createEnvironment(environmentData, loggedUser);

    assert.deepStrictEqual(createResult, err("alreadyExists"));
    assert.strictEqual(environmentRepository.createEnvironment.mock.callCount(), 1);
    assert.deepStrictEqual(environmentRepository.createEnvironment.mock.calls[0].arguments, [
      {
        ...environmentData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const environmentData = upsertEnvironmentInputFactory.build();

    const createResult = await environmentService.createEnvironment(environmentData, null);

    assert.deepStrictEqual(createResult, err("notAllowed"));
    assert.strictEqual(environmentRepository.createEnvironment.mock.callCount(), 0);
  });
});

describe("Deletion of an environment", () => {
  test("should handle the deletion of an owned environment", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
      role: "contributor",
    });

    const environment = environmentFactory.build({
      ownerId: loggedUser.id,
    });

    environmentRepository.findEnvironmentById.mock.mockImplementationOnce(() => Promise.resolve(environment));

    await environmentService.deleteEnvironment(11, loggedUser);

    assert.strictEqual(environmentRepository.deleteEnvironmentById.mock.callCount(), 1);
    assert.deepStrictEqual(environmentRepository.deleteEnvironmentById.mock.calls[0].arguments, [11]);
  });

  test("hould handle the deletion of any environment if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    environmentRepository.findEnvironmentById.mock.mockImplementationOnce(() =>
      Promise.resolve(environmentFactory.build()),
    );

    await environmentService.deleteEnvironment(11, loggedUser);

    assert.strictEqual(environmentRepository.deleteEnvironmentById.mock.callCount(), 1);
    assert.deepStrictEqual(environmentRepository.deleteEnvironmentById.mock.calls[0].arguments, [11]);
  });

  test("should not be allowed when deleting a non-owned environment as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "contributor",
    });

    environmentRepository.findEnvironmentById.mock.mockImplementationOnce(() =>
      Promise.resolve(environmentFactory.build()),
    );

    const deleteResult = await environmentService.deleteEnvironment(11, loggedUser);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(environmentRepository.deleteEnvironmentById.mock.callCount(), 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await environmentService.deleteEnvironment(11, null);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(environmentRepository.deleteEnvironmentById.mock.callCount(), 0);
  });
});

test("Create multiple environments", async () => {
  const environmentsData = upsertEnvironmentInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  environmentRepository.createEnvironments.mock.mockImplementationOnce(() => Promise.resolve([]));

  await environmentService.createEnvironments(environmentsData, loggedUser);

  assert.strictEqual(environmentRepository.createEnvironments.mock.callCount(), 1);
  assert.deepStrictEqual(environmentRepository.createEnvironments.mock.calls[0].arguments, [
    environmentsData.map((environment) => {
      return {
        ...environment,
        ownerId: loggedUser.id,
      };
    }),
  ]);
});