import { type Logger } from "pino";
import { createMockPool } from "slonik";
import { vi } from "vitest";
import { any, anyNumber, anyObject, mock } from "vitest-mock-extended";
import {
  SearchDonneesOrderBy,
  SortOrder,
  type DonneeNavigationData,
  type InputDonnee,
  type MutationUpsertDonneeArgs,
  type PaginatedSearchDonneesResultResultArgs,
} from "../../graphql/generated/graphql-types.js";
import { type DonneeComportementRepository } from "../../repositories/donnee-comportement/donnee-comportement-repository.js";
import { type DonneeMilieuRepository } from "../../repositories/donnee-milieu/donnee-milieu-repository.js";
import { type Donnee, type DonneeCreateInput } from "../../repositories/donnee/donnee-repository-types.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type Inventaire } from "../../repositories/inventaire/inventaire-repository-types.js";
import { type InventaireRepository } from "../../repositories/inventaire/inventaire-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { OucaError } from "../../utils/errors.js";
import { buildDonneeService } from "./donnee-service.js";

const donneeRepository = mock<DonneeRepository>({});
const donneeComportementRepository = mock<DonneeComportementRepository>({});
const donneeMilieuRepository = mock<DonneeMilieuRepository>({});
const inventaireRepository = mock<InventaireRepository>({});
const logger = mock<Logger>();
const slonik = createMockPool({
  query: vi.fn(),
});

const donneeService = buildDonneeService({
  logger,
  slonik,
  inventaireRepository,
  donneeRepository,
  donneeComportementRepository,
  donneeMilieuRepository,
});

