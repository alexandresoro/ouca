import assert from "node:assert/strict";
import test, { describe, beforeEach } from "node:test";
import { ageCreateInputFactory, ageFactory } from "@fixtures/domain/age/age.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertAgeInputFactory } from "@fixtures/services/age/age-service.fixtures.js";
import type { AgeRepository } from "@interfaces/age-repository-interface.js";
import type { AgesSearchParams } from "@ou-ca/common/api/age";
import { err, ok } from "neverthrow";
import { mock } from "../../../utils/mock.js";
import { buildAgeService } from "./age-service.js";

const ageRepository = mock<AgeRepository>();

const ageService = buildAgeService({
  ageRepository,
});

beforeEach(() => {
  ageRepository.findAgeById.mock.resetCalls();
  ageRepository.findAgeByEntryId.mock.resetCalls();
  ageRepository.findAges.mock.resetCalls();
  ageRepository.getCount.mock.resetCalls();
  ageRepository.getEntriesCountById.mock.resetCalls();
  ageRepository.updateAge.mock.resetCalls();
  ageRepository.createAge.mock.resetCalls();
  ageRepository.deleteAgeById.mock.resetCalls();
  ageRepository.createAges.mock.resetCalls();
});

describe("Find age", () => {
  test("should handle a matching age", async () => {
    const ageData = ageFactory.build();
    const loggedUser = loggedUserFactory.build();

    ageRepository.findAgeById.mock.mockImplementationOnce(() => Promise.resolve(ageData));

    await ageService.findAge(12, loggedUser);

    assert.strictEqual(ageRepository.findAgeById.mock.callCount(), 1);
    assert.deepStrictEqual(ageRepository.findAgeById.mock.calls[0].arguments, [12]);
  });

  test("should handle age not found", async () => {
    ageRepository.findAgeById.mock.mockImplementationOnce(() => Promise.resolve(null));
    const loggedUser = loggedUserFactory.build();

    assert.deepStrictEqual(await ageService.findAge(10, loggedUser), ok(null));

    assert.strictEqual(ageRepository.findAgeById.mock.callCount(), 1);
    assert.deepStrictEqual(ageRepository.findAgeById.mock.calls[0].arguments, [10]);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await ageService.findAge(11, null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
    assert.strictEqual(ageRepository.findAgeById.mock.callCount(), 0);
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await ageService.getEntriesCountByAge("12", loggedUser);

    assert.strictEqual(ageRepository.getEntriesCountById.mock.callCount(), 1);
    assert.deepStrictEqual(ageRepository.getEntriesCountById.mock.calls[0].arguments, ["12"]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await ageService.getEntriesCountByAge("12", null);

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

describe("Find age by data ID", () => {
  test("should handle age found", async () => {
    const ageData = ageFactory.build();
    const loggedUser = loggedUserFactory.build();

    ageRepository.findAgeByEntryId.mock.mockImplementationOnce(() => Promise.resolve(ageData));

    const ageResult = await ageService.findAgeOfEntryId("43", loggedUser);

    assert.strictEqual(ageRepository.findAgeByEntryId.mock.callCount(), 1);
    assert.deepStrictEqual(ageRepository.findAgeByEntryId.mock.calls[0].arguments, [43]);
    assert.ok(ageResult.isOk());
    assert.strictEqual(ageResult.value?.id, ageData.id);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const findResult = await ageService.findAgeOfEntryId("12", null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
  });
});

test("Find all ages", async () => {
  const agesData = ageFactory.buildList(3);

  ageRepository.findAges.mock.mockImplementationOnce(() => Promise.resolve(agesData));

  await ageService.findAllAges();

  assert.strictEqual(ageRepository.findAges.mock.callCount(), 1);
  assert.deepStrictEqual(ageRepository.findAges.mock.calls[0].arguments, [
    {
      orderBy: "libelle",
    },
  ]);
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const agesData = ageFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    ageRepository.findAges.mock.mockImplementationOnce(() => Promise.resolve(agesData));

    await ageService.findPaginatedAges(loggedUser, {});

    assert.strictEqual(ageRepository.findAges.mock.callCount(), 1);
    assert.deepStrictEqual(ageRepository.findAges.mock.calls[0].arguments, [
      {
        limit: undefined,
        offset: undefined,
        orderBy: undefined,
        q: undefined,
        sortOrder: undefined,
      },
    ]);
  });

  test("should handle params when retrieving paginated ages", async () => {
    const agesData = ageFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: AgesSearchParams = {
      orderBy: "libelle",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    ageRepository.findAges.mock.mockImplementationOnce(() => Promise.resolve([agesData[0]]));

    await ageService.findPaginatedAges(loggedUser, searchParams);

    assert.strictEqual(ageRepository.findAges.mock.callCount(), 1);
    assert.deepStrictEqual(ageRepository.findAges.mock.calls[0].arguments, [
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
    const entitiesPaginatedResult = await ageService.findPaginatedAges(null, {});

    assert.deepStrictEqual(entitiesPaginatedResult, err("notAllowed"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await ageService.getAgesCount(loggedUser);

    assert.strictEqual(ageRepository.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(ageRepository.getCount.mock.calls[0].arguments, [undefined]);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await ageService.getAgesCount(loggedUser, "test");

    assert.strictEqual(ageRepository.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(ageRepository.getCount.mock.calls[0].arguments, ["test"]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await ageService.getAgesCount(null);

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

describe("Update of an age", () => {
  test("should be allowed when requested by an admin", async () => {
    const ageData = upsertAgeInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    ageRepository.updateAge.mock.mockImplementationOnce(() => Promise.resolve(ok(ageFactory.build())));

    await ageService.updateAge(12, ageData, loggedUser);

    assert.strictEqual(ageRepository.updateAge.mock.callCount(), 1);
    assert.deepStrictEqual(ageRepository.updateAge.mock.calls[0].arguments, [12, ageData]);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = ageFactory.build({
      ownerId: "notAdmin",
    });

    const ageData = upsertAgeInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    ageRepository.findAgeById.mock.mockImplementationOnce(() => Promise.resolve(existingData));
    ageRepository.updateAge.mock.mockImplementationOnce(() => Promise.resolve(ok(ageFactory.build())));

    await ageService.updateAge(12, ageData, loggedUser);

    assert.strictEqual(ageRepository.updateAge.mock.callCount(), 1);
    assert.deepStrictEqual(ageRepository.updateAge.mock.calls[0].arguments, [12, ageData]);
  });

  test("should not be allowed when requested by an user that is nor owner nor admin", async () => {
    const existingData = ageFactory.build({
      ownerId: "notAdmin",
    });

    const ageData = upsertAgeInputFactory.build();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    ageRepository.findAgeById.mock.mockImplementationOnce(() => Promise.resolve(existingData));

    const updateResult = await ageService.updateAge(12, ageData, user);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(ageRepository.updateAge.mock.callCount(), 0);
  });

  test("should not be allowed when trying to update to an age that exists", async () => {
    const ageData = upsertAgeInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    ageRepository.updateAge.mock.mockImplementationOnce(() => Promise.resolve(err("alreadyExists")));

    const updateResult = await ageService.updateAge(12, ageData, loggedUser);

    assert.deepStrictEqual(updateResult, err("alreadyExists"));
    assert.strictEqual(ageRepository.updateAge.mock.callCount(), 1);
    assert.deepStrictEqual(ageRepository.updateAge.mock.calls[0].arguments, [12, ageData]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const ageData = upsertAgeInputFactory.build();

    const updateResult = await ageService.updateAge(12, ageData, null);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(ageRepository.updateAge.mock.callCount(), 0);
  });
});

describe("Creation of an age", () => {
  test("should create new age", async () => {
    const ageData = upsertAgeInputFactory.build();

    const loggedUser = loggedUserFactory.build();

    ageRepository.createAge.mock.mockImplementationOnce(() => Promise.resolve(ok(ageFactory.build())));

    await ageService.createAge(ageData, loggedUser);

    assert.strictEqual(ageRepository.createAge.mock.callCount(), 1);
    assert.deepStrictEqual(ageRepository.createAge.mock.calls[0].arguments, [
      {
        ...ageData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when trying to create an age that already exists", async () => {
    const ageData = upsertAgeInputFactory.build();

    const loggedUser = loggedUserFactory.build();

    ageRepository.createAge.mock.mockImplementationOnce(() => Promise.resolve(err("alreadyExists")));

    const createResult = await ageService.createAge(ageData, loggedUser);

    assert.deepStrictEqual(createResult, err("alreadyExists"));
    assert.strictEqual(ageRepository.createAge.mock.callCount(), 1);
    assert.deepStrictEqual(ageRepository.createAge.mock.calls[0].arguments, [
      {
        ...ageData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const ageData = upsertAgeInputFactory.build();

    const createResult = await ageService.createAge(ageData, null);

    assert.deepStrictEqual(createResult, err("notAllowed"));
    assert.strictEqual(ageRepository.createAge.mock.callCount(), 0);
  });
});

describe("Deletion of an age", () => {
  test("should handle the deletion of an owned age", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
      role: "contributor",
    });

    const age = ageFactory.build({ ownerId: loggedUser.id });

    ageRepository.findAgeById.mock.mockImplementationOnce(() => Promise.resolve(age));

    await ageService.deleteAge(11, loggedUser);

    assert.strictEqual(ageRepository.deleteAgeById.mock.callCount(), 1);
    assert.deepStrictEqual(ageRepository.deleteAgeById.mock.calls[0].arguments, [11]);
  });

  test("should handle the deletion of any age if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    ageRepository.findAgeById.mock.mockImplementationOnce(() => Promise.resolve(ageFactory.build()));

    await ageService.deleteAge(11, loggedUser);

    assert.strictEqual(ageRepository.deleteAgeById.mock.callCount(), 1);
    assert.deepStrictEqual(ageRepository.deleteAgeById.mock.calls[0].arguments, [11]);
  });

  test("should not be allowed when deleting a non-owned age as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
    });

    const deleteResult = await ageService.deleteAge(11, loggedUser);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(ageRepository.deleteAgeById.mock.callCount(), 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await ageService.deleteAge(11, null);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(ageRepository.deleteAgeById.mock.callCount(), 0);
  });
});

test("Create multiple ages", async () => {
  const agesData = ageCreateInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  ageRepository.createAges.mock.mockImplementationOnce(() => Promise.resolve([]));

  await ageService.createAges(agesData, loggedUser);

  assert.strictEqual(ageRepository.createAges.mock.callCount(), 1);
  assert.deepStrictEqual(ageRepository.createAges.mock.calls[0].arguments, [
    agesData.map((age) => {
      return {
        ...age,
        ownerId: loggedUser.id,
      };
    }),
  ]);
});
