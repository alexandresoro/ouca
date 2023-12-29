import { OucaError } from "@domain/errors/ouca-error.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type EntryNavigation } from "@ou-ca/common/api/entities/entry";
import { type EntriesSearchParams, type UpsertEntryInput } from "@ou-ca/common/api/entry";
import { createMockPool } from "slonik";
import { vi } from "vitest";
import { any, anyNumber, anyObject, mock } from "vitest-mock-extended";
import { type DonneeComportementRepository } from "../../repositories/donnee-comportement/donnee-comportement-repository.js";
import { type DonneeMilieuRepository } from "../../repositories/donnee-milieu/donnee-milieu-repository.js";
import { type Donnee, type DonneeCreateInput } from "../../repositories/donnee/donnee-repository-types.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type Inventaire } from "../../repositories/inventaire/inventaire-repository-types.js";
import { type InventaireRepository } from "../../repositories/inventaire/inventaire-repository.js";
import { mockVi } from "../../utils/mock.js";
import { buildDonneeService } from "./donnee-service.js";

const entryRepository = mockVi<DonneeRepository>();
const entryBehaviorRepository = mockVi<DonneeComportementRepository>();
const entryEnvironmentRepository = mockVi<DonneeMilieuRepository>();
const inventoryRepository = mockVi<InventaireRepository>();
const slonik = createMockPool({
  query: vi.fn(),
});

const donneeService = buildDonneeService({
  slonik,
  inventoryRepository,
  entryRepository,
  entryBehaviorRepository,
  entryEnvironmentRepository,
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

    entryRepository.findDonneeById.mockResolvedValueOnce(dataData);

    await donneeService.findDonnee(12, loggedUser);

    expect(entryRepository.findDonneeById).toHaveBeenCalledTimes(1);
    expect(entryRepository.findDonneeById).toHaveBeenLastCalledWith(12);
  });

  test("should handle data not found", async () => {
    entryRepository.findDonneeById.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(donneeService.findDonnee(10, loggedUser)).resolves.toBe(null);

    expect(entryRepository.findDonneeById).toHaveBeenCalledTimes(1);
    expect(entryRepository.findDonneeById).toHaveBeenLastCalledWith(10);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(donneeService.findDonnee(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(entryRepository.findDonneeById).not.toHaveBeenCalled();
  });
});

test("Find all datas", async () => {
  const dataData = [mock<Donnee>(), mock<Donnee>(), mock<Donnee>()];

  entryRepository.findDonnees.mockResolvedValueOnce(dataData);

  await donneeService.findAllDonnees();

  expect(entryRepository.findDonnees).toHaveBeenCalledTimes(1);
});

