import { type UpsertSpeciesInput } from "@ou-ca/common/api/species";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { EspecesOrderBy, SortOrder, type QueryEspecesArgs } from "../../graphql/generated/graphql-types.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type Espece, type EspeceCreateInput } from "../../repositories/espece/espece-repository-types.js";
import { type EspeceRepository } from "../../repositories/espece/espece-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { COLUMN_CODE } from "../../utils/constants.js";
import { OucaError } from "../../utils/errors.js";
import { reshapeInputEspeceUpsertData } from "./espece-service-reshape.js";
import { buildEspeceService } from "./espece-service.js";

const especeRepository = mock<EspeceRepository>({});
const donneeRepository = mock<DonneeRepository>({});
const logger = mock<Logger>();

const especeService = buildEspeceService({
  logger,
  especeRepository,
  donneeRepository,
});

const uniqueConstraintFailedError = new UniqueIntegrityConstraintViolationError(
  new Error("errorMessage"),
  "constraint"
);

const uniqueConstraintFailed = () => {
  throw uniqueConstraintFailedError;
};

vi.mock("./espece-service-reshape.js", () => {
  return {
    __esModule: true,
    reshapeInputEspeceUpsertData: vi.fn(),
  };
});

const mockedReshapeInputEspeceUpsertData = vi.mocked(reshapeInputEspeceUpsertData);

