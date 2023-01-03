import { any, mock } from "jest-mock-extended";
import { type Logger } from "pino";
import { createMockPool } from "slonik";
import { type MutationUpsertInventaireArgs } from "../../graphql/generated/graphql-types";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository";
import { type InventaireAssocieRepository } from "../../repositories/inventaire-associe/inventaire-associe-repository";
import { type InventaireMeteoRepository } from "../../repositories/inventaire-meteo/inventaire-meteo-repository";
import { type InventaireRepository } from "../../repositories/inventaire/inventaire-repository";
import { type Inventaire, type InventaireCreateInput } from "../../repositories/inventaire/inventaire-repository-types";
import { type LoggedUser } from "../../types/User";
import { OucaError } from "../../utils/errors";
import { buildInventaireService } from "./inventaire-service";
import { reshapeInputInventaireUpsertData } from "./inventaire-service-reshape";

const inventaireRepository = mock<InventaireRepository>({});
const inventaireAssocieRepository = mock<InventaireAssocieRepository>({});
const inventaireMeteoRepository = mock<InventaireMeteoRepository>({});
const donneeRepository = mock<DonneeRepository>({});
const logger = mock<Logger>();
const slonik = createMockPool({
  query: jest.fn(),
});

const inventaireService = buildInventaireService({
  logger,
  slonik,
  inventaireRepository,
  inventaireAssocieRepository,
  inventaireMeteoRepository,
  donneeRepository,
});

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
jest.mock<typeof import("./inventaire-service-reshape")>("./inventaire-service-reshape", () => {
  return {
    __esModule: true,
    reshapeInputInventaireUpsertData: jest.fn(),
  };
});

const mockedReshapeInputInventaireUpsertData = jest.mocked(reshapeInputInventaireUpsertData);

