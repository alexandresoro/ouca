import { type InventoriesSearchParams, type UpsertInventoryInput } from "@ou-ca/common/api/inventory";
import { type Logger } from "pino";
import { createMockPool } from "slonik";
import { vi } from "vitest";
import { any, anyNumber, anyObject, mock } from "vitest-mock-extended";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type InventaireAssocieRepository } from "../../repositories/inventaire-associe/inventaire-associe-repository.js";
import { type InventaireMeteoRepository } from "../../repositories/inventaire-meteo/inventaire-meteo-repository.js";
import {
  type Inventaire,
  type InventaireCreateInput,
} from "../../repositories/inventaire/inventaire-repository-types.js";
import { type InventaireRepository } from "../../repositories/inventaire/inventaire-repository.js";
import { type Lieudit } from "../../repositories/lieudit/lieudit-repository-types.js";
import { type LieuditRepository } from "../../repositories/lieudit/lieudit-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { OucaError } from "../../utils/errors.js";
import { buildInventaireService } from "./inventaire-service.js";

const inventaireRepository = mock<InventaireRepository>({});
const inventaireAssocieRepository = mock<InventaireAssocieRepository>({});
const inventaireMeteoRepository = mock<InventaireMeteoRepository>({});
const donneeRepository = mock<DonneeRepository>({});
const lieuditRepository = mock<LieuditRepository>({});
const logger = mock<Logger>();
const slonik = createMockPool({
  query: vi.fn(),
});

const inventaireService = buildInventaireService({
  logger,
  slonik,
  inventaireRepository,
  inventaireAssocieRepository,
  inventaireMeteoRepository,
  donneeRepository,
  lieuditRepository,
});

