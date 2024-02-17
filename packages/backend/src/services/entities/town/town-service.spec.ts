import { OucaError } from "@domain/errors/ouca-error.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type TownsSearchParams, type UpsertTownInput } from "@ou-ca/common/api/town";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type Commune, type CommuneCreateInput } from "../../../repositories/commune/commune-repository-types.js";
import { type CommuneRepository } from "../../../repositories/commune/commune-repository.js";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { type LieuditRepository } from "../../../repositories/lieudit/lieudit-repository.js";
import { mockVi } from "../../../utils/mock.js";
import { reshapeInputCommuneUpsertData } from "./town-service-reshape.js";
import { buildTownService } from "./town-service.js";

const townRepository = mockVi<CommuneRepository>();
const localityRepository = mockVi<LieuditRepository>();
const entryRepository = mockVi<DonneeRepository>();

const townService = buildTownService({
  townRepository,
  localityRepository,
  entryRepository,
});

const uniqueConstraintFailedError = new UniqueIntegrityConstraintViolationError(
  new Error("errorMessage"),
  "constraint"
);

const uniqueConstraintFailed = () => {
  throw uniqueConstraintFailedError;
};

vi.mock("./town-service-reshape.js", () => {
  return {
    __esModule: true,
    reshapeInputCommuneUpsertData: vi.fn(),
  };
});

const mockedReshapeInputCommuneUpsertData = vi.mocked(reshapeInputCommuneUpsertData);

