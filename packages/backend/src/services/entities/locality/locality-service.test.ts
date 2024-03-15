import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import type { LoggedUser } from "@domain/user/logged-user.js";
import { localityFactory } from "@fixtures/domain/locality/locality.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertLocalityInputFactory } from "@fixtures/services/locality/locality-service.fixtures.js";
import type { LocalitiesSearchParams } from "@ou-ca/common/api/locality";
import { err, ok } from "neverthrow";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import type { DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import type { InventaireRepository } from "../../../repositories/inventaire/inventaire-repository.js";
import type { LieuditRepository } from "../../../repositories/lieudit/lieudit-repository.js";
import { mock } from "../../../utils/mock.js";
import { buildLocalityService } from "./locality-service.js";

const localityRepository = mock<LieuditRepository>();
const inventoryRepository = mock<InventaireRepository>();
const entryRepository = mock<DonneeRepository>();

const localityService = buildLocalityService({
  localityRepository,
  inventoryRepository,
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
  localityRepository.findLieuditById.mock.resetCalls();
  localityRepository.findLieuditByInventaireId.mock.resetCalls();
  localityRepository.findLieuxdits.mock.resetCalls();
  localityRepository.getCount.mock.resetCalls();
  localityRepository.updateLieudit.mock.resetCalls();
  localityRepository.createLieudit.mock.resetCalls();
  localityRepository.deleteLieuditById.mock.resetCalls();
  localityRepository.createLieuxdits.mock.resetCalls();
  inventoryRepository.getCountByLocality.mock.resetCalls();
  entryRepository.getCountByLieuditId.mock.resetCalls();
});

describe("Find locality", () => {
  test("should handle a matching locality", async () => {
    const localityData = localityFactory.build();
    const loggedUser = loggedUserFactory.build();

    localityRepository.findLieuditById.mock.mockImplementationOnce(() => Promise.resolve(localityData));

    await localityService.findLocality(12, loggedUser);

    assert.strictEqual(localityRepository.findLieuditById.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.findLieuditById.mock.calls[0].arguments, [12]);
  });

  test("should handle locality not found", async () => {
    localityRepository.findLieuditById.mock.mockImplementationOnce(() => Promise.resolve(null));
    const loggedUser = loggedUserFactory.build();

    assert.deepStrictEqual(await localityService.findLocality(10, loggedUser), ok(null));

    assert.strictEqual(localityRepository.findLieuditById.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.findLieuditById.mock.calls[0].arguments, [10]);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await localityService.findLocality(11, null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
    assert.strictEqual(localityRepository.findLieuditById.mock.callCount(), 0);
  });
});

describe("Inventory count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await localityService.getInventoriesCountByLocality("12", loggedUser);

    assert.strictEqual(inventoryRepository.getCountByLocality.mock.callCount(), 1);
    assert.deepStrictEqual(inventoryRepository.getCountByLocality.mock.calls[0].arguments, [12]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const inventoriesCountResult = await localityService.getInventoriesCountByLocality("12", null);

    assert.deepStrictEqual(inventoriesCountResult, err("notAllowed"));
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await localityService.getEntriesCountByLocality("12", loggedUser);

    assert.strictEqual(entryRepository.getCountByLieuditId.mock.callCount(), 1);
    assert.deepStrictEqual(entryRepository.getCountByLieuditId.mock.calls[0].arguments, [12]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await localityService.getEntriesCountByLocality("12", null);

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

describe("Find locality by inventary ID", () => {
  test("should handle locality found", async () => {
    const localityData = localityFactory.build({
      id: "256",
    });
    const loggedUser = loggedUserFactory.build();

    localityRepository.findLieuditByInventaireId.mock.mockImplementationOnce(() => Promise.resolve(localityData));

    const localityResult = await localityService.findLocalityOfInventoryId(43, loggedUser);

    assert.strictEqual(localityRepository.findLieuditByInventaireId.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.findLieuditByInventaireId.mock.calls[0].arguments, [43]);
    assert.ok(localityResult.isOk());
    assert.strictEqual(localityResult.value?.id, localityData.id);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const findResult = await localityService.findLocalityOfInventoryId(12, null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
  });
});

test("Find all localities", async () => {
  const localitiesData = localityFactory.buildList(3);

  localityRepository.findLieuxdits.mock.mockImplementationOnce(() => Promise.resolve(localitiesData));

  await localityService.findAllLocalities();

  assert.strictEqual(localityRepository.findLieuxdits.mock.callCount(), 1);
  assert.deepStrictEqual(localityRepository.findLieuxdits.mock.calls[0].arguments, [
    {
      orderBy: "nom",
    },
  ]);
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const localitiesData = localityFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    localityRepository.findLieuxdits.mock.mockImplementationOnce(() => Promise.resolve(localitiesData));

    await localityService.findPaginatedLocalities(loggedUser, {});

    assert.strictEqual(localityRepository.findLieuxdits.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.findLieuxdits.mock.calls[0].arguments, [
      {
        q: undefined,
        orderBy: undefined,
        sortOrder: undefined,
        offset: undefined,
        limit: undefined,
        townId: undefined,
      },
    ]);
  });

  test("should handle params when retrieving paginated localities", async () => {
    const localitiesData = localityFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: LocalitiesSearchParams = {
      orderBy: "nom",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    localityRepository.findLieuxdits.mock.mockImplementationOnce(() => Promise.resolve([localitiesData[0]]));

    await localityService.findPaginatedLocalities(loggedUser, searchParams);

    assert.strictEqual(localityRepository.findLieuxdits.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.findLieuxdits.mock.calls[0].arguments, [
      {
        q: "Bob",
        orderBy: "nom",
        sortOrder: "desc",
        offset: 0,
        limit: searchParams.pageSize,
        townId: undefined,
      },
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesPaginatedResult = await localityService.findPaginatedLocalities(null, {});

    assert.deepStrictEqual(entitiesPaginatedResult, err("notAllowed"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await localityService.getLocalitiesCount(loggedUser, {});

    assert.strictEqual(localityRepository.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.getCount.mock.calls[0].arguments, [undefined, undefined]);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await localityService.getLocalitiesCount(loggedUser, { q: "test", townId: "12" });

    assert.strictEqual(localityRepository.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.getCount.mock.calls[0].arguments, ["test", 12]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await localityService.getLocalitiesCount(null, {});

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

describe("Update of a locality", () => {
  test("should be allowed when requested by an admin", async () => {
    const localityData = upsertLocalityInputFactory.build();
    const { townId, ...restLocalityData } = localityData;

    const loggedUser = loggedUserFactory.build({ role: "admin" });
    localityRepository.updateLieudit.mock.mockImplementationOnce(() => Promise.resolve(localityFactory.build()));

    await localityService.updateLocality(12, localityData, loggedUser);

    assert.strictEqual(localityRepository.updateLieudit.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.updateLieudit.mock.calls[0].arguments, [
      12,
      { ...restLocalityData, coordinates_system: "gps", commune_id: Number.parseInt(townId) },
    ]);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = localityFactory.build({
      ownerId: "notAdmin",
    });

    const localityData = upsertLocalityInputFactory.build();
    const { townId, ...restLocalityData } = localityData;

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    localityRepository.findLieuditById.mock.mockImplementationOnce(() => Promise.resolve(existingData));

    await localityService.updateLocality(12, localityData, loggedUser);

    assert.strictEqual(localityRepository.updateLieudit.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.updateLieudit.mock.calls[0].arguments, [
      12,
      {
        ...restLocalityData,
        coordinates_system: "gps",
        commune_id: Number.parseInt(townId),
      },
    ]);
  });

  test("should not be allowed when requested by an user that is nor owner nor admin", async () => {
    const existingData = localityFactory.build({
      ownerId: "notAdmin",
    });

    const localityData = upsertLocalityInputFactory.build();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    localityRepository.findLieuditById.mock.mockImplementationOnce(() => Promise.resolve(existingData));

    assert.deepStrictEqual(await localityService.updateLocality(12, localityData, user), err("notAllowed"));

    assert.strictEqual(localityRepository.updateLieudit.mock.callCount(), 0);
  });

  test("should not be allowed when trying to update to a locality that exists", async () => {
    const localityData = upsertLocalityInputFactory.build();
    const { townId, ...restLocalityData } = localityData;

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    localityRepository.updateLieudit.mock.mockImplementationOnce(uniqueConstraintFailed);

    assert.deepStrictEqual(await localityService.updateLocality(12, localityData, loggedUser), err("alreadyExists"));

    assert.strictEqual(localityRepository.updateLieudit.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.updateLieudit.mock.calls[0].arguments, [
      12,
      {
        ...restLocalityData,
        coordinates_system: "gps",
        commune_id: Number.parseInt(townId),
      },
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const localityData = upsertLocalityInputFactory.build();

    const updateResult = await localityService.updateLocality(12, localityData, null);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
  });
});

describe("Creation of a locality", () => {
  test("should create new locality", async () => {
    const localityData = upsertLocalityInputFactory.build();
    const { townId, ...restLocalityData } = localityData;

    const loggedUser = loggedUserFactory.build({ id: "a" });

    localityRepository.createLieudit.mock.mockImplementationOnce(() => Promise.resolve(localityFactory.build()));

    await localityService.createLocality(localityData, loggedUser);

    assert.strictEqual(localityRepository.createLieudit.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.createLieudit.mock.calls[0].arguments, [
      {
        ...restLocalityData,
        commune_id: Number.parseInt(townId),
        coordinates_system: "gps",
        owner_id: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when trying to create a locality that already exists", async () => {
    const localityData = upsertLocalityInputFactory.build();
    const { townId, ...restLocalityData } = localityData;

    const loggedUser = loggedUserFactory.build({ id: "a" });

    localityRepository.createLieudit.mock.mockImplementationOnce(uniqueConstraintFailed);

    assert.deepStrictEqual(await localityService.createLocality(localityData, loggedUser), err("alreadyExists"));

    assert.strictEqual(localityRepository.createLieudit.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.createLieudit.mock.calls[0].arguments, [
      {
        ...restLocalityData,
        commune_id: Number.parseInt(townId),
        coordinates_system: "gps",
        owner_id: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const localityData = upsertLocalityInputFactory.build();

    const createResult = await localityService.createLocality(localityData, null);

    assert.deepStrictEqual(createResult, err("notAllowed"));
  });
});

describe("Deletion of a locality", () => {
  test("should handle the deletion of an owned locality", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const locality = localityFactory.build({
      ownerId: loggedUser.id,
    });

    localityRepository.findLieuditById.mock.mockImplementationOnce(() => Promise.resolve(locality));
    localityRepository.deleteLieuditById.mock.mockImplementationOnce(() => Promise.resolve(localityFactory.build()));

    await localityService.deleteLocality(11, loggedUser);

    assert.strictEqual(localityRepository.deleteLieuditById.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.deleteLieuditById.mock.calls[0].arguments, [11]);
  });

  test("should handle the deletion of any locality if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    localityRepository.findLieuditById.mock.mockImplementationOnce(() => Promise.resolve(localityFactory.build()));
    localityRepository.deleteLieuditById.mock.mockImplementationOnce(() => Promise.resolve(localityFactory.build()));

    await localityService.deleteLocality(11, loggedUser);

    assert.strictEqual(localityRepository.deleteLieuditById.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.deleteLieuditById.mock.calls[0].arguments, [11]);
  });

  test("should not be allowed when deleting a non-owned locality as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "contributor",
    });

    localityRepository.findLieuditById.mock.mockImplementationOnce(() => Promise.resolve(localityFactory.build()));

    assert.deepStrictEqual(await localityService.deleteLocality(11, loggedUser), err("notAllowed"));

    assert.strictEqual(localityRepository.deleteLieuditById.mock.callCount(), 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await localityService.deleteLocality(11, null);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
  });
});

test("Create multiple localities", async () => {
  const localitiesData = upsertLocalityInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  localityRepository.createLieuxdits.mock.mockImplementationOnce(() => Promise.resolve([]));

  await localityService.createLocalities(localitiesData, loggedUser);

  assert.strictEqual(localityRepository.createLieuxdits.mock.callCount(), 1);
  assert.deepStrictEqual(localityRepository.createLieuxdits.mock.calls[0].arguments, [
    localitiesData.map((locality) => {
      const { townId, ...restLocality } = locality;
      return {
        ...restLocality,
        commune_id: Number.parseInt(townId),
        coordinates_system: "gps",
        owner_id: loggedUser.id,
      };
    }),
  ]);
});
