import { mock } from "jest-mock-extended";
import { type Logger } from "pino";
import { createMockPool, UniqueIntegrityConstraintViolationError } from "slonik";
import {
  SearchDonneesOrderBy,
  SortOrder,
  type PaginatedSearchDonneesResultResultArgs,
} from "../../graphql/generated/graphql-types";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository";
import { type Donnee } from "../../repositories/donnee/donnee-repository-types";
import { type InventaireRepository } from "../../repositories/inventaire/inventaire-repository";
import { type Inventaire } from "../../repositories/inventaire/inventaire-repository-types";
import { type LoggedUser } from "../../types/User";
import { OucaError } from "../../utils/errors";
import { buildDonneeService } from "./donnee-service";

const donneeRepository = mock<DonneeRepository>({});
const inventaireRepository = mock<InventaireRepository>({});
const logger = mock<Logger>();
const slonik = createMockPool({
  query: jest.fn(),
});

const donneeService = buildDonneeService({
  logger,
  slonik,
  inventaireRepository,
  donneeRepository,
});

const uniqueConstraintFailedError = new UniqueIntegrityConstraintViolationError(
  new Error("errorMessage"),
  "constraint"
);

const uniqueConstraintFailed = () => {
  throw uniqueConstraintFailedError;
};

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