const reshapeInputDonneeUpsertData = vi.fn<unknown[], DonneeCreateInput>();
vi.doMock("./donnee-service-reshape.js", () => {
  return {
    __esModule: true,
    reshapeInputDonneeUpsertData,
  };
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe("Find data", () => {
  test("should handle a matching data", async () => {
    const dataData = mock<Donnee>();
    const loggedUser = mock<LoggedUser>();

    donneeRepository.findDonneeById.mockResolvedValueOnce(dataData);

    await donneeService.findDonnee(dataData.id, loggedUser);

    expect(donneeRepository.findDonneeById).toHaveBeenCalledTimes(1);
    expect(donneeRepository.findDonneeById).toHaveBeenLastCalledWith(dataData.id);
  });

  test("should handle data not found", async () => {
    donneeRepository.findDonneeById.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(donneeService.findDonnee(10, loggedUser)).resolves.toBe(null);

    expect(donneeRepository.findDonneeById).toHaveBeenCalledTimes(1);
    expect(donneeRepository.findDonneeById).toHaveBeenLastCalledWith(10);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(donneeService.findDonnee(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(donneeRepository.findDonneeById).not.toHaveBeenCalled();
  });
});

test("Find all datas", async () => {
  const dataData = [mock<Donnee>(), mock<Donnee>(), mock<Donnee>()];

  donneeRepository.findDonnees.mockResolvedValueOnce(dataData);

  await donneeService.findAllDonnees();

  expect(donneeRepository.findDonnees).toHaveBeenCalledTimes(1);
});

describe("Data paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const dataData = [mock<Donnee>(), mock<Donnee>(), mock<Donnee>()];
    const loggedUser = mock<LoggedUser>();

    donneeRepository.findDonnees.mockResolvedValueOnce(dataData);

    await donneeService.findPaginatedDonnees(loggedUser);

    expect(donneeRepository.findDonnees).toHaveBeenCalledTimes(1);
    expect(donneeRepository.findDonnees).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated data", async () => {
    const dataData = [mock<Donnee>(), mock<Donnee>(), mock<Donnee>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: PaginatedSearchDonneesResultResultArgs = {
      searchCriteria: {
        nombre: 12,
        nicheurs: ["certain", "probable"],
      },
      orderBy: SearchDonneesOrderBy.Departement,
      sortOrder: SortOrder.Desc,
      searchParams: {
        pageNumber: 0,
        pageSize: 10,
      },
    };

    donneeRepository.findDonnees.mockResolvedValueOnce([dataData[0]]);

    await donneeService.findPaginatedDonnees(loggedUser, searchParams);

    expect(donneeRepository.findDonnees).toHaveBeenCalledTimes(1);
    expect(donneeRepository.findDonnees).toHaveBeenLastCalledWith({
      searchCriteria: {
        nombre: 12,
        nicheurs: ["certain", "probable"],
      },
      orderBy: "departement",
      sortOrder: SortOrder.Desc,
      offset: searchParams.searchParams?.pageNumber,
      limit: searchParams.searchParams?.pageSize,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(donneeService.findPaginatedDonnees(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await donneeService.getDonneesCount(loggedUser);

    expect(donneeRepository.getCount).toHaveBeenCalledTimes(1);
    expect(donneeRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    const searchCriteria: PaginatedSearchDonneesResultResultArgs["searchCriteria"] = {
      nombre: 12,
      nicheurs: ["certain", "probable"],
    };

    await donneeService.getDonneesCount(loggedUser, searchCriteria);

    expect(donneeRepository.getCount).toHaveBeenCalledTimes(1);
    expect(donneeRepository.getCount).toHaveBeenLastCalledWith({
      nombre: 12,
      nicheurs: ["certain", "probable"],
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(donneeService.getDonneesCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Data navigation", () => {
  test("should call the correct info", async () => {
    const loggedUser = mock<LoggedUser>();

    donneeRepository.findPreviousDonneeId.mockResolvedValueOnce(3);
    donneeRepository.findNextDonneeId.mockResolvedValueOnce(17);
    donneeRepository.findDonneeIndex.mockResolvedValueOnce(11);

    const result = await donneeService.findDonneeNavigationData(loggedUser, 12);

    expect(donneeRepository.findPreviousDonneeId).toHaveBeenCalledTimes(1);
    expect(donneeRepository.findNextDonneeId).toHaveBeenCalledTimes(1);
    expect(donneeRepository.findDonneeIndex).toHaveBeenCalledTimes(1);
    expect(result).toEqual<DonneeNavigationData>({
      index: 11,
      previousDonneeId: 3,
      nextDonneeId: 17,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(donneeService.findDonneeNavigationData(null, 12)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Get latest data id", () => {
  test("should handle existing data", async () => {
    const loggedUser = mock<LoggedUser>();

    donneeRepository.findLatestDonneeId.mockResolvedValueOnce(18);

    const nextRegroupement = await donneeService.findLastDonneeId(loggedUser);

    expect(donneeRepository.findLatestDonneeId).toHaveBeenCalledTimes(1);
    expect(nextRegroupement).toEqual(18);
  });

  test("should handle no existing data", async () => {
    const loggedUser = mock<LoggedUser>();

    donneeRepository.findLatestDonneeId.mockResolvedValueOnce(null);

    await donneeService.findLastDonneeId(loggedUser);

    expect(donneeRepository.findLatestDonneeId).toHaveBeenCalledTimes(1);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(donneeService.findLastDonneeId(null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(donneeRepository.findLatestDonneeId).not.toHaveBeenCalled();
  });
});

describe("Get next group", () => {
  test("should handle existing groups", async () => {
    const loggedUser = mock<LoggedUser>();

    donneeRepository.findLatestRegroupement.mockResolvedValueOnce(18);

    const nextRegroupement = await donneeService.findNextRegroupement(loggedUser);

    expect(donneeRepository.findLatestRegroupement).toHaveBeenCalledTimes(1);
    expect(nextRegroupement).toEqual(19);
  });

  test("should handle no existing group", async () => {
    const loggedUser = mock<LoggedUser>();

    donneeRepository.findLatestRegroupement.mockResolvedValueOnce(null);

    await donneeService.findNextRegroupement(loggedUser);

    expect(donneeRepository.findLatestRegroupement).toHaveBeenCalledTimes(1);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(donneeService.findNextRegroupement(null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(donneeRepository.findLatestRegroupement).not.toHaveBeenCalled();
  });
});

describe("Deletion of a data", () => {
  describe("should handle the deletion of any data if admin", () => {
    test("when the inventory should remain after the data deletion", async () => {
      const loggedUser = mock<LoggedUser>({
        role: "admin",
      });

      const matchingInventory = mock<Inventaire>({});

      const deletedDonnee = mock<Donnee>({
        id: 42,
      });

      inventaireRepository.findInventaireByDonneeId.mockResolvedValueOnce(matchingInventory);
      donneeRepository.getCountByInventaireId.mockResolvedValueOnce(2);
      donneeRepository.deleteDonneeById.mockResolvedValueOnce(deletedDonnee);

      const result = await donneeService.deleteDonnee(11, loggedUser);

      expect(donneeRepository.deleteDonneeById).toHaveBeenCalledTimes(1);
      expect(inventaireRepository.deleteInventaireById).not.toHaveBeenCalled();
      expect(result).toEqual(deletedDonnee);
    });

    test("when the inventory will not have any linked data after the data deletion", async () => {
      const loggedUser = mock<LoggedUser>({
        role: "admin",
      });

      const matchingInventory = mock<Inventaire>({});

      const deletedDonnee = mock<Donnee>({
        id: 42,
      });

      inventaireRepository.findInventaireByDonneeId.mockResolvedValueOnce(matchingInventory);
      donneeRepository.getCountByInventaireId.mockResolvedValueOnce(0);
      donneeRepository.deleteDonneeById.mockResolvedValueOnce(deletedDonnee);

      const result = await donneeService.deleteDonnee(11, loggedUser);

      expect(donneeRepository.deleteDonneeById).toHaveBeenCalledTimes(1);
      expect(inventaireRepository.deleteInventaireById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(deletedDonnee);
    });

    test("even when no matching inventory has been found", async () => {
      const loggedUser = mock<LoggedUser>({
        role: "admin",
      });

      const deletedDonnee = mock<Donnee>({
        id: 42,
      });

      inventaireRepository.findInventaireByDonneeId.mockResolvedValueOnce(null);
      donneeRepository.deleteDonneeById.mockResolvedValueOnce(deletedDonnee);

      const result = await donneeService.deleteDonnee(11, loggedUser);

      expect(donneeRepository.deleteDonneeById).toHaveBeenCalledTimes(1);
      expect(inventaireRepository.deleteInventaireById).not.toHaveBeenCalled();
      expect(result).toEqual(deletedDonnee);
    });
  });

  describe("should handle the deletion of any data belonging to a owned inventory if non-admin", () => {
    test("when the inventory should remain after the data deletion", async () => {
      const loggedUser = mock<LoggedUser>({
        id: "12",
        role: "contributor",
      });

      const matchingInventory = mock<Inventaire>({
        ownerId: loggedUser.id,
      });

      const deletedDonnee = mock<Donnee>({
        id: 42,
      });

      inventaireRepository.findInventaireByDonneeId.mockResolvedValueOnce(matchingInventory);
      donneeRepository.getCountByInventaireId.mockResolvedValueOnce(2);
      donneeRepository.deleteDonneeById.mockResolvedValueOnce(deletedDonnee);

      const result = await donneeService.deleteDonnee(11, loggedUser);

      expect(donneeRepository.deleteDonneeById).toHaveBeenCalledTimes(1);
      expect(inventaireRepository.deleteInventaireById).not.toHaveBeenCalled();
      expect(result).toEqual(deletedDonnee);
    });

    test("when the inventory will not have any linked data after the data deletion", async () => {
      const loggedUser = mock<LoggedUser>({
        id: "12",
        role: "contributor",
      });

      const matchingInventory = mock<Inventaire>({
        ownerId: loggedUser.id,
      });

      const deletedDonnee = mock<Donnee>({
        id: 42,
      });

      inventaireRepository.findInventaireByDonneeId.mockResolvedValueOnce(matchingInventory);
      donneeRepository.getCountByInventaireId.mockResolvedValueOnce(0);
      donneeRepository.deleteDonneeById.mockResolvedValueOnce(deletedDonnee);

      const result = await donneeService.deleteDonnee(11, loggedUser);

      expect(donneeRepository.deleteDonneeById).toHaveBeenCalledTimes(1);
      expect(inventaireRepository.deleteInventaireById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(deletedDonnee);
    });

    test("unless no matching inventory has been found", async () => {
      const loggedUser = mock<LoggedUser>({
        id: "12",
        role: "contributor",
      });

      const deletedDonnee = mock<Donnee>({
        id: 42,
      });

      inventaireRepository.findInventaireByDonneeId.mockResolvedValueOnce(null);
      donneeRepository.deleteDonneeById.mockResolvedValueOnce(deletedDonnee);

      await expect(donneeService.deleteDonnee(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));
      expect(donneeRepository.deleteDonneeById).not.toHaveBeenCalled();
      expect(inventaireRepository.deleteInventaireById).not.toHaveBeenCalled();
    });
  });

  test("should throw an error when trying to deletre a data belonging to a non-owned inventory", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "contributor",
    });

    inventaireRepository.findInventaireByDonneeId.mockResolvedValueOnce(mock<Inventaire>());

    await expect(donneeService.deleteDonnee(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(donneeRepository.deleteDonneeById).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(donneeService.deleteDonnee(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(donneeRepository.deleteDonneeById).not.toHaveBeenCalled();
  });
});

describe("Update of a data", () => {
  test("should update existing data", async () => {
    const dataData: MutationUpsertDonneeArgs = mock<MutationUpsertDonneeArgs>({
      id: 12,
      data: {
        comportementsIds: [2, 3],
        milieuxIds: [4, 5],
      },
    });

    const loggedUser = mock<LoggedUser>();

    donneeRepository.findExistingDonnee.mockResolvedValueOnce(null);
    donneeRepository.createDonnee.mockResolvedValueOnce(
      mock<Donnee>({
        id: 12,
      })
    );

    const reshapedInputData = mock<DonneeCreateInput>();
    reshapeInputDonneeUpsertData.mockReturnValueOnce(reshapedInputData);

    await donneeService.updateDonnee(12, dataData, loggedUser);

    expect(donneeRepository.updateDonnee).toHaveBeenCalledTimes(1);
    expect(donneeRepository.updateDonnee).toHaveBeenLastCalledWith(12, any(), any());
    expect(donneeComportementRepository.deleteComportementsOfDonneeId).toHaveBeenCalledTimes(1);
    expect(donneeComportementRepository.deleteComportementsOfDonneeId).toHaveBeenLastCalledWith(12, any());
    expect(donneeComportementRepository.insertDonneeWithComportements).toHaveBeenCalledTimes(1);
    expect(donneeComportementRepository.insertDonneeWithComportements).toHaveBeenLastCalledWith(
      anyNumber(),
      expect.arrayContaining([2, 3]),
      anyObject()
    );
    expect(donneeMilieuRepository.deleteMilieuxOfDonneeId).toHaveBeenCalledTimes(1);
    expect(donneeMilieuRepository.deleteMilieuxOfDonneeId).toHaveBeenLastCalledWith(12, any());
    expect(donneeMilieuRepository.insertDonneeWithMilieux).toHaveBeenCalledTimes(1);
    expect(donneeMilieuRepository.insertDonneeWithMilieux).toHaveBeenLastCalledWith(
      anyNumber(),
      expect.arrayContaining([4, 5]),
      anyObject()
    );
  });

  test("should throw an error when trying to update to a different data that already exists", async () => {
    const dataData = mock<MutationUpsertDonneeArgs>({
      id: 12,
    });

    const loggedUser = mock<LoggedUser>();

    donneeRepository.findExistingDonnee.mockResolvedValueOnce(
      mock<Donnee>({
        id: 345,
      })
    );

    await expect(donneeService.updateDonnee(12, dataData, loggedUser)).rejects.toEqual(
      new OucaError("OUCA0004", {
        code: "OUCA0004",
        message: "Cette donnée existe déjà (ID = 345).",
      })
    );
    expect(donneeRepository.updateDonnee).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    const dataData = mock<MutationUpsertDonneeArgs>({
      id: 12,
    });

    await expect(donneeService.updateDonnee(12, dataData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(donneeRepository.createDonnee).not.toHaveBeenCalled();
  });
});

describe("Creation of a data", () => {
  test("should create new data without behaviors or environments", async () => {
    const dataData = mock<InputDonnee>({
      comportementsIds: null,
      milieuxIds: null,
    });

    const loggedUser = mock<LoggedUser>();

    const reshapedInputData = mock<DonneeCreateInput>();
    reshapeInputDonneeUpsertData.mockReturnValueOnce(reshapedInputData);

    await donneeService.createDonnee(dataData, loggedUser);

    expect(donneeRepository.createDonnee).toHaveBeenCalledTimes(1);
    expect(donneeRepository.createDonnee).toHaveBeenLastCalledWith(any(), any());
    expect(donneeComportementRepository.insertDonneeWithComportements).not.toHaveBeenCalled();
    expect(donneeMilieuRepository.insertDonneeWithMilieux).not.toHaveBeenCalled();
  });

  test("should create new data with behaviors only", async () => {
    const dataData = mock<InputDonnee>({
      comportementsIds: [2, 3],
      milieuxIds: null,
    });

    const loggedUser = mock<LoggedUser>();

    const reshapedInputData = mock<DonneeCreateInput>();
    reshapeInputDonneeUpsertData.mockReturnValueOnce(reshapedInputData);
    donneeRepository.createDonnee.mockResolvedValueOnce(
      mock<Donnee>({
        id: 12,
      })
    );

    await donneeService.createDonnee(dataData, loggedUser);

    expect(donneeRepository.createDonnee).toHaveBeenCalledTimes(1);
    expect(donneeRepository.createDonnee).toHaveBeenLastCalledWith(any(), any());
    expect(donneeComportementRepository.insertDonneeWithComportements).toHaveBeenCalledTimes(1);
    expect(donneeComportementRepository.insertDonneeWithComportements).toHaveBeenLastCalledWith(
      12,
      dataData.comportementsIds,
      any()
    );
    expect(donneeMilieuRepository.insertDonneeWithMilieux).not.toHaveBeenCalled();
  });

  test("should create new data with environments only", async () => {
    const dataData = mock<InputDonnee>({
      comportementsIds: null,
      milieuxIds: [2, 3],
    });

    const loggedUser = mock<LoggedUser>();

    const reshapedInputData = mock<DonneeCreateInput>();
    reshapeInputDonneeUpsertData.mockReturnValueOnce(reshapedInputData);
    donneeRepository.createDonnee.mockResolvedValueOnce(
      mock<Donnee>({
        id: 12,
      })
    );

    await donneeService.createDonnee(dataData, loggedUser);

    expect(donneeRepository.createDonnee).toHaveBeenCalledTimes(1);
    expect(donneeRepository.createDonnee).toHaveBeenLastCalledWith(any(), any());
    expect(donneeComportementRepository.insertDonneeWithComportements).not.toHaveBeenCalled();
    expect(donneeMilieuRepository.insertDonneeWithMilieux).toHaveBeenCalledTimes(1);
    expect(donneeMilieuRepository.insertDonneeWithMilieux).toHaveBeenLastCalledWith(12, dataData.milieuxIds, any());
  });
});
