import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import type { LoggedUser } from "@domain/user/logged-user.js";
import { behaviorFactory } from "@fixtures/domain/behavior/behavior.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertBehaviorInputFactory } from "@fixtures/services/behavior/behavior-service.fixtures.js";
import type { BehaviorsSearchParams } from "@ou-ca/common/api/behavior";
import { err, ok } from "neverthrow";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import type { ComportementRepository } from "../../../repositories/comportement/comportement-repository.js";
import type { DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { mock } from "../../../utils/mock.js";
import { buildBehaviorService } from "./behavior-service.js";

const behaviorRepository = mock<ComportementRepository>();
const entryRepository = mock<DonneeRepository>();

const behaviorService = buildBehaviorService({
  behaviorRepository,
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
  behaviorRepository.findComportementById.mock.resetCalls();
  behaviorRepository.findComportements.mock.resetCalls();
  behaviorRepository.createComportement.mock.resetCalls();
  behaviorRepository.createComportements.mock.resetCalls();
  behaviorRepository.updateComportement.mock.resetCalls();
  behaviorRepository.deleteComportementById.mock.resetCalls();
  behaviorRepository.getCount.mock.resetCalls();
  behaviorRepository.findComportementsOfDonneeId.mock.resetCalls();
  entryRepository.getCountByComportementId.mock.resetCalls();
});

describe("Find behavior", () => {
  test("should handle a matching behavior", async () => {
    const behaviorData = behaviorFactory.build();
    const loggedUser = loggedUserFactory.build();

    behaviorRepository.findComportementById.mock.mockImplementationOnce(() => Promise.resolve(behaviorData));

    await behaviorService.findBehavior(12, loggedUser);

    assert.strictEqual(behaviorRepository.findComportementById.mock.callCount(), 1);
    assert.deepStrictEqual(behaviorRepository.findComportementById.mock.calls[0].arguments, [12]);
  });

  test("should handle behavior not found", async () => {
    behaviorRepository.findComportementById.mock.mockImplementationOnce(() => Promise.resolve(null));
    const loggedUser = loggedUserFactory.build();

    assert.deepStrictEqual(await behaviorService.findBehavior(10, loggedUser), ok(null));

    assert.strictEqual(behaviorRepository.findComportementById.mock.callCount(), 1);
    assert.deepStrictEqual(behaviorRepository.findComportementById.mock.calls[0].arguments, [10]);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await behaviorService.findBehavior(11, null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
    assert.strictEqual(behaviorRepository.findComportementById.mock.callCount(), 0);
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await behaviorService.getEntriesCountByBehavior("12", loggedUser);

    assert.strictEqual(entryRepository.getCountByComportementId.mock.callCount(), 1);
    assert.deepStrictEqual(entryRepository.getCountByComportementId.mock.calls[0].arguments, [12]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await behaviorService.getEntriesCountByBehavior("12", null);

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

describe("Find behaviors by inventary ID", () => {
  test("should handle behaviors found", async () => {
    const behaviorsData = behaviorFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    behaviorRepository.findComportementsOfDonneeId.mock.mockImplementationOnce(() => Promise.resolve(behaviorsData));

    const behaviorsResult = await behaviorService.findBehaviorsOfEntryId("43", loggedUser);

    assert.strictEqual(behaviorRepository.findComportementsOfDonneeId.mock.callCount(), 1);
    assert.deepStrictEqual(behaviorRepository.findComportementsOfDonneeId.mock.calls[0].arguments, [43]);
    assert.ok(behaviorsResult.isOk());
    assert.strictEqual(behaviorsResult._unsafeUnwrap().length, behaviorsData.length);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await behaviorService.findBehaviorsOfEntryId("12", null);

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

test("Find all behaviors", async () => {
  const behaviorsData = behaviorFactory.buildList(3);

  behaviorRepository.findComportements.mock.mockImplementationOnce(() => Promise.resolve(behaviorsData));

  await behaviorService.findAllBehaviors();

  assert.strictEqual(behaviorRepository.findComportements.mock.callCount(), 1);
  assert.deepStrictEqual(behaviorRepository.findComportements.mock.calls[0].arguments, [
    {
      orderBy: "code",
    },
  ]);
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const behaviorsData = behaviorFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    behaviorRepository.findComportements.mock.mockImplementationOnce(() => Promise.resolve(behaviorsData));

    await behaviorService.findPaginatedBehaviors(loggedUser, {});

    assert.strictEqual(behaviorRepository.findComportements.mock.callCount(), 1);
    assert.deepStrictEqual(behaviorRepository.findComportements.mock.calls[0].arguments, [
      {
        orderBy: undefined,
        sortOrder: undefined,
        q: undefined,
        offset: undefined,
        limit: undefined,
      },
    ]);
  });

  test("should handle params when retrieving paginated behaviors", async () => {
    const behaviorsData = behaviorFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: BehaviorsSearchParams = {
      orderBy: "libelle",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    behaviorRepository.findComportements.mock.mockImplementationOnce(() => Promise.resolve([behaviorsData[0]]));

    await behaviorService.findPaginatedBehaviors(loggedUser, searchParams);

    assert.strictEqual(behaviorRepository.findComportements.mock.callCount(), 1);
    assert.deepStrictEqual(behaviorRepository.findComportements.mock.calls[0].arguments, [
      {
        orderBy: "libelle",
        sortOrder: "desc",
        q: "Bob",
        offset: 0,
        limit: searchParams.pageSize,
      },
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesPaginatedResult = await behaviorService.findPaginatedBehaviors(null, {});

    assert.deepStrictEqual(entitiesPaginatedResult, err("notAllowed"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await behaviorService.getBehaviorsCount(loggedUser);

    assert.strictEqual(behaviorRepository.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(behaviorRepository.getCount.mock.calls[0].arguments, [undefined]);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await behaviorService.getBehaviorsCount(loggedUser, "test");

    assert.strictEqual(behaviorRepository.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(behaviorRepository.getCount.mock.calls[0].arguments, ["test"]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await behaviorService.getBehaviorsCount(null);

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

describe("Update of a behavior", () => {
  test("should be allowed when requested by an admin", async () => {
    const behaviorData = upsertBehaviorInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    await behaviorService.updateBehavior(12, behaviorData, loggedUser);

    assert.strictEqual(behaviorRepository.updateComportement.mock.callCount(), 1);
    assert.deepStrictEqual(behaviorRepository.updateComportement.mock.calls[0].arguments, [12, behaviorData]);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = behaviorFactory.build({
      ownerId: "notAdmin",
    });

    const behaviorData = upsertBehaviorInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    behaviorRepository.findComportementById.mock.mockImplementationOnce(() => Promise.resolve(existingData));

    await behaviorService.updateBehavior(12, behaviorData, loggedUser);

    assert.strictEqual(behaviorRepository.updateComportement.mock.callCount(), 1);
    assert.deepStrictEqual(behaviorRepository.updateComportement.mock.calls[0].arguments, [12, behaviorData]);
  });

  test("should not be allowed when requested by an user that is nor owner nor admin", async () => {
    const existingData = behaviorFactory.build({
      ownerId: "notAdmin",
    });

    const behaviorData = upsertBehaviorInputFactory.build();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    behaviorRepository.findComportementById.mock.mockImplementationOnce(() => Promise.resolve(existingData));

    const updateResult = await behaviorService.updateBehavior(12, behaviorData, user);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(behaviorRepository.updateComportement.mock.callCount(), 0);
  });

  test("should not be allowed when trying to update to a behavior that exists", async () => {
    const behaviorData = upsertBehaviorInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    behaviorRepository.updateComportement.mock.mockImplementationOnce(uniqueConstraintFailed);

    const updateResult = await behaviorService.updateBehavior(12, behaviorData, loggedUser);

    assert.deepStrictEqual(updateResult, err("alreadyExists"));
    assert.strictEqual(behaviorRepository.updateComportement.mock.callCount(), 1);
    assert.deepStrictEqual(behaviorRepository.updateComportement.mock.calls[0].arguments, [12, behaviorData]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const behaviorData = upsertBehaviorInputFactory.build();

    const updateResult = await behaviorService.updateBehavior(12, behaviorData, null);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(behaviorRepository.updateComportement.mock.callCount(), 0);
  });
});

describe("Creation of a behavior", () => {
  test("should create new behavior", async () => {
    const behaviorData = upsertBehaviorInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "a" });

    await behaviorService.createBehavior(behaviorData, loggedUser);

    assert.strictEqual(behaviorRepository.createComportement.mock.callCount(), 1);
    assert.deepStrictEqual(behaviorRepository.createComportement.mock.calls[0].arguments, [
      {
        ...behaviorData,
        owner_id: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when trying to create a behavior that already exists", async () => {
    const behaviorData = upsertBehaviorInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "a" });

    behaviorRepository.createComportement.mock.mockImplementationOnce(uniqueConstraintFailed);

    const createResult = await behaviorService.createBehavior(behaviorData, loggedUser);

    assert.deepStrictEqual(createResult, err("alreadyExists"));
    assert.strictEqual(behaviorRepository.createComportement.mock.callCount(), 1);
    assert.deepStrictEqual(behaviorRepository.createComportement.mock.calls[0].arguments, [
      {
        ...behaviorData,
        owner_id: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const behaviorData = upsertBehaviorInputFactory.build();

    const createResult = await behaviorService.createBehavior(behaviorData, null);

    assert.deepStrictEqual(createResult, err("notAllowed"));
    assert.strictEqual(behaviorRepository.createComportement.mock.callCount(), 0);
  });
});

describe("Deletion of a behavior", () => {
  test("should handle the deletion of an owned behavior", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const behavior = behaviorFactory.build({
      ownerId: loggedUser.id,
    });

    behaviorRepository.findComportementById.mock.mockImplementationOnce(() => Promise.resolve(behavior));

    await behaviorService.deleteBehavior(11, loggedUser);

    assert.strictEqual(behaviorRepository.deleteComportementById.mock.callCount(), 1);
    assert.deepStrictEqual(behaviorRepository.deleteComportementById.mock.calls[0].arguments, [11]);
  });

  test("should handle the deletion of any behavior if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    behaviorRepository.findComportementById.mock.mockImplementationOnce(() => Promise.resolve(behaviorFactory.build()));

    await behaviorService.deleteBehavior(11, loggedUser);

    assert.strictEqual(behaviorRepository.deleteComportementById.mock.callCount(), 1);
    assert.deepStrictEqual(behaviorRepository.deleteComportementById.mock.calls[0].arguments, [11]);
  });

  test("should not be allowed when deleting a non-owned behavior as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "contributor",
    });

    behaviorRepository.findComportementById.mock.mockImplementationOnce(() => Promise.resolve(behaviorFactory.build()));

    const deleteResult = await behaviorService.deleteBehavior(11, loggedUser);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(behaviorRepository.deleteComportementById.mock.callCount(), 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await behaviorService.deleteBehavior(11, null);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(behaviorRepository.deleteComportementById.mock.callCount(), 0);
  });
});

test("Create multiple comportements", async () => {
  const comportementsData = upsertBehaviorInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  behaviorRepository.createComportements.mock.mockImplementationOnce(() => Promise.resolve([]));

  await behaviorService.createBehaviors(comportementsData, loggedUser);

  assert.strictEqual(behaviorRepository.createComportements.mock.callCount(), 1);
  assert.deepStrictEqual(behaviorRepository.createComportements.mock.calls[0].arguments, [
    comportementsData.map((comportement) => {
      return {
        ...comportement,
        owner_id: loggedUser.id,
      };
    }),
  ]);
});
