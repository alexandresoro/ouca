import { mock, mockDeep } from "jest-mock-extended";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import {
  LieuxDitsOrderBy,
  SortOrder,
  type MutationUpsertLieuDitArgs,
  type QueryLieuxDitsArgs,
} from "../../graphql/generated/graphql-types";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository";
import { type LieuditRepository } from "../../repositories/lieudit/lieudit-repository";
import { type Lieudit, type LieuditCreateInput } from "../../repositories/lieudit/lieudit-repository-types";
import { type LoggedUser } from "../../types/User";
import { COLUMN_NOM } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { buildLieuditService } from "./lieu-dit-service";
import { reshapeInputLieuditUpsertData } from "./lieu-dit-service-reshape";

const lieuditRepository = mock<LieuditRepository>({});
const donneeRepository = mock<DonneeRepository>({});
const logger = mock<Logger>();

const lieuditService = buildLieuditService({
  logger,
  lieuditRepository,
  donneeRepository,
});

const uniqueConstraintFailedError = new UniqueIntegrityConstraintViolationError(
  new Error("errorMessage"),
  "constraint"
);

const uniqueConstraintFailed = () => {
  throw uniqueConstraintFailedError;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
jest.mock<typeof import("./lieu-dit-service-reshape")>("./lieu-dit-service-reshape", () => {
  return {
    __esModule: true,
    reshapeInputLieuditUpsertData: jest.fn(),
  };
});

const mockedReshapeInputLieuditUpsertData = jest.mocked(reshapeInputLieuditUpsertData);

describe("Find locality", () => {
  test("should handle a matching locality", async () => {
    const localityData = mockDeep<Lieudit>();
    const loggedUser = mock<LoggedUser>();

    lieuditRepository.findLieuditById.mockResolvedValueOnce(localityData);

    await lieuditService.findLieuDit(localityData.id, loggedUser);

    expect(lieuditRepository.findLieuditById).toHaveBeenCalledTimes(1);
    expect(lieuditRepository.findLieuditById).toHaveBeenLastCalledWith(localityData.id);
  });

  test("should handle locality not found", async () => {
    lieuditRepository.findLieuditById.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(lieuditService.findLieuDit(10, loggedUser)).resolves.toBe(null);

    expect(lieuditRepository.findLieuditById).toHaveBeenCalledTimes(1);
    expect(lieuditRepository.findLieuditById).toHaveBeenLastCalledWith(10);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(lieuditService.findLieuDit(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(lieuditRepository.findLieuditById).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await lieuditService.getDonneesCountByLieuDit(12, loggedUser);

    expect(donneeRepository.getCountByLieuditId).toHaveBeenCalledTimes(1);
    expect(donneeRepository.getCountByLieuditId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(lieuditService.getDonneesCountByLieuDit(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Find locality by inventary ID", () => {
  test("should handle locality found", async () => {
    const localityData = mock<Lieudit>({
      id: 256,
    });
    const loggedUser = mock<LoggedUser>();

    lieuditRepository.findLieuditByInventaireId.mockResolvedValueOnce(localityData);

    const locality = await lieuditService.findLieuDitOfInventaireId(43, loggedUser);

    expect(lieuditRepository.findLieuditByInventaireId).toHaveBeenCalledTimes(1);
    expect(lieuditRepository.findLieuditByInventaireId).toHaveBeenLastCalledWith(43);
    expect(locality?.id).toEqual(256);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(lieuditService.findLieuDitOfInventaireId(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all localities", async () => {
  const localitiesData = [mockDeep<Lieudit>(), mockDeep<Lieudit>(), mockDeep<Lieudit>()];

  lieuditRepository.findLieuxdits.mockResolvedValueOnce(localitiesData);

  await lieuditService.findAllLieuxDits();

  expect(lieuditRepository.findLieuxdits).toHaveBeenCalledTimes(1);
  expect(lieuditRepository.findLieuxdits).toHaveBeenLastCalledWith({
    orderBy: COLUMN_NOM,
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const localitiesData = [mockDeep<Lieudit>(), mockDeep<Lieudit>(), mockDeep<Lieudit>()];
    const loggedUser = mock<LoggedUser>();

    lieuditRepository.findLieuxdits.mockResolvedValueOnce(localitiesData);

    await lieuditService.findPaginatedLieuxDits(loggedUser);

    expect(lieuditRepository.findLieuxdits).toHaveBeenCalledTimes(1);
    expect(lieuditRepository.findLieuxdits).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated localities ", async () => {
    const localitiesData = [mockDeep<Lieudit>(), mockDeep<Lieudit>(), mockDeep<Lieudit>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: QueryLieuxDitsArgs = {
      orderBy: LieuxDitsOrderBy.Nom,
      sortOrder: SortOrder.Desc,
      searchParams: {
        q: "Bob",
        pageNumber: 0,
        pageSize: 10,
      },
    };

    lieuditRepository.findLieuxdits.mockResolvedValueOnce([localitiesData[0]]);

    await lieuditService.findPaginatedLieuxDits(loggedUser, searchParams);

    expect(lieuditRepository.findLieuxdits).toHaveBeenCalledTimes(1);
    expect(lieuditRepository.findLieuxdits).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: COLUMN_NOM,
      sortOrder: SortOrder.Desc,
      offset: searchParams.searchParams?.pageNumber,
      limit: searchParams.searchParams?.pageSize,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(lieuditService.findPaginatedLieuxDits(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await lieuditService.getLieuxDitsCount(loggedUser);

    expect(lieuditRepository.getCount).toHaveBeenCalledTimes(1);
    expect(lieuditRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await lieuditService.getLieuxDitsCount(loggedUser, "test");

    expect(lieuditRepository.getCount).toHaveBeenCalledTimes(1);
    expect(lieuditRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(lieuditService.getLieuxDitsCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of a locality", () => {
  test("should be allowed when requested by an admin", async () => {
    const localityData = mock<MutationUpsertLieuDitArgs>();

    const reshapedInputData = mock<LieuditCreateInput>();
    mockedReshapeInputLieuditUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ role: "admin" });
    lieuditRepository.updateLieudit.mockResolvedValueOnce(mockDeep<Lieudit>());

    await lieuditService.upsertLieuDit(localityData, loggedUser);

    expect(lieuditRepository.updateLieudit).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputLieuditUpsertData).toHaveBeenCalledTimes(1);
    expect(lieuditRepository.updateLieudit).toHaveBeenLastCalledWith(localityData.id, reshapedInputData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = mock<Lieudit>({
      ownerId: "notAdmin",
    });

    const localityData = mock<MutationUpsertLieuDitArgs>();

    const reshapedInputData = mock<LieuditCreateInput>();
    mockedReshapeInputLieuditUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    lieuditRepository.findLieuditById.mockResolvedValueOnce(existingData);

    await lieuditService.upsertLieuDit(localityData, loggedUser);

    expect(lieuditRepository.updateLieudit).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputLieuditUpsertData).toHaveBeenCalledTimes(1);
    expect(lieuditRepository.updateLieudit).toHaveBeenLastCalledWith(localityData.id, reshapedInputData);
  });

  test("should throw an error when requested by an user that is nor owner nor admin", async () => {
    const existingData = mock<Lieudit>({
      ownerId: "notAdmin",
    });

    const localityData = mock<MutationUpsertLieuDitArgs>();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    lieuditRepository.findLieuditById.mockResolvedValueOnce(existingData);

    await expect(lieuditService.upsertLieuDit(localityData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

    expect(lieuditRepository.updateLieudit).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to a locality that exists", async () => {
    const localityData = mock<MutationUpsertLieuDitArgs>({
      id: 12,
    });

    const reshapedInputData = mock<LieuditCreateInput>();
    mockedReshapeInputLieuditUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    lieuditRepository.updateLieudit.mockImplementation(uniqueConstraintFailed);

    await expect(() => lieuditService.upsertLieuDit(localityData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(lieuditRepository.updateLieudit).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputLieuditUpsertData).toHaveBeenCalledTimes(1);
    expect(lieuditRepository.updateLieudit).toHaveBeenLastCalledWith(localityData.id, reshapedInputData);
  });

  test("should throw an error when the requester is not logged", async () => {
    const localityData = mock<MutationUpsertLieuDitArgs>({
      id: 12,
    });

    await expect(lieuditService.upsertLieuDit(localityData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(lieuditRepository.updateLieudit).not.toHaveBeenCalled();
  });
});

describe("Creation of a locality", () => {
  test("should create new locality", async () => {
    const localityData = mock<MutationUpsertLieuDitArgs>({
      id: undefined,
    });

    const reshapedInputData = mock<LieuditCreateInput>();
    mockedReshapeInputLieuditUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ id: "a" });

    lieuditRepository.createLieudit.mockResolvedValueOnce(mockDeep<Lieudit>());

    await lieuditService.upsertLieuDit(localityData, loggedUser);

    expect(lieuditRepository.createLieudit).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputLieuditUpsertData).toHaveBeenCalledTimes(1);
    expect(lieuditRepository.createLieudit).toHaveBeenLastCalledWith({
      ...reshapedInputData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when trying to create a locality that already exists", async () => {
    const localityData = mock<MutationUpsertLieuDitArgs>({
      id: undefined,
    });

    const reshapedInputData = mock<LieuditCreateInput>();
    mockedReshapeInputLieuditUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ id: "a" });

    lieuditRepository.createLieudit.mockImplementation(uniqueConstraintFailed);

    await expect(() => lieuditService.upsertLieuDit(localityData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(lieuditRepository.createLieudit).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputLieuditUpsertData).toHaveBeenCalledTimes(1);
    expect(lieuditRepository.createLieudit).toHaveBeenLastCalledWith({
      ...reshapedInputData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const localityData = mock<MutationUpsertLieuDitArgs>({
      id: undefined,
    });

    await expect(lieuditService.upsertLieuDit(localityData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(lieuditRepository.createLieudit).not.toHaveBeenCalled();
  });
});

describe("Deletion of a locality", () => {
  test("should handle the deletion of an owned locality", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const locality = mock<Lieudit>({
      ownerId: loggedUser.id,
    });

    lieuditRepository.findLieuditById.mockResolvedValueOnce(locality);
    lieuditRepository.deleteLieuditById.mockResolvedValueOnce(mockDeep<Lieudit>());

    await lieuditService.deleteLieuDit(11, loggedUser);

    expect(lieuditRepository.deleteLieuditById).toHaveBeenCalledTimes(1);
    expect(lieuditRepository.deleteLieuditById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any locality if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "admin",
    });

    lieuditRepository.findLieuditById.mockResolvedValueOnce(mock<Lieudit>());
    lieuditRepository.deleteLieuditById.mockResolvedValueOnce(mockDeep<Lieudit>());

    await lieuditService.deleteLieuDit(11, loggedUser);

    expect(lieuditRepository.deleteLieuditById).toHaveBeenCalledTimes(1);
    expect(lieuditRepository.deleteLieuditById).toHaveBeenLastCalledWith(11);
  });

  test("should return an error when deleting a non-owned locality as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "contributor",
    });

    lieuditRepository.findLieuditById.mockResolvedValueOnce(mock<Lieudit>());

    await expect(lieuditService.deleteLieuDit(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(lieuditRepository.deleteLieuditById).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(lieuditService.deleteLieuDit(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(lieuditRepository.deleteLieuditById).not.toHaveBeenCalled();
  });
});

test("Create multiple localities", async () => {
  const lieuDitsData = [
    mock<Omit<LieuditCreateInput, "owner_id">>(),
    mock<Omit<LieuditCreateInput, "owner_id">>(),
    mock<Omit<LieuditCreateInput, "owner_id">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  await lieuditService.createLieuxDits(lieuDitsData, loggedUser);

  expect(lieuditRepository.createLieuxdits).toHaveBeenCalledTimes(1);
  expect(lieuditRepository.createLieuxdits).toHaveBeenLastCalledWith(
    lieuDitsData.map((lieuDit) => {
      return {
        ...lieuDit,
        owner_id: loggedUser.id,
      };
    })
  );
});
