import { inventoryFactory } from "@fixtures/domain/inventory/inventory.fixtures.js";
import { localityFactory } from "@fixtures/domain/locality/locality.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import type { InventoryRepository } from "@interfaces/inventory-repository-interface.js";
import type { LocalityRepository } from "@interfaces/locality-repository-interface.js";
import type { InventoriesSearchParams, UpsertInventoryInput } from "@ou-ca/common/api/inventory";
import { err, ok } from "neverthrow";
import { createMockPool } from "slonik";
import { vi } from "vitest";
import { any, anyNumber, anyObject, mock as mockVe } from "vitest-mock-extended";
import type { DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import type { InventaireAssocieRepository } from "../../repositories/inventaire-associe/inventaire-associe-repository.js";
import type { InventaireMeteoRepository } from "../../repositories/inventaire-meteo/inventaire-meteo-repository.js";
import type { Inventaire, InventaireCreateInput } from "../../repositories/inventaire/inventaire-repository-types.js";
import type { InventaireRepository } from "../../repositories/inventaire/inventaire-repository.js";
import { mock, mockVi } from "../../utils/mock.js";
import { buildInventoryService } from "./inventory-service.js";

const inventoryRepository = mock<InventoryRepository>();
const inventoryRepositoryLegacy = mockVi<InventaireRepository>();
const inventoryAssociateRepository = mockVi<InventaireAssocieRepository>();
const inventoryWeatherRepository = mockVi<InventaireMeteoRepository>();
const entryRepository = mockVi<DonneeRepository>();
const localityRepository = mockVi<LocalityRepository>();
const slonik = createMockPool({
  query: vi.fn(),
});

const inventaireService = buildInventoryService({
  slonik,
  inventoryRepository,
  inventoryRepositoryLegacy,
  inventoryAssociateRepository,
  inventoryWeatherRepository,
  entryRepository,
  localityRepository,
});

const reshapeInputInventoryUpsertData = vi.fn();
vi.doMock("./inventaire-service-reshape.js", () => {
  return {
    __esModule: true,
    reshapeInputInventoryUpsertData,
  };
});

beforeEach(() => {
  vi.resetAllMocks();
  inventoryRepository.findInventoryById.mock.resetCalls();
  inventoryRepository.findInventoryByEntryId.mock.resetCalls();
  inventoryRepository.findInventories.mock.resetCalls();
  inventoryRepository.deleteInventoryById.mock.resetCalls();
  inventoryRepository.getCount.mock.resetCalls();
  inventoryRepository.getCountByLocality.mock.resetCalls();
});

describe("Find inventory", () => {
  test("should handle a matching inventory", async () => {
    const inventoryData = inventoryFactory.build();
    const loggedUser = loggedUserFactory.build();

    inventoryRepository.findInventoryById.mock.mockImplementationOnce(() => Promise.resolve(inventoryData));

    await inventaireService.findInventory(12, loggedUser);

    expect(inventoryRepository.findInventoryById.mock.callCount()).toEqual(1);
    expect(inventoryRepository.findInventoryById.mock.calls[0].arguments).toEqual([12]);
  });

  test("should handle inventory not found", async () => {
    inventoryRepository.findInventoryById.mock.mockImplementationOnce(() => Promise.resolve(null));
    const loggedUser = loggedUserFactory.build();

    await expect(inventaireService.findInventory(10, loggedUser)).resolves.toEqual(ok(null));

    expect(inventoryRepository.findInventoryById.mock.callCount()).toEqual(1);
    expect(inventoryRepository.findInventoryById.mock.calls[0].arguments).toEqual([10]);
  });

  test("should not be allowed when the no login details are provided", async () => {
    expect(await inventaireService.findInventory(11, null)).toEqual(err("notAllowed"));
    expect(inventoryRepository.findInventoryById.mock.callCount()).toEqual(0);
  });
});

describe("Find inventory by data ID", () => {
  test("should handle inventory found", async () => {
    const inventoryData = inventoryFactory.build();
    const loggedUser = loggedUserFactory.build();

    inventoryRepository.findInventoryByEntryId.mock.mockImplementationOnce(() => Promise.resolve(inventoryData));

    const inventory = await inventaireService.findInventoryOfEntryId("43", loggedUser);

    expect(inventoryRepository.findInventoryByEntryId.mock.callCount()).toEqual(1);
    expect(inventoryRepository.findInventoryByEntryId.mock.calls[0].arguments).toEqual(["43"]);
    expect(inventory).toEqual(ok(inventoryData));
  });

  test("should not be allowed when the requester is not logged", async () => {
    expect(await inventaireService.findInventoryOfEntryId("12", null)).toEqual(err("notAllowed"));
  });
});

test("Find all inventaries", async () => {
  const inventariesData = [mockVe<Inventaire>(), mockVe<Inventaire>(), mockVe<Inventaire>()];

  inventoryRepository.findInventories.mock.mockImplementationOnce(() => Promise.resolve(inventariesData));

  await inventaireService.findAllInventories();

  expect(inventoryRepository.findInventories.mock.callCount()).toEqual(1);
});

describe("Inventories paginated find by search criteria", () => {
  test("should handle params when retrieving paginated inventories", async () => {
    const inventoriesData = [mockVe<Inventaire>(), mockVe<Inventaire>(), mockVe<Inventaire>()];
    const loggedUser = loggedUserFactory.build();

    const searchParams: InventoriesSearchParams = {
      orderBy: "creationDate",
      sortOrder: "desc",
      pageNumber: 1,
      pageSize: 10,
    };

    inventoryRepository.findInventories.mock.mockImplementationOnce(() => Promise.resolve([inventoriesData[0]]));

    await inventaireService.findPaginatedInventories(loggedUser, searchParams);

    expect(inventoryRepository.findInventories.mock.callCount()).toEqual(1);
    expect(inventoryRepository.findInventories.mock.calls[0].arguments).toEqual([
      {
        orderBy: "creationDate",
        sortOrder: "desc",
        offset: 0,
        limit: searchParams.pageSize,
      },
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    expect(await inventaireService.findPaginatedInventories(null, mockVe<InventoriesSearchParams>())).toEqual(
      err("notAllowed"),
    );
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await inventaireService.getInventoriesCount(loggedUser);

    expect(inventoryRepository.getCount.mock.callCount()).toEqual(1);
  });

  test("should not be allowed when the requester is not logged", async () => {
    expect(await inventaireService.getInventoriesCount(null)).toEqual(err("notAllowed"));
  });
});

describe("Update of an inventory", () => {
  describe("to values already matching an existing inventory", () => {
    test("should return the correct state if no migration requested", async () => {
      const inventoryData = mockVe<UpsertInventoryInput>({
        migrateDonneesIfMatchesExistingInventaire: undefined,
      });

      const loggedUser = loggedUserFactory.build();

      localityRepository.findLocalityById.mockResolvedValue(localityFactory.build());
      inventoryRepositoryLegacy.findExistingInventaire.mockResolvedValueOnce(
        mockVe<Inventaire>({
          id: "345",
        }),
      );

      expect(await inventaireService.updateInventory(12, inventoryData, loggedUser)).toEqual(
        err({ type: "similarInventoryAlreadyExists", correspondingInventoryFound: "345" }),
      );

      expect(entryRepository.updateAssociatedInventaire).not.toHaveBeenCalled();
      expect(inventoryRepository.deleteInventoryById.mock.callCount()).toEqual(0);
    });

    test("should handle migration of existing data if requested", async () => {
      const inventoryData = mockVe<UpsertInventoryInput>({
        migrateDonneesIfMatchesExistingInventaire: true,
      });

      const loggedUser = loggedUserFactory.build();

      localityRepository.findLocalityById.mockResolvedValue(localityFactory.build());
      inventoryRepositoryLegacy.findExistingInventaire.mockResolvedValueOnce(
        mockVe<Inventaire>({
          id: "345",
        }),
      );

      const result = await inventaireService.updateInventory(12, inventoryData, loggedUser);

      expect(entryRepository.updateAssociatedInventaire).toHaveBeenCalledTimes(1);
      expect(entryRepository.updateAssociatedInventaire).toHaveBeenCalledWith(12, 345, any());
      expect(inventoryRepository.deleteInventoryById.mock.callCount()).toEqual(1);
      expect(inventoryRepository.deleteInventoryById.mock.calls[0].arguments).toEqual(["12"]);
      expect(result.isOk()).toBeTruthy();
      expect(result._unsafeUnwrap().id).toEqual("345");
    });

    test("should not be allowed when the requester is not logged", async () => {
      const inventoryData = mockVe<UpsertInventoryInput>();

      expect(await inventaireService.updateInventory(12, inventoryData, null)).toEqual(err({ type: "notAllowed" }));
      expect(inventoryRepositoryLegacy.findExistingInventaire).not.toHaveBeenCalled();
    });
  });

  describe("to values not matching an existing inventory", () => {
    test("should update an inventory", async () => {
      const inventoryData = mockVe<UpsertInventoryInput>({
        associateIds: ["2", "3"],
        weatherIds: ["4", "5"],
      });

      const loggedUser = loggedUserFactory.build();

      localityRepository.findLocalityById.mockResolvedValue(localityFactory.build());
      inventoryRepositoryLegacy.findExistingInventaire.mockResolvedValueOnce(null);
      inventoryRepositoryLegacy.updateInventaire.mockResolvedValueOnce(
        mockVe<Inventaire>({
          id: "12",
        }),
      );

      const reshapedInputData = mockVe<InventaireCreateInput>();
      reshapeInputInventoryUpsertData.mockReturnValueOnce(reshapedInputData);

      await inventaireService.updateInventory(12, inventoryData, loggedUser);

      expect(inventoryRepositoryLegacy.updateInventaire).toHaveBeenCalledTimes(1);
      expect(inventoryRepositoryLegacy.updateInventaire).toHaveBeenLastCalledWith(12, any(), any());
      expect(inventoryAssociateRepository.deleteAssociesOfInventaireId).toHaveBeenCalledTimes(1);
      expect(inventoryAssociateRepository.deleteAssociesOfInventaireId).toHaveBeenLastCalledWith(12, any());
      expect(inventoryAssociateRepository.insertInventaireWithAssocies).toHaveBeenCalledTimes(1);
      expect(inventoryAssociateRepository.insertInventaireWithAssocies).toHaveBeenLastCalledWith(
        anyNumber(),
        expect.arrayContaining([2, 3]),
        anyObject(),
      );
      expect(inventoryWeatherRepository.deleteMeteosOfInventaireId).toHaveBeenCalledTimes(1);
      expect(inventoryWeatherRepository.deleteMeteosOfInventaireId).toHaveBeenLastCalledWith(12, any());
      expect(inventoryWeatherRepository.insertInventaireWithMeteos).toHaveBeenCalledTimes(1);
      expect(inventoryWeatherRepository.insertInventaireWithMeteos).toHaveBeenLastCalledWith(
        anyNumber(),
        expect.arrayContaining([4, 5]),
        anyObject(),
      );
    });

    test("should not be allowed when the requester is not logged", async () => {
      const inventoryData = mockVe<UpsertInventoryInput>();

      expect(await inventaireService.updateInventory(12, inventoryData, null)).toEqual(err({ type: "notAllowed" }));
      expect(inventoryRepositoryLegacy.findExistingInventaire).not.toHaveBeenCalled();
    });
  });
});

describe("Creation of an inventory", () => {
  describe("with values already matching an existing inventory", () => {
    test("should return the existing inventory", async () => {
      const inventoryData = mockVe<UpsertInventoryInput>({
        duration: null,
      });

      const loggedUser = loggedUserFactory.build();

      localityRepository.findLocalityById.mockResolvedValue(localityFactory.build());
      inventoryRepositoryLegacy.findExistingInventaire.mockResolvedValueOnce(
        mockVe<Inventaire>({
          id: "345",
        }),
      );

      const result = await inventaireService.createInventory(inventoryData, loggedUser);

      expect(entryRepository.updateAssociatedInventaire).not.toHaveBeenCalled();
      expect(inventoryRepository.deleteInventoryById.mock.callCount()).toEqual(0);
      expect(result.isOk()).toBeTruthy();
      expect(result._unsafeUnwrap().id).toEqual("345");
    });

    test("should not be allowed when the requester is not logged", async () => {
      const inventoryData = mockVe<UpsertInventoryInput>();

      expect(await inventaireService.createInventory(inventoryData, null)).toEqual(err("notAllowed"));
      expect(inventoryRepositoryLegacy.findExistingInventaire).not.toHaveBeenCalled();
    });
  });

  describe("with values not matching an existing inventory", () => {
    test("should create new inventory", async () => {
      const inventoryData = mockVe<UpsertInventoryInput>({
        associateIds: ["2", "3"],
        weatherIds: ["4", "5"],
        duration: null,
      });

      const loggedUser = loggedUserFactory.build();

      localityRepository.findLocalityById.mockResolvedValue(localityFactory.build());
      inventoryRepositoryLegacy.findExistingInventaire.mockResolvedValueOnce(null);
      inventoryRepositoryLegacy.createInventaire.mockResolvedValueOnce(
        mockVe<Inventaire>({
          id: "322",
        }),
      );

      const reshapedInputData = mockVe<InventaireCreateInput>();
      reshapeInputInventoryUpsertData.mockReturnValueOnce(reshapedInputData);

      await inventaireService.createInventory(inventoryData, loggedUser);

      expect(inventoryRepositoryLegacy.createInventaire).toHaveBeenCalledTimes(1);
      expect(inventoryRepositoryLegacy.createInventaire).toHaveBeenLastCalledWith(any(), any());
      expect(inventoryAssociateRepository.insertInventaireWithAssocies).toHaveBeenCalledTimes(1);
      // TODO investigate why this check is failing
      // expect(inventoryAssociateRepository.insertInventaireWithAssocies).toHaveBeenLastCalledWith(322, [2, 3], any());
      expect(inventoryWeatherRepository.insertInventaireWithMeteos).toHaveBeenCalledTimes(1);
      // expect(nventaireMeteoRepository.insertInventaireWithMeteos).toHaveBeenLastCalledWith(322, [4, 5], any());
    });

    test("should not be allowed when the requester is not logged", async () => {
      const inventoryData = mockVe<UpsertInventoryInput>();

      expect(await inventaireService.createInventory(inventoryData, null)).toEqual(err("notAllowed"));
      expect(inventoryRepositoryLegacy.findExistingInventaire).not.toHaveBeenCalled();
    });
  });
});

describe("Deletion of an inventory", () => {
  test("when deletion of inventory is done by an admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    const inventory = inventoryFactory.build({
      ownerId: loggedUser.id,
    });

    inventoryRepository.findInventoryById.mock.mockImplementationOnce(() => Promise.resolve(inventory));
    entryRepository.getCountByInventaireId.mockResolvedValueOnce(0);
    inventoryRepository.deleteInventoryById.mock.mockImplementationOnce(() => Promise.resolve(inventory));

    const result = await inventaireService.deleteInventory("11", loggedUser);

    expect(inventoryRepository.deleteInventoryById.mock.callCount()).toEqual(1);
    expect(result).toEqual(ok(inventory));
  });

  test("when deletion of inventory is done by a non-admin owner", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
      role: "contributor",
    });

    const inventory = inventoryFactory.build({
      ownerId: loggedUser.id,
    });

    inventoryRepository.findInventoryById.mock.mockImplementationOnce(() => Promise.resolve(inventory));
    entryRepository.getCountByInventaireId.mockResolvedValueOnce(0);
    inventoryRepository.deleteInventoryById.mock.mockImplementationOnce(() => Promise.resolve(inventory));

    const result = await inventaireService.deleteInventory("11", loggedUser);

    expect(inventoryRepository.deleteInventoryById.mock.callCount()).toEqual(1);
    expect(result).toEqual(ok(inventory));
  });

  test("should not be allowed when trying to delete an inventory still used", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
      role: "contributor",
    });

    const inventory = inventoryFactory.build({
      ownerId: loggedUser.id,
    });

    inventoryRepository.findInventoryById.mock.mockImplementationOnce(() => Promise.resolve(inventory));
    entryRepository.getCountByInventaireId.mockResolvedValueOnce(3);
    inventoryRepository.deleteInventoryById.mock.mockImplementationOnce(() => Promise.resolve(inventory));

    expect(await inventaireService.deleteInventory("11", loggedUser)).toEqual(err("inventoryStillInUse"));
    expect(inventoryRepository.deleteInventoryById.mock.callCount()).toEqual(0);
  });

  test("should not be allowed when trying to delete an inventory belonging to a non-owned inventory", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "contributor",
    });

    inventoryRepository.findInventoryById.mock.mockImplementationOnce(() => Promise.resolve(inventoryFactory.build()));

    expect(await inventaireService.deleteInventory("11", loggedUser)).toEqual(err("notAllowed"));
    expect(inventoryRepository.deleteInventoryById.mock.callCount()).toEqual(0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    expect(await inventaireService.deleteInventory("11", null)).toEqual(err("notAllowed"));
    expect(inventoryRepository.deleteInventoryById.mock.callCount()).toEqual(0);
  });
});