describe("Find species", () => {
  test("should handle a matching species", async () => {
    const speciesData = mock<Espece>();
    const loggedUser = mock<LoggedUser>();

    especeRepository.findEspeceById.mockResolvedValueOnce(speciesData);

    await especeService.findEspece(speciesData.id, loggedUser);

    expect(especeRepository.findEspeceById).toHaveBeenCalledTimes(1);
    expect(especeRepository.findEspeceById).toHaveBeenLastCalledWith(speciesData.id);
  });

  test("should handle species not found", async () => {
    especeRepository.findEspeceById.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(especeService.findEspece(10, loggedUser)).resolves.toBe(null);

    expect(especeRepository.findEspeceById).toHaveBeenCalledTimes(1);
    expect(especeRepository.findEspeceById).toHaveBeenLastCalledWith(10);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(especeService.findEspece(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(especeRepository.findEspeceById).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await especeService.getDonneesCountByEspece(12, loggedUser);

    expect(donneeRepository.getCountByEspeceId).toHaveBeenCalledTimes(1);
    expect(donneeRepository.getCountByEspeceId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(especeService.getDonneesCountByEspece(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Find species by data ID", () => {
  test("should handle species found", async () => {
    const speciesData = mock<Espece>({
      id: 256,
    });
    const loggedUser = mock<LoggedUser>();

    especeRepository.findEspeceByDonneeId.mockResolvedValueOnce(speciesData);

    const species = await especeService.findEspeceOfDonneeId(43, loggedUser);

    expect(especeRepository.findEspeceByDonneeId).toHaveBeenCalledTimes(1);
    expect(especeRepository.findEspeceByDonneeId).toHaveBeenLastCalledWith(43);
    expect(species?.id).toEqual(256);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(especeService.findEspeceOfDonneeId(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all species", async () => {
  const speciesData = [mock<Espece>(), mock<Espece>(), mock<Espece>()];

  especeRepository.findEspeces.mockResolvedValueOnce(speciesData);

  await especeService.findAllEspeces();

  expect(especeRepository.findEspeces).toHaveBeenCalledTimes(1);
  expect(especeRepository.findEspeces).toHaveBeenLastCalledWith({
    orderBy: COLUMN_CODE,
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const speciesData = [mock<Espece>(), mock<Espece>(), mock<Espece>()];
    const loggedUser = mock<LoggedUser>();

    especeRepository.findEspeces.mockResolvedValueOnce(speciesData);

    await especeService.findPaginatedEspeces(loggedUser);

    expect(especeRepository.findEspeces).toHaveBeenCalledTimes(1);
    expect(especeRepository.findEspeces).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated species ", async () => {
    const speciesData = [mock<Espece>(), mock<Espece>(), mock<Espece>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: QueryEspecesArgs = {
      orderBy: EspecesOrderBy.Code,
      sortOrder: SortOrder.Desc,
      searchParams: {
        q: "Bob",
        pageNumber: 1,
        pageSize: 10,
      },
    };

    especeRepository.findEspeces.mockResolvedValueOnce([speciesData[0]]);

    await especeService.findPaginatedEspeces(loggedUser, searchParams);

    expect(especeRepository.findEspeces).toHaveBeenCalledTimes(1);
    expect(especeRepository.findEspeces).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: COLUMN_CODE,
      sortOrder: SortOrder.Desc,
      offset: 0,
      limit: searchParams.searchParams?.pageSize,
    });
  });

  test("should handle params and search criteria when retrieving paginated species ", async () => {
    const speciesData = [mock<Espece>(), mock<Espece>(), mock<Espece>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: QueryEspecesArgs = {
      orderBy: EspecesOrderBy.Code,
      sortOrder: SortOrder.Desc,
      searchParams: {
        q: "Bob",
        pageNumber: 1,
        pageSize: 10,
      },
      searchCriteria: {
        ages: [12, 23],
        nombre: null,
        communes: [3, 6],
        toDate: "2010-01-01",
      },
    };

    especeRepository.findEspeces.mockResolvedValueOnce([speciesData[0]]);

    await especeService.findPaginatedEspeces(loggedUser, searchParams);

    expect(especeRepository.findEspeces).toHaveBeenCalledTimes(1);
    expect(especeRepository.findEspeces).toHaveBeenLastCalledWith({
      q: "Bob",
      searchCriteria: {
        ages: [12, 23],
        nombre: null,
        communes: [3, 6],
        toDate: "2010-01-01",
      },
      orderBy: COLUMN_CODE,
      sortOrder: SortOrder.Desc,
      offset: 0,
      limit: searchParams.searchParams?.pageSize,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(especeService.findPaginatedEspeces(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await especeService.getEspecesCount(loggedUser);

    expect(especeRepository.getCount).toHaveBeenCalledTimes(1);
    expect(especeRepository.getCount).toHaveBeenLastCalledWith({});
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await especeService.getEspecesCount(loggedUser, { q: "test" });

    expect(especeRepository.getCount).toHaveBeenCalledTimes(1);
    expect(especeRepository.getCount).toHaveBeenLastCalledWith({
      q: "test",
    });
  });

  test("should handle to be called with some donnee criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await especeService.getEspecesCount(loggedUser, {
      searchCriteria: {
        ages: [12, 23],
        nombre: null,
        communes: [3, 6],
        toDate: "2010-01-01",
      },
    });

    expect(especeRepository.getCount).toHaveBeenCalledTimes(1);
    expect(especeRepository.getCount).toHaveBeenLastCalledWith({
      searchCriteria: {
        ages: [12, 23],
        nombre: null,
        communes: [3, 6],
        toDate: "2010-01-01",
      },
    });
  });

  test("should handle to be called with both espece and donnee criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await especeService.getEspecesCount(loggedUser, {
      q: "test",
      searchCriteria: {
        ages: [12, 23],
        nombre: null,
        communes: [3, 6],
        toDate: "2010-01-01",
      },
    });

    expect(especeRepository.getCount).toHaveBeenCalledTimes(1);
    expect(especeRepository.getCount).toHaveBeenLastCalledWith({
      q: "test",
      searchCriteria: {
        ages: [12, 23],
        nombre: null,
        communes: [3, 6],
        toDate: "2010-01-01",
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(especeService.getEspecesCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of a species", () => {
  test("should be allowed when requested by an admin", async () => {
    const speciesData = mock<UpsertSpeciesInput>();

    const reshapedInputData = mock<EspeceCreateInput>();
    mockedReshapeInputEspeceUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    await especeService.updateEspece(12, speciesData, loggedUser);

    expect(especeRepository.updateEspece).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputEspeceUpsertData).toHaveBeenCalledTimes(1);
    expect(especeRepository.updateEspece).toHaveBeenLastCalledWith(12, reshapedInputData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = mock<Espece>({
      ownerId: "notAdmin",
    });

    const speciesData = mock<UpsertSpeciesInput>();

    const reshapedInputData = mock<EspeceCreateInput>();
    mockedReshapeInputEspeceUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    especeRepository.findEspeceById.mockResolvedValueOnce(existingData);

    await especeService.updateEspece(12, speciesData, loggedUser);

    expect(especeRepository.updateEspece).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputEspeceUpsertData).toHaveBeenCalledTimes(1);
    expect(especeRepository.updateEspece).toHaveBeenLastCalledWith(12, reshapedInputData);
  });

  test("should throw an error when requested by an user that is nor owner nor admin", async () => {
    const existingData = mock<Espece>({
      ownerId: "notAdmin",
    });

    const speciesData = mock<UpsertSpeciesInput>();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    especeRepository.findEspeceById.mockResolvedValueOnce(existingData);

    await expect(especeService.updateEspece(12, speciesData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

    expect(especeRepository.updateEspece).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to a species that exists", async () => {
    const speciesData = mock<UpsertSpeciesInput>();

    const reshapedInputData = mock<EspeceCreateInput>();
    mockedReshapeInputEspeceUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    especeRepository.updateEspece.mockImplementation(uniqueConstraintFailed);

    await expect(() => especeService.updateEspece(12, speciesData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(especeRepository.updateEspece).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputEspeceUpsertData).toHaveBeenCalledTimes(1);
    expect(especeRepository.updateEspece).toHaveBeenLastCalledWith(12, reshapedInputData);
  });

  test("should throw an error when the requester is not logged", async () => {
    const speciesData = mock<UpsertSpeciesInput>();

    await expect(especeService.updateEspece(12, speciesData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(especeRepository.updateEspece).not.toHaveBeenCalled();
  });
});

describe("Creation of a species", () => {
  test("should create new species", async () => {
    const speciesData = mock<UpsertSpeciesInput>();

    const reshapedInputData = mock<EspeceCreateInput>();
    mockedReshapeInputEspeceUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ id: "a" });

    await especeService.createEspece(speciesData, loggedUser);

    expect(especeRepository.createEspece).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputEspeceUpsertData).toHaveBeenCalledTimes(1);
    expect(especeRepository.createEspece).toHaveBeenLastCalledWith({
      ...reshapedInputData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when trying to create a species that already exists", async () => {
    const speciesData = mock<UpsertSpeciesInput>();

    const reshapedInputData = mock<EspeceCreateInput>();
    mockedReshapeInputEspeceUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ id: "a" });

    especeRepository.createEspece.mockImplementation(uniqueConstraintFailed);

    await expect(() => especeService.createEspece(speciesData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(especeRepository.createEspece).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputEspeceUpsertData).toHaveBeenCalledTimes(1);
    expect(especeRepository.createEspece).toHaveBeenLastCalledWith({
      ...reshapedInputData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const speciesData = mock<UpsertSpeciesInput>();

    await expect(especeService.createEspece(speciesData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(especeRepository.createEspece).not.toHaveBeenCalled();
  });
});

describe("Deletion of a species", () => {
  test("should handle the deletion of an owned species", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const species = mock<Espece>({
      ownerId: loggedUser.id,
    });

    especeRepository.findEspeceById.mockResolvedValueOnce(species);

    await especeService.deleteEspece(11, loggedUser);

    expect(especeRepository.deleteEspeceById).toHaveBeenCalledTimes(1);
    expect(especeRepository.deleteEspeceById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any species if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "admin",
    });

    especeRepository.findEspeceById.mockResolvedValueOnce(mock<Espece>());

    await especeService.deleteEspece(11, loggedUser);

    expect(especeRepository.deleteEspeceById).toHaveBeenCalledTimes(1);
    expect(especeRepository.deleteEspeceById).toHaveBeenLastCalledWith(11);
  });

  test("should return an error when deleting a non-owned species as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "contributor",
    });

    especeRepository.findEspeceById.mockResolvedValueOnce(mock<Espece>());

    await expect(especeService.deleteEspece(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(especeRepository.deleteEspeceById).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(especeService.deleteEspece(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(especeRepository.deleteEspeceById).not.toHaveBeenCalled();
  });
});

test("Create multiple species", async () => {
  const speciesData = [
    mock<Omit<EspeceCreateInput, "owner_id">>(),
    mock<Omit<EspeceCreateInput, "owner_id">>(),
    mock<Omit<EspeceCreateInput, "owner_id">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  especeRepository.createEspeces.mockResolvedValueOnce([]);

  await especeService.createEspeces(speciesData, loggedUser);

  expect(especeRepository.createEspeces).toHaveBeenCalledTimes(1);
  expect(especeRepository.createEspeces).toHaveBeenLastCalledWith(
    speciesData.map((species) => {
      return {
        ...species,
        owner_id: loggedUser.id,
      };
    })
  );
});
