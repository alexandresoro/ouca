import { mock } from "jest-mock-extended";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import {
  CommunesOrderBy,
  SortOrder,
  type MutationUpsertCommuneArgs,
  type QueryCommunesArgs,
} from "../../graphql/generated/graphql-types";
import { type CommuneRepository } from "../../repositories/commune/commune-repository";
import { type Commune, type CommuneCreateInput } from "../../repositories/commune/commune-repository-types";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository";
import { type LieuditRepository } from "../../repositories/lieudit/lieudit-repository";
import { type LoggedUser } from "../../types/User";
import { COLUMN_NOM } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { buildCommuneService } from "./commune-service";
import { reshapeInputCommuneUpsertData } from "./commune-service-reshape";

const communeRepository = mock<CommuneRepository>({});
const lieuditRepository = mock<LieuditRepository>({});
const donneeRepository = mock<DonneeRepository>({});
const logger = mock<Logger>();

const communeService = buildCommuneService({
  logger,
  communeRepository,
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
jest.mock<typeof import("./commune-service-reshape")>("./commune-service-reshape", () => {
  return {
    __esModule: true,
    reshapeInputCommuneUpsertData: jest.fn(),
  };
});

const mockedReshapeInputCommuneUpsertData = jest.mocked(reshapeInputCommuneUpsertData);

describe("Find city", () => {
  test("should handle a matching city", async () => {
    const cityData = mock<Commune>();
    const loggedUser = mock<LoggedUser>();

    communeRepository.findCommuneById.mockResolvedValueOnce(cityData);

    await communeService.findCommune(cityData.id, loggedUser);

    expect(communeRepository.findCommuneById).toHaveBeenCalledTimes(1);
    expect(communeRepository.findCommuneById).toHaveBeenLastCalledWith(cityData.id);
  });

  test("should handle city not found", async () => {
    communeRepository.findCommuneById.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(communeService.findCommune(10, loggedUser)).resolves.toBe(null);

    expect(communeRepository.findCommuneById).toHaveBeenCalledTimes(1);
    expect(communeRepository.findCommuneById).toHaveBeenLastCalledWith(10);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(communeService.findCommune(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(communeRepository.findCommuneById).not.toHaveBeenCalled();
  });
});

describe("Localities count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await communeService.getLieuxDitsCountByCommune(12, loggedUser);

    expect(lieuditRepository.getCountByCommuneId).toHaveBeenCalledTimes(1);
    expect(lieuditRepository.getCountByCommuneId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(communeService.getLieuxDitsCountByCommune(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await communeService.getDonneesCountByCommune(12, loggedUser);

    expect(donneeRepository.getCountByCommuneId).toHaveBeenCalledTimes(1);
    expect(donneeRepository.getCountByCommuneId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(communeService.getDonneesCountByCommune(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Find city by locality ID", () => {
  test("should handle a found city", async () => {
    const cityData = mock<Commune>({
      id: 256,
    });
    const loggedUser = mock<LoggedUser>();

    communeRepository.findCommuneByLieuDitId.mockResolvedValueOnce(cityData);

    const city = await communeService.findCommuneOfLieuDitId(43, loggedUser);

    expect(communeRepository.findCommuneByLieuDitId).toHaveBeenCalledTimes(1);
    expect(communeRepository.findCommuneByLieuDitId).toHaveBeenLastCalledWith(43);
    expect(city?.id).toEqual(256);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(communeService.findCommuneOfLieuDitId(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all cities", async () => {
  const citiesData = [mock<Commune>(), mock<Commune>(), mock<Commune>()];

  communeRepository.findCommunes.mockResolvedValueOnce(citiesData);

  await communeService.findAllCommunes();

  expect(communeRepository.findCommunes).toHaveBeenCalledTimes(1);
  expect(communeRepository.findCommunes).toHaveBeenLastCalledWith({
    orderBy: COLUMN_NOM,
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const citiesData = [mock<Commune>(), mock<Commune>(), mock<Commune>()];
    const loggedUser = mock<LoggedUser>();

    communeRepository.findCommunes.mockResolvedValueOnce(citiesData);

    await communeService.findPaginatedCommunes(loggedUser);

    expect(communeRepository.findCommunes).toHaveBeenCalledTimes(1);
    expect(communeRepository.findCommunes).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated cities ", async () => {
    const citiesData = [mock<Commune>(), mock<Commune>(), mock<Commune>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: QueryCommunesArgs = {
      orderBy: CommunesOrderBy.Nom,
      sortOrder: SortOrder.Desc,
      searchParams: {
        q: "Bob",
        pageNumber: 0,
        pageSize: 10,
      },
    };

    communeRepository.findCommunes.mockResolvedValueOnce([citiesData[0]]);

    await communeService.findPaginatedCommunes(loggedUser, searchParams);

    expect(communeRepository.findCommunes).toHaveBeenCalledTimes(1);
    expect(communeRepository.findCommunes).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: COLUMN_NOM,
      sortOrder: SortOrder.Desc,
      offset: searchParams.searchParams?.pageNumber,
      limit: searchParams.searchParams?.pageSize,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(communeService.findPaginatedCommunes(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await communeService.getCommunesCount(loggedUser);

    expect(communeRepository.getCount).toHaveBeenCalledTimes(1);
    expect(communeRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await communeService.getCommunesCount(loggedUser, "test");

    expect(communeRepository.getCount).toHaveBeenCalledTimes(1);
    expect(communeRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(communeService.getCommunesCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of a city", () => {
  test("should be allowed when requested by an admin", async () => {
    const cityData = mock<MutationUpsertCommuneArgs>();

    const reshapedInputData = mock<CommuneCreateInput>();
    mockedReshapeInputCommuneUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    await communeService.upsertCommune(cityData, loggedUser);

    expect(communeRepository.updateCommune).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputCommuneUpsertData).toHaveBeenCalledTimes(1);
    expect(communeRepository.updateCommune).toHaveBeenLastCalledWith(cityData.id, reshapedInputData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = mock<Commune>({
      ownerId: "notAdmin",
    });

    const cityData = mock<MutationUpsertCommuneArgs>();

    const reshapedInputData = mock<CommuneCreateInput>();
    mockedReshapeInputCommuneUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    communeRepository.findCommuneById.mockResolvedValueOnce(existingData);

    await communeService.upsertCommune(cityData, loggedUser);

    expect(communeRepository.updateCommune).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputCommuneUpsertData).toHaveBeenCalledTimes(1);
    expect(communeRepository.updateCommune).toHaveBeenLastCalledWith(cityData.id, reshapedInputData);
  });

  test("should throw an error when requested by an user that is nor owner nor admin", async () => {
    const existingData = mock<Commune>({
      ownerId: "notAdmin",
    });

    const cityData = mock<MutationUpsertCommuneArgs>();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    communeRepository.findCommuneById.mockResolvedValueOnce(existingData);

    await expect(communeService.upsertCommune(cityData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

    expect(communeRepository.updateCommune).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to a city that exists", async () => {
    const cityData = mock<MutationUpsertCommuneArgs>({
      id: 12,
    });

    const reshapedInputData = mock<CommuneCreateInput>();
    mockedReshapeInputCommuneUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    communeRepository.updateCommune.mockImplementation(uniqueConstraintFailed);

    await expect(() => communeService.upsertCommune(cityData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(communeRepository.updateCommune).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputCommuneUpsertData).toHaveBeenCalledTimes(1);
    expect(communeRepository.updateCommune).toHaveBeenLastCalledWith(cityData.id, reshapedInputData);
  });

  test("should throw an error when the requester is not logged", async () => {
    const cityData = mock<MutationUpsertCommuneArgs>({
      id: 12,
    });

    await expect(communeService.upsertCommune(cityData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(communeRepository.updateCommune).not.toHaveBeenCalled();
  });
});

describe("Creation of a city", () => {
  test("should create new city", async () => {
    const cityData = mock<MutationUpsertCommuneArgs>({
      id: undefined,
    });

    const reshapedInputData = mock<CommuneCreateInput>();
    mockedReshapeInputCommuneUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ id: "a" });

    await communeService.upsertCommune(cityData, loggedUser);

    expect(communeRepository.createCommune).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputCommuneUpsertData).toHaveBeenCalledTimes(1);
    expect(communeRepository.createCommune).toHaveBeenLastCalledWith({
      ...reshapedInputData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when trying to create a city that already exists", async () => {
    const cityData = mock<MutationUpsertCommuneArgs>({
      id: undefined,
    });

    const reshapedInputData = mock<CommuneCreateInput>();
    mockedReshapeInputCommuneUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ id: "a" });

    communeRepository.createCommune.mockImplementation(uniqueConstraintFailed);

    await expect(() => communeService.upsertCommune(cityData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(communeRepository.createCommune).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputCommuneUpsertData).toHaveBeenCalledTimes(1);
    expect(communeRepository.createCommune).toHaveBeenLastCalledWith({
      ...reshapedInputData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const cityData = mock<MutationUpsertCommuneArgs>({
      id: undefined,
    });

    await expect(communeService.upsertCommune(cityData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(communeRepository.createCommune).not.toHaveBeenCalled();
  });
});

describe("Deletion of a city", () => {
  test("should handle the deletion of an owned city", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const city = mock<Commune>({
      ownerId: loggedUser.id,
    });

    communeRepository.findCommuneById.mockResolvedValueOnce(city);

    await communeService.deleteCommune(11, loggedUser);

    expect(communeRepository.deleteCommuneById).toHaveBeenCalledTimes(1);
    expect(communeRepository.deleteCommuneById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any city if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "admin",
    });

    communeRepository.findCommuneById.mockResolvedValueOnce(mock<Commune>());

    await communeService.deleteCommune(11, loggedUser);

    expect(communeRepository.deleteCommuneById).toHaveBeenCalledTimes(1);
    expect(communeRepository.deleteCommuneById).toHaveBeenLastCalledWith(11);
  });

  test("should return an error when deleting a non-owned city as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "contributor",
    });

    communeRepository.findCommuneById.mockResolvedValueOnce(mock<Commune>());

    await expect(communeService.deleteCommune(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(communeRepository.deleteCommuneById).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(communeService.deleteCommune(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(communeRepository.deleteCommuneById).not.toHaveBeenCalled();
  });
});

test("Create multiple cities", async () => {
  const communesData = [
    mock<Omit<CommuneCreateInput, "owner_id">>(),
    mock<Omit<CommuneCreateInput, "owner_id">>(),
    mock<Omit<CommuneCreateInput, "owner_id">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  await communeService.createCommunes(communesData, loggedUser);

  expect(communeRepository.createCommunes).toHaveBeenCalledTimes(1);
  expect(communeRepository.createCommunes).toHaveBeenLastCalledWith(
    communesData.map((commune) => {
      return {
        ...commune,
        owner_id: loggedUser.id,
      };
    })
  );
});
