import { inventoryFactory } from "@fixtures/domain/inventory/inventory.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import type { EntryRepository } from "@interfaces/entry-repository-interface.js";
import type { InventoryRepository } from "@interfaces/inventory-repository-interface.js";
import type { EntriesSearchParams, UpsertEntryInput } from "@ou-ca/common/api/entry";
import { err, ok } from "neverthrow";
import { createMockPool } from "slonik";
import { vi } from "vitest";
import { any, anyNumber, anyObject, mock as mockVe } from "vitest-mock-extended";
import type { DonneeComportementRepository } from "../../repositories/donnee-comportement/donnee-comportement-repository.js";
import type { DonneeMilieuRepository } from "../../repositories/donnee-milieu/donnee-milieu-repository.js";
import type { Donnee, DonneeCreateInput } from "../../repositories/donnee/donnee-repository-types.js";
import type { DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { mock, mockVi } from "../../utils/mock.js";
import { buildEntryService } from "./entry-service.js";

const entryRepository = mock<EntryRepository>();
const entryRepositoryLegacy = mockVi<DonneeRepository>();
const entryBehaviorRepository = mockVi<DonneeComportementRepository>();
const entryEnvironmentRepository = mockVi<DonneeMilieuRepository>();
const inventoryRepository = mockVi<InventoryRepository>();
const slonik = createMockPool({
  query: vi.fn(),
});

const entryService = buildEntryService({
  slonik,
  inventoryRepository,
  entryRepository,
  entryRepositoryLegacy,
  entryBehaviorRepository,
  entryEnvironmentRepository,
});

const reshapeInputEntryUpsertData = vi.fn<unknown[], DonneeCreateInput>();
vi.doMock("./entry-service-reshape.js", () => {
  return {
    __esModule: true,
    reshapeInputEntryUpsertData,
  };
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe("Find data", () => {
  test("should handle a matching data", async () => {
    const dataData = mockVe<Donnee>();
    const loggedUser = loggedUserFactory.build();

    entryRepositoryLegacy.findDonneeById.mockResolvedValueOnce(dataData);

    await entryService.findEntry(12, loggedUser);

    expect(entryRepositoryLegacy.findDonneeById).toHaveBeenCalledTimes(1);
    expect(entryRepositoryLegacy.findDonneeById).toHaveBeenLastCalledWith(12);
  });

  test("should handle data not found", async () => {
    entryRepositoryLegacy.findDonneeById.mockResolvedValueOnce(null);
    const loggedUser = loggedUserFactory.build();

    await expect(entryService.findEntry(10, loggedUser)).resolves.toEqual(ok(null));

    expect(entryRepositoryLegacy.findDonneeById).toHaveBeenCalledTimes(1);
    expect(entryRepositoryLegacy.findDonneeById).toHaveBeenLastCalledWith(10);
  });

  test("should not be allowed when the no login details are provided", async () => {
    expect(await entryService.findEntry(11, null)).toEqual(err("notAllowed"));

    expect(entryRepositoryLegacy.findDonneeById).not.toHaveBeenCalled();
  });
});

test("Find all datas", async () => {
  const dataData = [mockVe<Donnee>(), mockVe<Donnee>(), mockVe<Donnee>()];

  entryRepositoryLegacy.findDonnees.mockResolvedValueOnce(dataData);

  await entryService.findAllEntries();

  expect(entryRepositoryLegacy.findDonnees).toHaveBeenCalledTimes(1);
});

describe("Data paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const dataData = [mockVe<Donnee>(), mockVe<Donnee>(), mockVe<Donnee>()];
    const loggedUser = loggedUserFactory.build();

    entryRepositoryLegacy.findDonnees.mockResolvedValueOnce(dataData);

    await entryService.findPaginatedEntries(loggedUser, {
      pageNumber: 1,
      pageSize: 10,
    });

    expect(entryRepositoryLegacy.findDonnees).toHaveBeenCalledTimes(1);
    expect(entryRepositoryLegacy.findDonnees).toHaveBeenLastCalledWith({
      offset: 0,
      limit: 10,
    });
  });

  test("should handle params when retrieving paginated data", async () => {
    const dataData = [mockVe<Donnee>(), mockVe<Donnee>(), mockVe<Donnee>()];
    const loggedUser = loggedUserFactory.build();

    const searchParams: EntriesSearchParams = {
      number: 12,
      breeders: ["certain", "probable"],
      orderBy: "departement",
      sortOrder: "desc",
      pageNumber: 1,
      pageSize: 10,
    };

    entryRepositoryLegacy.findDonnees.mockResolvedValueOnce([dataData[0]]);

    await entryService.findPaginatedEntries(loggedUser, searchParams);

    expect(entryRepositoryLegacy.findDonnees).toHaveBeenCalledTimes(1);
    expect(entryRepositoryLegacy.findDonnees).toHaveBeenLastCalledWith({
      searchCriteria: {
        number: 12,
        breeders: ["certain", "probable"],
      },
      orderBy: "departement",
      sortOrder: "desc",
      offset: 0,
      limit: 10,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    expect(await entryService.findPaginatedEntries(null, { pageNumber: 1, pageSize: 10 })).toEqual(err("notAllowed"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await entryService.getEntriesCount(loggedUser, {
      pageNumber: 1,
      pageSize: 10,
    });

    expect(entryRepositoryLegacy.getCount).toHaveBeenCalledTimes(1);
    expect(entryRepositoryLegacy.getCount).toHaveBeenLastCalledWith(undefined);
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

    expect(entryRepositoryLegacy.getCount).toHaveBeenCalledTimes(1);
    expect(entryRepositoryLegacy.getCount).toHaveBeenLastCalledWith({
      number: 12,
      breeders: ["certain", "probable"],
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    expect(await entryService.getEntriesCount(null, { pageNumber: 1, pageSize: 10 })).toEqual(err("notAllowed"));
  });
});

describe("Get next group", () => {
  test("should handle existing groups", async () => {
    const loggedUser = loggedUserFactory.build();

    entryRepositoryLegacy.findLatestRegroupement.mockResolvedValueOnce(18);

    const nextRegroupement = await entryService.findNextGrouping(loggedUser);

    expect(entryRepositoryLegacy.findLatestRegroupement).toHaveBeenCalledTimes(1);
    expect(nextRegroupement).toEqual(ok(19));
  });

  test("should handle no existing group", async () => {
    const loggedUser = loggedUserFactory.build();

    entryRepositoryLegacy.findLatestRegroupement.mockResolvedValueOnce(null);

    await entryService.findNextGrouping(loggedUser);

    expect(entryRepositoryLegacy.findLatestRegroupement).toHaveBeenCalledTimes(1);
  });

  test("should not be allowed when the no login details are provided", async () => {
    expect(await entryService.findNextGrouping(null)).toEqual(err("notAllowed"));
    expect(entryRepositoryLegacy.findLatestRegroupement).not.toHaveBeenCalled();
  });
});

describe("Deletion of a data", () => {
  test("should handle the deletion of any data if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    const matchingInventory = inventoryFactory.build();

    const deletedEntry = mockVe<Donnee>({
      id: "42",
    });

    inventoryRepository.findInventoryByEntryId.mockResolvedValueOnce(matchingInventory);
    entryRepositoryLegacy.deleteDonneeById.mockResolvedValueOnce(deletedEntry);

    const result = await entryService.deleteEntry("11", loggedUser);

    expect(entryRepositoryLegacy.deleteDonneeById).toHaveBeenCalledTimes(1);
    expect(result).toEqual(ok(deletedEntry));
  });

  describe("should handle the deletion of any data belonging to a owned inventory if non-admin", () => {
    test("when the inventory exists", async () => {
      const loggedUser = loggedUserFactory.build({
        id: "12",
        role: "contributor",
      });

      const matchingInventory = inventoryFactory.build({
        ownerId: loggedUser.id,
      });

      const deletedEntry = mockVe<Donnee>({
        id: "42",
      });

      inventoryRepository.findInventoryByEntryId.mockResolvedValueOnce(matchingInventory);
      entryRepositoryLegacy.deleteDonneeById.mockResolvedValueOnce(deletedEntry);

      const result = await entryService.deleteEntry("11", loggedUser);

      expect(entryRepositoryLegacy.deleteDonneeById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(ok(deletedEntry));
    });

    test("unless no matching inventory has been found", async () => {
      const loggedUser = loggedUserFactory.build({
        id: "12",
        role: "contributor",
      });

      const deletedEntry = mockVe<Donnee>({
        id: "42",
      });

      inventoryRepository.findInventoryByEntryId.mockResolvedValueOnce(null);
      entryRepositoryLegacy.deleteDonneeById.mockResolvedValueOnce(deletedEntry);

      expect(await entryService.deleteEntry("11", loggedUser)).toEqual(err("notAllowed"));
      expect(entryRepositoryLegacy.deleteDonneeById).not.toHaveBeenCalled();
    });
  });

  test("should not be allowed when trying to deletre a data belonging to a non-owned inventory", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "contributor",
    });

    inventoryRepository.findInventoryByEntryId.mockResolvedValueOnce(inventoryFactory.build());

    expect(await entryService.deleteEntry("11", loggedUser)).toEqual(err("notAllowed"));
    expect(entryRepositoryLegacy.deleteDonneeById).not.toHaveBeenCalled();
  });

  test("should not be allowed when the requester is not logged", async () => {
    expect(await entryService.deleteEntry("11", null)).toEqual(err("notAllowed"));
    expect(entryRepositoryLegacy.deleteDonneeById).not.toHaveBeenCalled();
  });
});

describe("Update of a data", () => {
  test("should update existing data", async () => {
    const dataData = mockVe<UpsertEntryInput>({
      behaviorIds: ["2", "3"],
      environmentIds: ["4", "5"],
    });

    const loggedUser = loggedUserFactory.build();

    entryRepositoryLegacy.findExistingDonnee.mockResolvedValueOnce(null);
    entryRepositoryLegacy.createDonnee.mockResolvedValueOnce(
      mockVe<Donnee>({
        id: "12",
      }),
    );

    const reshapedInputData = mockVe<DonneeCreateInput>();
    reshapeInputEntryUpsertData.mockReturnValueOnce(reshapedInputData);

    await entryService.updateEntry("12", dataData, loggedUser);

    expect(entryRepositoryLegacy.updateDonnee).toHaveBeenCalledTimes(1);
    expect(entryRepositoryLegacy.updateDonnee).toHaveBeenLastCalledWith(12, any(), any());
    expect(entryBehaviorRepository.deleteComportementsOfDonneeId).toHaveBeenCalledTimes(1);
    expect(entryBehaviorRepository.deleteComportementsOfDonneeId).toHaveBeenLastCalledWith(12, any());
    expect(entryBehaviorRepository.insertDonneeWithComportements).toHaveBeenCalledTimes(1);
    expect(entryBehaviorRepository.insertDonneeWithComportements).toHaveBeenLastCalledWith(
      anyNumber(),
      expect.arrayContaining([2, 3]),
      anyObject(),
    );
    expect(entryEnvironmentRepository.deleteMilieuxOfDonneeId).toHaveBeenCalledTimes(1);
    expect(entryEnvironmentRepository.deleteMilieuxOfDonneeId).toHaveBeenLastCalledWith(12, any());
    expect(entryEnvironmentRepository.insertDonneeWithMilieux).toHaveBeenCalledTimes(1);
    expect(entryEnvironmentRepository.insertDonneeWithMilieux).toHaveBeenLastCalledWith(
      anyNumber(),
      expect.arrayContaining([4, 5]),
      anyObject(),
    );
  });

  test("should not be allowed when trying to update to a different data that already exists", async () => {
    const dataData = mockVe<UpsertEntryInput>();

    const loggedUser = loggedUserFactory.build();

    entryRepositoryLegacy.findExistingDonnee.mockResolvedValueOnce(
      mockVe<Donnee>({
        id: "345",
      }),
    );

    expect(await entryService.updateEntry("12", dataData, loggedUser)).toEqual(
      err({
        type: "similarEntryAlreadyExists",
        correspondingEntryFound: "345",
      }),
    );
    expect(entryRepositoryLegacy.updateDonnee).not.toHaveBeenCalled();
  });

  test("should not be allowed when the requester is not logged", async () => {
    const dataData = mockVe<UpsertEntryInput>();

    expect(await entryService.updateEntry("12", dataData, null)).toEqual(err({ type: "notAllowed" }));
    expect(entryRepositoryLegacy.createDonnee).not.toHaveBeenCalled();
  });
});

describe("Creation of a data", () => {
  test("should create new data without behaviors or environments", async () => {
    const dataData = mockVe<UpsertEntryInput>({
      behaviorIds: [],
      environmentIds: [],
    });

    const loggedUser = loggedUserFactory.build();

    const reshapedInputData = mockVe<DonneeCreateInput>();
    reshapeInputEntryUpsertData.mockReturnValueOnce(reshapedInputData);

    await entryService.createEntry(dataData, loggedUser);

    expect(entryRepositoryLegacy.createDonnee).toHaveBeenCalledTimes(1);
    expect(entryRepositoryLegacy.createDonnee).toHaveBeenLastCalledWith(any(), any());
    expect(entryBehaviorRepository.insertDonneeWithComportements).not.toHaveBeenCalled();
    expect(entryEnvironmentRepository.insertDonneeWithMilieux).not.toHaveBeenCalled();
  });

  test("should create new data with behaviors only", async () => {
    const dataData = mockVe<UpsertEntryInput>({
      behaviorIds: ["2", "3"],
      environmentIds: [],
    });

    const loggedUser = loggedUserFactory.build();

    const reshapedInputData = mockVe<DonneeCreateInput>();
    reshapeInputEntryUpsertData.mockReturnValueOnce(reshapedInputData);
    entryRepositoryLegacy.createDonnee.mockResolvedValueOnce(
      mockVe<Donnee>({
        id: "12",
      }),
    );

    await entryService.createEntry(dataData, loggedUser);

    expect(entryRepositoryLegacy.createDonnee).toHaveBeenCalledTimes(1);
    expect(entryRepositoryLegacy.createDonnee).toHaveBeenLastCalledWith(any(), any());
    expect(entryBehaviorRepository.insertDonneeWithComportements).toHaveBeenCalledTimes(1);
    expect(entryBehaviorRepository.insertDonneeWithComportements).toHaveBeenLastCalledWith(12, [2, 3], any());
    expect(entryEnvironmentRepository.insertDonneeWithMilieux).not.toHaveBeenCalled();
  });

  test("should create new data with environments only", async () => {
    const dataData = mockVe<UpsertEntryInput>({
      behaviorIds: [],
      environmentIds: ["2", "3"],
    });

    const loggedUser = loggedUserFactory.build();

    const reshapedInputData = mockVe<DonneeCreateInput>();
    reshapeInputEntryUpsertData.mockReturnValueOnce(reshapedInputData);
    entryRepositoryLegacy.createDonnee.mockResolvedValueOnce(
      mockVe<Donnee>({
        id: "12",
      }),
    );

    await entryService.createEntry(dataData, loggedUser);

    expect(entryRepositoryLegacy.createDonnee).toHaveBeenCalledTimes(1);
    expect(entryRepositoryLegacy.createDonnee).toHaveBeenLastCalledWith(any(), any());
    expect(entryBehaviorRepository.insertDonneeWithComportements).not.toHaveBeenCalled();
    expect(entryEnvironmentRepository.insertDonneeWithMilieux).toHaveBeenCalledTimes(1);
    expect(entryEnvironmentRepository.insertDonneeWithMilieux).toHaveBeenLastCalledWith(12, [2, 3], any());
  });
});