describe("Data paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const dataData = [mock<Donnee>(), mock<Donnee>(), mock<Donnee>()];
    const loggedUser = mock<LoggedUser>();

    entryRepository.findDonnees.mockResolvedValueOnce(dataData);

    await donneeService.findPaginatedDonnees(loggedUser, {
      pageNumber: 1,
      pageSize: 10,
    });

    expect(entryRepository.findDonnees).toHaveBeenCalledTimes(1);
    expect(entryRepository.findDonnees).toHaveBeenLastCalledWith({
      offset: 0,
      limit: 10,
    });
  });

  test("should handle params when retrieving paginated data", async () => {
    const dataData = [mock<Donnee>(), mock<Donnee>(), mock<Donnee>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: EntriesSearchParams = {
      number: 12,
      breeders: ["certain", "probable"],
      orderBy: "departement",
      sortOrder: "desc",
      pageNumber: 1,
      pageSize: 10,
    };

    entryRepository.findDonnees.mockResolvedValueOnce([dataData[0]]);

    await donneeService.findPaginatedDonnees(loggedUser, searchParams);

    expect(entryRepository.findDonnees).toHaveBeenCalledTimes(1);
    expect(entryRepository.findDonnees).toHaveBeenLastCalledWith({
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

  test("should throw an error when the requester is not logged", async () => {
    await expect(
      donneeService.findPaginatedDonnees(null, {
        pageNumber: 1,
        pageSize: 10,
      })
    ).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await donneeService.getDonneesCount(loggedUser, {
      pageNumber: 1,
      pageSize: 10,
    });

    expect(entryRepository.getCount).toHaveBeenCalledTimes(1);
    expect(entryRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    const searchCriteria: EntriesSearchParams = {
      pageNumber: 1,
      pageSize: 10,
      number: 12,
      breeders: ["certain", "probable"],
    };

    await donneeService.getDonneesCount(loggedUser, searchCriteria);

    expect(entryRepository.getCount).toHaveBeenCalledTimes(1);
    expect(entryRepository.getCount).toHaveBeenLastCalledWith({
      number: 12,
      breeders: ["certain", "probable"],
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(
      donneeService.getDonneesCount(null, {
        pageNumber: 1,
        pageSize: 10,
      })
    ).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Data navigation", () => {
  test("should call the correct info", async () => {
    const loggedUser = mock<LoggedUser>();

    entryRepository.findPreviousDonneeId.mockResolvedValueOnce(3);
    entryRepository.findNextDonneeId.mockResolvedValueOnce(17);
    entryRepository.findDonneeIndex.mockResolvedValueOnce(11);

    const result = await donneeService.findDonneeNavigationData(loggedUser, "12");

    expect(entryRepository.findPreviousDonneeId).toHaveBeenCalledTimes(1);
    expect(entryRepository.findNextDonneeId).toHaveBeenCalledTimes(1);
    expect(entryRepository.findDonneeIndex).toHaveBeenCalledTimes(1);
    expect(result).toEqual<EntryNavigation>({
      index: 11,
      previousEntryId: "3",
      nextEntryId: "17",
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(donneeService.findDonneeNavigationData(null, "12")).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Get latest data id", () => {
  test("should handle existing data", async () => {
    const loggedUser = mock<LoggedUser>();

    entryRepository.findLatestDonneeId.mockResolvedValueOnce("18");

    const nextRegroupement = await donneeService.findLastDonneeId(loggedUser);

    expect(entryRepository.findLatestDonneeId).toHaveBeenCalledTimes(1);
    expect(nextRegroupement).toEqual("18");
  });

  test("should handle no existing data", async () => {
    const loggedUser = mock<LoggedUser>();

    entryRepository.findLatestDonneeId.mockResolvedValueOnce(null);

    await donneeService.findLastDonneeId(loggedUser);

    expect(entryRepository.findLatestDonneeId).toHaveBeenCalledTimes(1);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(donneeService.findLastDonneeId(null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(entryRepository.findLatestDonneeId).not.toHaveBeenCalled();
  });
});

describe("Get next group", () => {
  test("should handle existing groups", async () => {
    const loggedUser = mock<LoggedUser>();

    entryRepository.findLatestRegroupement.mockResolvedValueOnce(18);

    const nextRegroupement = await donneeService.findNextRegroupement(loggedUser);

    expect(entryRepository.findLatestRegroupement).toHaveBeenCalledTimes(1);
    expect(nextRegroupement).toEqual(19);
  });

  test("should handle no existing group", async () => {
    const loggedUser = mock<LoggedUser>();

    entryRepository.findLatestRegroupement.mockResolvedValueOnce(null);

    await donneeService.findNextRegroupement(loggedUser);

    expect(entryRepository.findLatestRegroupement).toHaveBeenCalledTimes(1);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(donneeService.findNextRegroupement(null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(entryRepository.findLatestRegroupement).not.toHaveBeenCalled();
  });
});

describe("Deletion of a data", () => {
  test("should handle the deletion of any data if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "admin",
    });

    const matchingInventory = mock<Inventaire>({});

    const deletedDonnee = mock<Donnee>({
      id: "42",
    });

    inventoryRepository.findInventaireByDonneeId.mockResolvedValueOnce(matchingInventory);
    entryRepository.getCountByInventaireId.mockResolvedValueOnce(2);
    entryRepository.deleteDonneeById.mockResolvedValueOnce(deletedDonnee);

    const result = await donneeService.deleteDonnee(11, loggedUser);

    expect(entryRepository.deleteDonneeById).toHaveBeenCalledTimes(1);
    expect(inventoryRepository.deleteInventaireById).not.toHaveBeenCalled();
    expect(result).toEqual(deletedDonnee);
  });

  describe("should handle the deletion of any data belonging to a owned inventory if non-admin", () => {
    test("when the inventory exists", async () => {
      const loggedUser = mock<LoggedUser>({
        id: "12",
        role: "contributor",
      });

      const matchingInventory = mock<Inventaire>({
        ownerId: loggedUser.id,
      });

      const deletedDonnee = mock<Donnee>({
        id: "42",
      });

      inventoryRepository.findInventaireByDonneeId.mockResolvedValueOnce(matchingInventory);
      entryRepository.getCountByInventaireId.mockResolvedValueOnce(2);
      entryRepository.deleteDonneeById.mockResolvedValueOnce(deletedDonnee);

      const result = await donneeService.deleteDonnee(11, loggedUser);

      expect(entryRepository.deleteDonneeById).toHaveBeenCalledTimes(1);
      expect(inventoryRepository.deleteInventaireById).not.toHaveBeenCalled();
      expect(result).toEqual(deletedDonnee);
    });

    test("unless no matching inventory has been found", async () => {
      const loggedUser = mock<LoggedUser>({
        id: "12",
        role: "contributor",
      });

      const deletedDonnee = mock<Donnee>({
        id: "42",
      });

      inventoryRepository.findInventaireByDonneeId.mockResolvedValueOnce(null);
      entryRepository.deleteDonneeById.mockResolvedValueOnce(deletedDonnee);

      await expect(donneeService.deleteDonnee(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));
      expect(entryRepository.deleteDonneeById).not.toHaveBeenCalled();
      expect(inventoryRepository.deleteInventaireById).not.toHaveBeenCalled();
    });
  });

  test("should throw an error when trying to deletre a data belonging to a non-owned inventory", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "contributor",
    });

    inventoryRepository.findInventaireByDonneeId.mockResolvedValueOnce(mock<Inventaire>());

    await expect(donneeService.deleteDonnee(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(entryRepository.deleteDonneeById).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(donneeService.deleteDonnee(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(entryRepository.deleteDonneeById).not.toHaveBeenCalled();
  });
});

describe("Update of a data", () => {
  test("should update existing data", async () => {
    const dataData = mock<UpsertEntryInput>({
      behaviorIds: ["2", "3"],
      environmentIds: ["4", "5"],
    });

    const loggedUser = mock<LoggedUser>();

    entryRepository.findExistingDonnee.mockResolvedValueOnce(null);
    entryRepository.createDonnee.mockResolvedValueOnce(
      mock<Donnee>({
        id: "12",
      })
    );

    const reshapedInputData = mock<DonneeCreateInput>();
    reshapeInputDonneeUpsertData.mockReturnValueOnce(reshapedInputData);

    await donneeService.updateDonnee("12", dataData, loggedUser);

    expect(entryRepository.updateDonnee).toHaveBeenCalledTimes(1);
    expect(entryRepository.updateDonnee).toHaveBeenLastCalledWith(12, any(), any());
    expect(entryBehaviorRepository.deleteComportementsOfDonneeId).toHaveBeenCalledTimes(1);
    expect(entryBehaviorRepository.deleteComportementsOfDonneeId).toHaveBeenLastCalledWith(12, any());
    expect(entryBehaviorRepository.insertDonneeWithComportements).toHaveBeenCalledTimes(1);
    expect(entryBehaviorRepository.insertDonneeWithComportements).toHaveBeenLastCalledWith(
      anyNumber(),
      expect.arrayContaining([2, 3]),
      anyObject()
    );
    expect(entryEnvironmentRepository.deleteMilieuxOfDonneeId).toHaveBeenCalledTimes(1);
    expect(entryEnvironmentRepository.deleteMilieuxOfDonneeId).toHaveBeenLastCalledWith(12, any());
    expect(entryEnvironmentRepository.insertDonneeWithMilieux).toHaveBeenCalledTimes(1);
    expect(entryEnvironmentRepository.insertDonneeWithMilieux).toHaveBeenLastCalledWith(
      anyNumber(),
      expect.arrayContaining([4, 5]),
      anyObject()
    );
  });

  test("should throw an error when trying to update to a different data that already exists", async () => {
    const dataData = mock<UpsertEntryInput>();

    const loggedUser = mock<LoggedUser>();

    entryRepository.findExistingDonnee.mockResolvedValueOnce(
      mock<Donnee>({
        id: "345",
      })
    );

    await expect(donneeService.updateDonnee("12", dataData, loggedUser)).rejects.toEqual(
      new OucaError("OUCA0004", {
        code: "OUCA0004",
        message: "Cette donnée existe déjà (ID = 345).",
      })
    );
    expect(entryRepository.updateDonnee).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    const dataData = mock<UpsertEntryInput>();

    await expect(donneeService.updateDonnee("12", dataData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(entryRepository.createDonnee).not.toHaveBeenCalled();
  });
});

describe("Creation of a data", () => {
  test("should create new data without behaviors or environments", async () => {
    const dataData = mock<UpsertEntryInput>({
      behaviorIds: [],
      environmentIds: [],
    });

    const loggedUser = mock<LoggedUser>();

    const reshapedInputData = mock<DonneeCreateInput>();
    reshapeInputDonneeUpsertData.mockReturnValueOnce(reshapedInputData);

    await donneeService.createDonnee(dataData, loggedUser);

    expect(entryRepository.createDonnee).toHaveBeenCalledTimes(1);
    expect(entryRepository.createDonnee).toHaveBeenLastCalledWith(any(), any());
    expect(entryBehaviorRepository.insertDonneeWithComportements).not.toHaveBeenCalled();
    expect(entryEnvironmentRepository.insertDonneeWithMilieux).not.toHaveBeenCalled();
  });

  test("should create new data with behaviors only", async () => {
    const dataData = mock<UpsertEntryInput>({
      behaviorIds: ["2", "3"],
      environmentIds: [],
    });

    const loggedUser = mock<LoggedUser>();

    const reshapedInputData = mock<DonneeCreateInput>();
    reshapeInputDonneeUpsertData.mockReturnValueOnce(reshapedInputData);
    entryRepository.createDonnee.mockResolvedValueOnce(
      mock<Donnee>({
        id: "12",
      })
    );

    await donneeService.createDonnee(dataData, loggedUser);

    expect(entryRepository.createDonnee).toHaveBeenCalledTimes(1);
    expect(entryRepository.createDonnee).toHaveBeenLastCalledWith(any(), any());
    expect(entryBehaviorRepository.insertDonneeWithComportements).toHaveBeenCalledTimes(1);
    expect(entryBehaviorRepository.insertDonneeWithComportements).toHaveBeenLastCalledWith(12, [2, 3], any());
    expect(entryEnvironmentRepository.insertDonneeWithMilieux).not.toHaveBeenCalled();
  });

  test("should create new data with environments only", async () => {
    const dataData = mock<UpsertEntryInput>({
      behaviorIds: [],
      environmentIds: ["2", "3"],
    });

    const loggedUser = mock<LoggedUser>();

    const reshapedInputData = mock<DonneeCreateInput>();
    reshapeInputDonneeUpsertData.mockReturnValueOnce(reshapedInputData);
    entryRepository.createDonnee.mockResolvedValueOnce(
      mock<Donnee>({
        id: "12",
      })
    );

    await donneeService.createDonnee(dataData, loggedUser);

    expect(entryRepository.createDonnee).toHaveBeenCalledTimes(1);
    expect(entryRepository.createDonnee).toHaveBeenLastCalledWith(any(), any());
    expect(entryBehaviorRepository.insertDonneeWithComportements).not.toHaveBeenCalled();
    expect(entryEnvironmentRepository.insertDonneeWithMilieux).toHaveBeenCalledTimes(1);
    expect(entryEnvironmentRepository.insertDonneeWithMilieux).toHaveBeenLastCalledWith(12, [2, 3], any());
  });
});
