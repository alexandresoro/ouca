import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import { entryFactory } from "@fixtures/domain/entry/entry.fixtures.js";
import { inventoryFactory } from "@fixtures/domain/inventory/inventory.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertEntryInputFactory } from "@fixtures/services/entry/entry-service.fixtures.js";
import type { EntryRepository } from "@interfaces/entry-repository-interface.js";
import type { InventoryRepository } from "@interfaces/inventory-repository-interface.js";
import type { EntriesSearchParams } from "@ou-ca/common/api/entry";
import { err, ok } from "neverthrow";
import { mock } from "../../../utils/mock.js";
import { buildEntryService } from "./entry-service.js";

const entryRepository = mock<EntryRepository>();
const inventoryRepository = mock<InventoryRepository>();

const entryService = buildEntryService({
  inventoryRepository,
  entryRepository,
});

beforeEach(() => {
  entryRepository.findEntryById.mock.resetCalls();
  entryRepository.findExistingEntry.mock.resetCalls();
  entryRepository.findEntries.mock.resetCalls();
  entryRepository.getCount.mock.resetCalls();
  entryRepository.createEntry.mock.resetCalls();
  entryRepository.updateEntry.mock.resetCalls();
  entryRepository.deleteEntryById.mock.resetCalls();
  entryRepository.findLatestGrouping.mock.resetCalls();
  inventoryRepository.findInventoryByEntryId.mock.resetCalls();
});

describe("Find data", () => {
  test("should handle a matching data", async () => {
    const dataData = entryFactory.build();
    const loggedUser = loggedUserFactory.build();

    entryRepository.findEntryById.mock.mockImplementationOnce(() => Promise.resolve(dataData));

    await entryService.findEntry("12", loggedUser);

    assert.strictEqual(entryRepository.findEntryById.mock.callCount(), 1);
    assert.deepStrictEqual(entryRepository.findEntryById.mock.calls[0].arguments, ["12"]);
  });

  test("should handle data not found", async () => {
    entryRepository.findEntryById.mock.mockImplementationOnce(() => Promise.resolve(null));
    const loggedUser = loggedUserFactory.build();

    assert.deepStrictEqual(await entryService.findEntry("10", loggedUser), ok(null));

    assert.strictEqual(entryRepository.findEntryById.mock.callCount(), 1);
    assert.deepStrictEqual(entryRepository.findEntryById.mock.calls[0].arguments, ["10"]);
  });

  test("should not be allowed when the no login details are provided", async () => {
    assert.deepStrictEqual(await entryService.findEntry("11", null), err("notAllowed"));

    assert.strictEqual(entryRepository.findEntryById.mock.callCount(), 0);
  });
});

test("Find all datas", async () => {
  const dataData = entryFactory.buildList(3);

  entryRepository.findEntries.mock.mockImplementationOnce(() => Promise.resolve(dataData));

  await entryService.findAllEntries();

  assert.strictEqual(entryRepository.findEntries.mock.callCount(), 1);
});

