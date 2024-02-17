import { OucaError } from "@domain/errors/ouca-error.js";
import { type Locality } from "@domain/locality/locality.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type Locality as LocalityCommon } from "@ou-ca/common/api/entities/locality";
import { type LocalitiesSearchParams, type UpsertLocalityInput } from "@ou-ca/common/api/locality";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { vi } from "vitest";
import { mock, mockDeep } from "vitest-mock-extended";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type InventaireRepository } from "../../repositories/inventaire/inventaire-repository.js";
import { type LieuditCreateInput } from "../../repositories/lieudit/lieudit-repository-types.js";
import { type LieuditRepository } from "../../repositories/lieudit/lieudit-repository.js";
import { mockVi } from "../../utils/mock.js";
import { reshapeInputLieuditUpsertData, reshapeLocalityRepositoryToApi } from "./lieu-dit-service-reshape.js";
import { buildLieuditService } from "./lieu-dit-service.js";

const localityRepository = mockVi<LieuditRepository>();
const inventoryRepository = mockVi<InventaireRepository>();
const entryRepository = mockVi<DonneeRepository>();

const lieuditService = buildLieuditService({
  localityRepository,
  inventoryRepository,
  entryRepository,
});

const uniqueConstraintFailedError = new UniqueIntegrityConstraintViolationError(
  new Error("errorMessage"),
  "constraint"
);

const uniqueConstraintFailed = () => {
  throw uniqueConstraintFailedError;
};

vi.mock("./lieu-dit-service-reshape.js", () => {
  return {
    __esModule: true,
    reshapeInputLieuditUpsertData: vi.fn(),
    reshapeLocalityRepositoryToApi: vi.fn(),
  };
});

const mockedReshapeInputLieuditUpsertData = vi.mocked(reshapeInputLieuditUpsertData);
const mockedReshapeLocalityRepositoryToApi = vi.mocked(reshapeLocalityRepositoryToApi);

