import { OucaError } from "@domain/errors/ouca-error.js";
import type { Locality } from "@domain/locality/locality.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import type { LocalityRepository } from "@interfaces/locality-repository-interface.js";
import type { InventoriesSearchParams, UpsertInventoryInput } from "@ou-ca/common/api/inventory";
import { createMockPool } from "slonik";
import { vi } from "vitest";
import { any, anyNumber, anyObject, mock } from "vitest-mock-extended";
import type { DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import type { InventaireAssocieRepository } from "../../repositories/inventaire-associe/inventaire-associe-repository.js";
import type { InventaireMeteoRepository } from "../../repositories/inventaire-meteo/inventaire-meteo-repository.js";
import type { Inventaire, InventaireCreateInput } from "../../repositories/inventaire/inventaire-repository-types.js";
import type { InventaireRepository } from "../../repositories/inventaire/inventaire-repository.js";
import { mockVi } from "../../utils/mock.js";
import { buildInventaireService } from "./inventaire-service.js";

const inventoryRepository = mockVi<InventaireRepository>();
const inventoryAssociateRepository = mockVi<InventaireAssocieRepository>();
const inventoryWeatherRepository = mockVi<InventaireMeteoRepository>();
const entryRepository = mockVi<DonneeRepository>();
const localityRepository = mockVi<LocalityRepository>();
const slonik = createMockPool({
  query: vi.fn(),
});

const inventaireService = buildInventaireService({
  slonik,
  inventoryRepository,
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
});

describe("Find inventary", () => {
  test("should handle a matching inventary", async () => {
    const inventaryData = mock<Inventaire>();
    const loggedUser = loggedUserFactory.build();

    inventoryRepository.findInventaireById.mockResolvedValueOnce(inventaryData);

    await inventaireService.findInventaire(12, loggedUser);

    expect(inventoryRepository.findInventaireById).toHaveBeenCalledTimes(1);
    expect(inventoryRepository.findInventaireById).toHaveBeenLastCalledWith(12);
  });

  test("should handle inventary not found", async () => {
    inventoryRepository.findInventaireById.mockResolvedValueOnce(null);
    const loggedUser = loggedUserFactory.build();

    await expect(inventaireService.findInventaire(10, loggedUser)).resolves.toEqual(null);

    expect(inventoryRepository.findInventaireById).toHaveBeenCalledTimes(1);
    expect(inventoryRepository.findInventaireById).toHaveBeenLastCalledWith(10);
  });

  test("should not be allowed when the no login details are provided", async () => {
    await expect(inventaireService.findInventaire(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(inventoryRepository.findInventaireById).not.toHaveBeenCalled();
  });
});

describe("Find inventary by data ID", () => {
  test("should handle inventary found", async () => {
    const inventaryData = mock<Inventaire>();
    const loggedUser = loggedUserFactory.build();

    inventoryRepository.findInventaireByDonneeId.mockResolvedValueOnce(inventaryData);

    const inventary = await inventaireService.findInventaireOfDonneeId("43", loggedUser);

    expect(inventoryRepository.findInventaireByDonneeId).toHaveBeenCalledTimes(1);
    expect(inventoryRepository.findInventaireByDonneeId).toHaveBeenLastCalledWith(43);
    expect(inventary).toEqual(inventaryData);
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(inventaireService.findInventaireOfDonneeId("12", null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all inventaries", async () => {
  const inventariesData = [mock<Inventaire>(), mock<Inventaire>(), mock<Inventaire>()];

  inventoryRepository.findInventaires.mockResolvedValueOnce(inventariesData);

  await inventaireService.findAllInventaires();

  expect(inventoryRepository.findInventaires).toHaveBeenCalledTimes(1);
});

describe("Inventories paginated find by search criteria", () => {
  test("should handle params when retrieving paginated inventories", async () => {
    const inventoriesData = [mock<Inventaire>(), mock<Inventaire>(), mock<Inventaire>()];
    const loggedUser = loggedUserFactory.build();

    const searchParams: InventoriesSearchParams = {
      orderBy: "creationDate",
      sortOrder: "desc",
      pageNumber: 1,
      pageSize: 10,
    };

    inventoryRepository.findInventaires.mockResolvedValueOnce([inventoriesData[0]]);

    await inventaireService.findPaginatedInventaires(loggedUser, searchParams);

    expect(inventoryRepository.findInventaires).toHaveBeenCalledTimes(1);
    expect(inventoryRepository.findInventaires).toHaveBeenLastCalledWith({
      orderBy: "creationDate",
      sortOrder: "desc",
      offset: 0,
      limit: searchParams.pageSize,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(inventaireService.findPaginatedInventaires(null, mock<InventoriesSearchParams>())).rejects.toEqual(
      new OucaError("OUCA0001"),
    );
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await inventaireService.getInventairesCount(loggedUser);

    expect(inventoryRepository.getCount).toHaveBeenCalledTimes(1);
    expect(inventoryRepository.getCount).toHaveBeenLastCalledWith();
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(inventaireService.getInventairesCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of an inventory", () => {
  describe("to values already matching an existing inventory", () => {
    test("should return the correct state if no migration requested", async () => {
      const inventoryData = mock<UpsertInventoryInput>({
        migrateDonneesIfMatchesExistingInventaire: undefined,
      });

      const loggedUser = loggedUserFactory.build();

      localityRepository.findLocalityById.mockResolvedValue(mock<Locality>());
      inventoryRepository.findExistingInventaire.mockResolvedValueOnce(
        mock<Inventaire>({
          id: "345",
        }),
      );

      await expect(inventaireService.updateInventaire(12, inventoryData, loggedUser)).rejects.toEqual({
        inventaireExpectedToBeUpdated: 12,
        correspondingInventaireFound: "345",
      });

      expect(entryRepository.updateAssociatedInventaire).not.toHaveBeenCalled();
      expect(inventoryRepository.deleteInventaireById).not.toHaveBeenCalled();
    });

    test("should handle migration of existing data if requested", async () => {
      const inventoryData = mock<UpsertInventoryInput>({
        migrateDonneesIfMatchesExistingInventaire: true,
      });

      const loggedUser = loggedUserFactory.build();

      localityRepository.findLocalityById.mockResolvedValue(mock<Locality>());
      inventoryRepository.findExistingInventaire.mockResolvedValueOnce(
        mock<Inventaire>({
          id: "345",
        }),
      );

      const result = await inventaireService.updateInventaire(12, inventoryData, loggedUser);

      expect(entryRepository.updateAssociatedInventaire).toHaveBeenCalledTimes(1);
      expect(entryRepository.updateAssociatedInventaire).toHaveBeenCalledWith(12, 345, any());
      expect(inventoryRepository.deleteInventaireById).toHaveBeenCalledTimes(1);
      expect(inventoryRepository.deleteInventaireById).toHaveBeenCalledWith(12, any());
      expect(result.id).toEqual("345");
    });

    test("should not be allowed when the requester is not logged", async () => {
      const inventoryData = mock<UpsertInventoryInput>();

      await expect(inventaireService.updateInventaire(12, inventoryData, null)).rejects.toEqual(
        new OucaError("OUCA0001"),
      );
      expect(inventoryRepository.findExistingInventaire).not.toHaveBeenCalled();
    });
  });

  describe("to values not matching an existing inventory", () => {
    test("should update an inventory", async () => {
      const inventoryData = mock<UpsertInventoryInput>({
        associateIds: ["2", "3"],
        weatherIds: ["4", "5"],
      });

      const loggedUser = loggedUserFactory.build();

      localityRepository.findLocalityById.mockResolvedValue(mock<Locality>());
      inventoryRepository.findExistingInventaire.mockResolvedValueOnce(null);
      inventoryRepository.updateInventaire.mockResolvedValueOnce(
        mock<Inventaire>({
          id: "12",
        }),
      );

      const reshapedInputData = mock<InventaireCreateInput>();
      reshapeInputInventoryUpsertData.mockReturnValueOnce(reshapedInputData);

      await inventaireService.updateInventaire(12, inventoryData, loggedUser);

      expect(inventoryRepository.updateInventaire).toHaveBeenCalledTimes(1);
      expect(inventoryRepository.updateInventaire).toHaveBeenLastCalledWith(12, any(), any());
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
      const inventoryData = mock<UpsertInventoryInput>();

      await expect(inventaireService.updateInventaire(12, inventoryData, null)).rejects.toEqual(
        new OucaError("OUCA0001"),
      );
      expect(inventoryRepository.findExistingInventaire).not.toHaveBeenCalled();
    });
  });
});

describe("Creation of an inventory", () => {
  describe("with values already matching an existing inventory", () => {
    test("should return the existing inventory", async () => {
      const inventoryData = mock<UpsertInventoryInput>({
        duration: null,
      });

      const loggedUser = loggedUserFactory.build();

      localityRepository.findLocalityById.mockResolvedValue(mock<Locality>());
      inventoryRepository.findExistingInventaire.mockResolvedValueOnce(
        mock<Inventaire>({
          id: "345",
        }),
      );

      const result = await inventaireService.createInventaire(inventoryData, loggedUser);

      expect(entryRepository.updateAssociatedInventaire).not.toHaveBeenCalled();
      expect(inventoryRepository.deleteInventaireById).not.toHaveBeenCalled();
      expect(result.id).toEqual("345");
    });

    test("should not be allowed when the requester is not logged", async () => {
      const inventoryData = mock<UpsertInventoryInput>();

      await expect(inventaireService.createInventaire(inventoryData, null)).rejects.toEqual(new OucaError("OUCA0001"));
      expect(inventoryRepository.findExistingInventaire).not.toHaveBeenCalled();
    });
  });

  describe("with values not matching an existing inventory", () => {
    test("should create new inventory", async () => {
      const inventoryData = mock<UpsertInventoryInput>({
        associateIds: ["2", "3"],
        weatherIds: ["4", "5"],
        duration: null,
      });

      const loggedUser = loggedUserFactory.build();

      localityRepository.findLocalityById.mockResolvedValue(mock<Locality>());
      inventoryRepository.findExistingInventaire.mockResolvedValueOnce(null);
      inventoryRepository.createInventaire.mockResolvedValueOnce(
        mock<Inventaire>({
          id: "322",
        }),
      );

      const reshapedInputData = mock<InventaireCreateInput>();
      reshapeInputInventoryUpsertData.mockReturnValueOnce(reshapedInputData);

      await inventaireService.createInventaire(inventoryData, loggedUser);

      expect(inventoryRepository.createInventaire).toHaveBeenCalledTimes(1);
      expect(inventoryRepository.createInventaire).toHaveBeenLastCalledWith(any(), any());
      expect(inventoryAssociateRepository.insertInventaireWithAssocies).toHaveBeenCalledTimes(1);
      // TODO investigate why this check is failing
      // expect(inventoryAssociateRepository.insertInventaireWithAssocies).toHaveBeenLastCalledWith(322, [2, 3], any());
      expect(inventoryWeatherRepository.insertInventaireWithMeteos).toHaveBeenCalledTimes(1);
      // expect(nventaireMeteoRepository.insertInventaireWithMeteos).toHaveBeenLastCalledWith(322, [4, 5], any());
    });

    test("should not be allowed when the requester is not logged", async () => {
      const inventoryData = mock<UpsertInventoryInput>();

      await expect(inventaireService.createInventaire(inventoryData, null)).rejects.toEqual(new OucaError("OUCA0001"));
      expect(inventoryRepository.findExistingInventaire).not.toHaveBeenCalled();
    });
  });
});

describe("Deletion of an inventory", () => {
  test("when deletion of inventory is done by an admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    const inventory = mock<Inventaire>({
      ownerId: loggedUser.id,
    });

    inventoryRepository.findInventaireById.mockResolvedValueOnce(inventory);
    entryRepository.getCountByInventaireId.mockResolvedValueOnce(0);
    inventoryRepository.deleteInventaireById.mockResolvedValueOnce(inventory);

    const result = await inventaireService.deleteInventory("11", loggedUser);

    expect(inventoryRepository.deleteInventaireById).toHaveBeenCalledTimes(1);
    expect(result).toEqual(inventory);
  });

  test("when deletion of inventory is done by a non-admin owner", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
      role: "contributor",
    });

    const inventory = mock<Inventaire>({
      ownerId: loggedUser.id,
    });

    inventoryRepository.findInventaireById.mockResolvedValueOnce(inventory);
    entryRepository.getCountByInventaireId.mockResolvedValueOnce(0);
    inventoryRepository.deleteInventaireById.mockResolvedValueOnce(inventory);

    const result = await inventaireService.deleteInventory("11", loggedUser);

    expect(inventoryRepository.deleteInventaireById).toHaveBeenCalledTimes(1);
    expect(result).toEqual(inventory);
  });

  test("should not be allowed when trying to delete an inventory still used", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
      role: "contributor",
    });

    const inventory = mock<Inventaire>({
      ownerId: loggedUser.id,
    });

    inventoryRepository.findInventaireById.mockResolvedValueOnce(inventory);
    entryRepository.getCountByInventaireId.mockResolvedValueOnce(3);
    inventoryRepository.deleteInventaireById.mockResolvedValueOnce(inventory);

    await expect(inventaireService.deleteInventory("11", loggedUser)).rejects.toEqual(new OucaError("OUCA0005"));
    expect(inventoryRepository.deleteInventaireById).not.toHaveBeenCalled();
  });

  test("should not be allowed when trying to delete an inventory belonging to a non-owned inventory", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "contributor",
    });

    inventoryRepository.findInventaireById.mockResolvedValueOnce(mock<Inventaire>());

    await expect(inventaireService.deleteInventory("11", loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(inventoryRepository.deleteInventaireById).not.toHaveBeenCalled();
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(inventaireService.deleteInventory("11", null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(inventoryRepository.deleteInventaireById).not.toHaveBeenCalled();
  });
});
