import { mock } from "jest-mock-extended";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import {
  SearchDonneesOrderBy,
  SortOrder,
  type PaginatedSearchDonneesResultResultArgs,
} from "../../graphql/generated/graphql-types";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository";
import { type Donnee } from "../../repositories/donnee/donnee-repository-types";
import { type LoggedUser } from "../../types/User";
import { OucaError } from "../../utils/errors";
import { buildDonneeService } from "./donnee-service";

const donneeRepository = mock<DonneeRepository>({});
const logger = mock<Logger>();

const donneeService = buildDonneeService({
  logger,
  donneeRepository,
});

const uniqueConstraintFailedError = new UniqueIntegrityConstraintViolationError(
  new Error("errorMessage"),
  "constraint"
);

const uniqueConstraintFailed = () => {
  throw uniqueConstraintFailedError;
};

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
