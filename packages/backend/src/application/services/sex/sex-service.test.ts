import assert from "node:assert/strict";
import test, { describe, beforeEach } from "node:test";
import { sexCreateInputFactory, sexFactory } from "@fixtures/domain/sex/sex.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertSexInputFactory } from "@fixtures/services/sex/sex-service.fixtures.js";
import type { SexRepository } from "@interfaces/sex-repository-interface.js";
import type { SexesSearchParams } from "@ou-ca/common/api/sex";
import { err, ok } from "neverthrow";
import { mock } from "../../../utils/mock.js";
import { buildSexService } from "./sex-service.js";

const sexRepository = mock<SexRepository>();

const sexService = buildSexService({
  sexRepository,
});

beforeEach(() => {
  sexRepository.findSexById.mock.resetCalls();
  sexRepository.findSexes.mock.resetCalls();
  sexRepository.getCount.mock.resetCalls();
  sexRepository.getEntriesCountById.mock.resetCalls();
  sexRepository.updateSex.mock.resetCalls();
  sexRepository.createSex.mock.resetCalls();
  sexRepository.deleteSexById.mock.resetCalls();
  sexRepository.createSexes.mock.resetCalls();
});

describe("Find sex", () => {
  test("should handle a matching sex", async () => {
    const sexData = sexFactory.build();
    const loggedUser = loggedUserFactory.build();

    sexRepository.findSexById.mock.mockImplementationOnce(() => Promise.resolve(sexData));

    await sexService.findSex(12, loggedUser);

    assert.strictEqual(sexRepository.findSexById.mock.callCount(), 1);
    assert.deepStrictEqual(sexRepository.findSexById.mock.calls[0].arguments, [12]);
  });

  test("should handle sex not found", async () => {
    sexRepository.findSexById.mock.mockImplementationOnce(() => Promise.resolve(null));
    const loggedUser = loggedUserFactory.build();

    assert.deepStrictEqual(await sexService.findSex(10, loggedUser), ok(null));

    assert.strictEqual(sexRepository.findSexById.mock.callCount(), 1);
    assert.deepStrictEqual(sexRepository.findSexById.mock.calls[0].arguments, [10]);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await sexService.findSex(11, null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
    assert.strictEqual(sexRepository.findSexById.mock.callCount(), 0);
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await sexService.getEntriesCountBySex("12", loggedUser);

    assert.strictEqual(sexRepository.getEntriesCountById.mock.callCount(), 1);
    assert.deepStrictEqual(sexRepository.getEntriesCountById.mock.calls[0].arguments, ["12", loggedUser.id]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await sexService.getEntriesCountBySex("12", null);

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

test("Find all sexes", async () => {
  const sexesData = sexFactory.buildList(3);

  sexRepository.findSexes.mock.mockImplementationOnce(() => Promise.resolve(sexesData));

  await sexService.findAllSexes();

  assert.strictEqual(sexRepository.findSexes.mock.callCount(), 1);
  assert.deepStrictEqual(sexRepository.findSexes.mock.calls[0].arguments, [
    {
      orderBy: "libelle",
    },
  ]);
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const sexesData = sexFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    sexRepository.findSexes.mock.mockImplementationOnce(() => Promise.resolve(sexesData));

    await sexService.findPaginatedSexes(loggedUser, {});

    assert.strictEqual(sexRepository.findSexes.mock.callCount(), 1);
    assert.deepStrictEqual(sexRepository.findSexes.mock.calls[0].arguments, [
      { limit: undefined, offset: undefined, orderBy: undefined, q: undefined, sortOrder: undefined },
      loggedUser.id,
    ]);
  });

  test("should handle params when retrieving paginated sexes", async () => {
    const sexesData = sexFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: SexesSearchParams = {
      orderBy: "libelle",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    sexRepository.findSexes.mock.mockImplementationOnce(() => Promise.resolve([sexesData[0]]));

    await sexService.findPaginatedSexes(loggedUser, searchParams);

    assert.strictEqual(sexRepository.findSexes.mock.callCount(), 1);
    assert.deepStrictEqual(sexRepository.findSexes.mock.calls[0].arguments, [
      {
        q: "Bob",
        orderBy: "libelle",
        sortOrder: "desc",
        offset: 0,
        limit: 10,
      },
      loggedUser.id,
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesPaginatedResult = await sexService.findPaginatedSexes(null, {});

    assert.deepStrictEqual(entitiesPaginatedResult, err("notAllowed"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await sexService.getSexesCount(loggedUser);

    assert.strictEqual(sexRepository.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(sexRepository.getCount.mock.calls[0].arguments, [undefined]);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await sexService.getSexesCount(loggedUser, "test");

    assert.strictEqual(sexRepository.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(sexRepository.getCount.mock.calls[0].arguments, ["test"]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await sexService.getSexesCount(null);

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

describe("Update of a sex", () => {
  test("should be allowed when user has permission", async () => {
    const sexData = upsertSexInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { sex: { canEdit: true } } });

    sexRepository.updateSex.mock.mockImplementationOnce(() => Promise.resolve(ok(sexFactory.build())));

    await sexService.updateSex(12, sexData, loggedUser);

    assert.strictEqual(sexRepository.updateSex.mock.callCount(), 1);
    assert.deepStrictEqual(sexRepository.updateSex.mock.calls[0].arguments, [12, sexData]);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = sexFactory.build({
      ownerId: "notAdmin",
    });

    const sexData = upsertSexInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    sexRepository.findSexById.mock.mockImplementationOnce(() => Promise.resolve(existingData));
    sexRepository.updateSex.mock.mockImplementationOnce(() => Promise.resolve(ok(sexFactory.build())));

    await sexService.updateSex(12, sexData, loggedUser);

    assert.strictEqual(sexRepository.updateSex.mock.callCount(), 1);
    assert.deepStrictEqual(sexRepository.updateSex.mock.calls[0].arguments, [12, sexData]);
  });

  test("should not be allowed when requested by an user that is nor owner nor has permission", async () => {
    const existingData = sexFactory.build({
      ownerId: "notAdmin",
    });

    const sexData = upsertSexInputFactory.build();

    const user = loggedUserFactory.build();

    sexRepository.findSexById.mock.mockImplementationOnce(() => Promise.resolve(existingData));

    const updateResult = await sexService.updateSex(12, sexData, user);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(sexRepository.updateSex.mock.callCount(), 0);
  });

  test("should not be allowed when trying to update to a sex that exists", async () => {
    const sexData = upsertSexInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { sex: { canEdit: true } } });

    sexRepository.updateSex.mock.mockImplementationOnce(() => Promise.resolve(err("alreadyExists")));

    const updateResult = await sexService.updateSex(12, sexData, loggedUser);

    assert.deepStrictEqual(updateResult, err("alreadyExists"));
    assert.strictEqual(sexRepository.updateSex.mock.callCount(), 1);
    assert.deepStrictEqual(sexRepository.updateSex.mock.calls[0].arguments, [12, sexData]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const sexData = upsertSexInputFactory.build();

    const updateResult = await sexService.updateSex(12, sexData, null);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(sexRepository.updateSex.mock.callCount(), 0);
  });
});

describe("Creation of a sex", () => {
  test("should create new sex", async () => {
    const sexData = upsertSexInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { sex: { canCreate: true } } });

    sexRepository.createSex.mock.mockImplementationOnce(() => Promise.resolve(ok(sexFactory.build())));

    await sexService.createSex(sexData, loggedUser);

    assert.strictEqual(sexRepository.createSex.mock.callCount(), 1);
    assert.deepStrictEqual(sexRepository.createSex.mock.calls[0].arguments, [
      {
        ...sexData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when trying to create a sex that already exists", async () => {
    const sexData = upsertSexInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { sex: { canCreate: true } } });

    sexRepository.createSex.mock.mockImplementationOnce(() => Promise.resolve(err("alreadyExists")));

    const createResult = await sexService.createSex(sexData, loggedUser);

    assert.deepStrictEqual(createResult, err("alreadyExists"));
    assert.strictEqual(sexRepository.createSex.mock.callCount(), 1);
    assert.deepStrictEqual(sexRepository.createSex.mock.calls[0].arguments, [
      {
        ...sexData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed if user has no permission", async () => {
    const sexData = upsertSexInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { sex: { canCreate: false } } });

    const createResult = await sexService.createSex(sexData, loggedUser);

    assert.deepStrictEqual(createResult, err("notAllowed"));
    assert.strictEqual(sexRepository.createSex.mock.callCount(), 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const sexData = upsertSexInputFactory.build();

    const createResult = await sexService.createSex(sexData, null);

    assert.deepStrictEqual(createResult, err("notAllowed"));
    assert.strictEqual(sexRepository.createSex.mock.callCount(), 0);
  });
});

describe("Deletion of a sex", () => {
  test("should handle the deletion of an owned sex", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
      role: "user",
    });

    const sex = sexFactory.build({
      ownerId: loggedUser.id,
    });

    sexRepository.findSexById.mock.mockImplementationOnce(() => Promise.resolve(sex));

    await sexService.deleteSex(11, loggedUser);

    assert.strictEqual(sexRepository.deleteSexById.mock.callCount(), 1);
    assert.deepStrictEqual(sexRepository.deleteSexById.mock.calls[0].arguments, [11]);
  });

  test("should handle the deletion of any sex if has permission", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { sex: { canDelete: true } } });

    sexRepository.findSexById.mock.mockImplementationOnce(() => Promise.resolve(sexFactory.build()));

    await sexService.deleteSex(11, loggedUser);

    assert.strictEqual(sexRepository.deleteSexById.mock.callCount(), 1);
    assert.deepStrictEqual(sexRepository.deleteSexById.mock.calls[0].arguments, [11]);
  });

  test("should not be allowed when deleting a non-owned sex and no permission", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
    });

    const deleteResult = await sexService.deleteSex(11, loggedUser);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(sexRepository.deleteSexById.mock.callCount(), 0);
  });

  test("should not be allowed when the entity is used", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { sex: { canDelete: true } } });

    sexRepository.getEntriesCountById.mock.mockImplementationOnce(() => Promise.resolve(1));

    const deleteResult = await sexService.deleteSex(11, loggedUser);

    assert.deepStrictEqual(deleteResult, err("isUsed"));
    assert.strictEqual(sexRepository.deleteSexById.mock.callCount(), 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await sexService.deleteSex(11, null);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(sexRepository.deleteSexById.mock.callCount(), 0);
  });
});

test("Create multiple sexes", async () => {
  const sexesData = sexCreateInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  sexRepository.createSexes.mock.mockImplementationOnce(() => Promise.resolve([]));

  await sexService.createSexes(sexesData, loggedUser);

  assert.strictEqual(sexRepository.createSexes.mock.callCount(), 1);
  assert.deepStrictEqual(sexRepository.createSexes.mock.calls[0].arguments, [
    sexesData.map((sex) => {
      return {
        ...sex,
        ownerId: loggedUser.id,
      };
    }),
  ]);
});