describe("Find city", () => {
  test("should handle a matching city", async () => {
    const cityData = mock<Commune>();
    const loggedUser = mock<LoggedUser>();

    townRepository.findCommuneById.mockResolvedValueOnce(cityData);

    await townService.findCommune(12, loggedUser);

    expect(townRepository.findCommuneById).toHaveBeenCalledTimes(1);
    expect(townRepository.findCommuneById).toHaveBeenLastCalledWith(12);
  });

  test("should handle city not found", async () => {
    townRepository.findCommuneById.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(townService.findCommune(10, loggedUser)).resolves.toBe(null);

    expect(townRepository.findCommuneById).toHaveBeenCalledTimes(1);
    expect(townRepository.findCommuneById).toHaveBeenLastCalledWith(10);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(townService.findCommune(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(townRepository.findCommuneById).not.toHaveBeenCalled();
  });
});

describe("Localities count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await townService.getLieuxDitsCountByCommune("12", loggedUser);

    expect(localityRepository.getCountByCommuneId).toHaveBeenCalledTimes(1);
    expect(localityRepository.getCountByCommuneId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(townService.getLieuxDitsCountByCommune("12", null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await townService.getDonneesCountByCommune("12", loggedUser);

    expect(entryRepository.getCountByCommuneId).toHaveBeenCalledTimes(1);
    expect(entryRepository.getCountByCommuneId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(townService.getDonneesCountByCommune("12", null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Find city by locality ID", () => {
  test("should handle a found city", async () => {
    const cityData = mock<Commune>({
      id: "256",
    });
    const loggedUser = mock<LoggedUser>();

    townRepository.findCommuneByLieuDitId.mockResolvedValueOnce(cityData);

    const city = await townService.findCommuneOfLieuDitId("43", loggedUser);

    expect(townRepository.findCommuneByLieuDitId).toHaveBeenCalledTimes(1);
    expect(townRepository.findCommuneByLieuDitId).toHaveBeenLastCalledWith(43);
    expect(city?.id).toEqual("256");
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(townService.findCommuneOfLieuDitId("12", null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all cities", async () => {
  const citiesData = [mock<Commune>(), mock<Commune>(), mock<Commune>()];

  townRepository.findCommunes.mockResolvedValueOnce(citiesData);

  await townService.findAllCommunes();

  expect(townRepository.findCommunes).toHaveBeenCalledTimes(1);
  expect(townRepository.findCommunes).toHaveBeenLastCalledWith({
    orderBy: "nom",
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const citiesData = [mock<Commune>(), mock<Commune>(), mock<Commune>()];
    const loggedUser = mock<LoggedUser>();

    townRepository.findCommunes.mockResolvedValueOnce(citiesData);

    await townService.findPaginatedCommunes(loggedUser, {});

    expect(townRepository.findCommunes).toHaveBeenCalledTimes(1);
    expect(townRepository.findCommunes).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated cities ", async () => {
    const citiesData = [mock<Commune>(), mock<Commune>(), mock<Commune>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: TownsSearchParams = {
      orderBy: "nom",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    townRepository.findCommunes.mockResolvedValueOnce([citiesData[0]]);

    await townService.findPaginatedCommunes(loggedUser, searchParams);

    expect(townRepository.findCommunes).toHaveBeenCalledTimes(1);
    expect(townRepository.findCommunes).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: "nom",
      sortOrder: "desc",
      offset: 0,
      limit: searchParams.pageSize,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(townService.findPaginatedCommunes(null, {})).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await townService.getCommunesCount(loggedUser, {});

    expect(townRepository.getCount).toHaveBeenCalledTimes(1);
    expect(townRepository.getCount).toHaveBeenLastCalledWith(undefined, undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await townService.getCommunesCount(loggedUser, { q: "test", departmentId: "12" });

    expect(townRepository.getCount).toHaveBeenCalledTimes(1);
    expect(townRepository.getCount).toHaveBeenLastCalledWith("test", 12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(townService.getCommunesCount(null, {})).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of a city", () => {
  test("should be allowed when requested by an admin", async () => {
    const cityData = mock<UpsertTownInput>();

    const reshapedInputData = mock<CommuneCreateInput>();
    mockedReshapeInputCommuneUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    await townService.updateCommune(12, cityData, loggedUser);

    expect(townRepository.updateCommune).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputCommuneUpsertData).toHaveBeenCalledTimes(1);
    expect(townRepository.updateCommune).toHaveBeenLastCalledWith(12, reshapedInputData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = mock<Commune>({
      ownerId: "notAdmin",
    });

    const cityData = mock<UpsertTownInput>();

    const reshapedInputData = mock<CommuneCreateInput>();
    mockedReshapeInputCommuneUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    townRepository.findCommuneById.mockResolvedValueOnce(existingData);

    await townService.updateCommune(12, cityData, loggedUser);

    expect(townRepository.updateCommune).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputCommuneUpsertData).toHaveBeenCalledTimes(1);
    expect(townRepository.updateCommune).toHaveBeenLastCalledWith(12, reshapedInputData);
  });

  test("should throw an error when requested by an user that is nor owner nor admin", async () => {
    const existingData = mock<Commune>({
      ownerId: "notAdmin",
    });

    const cityData = mock<UpsertTownInput>();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    townRepository.findCommuneById.mockResolvedValueOnce(existingData);

    await expect(townService.updateCommune(12, cityData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

    expect(townRepository.updateCommune).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to a city that exists", async () => {
    const cityData = mock<UpsertTownInput>();

    const reshapedInputData = mock<CommuneCreateInput>();
    mockedReshapeInputCommuneUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    townRepository.updateCommune.mockImplementation(uniqueConstraintFailed);

    await expect(() => townService.updateCommune(12, cityData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(townRepository.updateCommune).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputCommuneUpsertData).toHaveBeenCalledTimes(1);
    expect(townRepository.updateCommune).toHaveBeenLastCalledWith(12, reshapedInputData);
  });

  test("should throw an error when the requester is not logged", async () => {
    const cityData = mock<UpsertTownInput>();

    await expect(townService.updateCommune(12, cityData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(townRepository.updateCommune).not.toHaveBeenCalled();
  });
});

describe("Creation of a city", () => {
  test("should create new city", async () => {
    const cityData = mock<UpsertTownInput>();

    const reshapedInputData = mock<CommuneCreateInput>();
    mockedReshapeInputCommuneUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ id: "a" });

    await townService.createCommune(cityData, loggedUser);

    expect(townRepository.createCommune).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputCommuneUpsertData).toHaveBeenCalledTimes(1);
    expect(townRepository.createCommune).toHaveBeenLastCalledWith({
      ...reshapedInputData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when trying to create a city that already exists", async () => {
    const cityData = mock<UpsertTownInput>();

    const reshapedInputData = mock<CommuneCreateInput>();
    mockedReshapeInputCommuneUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ id: "a" });

    townRepository.createCommune.mockImplementation(uniqueConstraintFailed);

    await expect(() => townService.createCommune(cityData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(townRepository.createCommune).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputCommuneUpsertData).toHaveBeenCalledTimes(1);
    expect(townRepository.createCommune).toHaveBeenLastCalledWith({
      ...reshapedInputData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const cityData = mock<UpsertTownInput>();

    await expect(townService.createCommune(cityData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(townRepository.createCommune).not.toHaveBeenCalled();
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

    townRepository.findCommuneById.mockResolvedValueOnce(city);

    await townService.deleteCommune(11, loggedUser);

    expect(townRepository.deleteCommuneById).toHaveBeenCalledTimes(1);
    expect(townRepository.deleteCommuneById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any city if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "admin",
    });

    townRepository.findCommuneById.mockResolvedValueOnce(mock<Commune>());

    await townService.deleteCommune(11, loggedUser);

    expect(townRepository.deleteCommuneById).toHaveBeenCalledTimes(1);
    expect(townRepository.deleteCommuneById).toHaveBeenLastCalledWith(11);
  });

  test("should return an error when deleting a non-owned city as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "contributor",
    });

    townRepository.findCommuneById.mockResolvedValueOnce(mock<Commune>());

    await expect(townService.deleteCommune(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(townRepository.deleteCommuneById).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(townService.deleteCommune(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(townRepository.deleteCommuneById).not.toHaveBeenCalled();
  });
});

test("Create multiple cities", async () => {
  const communesData = [
    mock<Omit<CommuneCreateInput, "owner_id">>(),
    mock<Omit<CommuneCreateInput, "owner_id">>(),
    mock<Omit<CommuneCreateInput, "owner_id">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  townRepository.createCommunes.mockResolvedValueOnce([]);

  await townService.createCommunes(communesData, loggedUser);

  expect(townRepository.createCommunes).toHaveBeenCalledTimes(1);
  expect(townRepository.createCommunes).toHaveBeenLastCalledWith(
    communesData.map((commune) => {
      return {
        ...commune,
        owner_id: loggedUser.id,
      };
    })
  );
});