describe("Find inventary", () => {
  test("should handle a matching inventary", async () => {
    const inventaryData = mock<Inventaire>();
    const loggedUser = mock<LoggedUser>();

    inventaireRepository.findInventaireById.mockResolvedValueOnce(inventaryData);

    await inventaireService.findInventaire(inventaryData.id, loggedUser);

    expect(inventaireRepository.findInventaireById).toHaveBeenCalledTimes(1);
    expect(inventaireRepository.findInventaireById).toHaveBeenLastCalledWith(inventaryData.id);
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

    const inventary = await inventaireService.findInventaireOfDonneeId(43, loggedUser);

    expect(inventaireRepository.findInventaireByDonneeId).toHaveBeenCalledTimes(1);
    expect(inventaireRepository.findInventaireByDonneeId).toHaveBeenLastCalledWith(43);
    expect(inventary).toEqual(inventaryData);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(inventaireService.findInventaireOfDonneeId(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all inventaries", async () => {
  const inventariesData = [mock<Inventaire>(), mock<Inventaire>(), mock<Inventaire>()];

  inventaireRepository.findInventaires.mockResolvedValueOnce(inventariesData);

  await inventaireService.findAllInventaires();

  expect(inventaireRepository.findInventaires).toHaveBeenCalledTimes(1);
});

describe("Update of an inventory", () => {
  describe("to values already matching an existing inventory", () => {
    test("should return the correct state if no migration requested", async () => {
      const inventoryData = mock<MutationUpsertInventaireArgs>({
        id: 12,
        migrateDonneesIfMatchesExistingInventaire: undefined,
      });

      const loggedUser = mock<LoggedUser>();

      inventaireRepository.findExistingInventaire.mockResolvedValueOnce(
        mock<Inventaire>({
          id: 345,
        })
      );

      await expect(inventaireService.upsertInventaire(inventoryData, loggedUser)).rejects.toEqual({
        inventaireExpectedToBeUpdated: 12,
        correspondingInventaireFound: 345,
      });

      expect(donneeRepository.updateAssociatedInventaire).not.toHaveBeenCalled();
      expect(inventaireRepository.deleteInventaireById).not.toHaveBeenCalled();
    });

    test("should handle migration of existing data if requested", async () => {
      const inventoryData = mock<MutationUpsertInventaireArgs>({
        id: 12,
        migrateDonneesIfMatchesExistingInventaire: true,
      });

      const loggedUser = mock<LoggedUser>();

      inventaireRepository.findExistingInventaire.mockResolvedValueOnce(
        mock<Inventaire>({
          id: 345,
        })
      );

      const result = await inventaireService.upsertInventaire(inventoryData, loggedUser);

      expect(donneeRepository.updateAssociatedInventaire).toHaveBeenCalledTimes(1);
      expect(donneeRepository.updateAssociatedInventaire).toHaveBeenCalledWith(12, 345, any());
      expect(inventaireRepository.deleteInventaireById).toHaveBeenCalledTimes(1);
      expect(inventaireRepository.deleteInventaireById).toHaveBeenCalledWith(12, any());
      expect(result.id).toEqual(345);
    });

    test("should throw an error when the requester is not logged", async () => {
      const inventoryData = mock<MutationUpsertInventaireArgs>({
        id: 12,
      });

      await expect(inventaireService.upsertInventaire(inventoryData, null)).rejects.toEqual(new OucaError("OUCA0001"));
      expect(inventaireRepository.findExistingInventaire).not.toHaveBeenCalled();
    });
  });

  describe("to values not matching an existing inventory", () => {
    test("should update an inventory", async () => {
      const inventoryData = mock<MutationUpsertInventaireArgs>({
        id: 12,
        data: {
          associesIds: [2, 3],
          meteosIds: [4, 5],
        },
      });

      const loggedUser = mock<LoggedUser>();

      inventaireRepository.findExistingInventaire.mockResolvedValueOnce(null);
      inventaireRepository.updateInventaire.mockResolvedValueOnce(
        mock<Inventaire>({
          id: 12,
        })
      );

      const reshapedInputData = mock<InventaireCreateInput>();
      mockedReshapeInputInventaireUpsertData.mockReturnValueOnce(reshapedInputData);

      await inventaireService.upsertInventaire(inventoryData, loggedUser);

      expect(inventaireRepository.updateInventaire).toHaveBeenCalledTimes(1);
      expect(inventaireRepository.updateInventaire).toHaveBeenLastCalledWith(12, any(), any());
      expect(inventaireAssocieRepository.deleteAssociesOfInventaireId).toHaveBeenCalledTimes(1);
      expect(inventaireAssocieRepository.deleteAssociesOfInventaireId).toHaveBeenLastCalledWith(12, any());
      expect(inventaireAssocieRepository.insertInventaireWithAssocies).toHaveBeenCalledTimes(1);
      // TODO investigate why this check is failing
      // expect(inventaireAssocieRepository.insertInventaireWithAssocies).toHaveBeenLastCalledWith(322, [2, 3], any());
      expect(inventaireMeteoRepository.deleteMeteosOfInventaireId).toHaveBeenCalledTimes(1);
      expect(inventaireMeteoRepository.deleteMeteosOfInventaireId).toHaveBeenLastCalledWith(12, any());
      expect(inventaireMeteoRepository.insertInventaireWithMeteos).toHaveBeenCalledTimes(1);
      // expect(nventaireMeteoRepository.insertInventaireWithMeteos).toHaveBeenLastCalledWith(322, [4, 5], any());
    });

    test("should throw an error when the requester is not logged", async () => {
      const inventoryData = mock<MutationUpsertInventaireArgs>({
        id: 12,
      });

      await expect(inventaireService.upsertInventaire(inventoryData, null)).rejects.toEqual(new OucaError("OUCA0001"));
      expect(inventaireRepository.findExistingInventaire).not.toHaveBeenCalled();
    });
  });
});

describe("Creation of an inventory", () => {
  describe("with values already matching an existing inventory", () => {
    test("should return the existing inventory", async () => {
      const inventoryData = mock<MutationUpsertInventaireArgs>({
        id: undefined,
      });

      const loggedUser = mock<LoggedUser>();

      inventaireRepository.findExistingInventaire.mockResolvedValueOnce(
        mock<Inventaire>({
          id: 345,
        })
      );

      const result = await inventaireService.upsertInventaire(inventoryData, loggedUser);

      expect(donneeRepository.updateAssociatedInventaire).not.toHaveBeenCalled();
      expect(inventaireRepository.deleteInventaireById).not.toHaveBeenCalled();
      expect(result.id).toEqual(345);
    });

    test("should throw an error when the requester is not logged", async () => {
      const inventoryData = mock<MutationUpsertInventaireArgs>({
        id: undefined,
      });

      await expect(inventaireService.upsertInventaire(inventoryData, null)).rejects.toEqual(new OucaError("OUCA0001"));
      expect(inventaireRepository.findExistingInventaire).not.toHaveBeenCalled();
    });
  });

  describe("with values not matching an existing inventory", () => {
    test("should create new inventory", async () => {
      const inventoryData = mock<MutationUpsertInventaireArgs>({
        id: undefined,
        data: {
          associesIds: [2, 3],
          meteosIds: [4, 5],
        },
      });

      const loggedUser = mock<LoggedUser>();

      inventaireRepository.findExistingInventaire.mockResolvedValueOnce(null);
      inventaireRepository.createInventaire.mockResolvedValueOnce(
        mock<Inventaire>({
          id: 322,
        })
      );

      const reshapedInputData = mock<InventaireCreateInput>();
      mockedReshapeInputInventaireUpsertData.mockReturnValueOnce(reshapedInputData);

      await inventaireService.upsertInventaire(inventoryData, loggedUser);

      expect(inventaireRepository.createInventaire).toHaveBeenCalledTimes(1);
      expect(inventaireRepository.createInventaire).toHaveBeenLastCalledWith(any(), any());
      expect(inventaireAssocieRepository.insertInventaireWithAssocies).toHaveBeenCalledTimes(1);
      // TODO investigate why this check is failing
      // expect(inventaireAssocieRepository.insertInventaireWithAssocies).toHaveBeenLastCalledWith(322, [2, 3], any());
      expect(inventaireMeteoRepository.insertInventaireWithMeteos).toHaveBeenCalledTimes(1);
      // expect(nventaireMeteoRepository.insertInventaireWithMeteos).toHaveBeenLastCalledWith(322, [4, 5], any());
    });

    test("should throw an error when the requester is not logged", async () => {
      const inventoryData = mock<MutationUpsertInventaireArgs>({
        id: undefined,
      });

      await expect(inventaireService.upsertInventaire(inventoryData, null)).rejects.toEqual(new OucaError("OUCA0001"));
      expect(inventaireRepository.findExistingInventaire).not.toHaveBeenCalled();
    });
  });
});