describe("Find locality", () => {
  test("should handle a matching locality", async () => {
    const localityData = mockDeep<Locality>();
    const loggedUser = mock<LoggedUser>();

    localityRepository.findLieuditById.mockResolvedValueOnce(localityData);

    await lieuditService.findLieuDit(12, loggedUser);

    expect(localityRepository.findLieuditById).toHaveBeenCalledTimes(1);
    expect(localityRepository.findLieuditById).toHaveBeenLastCalledWith(12);
  });

  test("should handle locality not found", async () => {
    localityRepository.findLieuditById.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    mockedReshapeLocalityRepositoryToApi.mockReturnValueOnce(null);

    await expect(lieuditService.findLieuDit(10, loggedUser)).resolves.toBe(null);

    expect(localityRepository.findLieuditById).toHaveBeenCalledTimes(1);
    expect(localityRepository.findLieuditById).toHaveBeenLastCalledWith(10);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(lieuditService.findLieuDit(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(localityRepository.findLieuditById).not.toHaveBeenCalled();
  });
});

describe("Inventory count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await lieuditService.getInventoriesCountByLocality("12", loggedUser);

    expect(inventoryRepository.getCountByLocality).toHaveBeenCalledTimes(1);
    expect(inventoryRepository.getCountByLocality).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(lieuditService.getInventoriesCountByLocality("12", null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await lieuditService.getDonneesCountByLieuDit("12", loggedUser);

    expect(entryRepository.getCountByLieuditId).toHaveBeenCalledTimes(1);
    expect(entryRepository.getCountByLieuditId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(lieuditService.getDonneesCountByLieuDit("12", null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Find locality by inventary ID", () => {
  test("should handle locality found", async () => {
    const localityData = mock<Locality>({
      id: "256",
    });
    const loggedUser = mock<LoggedUser>();

    localityRepository.findLieuditByInventaireId.mockResolvedValueOnce(localityData);
    mockedReshapeLocalityRepositoryToApi.mockReturnValueOnce(
      mock<LocalityCommon>({
        id: "258",
      })
    );

    const locality = await lieuditService.findLieuDitOfInventaireId(43, loggedUser);

    expect(localityRepository.findLieuditByInventaireId).toHaveBeenCalledTimes(1);
    expect(localityRepository.findLieuditByInventaireId).toHaveBeenLastCalledWith(43);
    expect(locality?.id).toEqual("258");
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(lieuditService.findLieuDitOfInventaireId(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all localities", async () => {
  const localitiesData = [mockDeep<Locality>(), mockDeep<Locality>(), mockDeep<Locality>()];

  localityRepository.findLieuxdits.mockResolvedValueOnce(localitiesData);

  await lieuditService.findAllLieuxDits();

  expect(localityRepository.findLieuxdits).toHaveBeenCalledTimes(1);
  expect(localityRepository.findLieuxdits).toHaveBeenLastCalledWith({
    orderBy: "nom",
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const localitiesData = [mockDeep<Locality>(), mockDeep<Locality>(), mockDeep<Locality>()];
    const loggedUser = mock<LoggedUser>();

    localityRepository.findLieuxdits.mockResolvedValueOnce(localitiesData);

    await lieuditService.findPaginatedLieuxDits(loggedUser, {});

    expect(localityRepository.findLieuxdits).toHaveBeenCalledTimes(1);
    expect(localityRepository.findLieuxdits).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated localities ", async () => {
    const localitiesData = [mockDeep<Locality>(), mockDeep<Locality>(), mockDeep<Locality>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: LocalitiesSearchParams = {
      orderBy: "nom",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    localityRepository.findLieuxdits.mockResolvedValueOnce([localitiesData[0]]);

    await lieuditService.findPaginatedLieuxDits(loggedUser, searchParams);

    expect(localityRepository.findLieuxdits).toHaveBeenCalledTimes(1);
    expect(localityRepository.findLieuxdits).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: "nom",
      sortOrder: "desc",
      offset: 0,
      limit: searchParams.pageSize,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(lieuditService.findPaginatedLieuxDits(null, {})).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await lieuditService.getLieuxDitsCount(loggedUser, {});

    expect(localityRepository.getCount).toHaveBeenCalledTimes(1);
    expect(localityRepository.getCount).toHaveBeenLastCalledWith(undefined, undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await lieuditService.getLieuxDitsCount(loggedUser, { q: "test", townId: "12" });

    expect(localityRepository.getCount).toHaveBeenCalledTimes(1);
    expect(localityRepository.getCount).toHaveBeenLastCalledWith("test", 12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(lieuditService.getLieuxDitsCount(null, {})).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of a locality", () => {
  test("should be allowed when requested by an admin", async () => {
    const localityData = mock<UpsertLocalityInput>();

    const reshapedInputData = mock<LieuditCreateInput>();
    mockedReshapeInputLieuditUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ role: "admin" });
    localityRepository.updateLieudit.mockResolvedValueOnce(mockDeep<Locality>());

    await lieuditService.updateLieuDit(12, localityData, loggedUser);

    expect(localityRepository.updateLieudit).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputLieuditUpsertData).toHaveBeenCalledTimes(1);
    expect(localityRepository.updateLieudit).toHaveBeenLastCalledWith(12, reshapedInputData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = mock<Locality>({
      ownerId: "notAdmin",
    });

    const localityData = mock<UpsertLocalityInput>();

    const reshapedInputData = mock<LieuditCreateInput>();
    mockedReshapeInputLieuditUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    localityRepository.findLieuditById.mockResolvedValueOnce(existingData);

    await lieuditService.updateLieuDit(12, localityData, loggedUser);

    expect(localityRepository.updateLieudit).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputLieuditUpsertData).toHaveBeenCalledTimes(1);
    expect(localityRepository.updateLieudit).toHaveBeenLastCalledWith(12, reshapedInputData);
  });

  test("should throw an error when requested by an user that is nor owner nor admin", async () => {
    const existingData = mock<Locality>({
      ownerId: "notAdmin",
    });

    const localityData = mock<UpsertLocalityInput>();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    localityRepository.findLieuditById.mockResolvedValueOnce(existingData);

    await expect(lieuditService.updateLieuDit(12, localityData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

    expect(localityRepository.updateLieudit).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to a locality that exists", async () => {
    const localityData = mock<UpsertLocalityInput>();

    const reshapedInputData = mock<LieuditCreateInput>();
    mockedReshapeInputLieuditUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    localityRepository.updateLieudit.mockImplementation(uniqueConstraintFailed);

    await expect(() => lieuditService.updateLieuDit(12, localityData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(localityRepository.updateLieudit).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputLieuditUpsertData).toHaveBeenCalledTimes(1);
    expect(localityRepository.updateLieudit).toHaveBeenLastCalledWith(12, reshapedInputData);
  });

  test("should throw an error when the requester is not logged", async () => {
    const localityData = mock<UpsertLocalityInput>();

    await expect(lieuditService.updateLieuDit(12, localityData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(localityRepository.updateLieudit).not.toHaveBeenCalled();
  });
});

describe("Creation of a locality", () => {
  test("should create new locality", async () => {
    const localityData = mock<UpsertLocalityInput>();

    const reshapedInputData = mock<LieuditCreateInput>();
    mockedReshapeInputLieuditUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ id: "a" });

    localityRepository.createLieudit.mockResolvedValueOnce(mockDeep<Locality>());

    await lieuditService.createLieuDit(localityData, loggedUser);

    expect(localityRepository.createLieudit).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputLieuditUpsertData).toHaveBeenCalledTimes(1);
    expect(localityRepository.createLieudit).toHaveBeenLastCalledWith({
      ...reshapedInputData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when trying to create a locality that already exists", async () => {
    const localityData = mock<UpsertLocalityInput>();

    const reshapedInputData = mock<LieuditCreateInput>();
    mockedReshapeInputLieuditUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ id: "a" });

    localityRepository.createLieudit.mockImplementation(uniqueConstraintFailed);

    await expect(() => lieuditService.createLieuDit(localityData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(localityRepository.createLieudit).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputLieuditUpsertData).toHaveBeenCalledTimes(1);
    expect(localityRepository.createLieudit).toHaveBeenLastCalledWith({
      ...reshapedInputData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const localityData = mock<UpsertLocalityInput>();

    await expect(lieuditService.createLieuDit(localityData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(localityRepository.createLieudit).not.toHaveBeenCalled();
  });
});

describe("Deletion of a locality", () => {
  test("should handle the deletion of an owned locality", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const locality = mock<Locality>({
      ownerId: loggedUser.id,
    });

    localityRepository.findLieuditById.mockResolvedValueOnce(locality);
    localityRepository.deleteLieuditById.mockResolvedValueOnce(mockDeep<Locality>());

    await lieuditService.deleteLieuDit(11, loggedUser);

    expect(localityRepository.deleteLieuditById).toHaveBeenCalledTimes(1);
    expect(localityRepository.deleteLieuditById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any locality if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "admin",
    });

    localityRepository.findLieuditById.mockResolvedValueOnce(mock<Locality>());
    localityRepository.deleteLieuditById.mockResolvedValueOnce(mockDeep<Locality>());

    await lieuditService.deleteLieuDit(11, loggedUser);

    expect(localityRepository.deleteLieuditById).toHaveBeenCalledTimes(1);
    expect(localityRepository.deleteLieuditById).toHaveBeenLastCalledWith(11);
  });

  test("should return an error when deleting a non-owned locality as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "contributor",
    });

    localityRepository.findLieuditById.mockResolvedValueOnce(mock<Locality>());

    await expect(lieuditService.deleteLieuDit(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(localityRepository.deleteLieuditById).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(lieuditService.deleteLieuDit(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(localityRepository.deleteLieuditById).not.toHaveBeenCalled();
  });
});

test("Create multiple localities", async () => {
  const lieuDitsData = [
    mock<Omit<LieuditCreateInput, "owner_id">>(),
    mock<Omit<LieuditCreateInput, "owner_id">>(),
    mock<Omit<LieuditCreateInput, "owner_id">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  localityRepository.createLieuxdits.mockResolvedValueOnce([]);

  await lieuditService.createLieuxDits(lieuDitsData, loggedUser);

  expect(localityRepository.createLieuxdits).toHaveBeenCalledTimes(1);
  expect(localityRepository.createLieuxdits).toHaveBeenLastCalledWith(
    lieuDitsData.map((lieuDit) => {
      return {
        ...lieuDit,
        owner_id: loggedUser.id,
      };
    })
  );
});