describe("Data paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const dataData = entryFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    entryRepository.findEntries.mock.mockImplementationOnce(() => Promise.resolve(dataData));

    await entryService.findPaginatedEntries(loggedUser, {
      pageNumber: 1,
      pageSize: 10,
    });

    assert.strictEqual(entryRepository.findEntries.mock.callCount(), 1);
    assert.deepStrictEqual(entryRepository.findEntries.mock.calls[0].arguments, [
      {
        orderBy: undefined,
        sortOrder: undefined,
        searchCriteria: { ownerId: loggedUser.id },
        offset: 0,
        limit: 10,
      },
    ]);
  });

  test("should handle params when retrieving paginated data", async () => {
    const dataData = entryFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: EntriesSearchParams = {
      number: 12,
      breeders: ["certain", "probable"],
      orderBy: "departement",
      sortOrder: "desc",
      pageNumber: 1,
      pageSize: 10,
    };

    entryRepository.findEntries.mock.mockImplementationOnce(() => Promise.resolve([dataData[0]]));

    await entryService.findPaginatedEntries(loggedUser, searchParams);

    assert.strictEqual(entryRepository.findEntries.mock.callCount(), 1);
    assert.deepStrictEqual(entryRepository.findEntries.mock.calls[0].arguments, [
      {
        searchCriteria: {
          number: 12,
          breeders: ["certain", "probable"],
          ownerId: loggedUser.id,
        },
        orderBy: "department",
        sortOrder: "desc",
        offset: 0,
        limit: 10,
      },
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    assert.deepStrictEqual(
      await entryService.findPaginatedEntries(null, { pageNumber: 1, pageSize: 10 }),
      err("notAllowed"),
    );
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await entryService.getEntriesCount(loggedUser, {
      pageNumber: 1,
      pageSize: 10,
    });

    assert.strictEqual(entryRepository.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(entryRepository.getCount.mock.calls[0].arguments, [
      {
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    const searchCriteria: EntriesSearchParams = {
      pageNumber: 1,
      pageSize: 10,
      number: 12,
      breeders: ["certain", "probable"],
    };

    await entryService.getEntriesCount(loggedUser, searchCriteria);

    assert.strictEqual(entryRepository.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(entryRepository.getCount.mock.calls[0].arguments, [
      {
        number: 12,
        breeders: ["certain", "probable"],
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    assert.deepStrictEqual(
      await entryService.getEntriesCount(null, { pageNumber: 1, pageSize: 10 }),
      err("notAllowed"),
    );
  });
});

describe("Get next group", () => {
  test("should handle existing groups", async () => {
    const loggedUser = loggedUserFactory.build();

    entryRepository.findLatestGrouping.mock.mockImplementationOnce(() => Promise.resolve(18));

    const nextRegroupement = await entryService.findNextGrouping(loggedUser);

    assert.strictEqual(entryRepository.findLatestGrouping.mock.callCount(), 1);
    assert.deepStrictEqual(nextRegroupement, ok(19));
  });

  test("should handle no existing group", async () => {
    const loggedUser = loggedUserFactory.build();

    entryRepository.findLatestGrouping.mock.mockImplementationOnce(() => Promise.resolve(null));

    const nextRegroupement = await entryService.findNextGrouping(loggedUser);

    assert.strictEqual(entryRepository.findLatestGrouping.mock.callCount(), 1);
    assert.deepStrictEqual(nextRegroupement, ok(1));
  });

  test("should not be allowed when the no login details are provided", async () => {
    const result = await entryService.findNextGrouping(null);

    assert.deepStrictEqual(result, err("notAllowed"));
    assert.strictEqual(entryRepository.findLatestGrouping.mock.callCount(), 0);
  });
});

describe("Deletion of a data", () => {
  test("should handle the deletion of any data if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    const matchingInventory = inventoryFactory.build();

    const deletedEntry = entryFactory.build({
      id: "42",
    });

    inventoryRepository.findInventoryByEntryId.mock.mockImplementationOnce(() => Promise.resolve(matchingInventory));
    entryRepository.deleteEntryById.mock.mockImplementationOnce(() => Promise.resolve(deletedEntry));

    const result = await entryService.deleteEntry("11", loggedUser);

    assert.strictEqual(entryRepository.deleteEntryById.mock.callCount(), 1);
    assert.deepStrictEqual(result, ok(deletedEntry));
  });

  describe("should handle the deletion of any data belonging to a owned inventory if non-admin", () => {
    test("when the inventory exists", async () => {
      const loggedUser = loggedUserFactory.build({
        id: "12",
        role: "user",
      });

      const matchingInventory = inventoryFactory.build({
        ownerId: loggedUser.id,
      });

      const deletedEntry = entryFactory.build({
        id: "42",
      });

      inventoryRepository.findInventoryByEntryId.mock.mockImplementationOnce(() => Promise.resolve(matchingInventory));
      entryRepository.deleteEntryById.mock.mockImplementationOnce(() => Promise.resolve(deletedEntry));

      const result = await entryService.deleteEntry("11", loggedUser);

      assert.strictEqual(entryRepository.deleteEntryById.mock.callCount(), 1);
      assert.deepStrictEqual(result, ok(deletedEntry));
    });

    test("unless no matching inventory has been found", async () => {
      const loggedUser = loggedUserFactory.build({
        id: "12",
        role: "user",
      });

      const deletedEntry = entryFactory.build();

      inventoryRepository.findInventoryByEntryId.mock.mockImplementationOnce(() => Promise.resolve(null));
      entryRepository.deleteEntryById.mock.mockImplementationOnce(() => Promise.resolve(deletedEntry));

      assert.deepStrictEqual(await entryService.deleteEntry("11", loggedUser), err("notAllowed"));
      assert.strictEqual(entryRepository.deleteEntryById.mock.callCount(), 0);
    });
  });

  test("should not be allowed when trying to deletre a data belonging to a non-owned inventory", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "user",
    });

    inventoryRepository.findInventoryByEntryId.mock.mockImplementationOnce(() =>
      Promise.resolve(inventoryFactory.build()),
    );

    assert.deepStrictEqual(await entryService.deleteEntry("11", loggedUser), err("notAllowed"));
    assert.strictEqual(entryRepository.deleteEntryById.mock.callCount(), 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    assert.deepStrictEqual(await entryService.deleteEntry("11", null), err("notAllowed"));
    assert.strictEqual(entryRepository.deleteEntryById.mock.callCount(), 0);
  });
});

describe("Update of a data", () => {
  test("should update existing data", async () => {
    const dataData = upsertEntryInputFactory.build();
    const { regroupment, ...restEntry } = dataData;

    const loggedUser = loggedUserFactory.build();

    entryRepository.findExistingEntry.mock.mockImplementationOnce(() => Promise.resolve(null));
    inventoryRepository.findInventoryByEntryId.mock.mockImplementationOnce(() =>
      Promise.resolve(
        inventoryFactory.build({
          ownerId: loggedUser.id,
        }),
      ),
    );

    await entryService.updateEntry("12", dataData, loggedUser);

    assert.strictEqual(entryRepository.updateEntry.mock.callCount(), 1);
    assert.deepStrictEqual(entryRepository.updateEntry.mock.calls[0].arguments, [
      "12",
      { ...restEntry, grouping: regroupment },
    ]);
  });

  test("should not be allowed when trying to update to a different data that already exists", async () => {
    const dataData = upsertEntryInputFactory.build();

    const loggedUser = loggedUserFactory.build();

    entryRepository.findExistingEntry.mock.mockImplementationOnce(() =>
      Promise.resolve(
        entryFactory.build({
          id: "345",
        }),
      ),
    );
    inventoryRepository.findInventoryByEntryId.mock.mockImplementationOnce(() =>
      Promise.resolve(
        inventoryFactory.build({
          ownerId: loggedUser.id,
        }),
      ),
    );

    assert.deepStrictEqual(
      await entryService.updateEntry("12", dataData, loggedUser),
      err({
        type: "similarEntryAlreadyExists",
        correspondingEntryFound: "345",
      }),
    );
    assert.strictEqual(entryRepository.updateEntry.mock.callCount(), 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const dataData = upsertEntryInputFactory.build();

    assert.deepStrictEqual(await entryService.updateEntry("12", dataData, null), err({ type: "notAllowed" }));
    assert.strictEqual(entryRepository.updateEntry.mock.callCount(), 0);
  });
});

describe("Creation of a data", () => {
  test("should create new data without behaviors or environments", async () => {
    const dataData = upsertEntryInputFactory.build({
      behaviorIds: [],
      environmentIds: [],
    });
    const { regroupment, ...restEntry } = dataData;

    const loggedUser = loggedUserFactory.build();

    await entryService.createEntry(dataData, loggedUser);

    assert.strictEqual(entryRepository.createEntry.mock.callCount(), 1);
    assert.deepStrictEqual(entryRepository.createEntry.mock.calls[0].arguments, [
      { ...restEntry, grouping: regroupment },
    ]);
  });

  test("should create new data with behaviors only", async () => {
    const dataData = upsertEntryInputFactory.build({
      behaviorIds: ["2", "3"],
      environmentIds: [],
    });
    const { regroupment, ...restEntry } = dataData;

    const loggedUser = loggedUserFactory.build();

    entryRepository.createEntry.mock.mockImplementationOnce(() => Promise.resolve(entryFactory.build()));

    await entryService.createEntry(dataData, loggedUser);

    assert.strictEqual(entryRepository.createEntry.mock.callCount(), 1);
    assert.deepStrictEqual(entryRepository.createEntry.mock.calls[0].arguments, [
      { ...restEntry, grouping: regroupment },
    ]);
  });

  test("should create new data with environments only", async () => {
    const dataData = upsertEntryInputFactory.build({
      behaviorIds: [],
      environmentIds: ["2", "3"],
    });
    const { regroupment, ...restEntry } = dataData;

    const loggedUser = loggedUserFactory.build();

    entryRepository.createEntry.mock.mockImplementationOnce(() => Promise.resolve(entryFactory.build()));

    await entryService.createEntry(dataData, loggedUser);

    assert.strictEqual(entryRepository.createEntry.mock.callCount(), 1);
    assert.deepStrictEqual(entryRepository.createEntry.mock.calls[0].arguments, [
      { ...restEntry, grouping: regroupment },
    ]);
  });
});