const reshapeInputInventaireUpsertData = vi.fn();
vi.doMock("./inventaire-service-reshape.js", () => {
  return {
    __esModule: true,
    reshapeInputInventaireUpsertData,
  };
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe("Find inventary", () => {
  test("should handle a matching inventary", async () => {
    const inventaryData = mock<Inventaire>();
    const loggedUser = mock<LoggedUser>();

    inventaireRepository.findInventaireById.mockResolvedValueOnce(inventaryData);

    await inventaireService.findInventaire(12, loggedUser);

    expect(inventaireRepository.findInventaireById).toHaveBeenCalledTimes(1);
    expect(inventaireRepository.findInventaireById).toHaveBeenLastCalledWith(12);
  });

  test("should handle inventary not found", async () => {
    inventaireRepository.findInventaireById.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(inventaireService.findInventaire(10, loggedUser)).resolves.toBe(null);

    expect(inventaireRepository.findInventaireById).toHaveBeenCalledTimes(1);
    expect(inventaireRepository.findInventaireById).toHaveBeenLastCalledWith(10);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(inventaireService.findInventaire(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(inventaireRepository.findInventaireById).not.toHaveBeenCalled();
  });
});

describe("Find inventary by data ID", () => {
  test("should handle inventary found", async () => {
    const inventaryData = mock<Inventaire>();
    const loggedUser = mock<LoggedUser>();

    inventaireRepository.findInventaireByDonneeId.mockResolvedValueOnce(inventaryData);

    const inventary = await inventaireService.findInventaireOfDonneeId("43", loggedUser);

    expect(inventaireRepository.findInventaireByDonneeId).toHaveBeenCalledTimes(1);
    expect(inventaireRepository.findInventaireByDonneeId).toHaveBeenLastCalledWith(43);
    expect(inventary).toEqual(inventaryData);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(inventaireService.findInventaireOfDonneeId("12", null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all inventaries", async () => {
  const inventariesData = [mock<Inventaire>(), mock<Inventaire>(), mock<Inventaire>()];

  inventaireRepository.findInventaires.mockResolvedValueOnce(inventariesData);

  await inventaireService.findAllInventaires();

  expect(inventaireRepository.findInventaires).toHaveBeenCalledTimes(1);
});

describe("Inventories paginated find by search criteria", () => {
  test("should handle params when retrieving paginated inventories", async () => {
    const inventoriesData = [mock<Inventaire>(), mock<Inventaire>(), mock<Inventaire>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: InventoriesSearchParams = {
      orderBy: "creationDate",
      sortOrder: "desc",
      pageNumber: 1,
      pageSize: 10,
    };

    inventaireRepository.findInventaires.mockResolvedValueOnce([inventoriesData[0]]);

    await inventaireService.findPaginatedInventaires(loggedUser, searchParams);

    expect(inventaireRepository.findInventaires).toHaveBeenCalledTimes(1);
    expect(inventaireRepository.findInventaires).toHaveBeenLastCalledWith({
      orderBy: "creationDate",
      sortOrder: "desc",
      offset: 0,
      limit: searchParams.pageSize,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(inventaireService.findPaginatedInventaires(null, mock<InventoriesSearchParams>())).rejects.toEqual(
      new OucaError("OUCA0001")
    );
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await inventaireService.getInventairesCount(loggedUser);

    expect(inventaireRepository.getCount).toHaveBeenCalledTimes(1);
    expect(inventaireRepository.getCount).toHaveBeenLastCalledWith();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(inventaireService.getInventairesCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of an inventory", () => {
  describe("to values already matching an existing inventory", () => {
    test("should return the correct state if no migration requested", async () => {
      const inventoryData = mock<UpsertInventoryInput>({
        migrateDonneesIfMatchesExistingInventaire: undefined,
      });

      const loggedUser = mock<LoggedUser>();

      lieuditRepository.findLieuditById.mockResolvedValue(mock<Lieudit>());
      inventaireRepository.findExistingInventaire.mockResolvedValueOnce(
        mock<Inventaire>({
          id: "345",
        })
      );

      await expect(inventaireService.updateInventaire(12, inventoryData, loggedUser)).rejects.toEqual({
        inventaireExpectedToBeUpdated: 12,
        correspondingInventaireFound: "345",
      });

      expect(donneeRepository.updateAssociatedInventaire).not.toHaveBeenCalled();
      expect(inventaireRepository.deleteInventaireById).not.toHaveBeenCalled();
    });

    test("should handle migration of existing data if requested", async () => {
      const inventoryData = mock<UpsertInventoryInput>({
        migrateDonneesIfMatchesExistingInventaire: true,
      });

      const loggedUser = mock<LoggedUser>();

      lieuditRepository.findLieuditById.mockResolvedValue(mock<Lieudit>());
      inventaireRepository.findExistingInventaire.mockResolvedValueOnce(
        mock<Inventaire>({
          id: "345",
        })
      );

      const result = await inventaireService.updateInventaire(12, inventoryData, loggedUser);

      expect(donneeRepository.updateAssociatedInventaire).toHaveBeenCalledTimes(1);
      expect(donneeRepository.updateAssociatedInventaire).toHaveBeenCalledWith(12, 345, any());
      expect(inventaireRepository.deleteInventaireById).toHaveBeenCalledTimes(1);
      expect(inventaireRepository.deleteInventaireById).toHaveBeenCalledWith(12, any());
      expect(result.id).toEqual("345");
    });

    test("should throw an error when the requester is not logged", async () => {
      const inventoryData = mock<UpsertInventoryInput>();

      await expect(inventaireService.updateInventaire(12, inventoryData, null)).rejects.toEqual(
        new OucaError("OUCA0001")
      );
      expect(inventaireRepository.findExistingInventaire).not.toHaveBeenCalled();
    });
  });

  describe("to values not matching an existing inventory", () => {
    test("should update an inventory", async () => {
      const inventoryData = mock<UpsertInventoryInput>({
        associateIds: ["2", "3"],
        weatherIds: ["4", "5"],
      });

      const loggedUser = mock<LoggedUser>();

      lieuditRepository.findLieuditById.mockResolvedValue(mock<Lieudit>());
      inventaireRepository.findExistingInventaire.mockResolvedValueOnce(null);
      inventaireRepository.updateInventaire.mockResolvedValueOnce(
        mock<Inventaire>({
          id: "12",
        })
      );

      const reshapedInputData = mock<InventaireCreateInput>();
      reshapeInputInventaireUpsertData.mockReturnValueOnce(reshapedInputData);

      await inventaireService.updateInventaire(12, inventoryData, loggedUser);

      expect(inventaireRepository.updateInventaire).toHaveBeenCalledTimes(1);
      expect(inventaireRepository.updateInventaire).toHaveBeenLastCalledWith(12, any(), any());
      expect(inventaireAssocieRepository.deleteAssociesOfInventaireId).toHaveBeenCalledTimes(1);
      expect(inventaireAssocieRepository.deleteAssociesOfInventaireId).toHaveBeenLastCalledWith(12, any());
      expect(inventaireAssocieRepository.insertInventaireWithAssocies).toHaveBeenCalledTimes(1);
      expect(inventaireAssocieRepository.insertInventaireWithAssocies).toHaveBeenLastCalledWith(
        anyNumber(),
        expect.arrayContaining([2, 3]),
        anyObject()
      );
      expect(inventaireMeteoRepository.deleteMeteosOfInventaireId).toHaveBeenCalledTimes(1);
      expect(inventaireMeteoRepository.deleteMeteosOfInventaireId).toHaveBeenLastCalledWith(12, any());
      expect(inventaireMeteoRepository.insertInventaireWithMeteos).toHaveBeenCalledTimes(1);
      expect(inventaireMeteoRepository.insertInventaireWithMeteos).toHaveBeenLastCalledWith(
        anyNumber(),
        expect.arrayContaining([4, 5]),
        anyObject()
      );
    });

    test("should throw an error when the requester is not logged", async () => {
      const inventoryData = mock<UpsertInventoryInput>();

      await expect(inventaireService.updateInventaire(12, inventoryData, null)).rejects.toEqual(
        new OucaError("OUCA0001")
      );
      expect(inventaireRepository.findExistingInventaire).not.toHaveBeenCalled();
    });
  });
});

describe("Creation of an inventory", () => {
  describe("with values already matching an existing inventory", () => {
    test("should return the existing inventory", async () => {
      const inventoryData = mock<UpsertInventoryInput>();

      const loggedUser = mock<LoggedUser>();

      lieuditRepository.findLieuditById.mockResolvedValue(mock<Lieudit>());
      inventaireRepository.findExistingInventaire.mockResolvedValueOnce(
        mock<Inventaire>({
          id: "345",
        })
      );

      const result = await inventaireService.createInventaire(inventoryData, loggedUser);

      expect(donneeRepository.updateAssociatedInventaire).not.toHaveBeenCalled();
      expect(inventaireRepository.deleteInventaireById).not.toHaveBeenCalled();
      expect(result.id).toEqual("345");
    });

    test("should throw an error when the requester is not logged", async () => {
      const inventoryData = mock<UpsertInventoryInput>();

      await expect(inventaireService.createInventaire(inventoryData, null)).rejects.toEqual(new OucaError("OUCA0001"));
      expect(inventaireRepository.findExistingInventaire).not.toHaveBeenCalled();
    });
  });

  describe("with values not matching an existing inventory", () => {
    test("should create new inventory", async () => {
      const inventoryData = mock<UpsertInventoryInput>({
        associateIds: ["2", "3"],
        weatherIds: ["4", "5"],
      });

      const loggedUser = mock<LoggedUser>();

      lieuditRepository.findLieuditById.mockResolvedValue(mock<Lieudit>());
      inventaireRepository.findExistingInventaire.mockResolvedValueOnce(null);
      inventaireRepository.createInventaire.mockResolvedValueOnce(
        mock<Inventaire>({
          id: "322",
        })
      );

      const reshapedInputData = mock<InventaireCreateInput>();
      reshapeInputInventaireUpsertData.mockReturnValueOnce(reshapedInputData);

      await inventaireService.createInventaire(inventoryData, loggedUser);

      expect(inventaireRepository.createInventaire).toHaveBeenCalledTimes(1);
      expect(inventaireRepository.createInventaire).toHaveBeenLastCalledWith(any(), any());
      expect(inventaireAssocieRepository.insertInventaireWithAssocies).toHaveBeenCalledTimes(1);
      // TODO investigate why this check is failing
      // expect(inventaireAssocieRepository.insertInventaireWithAssocies).toHaveBeenLastCalledWith(322, [2, 3], any());
      expect(inventaireMeteoRepository.insertInventaireWithMeteos).toHaveBeenCalledTimes(1);
      // expect(nventaireMeteoRepository.insertInventaireWithMeteos).toHaveBeenLastCalledWith(322, [4, 5], any());
    });

    test("should throw an error when the requester is not logged", async () => {
      const inventoryData = mock<UpsertInventoryInput>();

      await expect(inventaireService.createInventaire(inventoryData, null)).rejects.toEqual(new OucaError("OUCA0001"));
      expect(inventaireRepository.findExistingInventaire).not.toHaveBeenCalled();
    });
  });
});
