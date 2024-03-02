import { OucaError } from "@domain/errors/ouca-error.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { townFactory } from "@fixtures/domain/town/town.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertTownInputFactory } from "@fixtures/services/town/town-service.fixtures.js";
import { type TownsSearchParams } from "@ou-ca/common/api/town";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type CommuneCreateInput } from "../../../repositories/commune/commune-repository-types.js";
import { type CommuneRepository } from "../../../repositories/commune/commune-repository.js";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { type LieuditRepository } from "../../../repositories/lieudit/lieudit-repository.js";
import { mockVi } from "../../../utils/mock.js";
import { reshapeInputTownUpsertData } from "./town-service-reshape.js";
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
    reshapeInputTownUpsertData: vi.fn(),
  };
});

const mockedReshapeInputTownUpsertData = vi.mocked(reshapeInputTownUpsertData);

describe("Find city", () => {
  test("should handle a matching city", async () => {
    const cityData = townFactory.build();
    const loggedUser = loggedUserFactory.build();

    townRepository.findCommuneById.mockResolvedValueOnce(cityData);

    await townService.findTown(12, loggedUser);

    expect(townRepository.findCommuneById).toHaveBeenCalledTimes(1);
    expect(townRepository.findCommuneById).toHaveBeenLastCalledWith(12);
  });

  test("should handle city not found", async () => {
    townRepository.findCommuneById.mockResolvedValueOnce(null);
    const loggedUser = loggedUserFactory.build();

    await expect(townService.findTown(10, loggedUser)).resolves.toEqual(null);

    expect(townRepository.findCommuneById).toHaveBeenCalledTimes(1);
    expect(townRepository.findCommuneById).toHaveBeenLastCalledWith(10);
  });

  test("should not be allowed when the no login details are provided", async () => {
    await expect(townService.findTown(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(townRepository.findCommuneById).not.toHaveBeenCalled();
  });
});

describe("Localities count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await townService.getLocalitiesCountByTown("12", loggedUser);

    expect(localityRepository.getCountByCommuneId).toHaveBeenCalledTimes(1);
    expect(localityRepository.getCountByCommuneId).toHaveBeenLastCalledWith(12);
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(townService.getLocalitiesCountByTown("12", null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await townService.getEntriesCountByTown("12", loggedUser);

    expect(entryRepository.getCountByCommuneId).toHaveBeenCalledTimes(1);
    expect(entryRepository.getCountByCommuneId).toHaveBeenLastCalledWith(12);
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(townService.getEntriesCountByTown("12", null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Find city by locality ID", () => {
  test("should handle a found city", async () => {
    const cityData = townFactory.build({
      id: "256",
    });
    const loggedUser = loggedUserFactory.build();

    townRepository.findCommuneByLieuDitId.mockResolvedValueOnce(cityData);

    const city = await townService.findTownOfLocalityId("43", loggedUser);

    expect(townRepository.findCommuneByLieuDitId).toHaveBeenCalledTimes(1);
    expect(townRepository.findCommuneByLieuDitId).toHaveBeenLastCalledWith(43);
    expect(city?.id).toEqual("256");
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(townService.findTownOfLocalityId("12", null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all cities", async () => {
  const citiesData = townFactory.buildList(3);

  townRepository.findCommunes.mockResolvedValueOnce(citiesData);

  await townService.findAllTowns();

  expect(townRepository.findCommunes).toHaveBeenCalledTimes(1);
  expect(townRepository.findCommunes).toHaveBeenLastCalledWith({
    orderBy: "nom",
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const citiesData = townFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    townRepository.findCommunes.mockResolvedValueOnce(citiesData);

    await townService.findPaginatedTowns(loggedUser, {});

    expect(townRepository.findCommunes).toHaveBeenCalledTimes(1);
    expect(townRepository.findCommunes).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated cities", async () => {
    const citiesData = townFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: TownsSearchParams = {
      orderBy: "nom",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    townRepository.findCommunes.mockResolvedValueOnce([citiesData[0]]);

    await townService.findPaginatedTowns(loggedUser, searchParams);

    expect(townRepository.findCommunes).toHaveBeenCalledTimes(1);
    expect(townRepository.findCommunes).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: "nom",
      sortOrder: "desc",
      offset: 0,
      limit: searchParams.pageSize,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(townService.findPaginatedTowns(null, {})).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await townService.getTownsCount(loggedUser, {});

    expect(townRepository.getCount).toHaveBeenCalledTimes(1);
    expect(townRepository.getCount).toHaveBeenLastCalledWith(undefined, undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await townService.getTownsCount(loggedUser, { q: "test", departmentId: "12" });

    expect(townRepository.getCount).toHaveBeenCalledTimes(1);
    expect(townRepository.getCount).toHaveBeenLastCalledWith("test", 12);
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(townService.getTownsCount(null, {})).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of a city", () => {
  test("should be allowed when requested by an admin", async () => {
    const cityData = upsertTownInputFactory.build();

    const reshapedInputData = mock<CommuneCreateInput>();
    mockedReshapeInputTownUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    await townService.updateTown(12, cityData, loggedUser);

    expect(townRepository.updateCommune).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputTownUpsertData).toHaveBeenCalledTimes(1);
    expect(townRepository.updateCommune).toHaveBeenLastCalledWith(12, reshapedInputData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = townFactory.build({
      ownerId: "notAdmin",
    });

    const cityData = upsertTownInputFactory.build();

    const reshapedInputData = mock<CommuneCreateInput>();
    mockedReshapeInputTownUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    townRepository.findCommuneById.mockResolvedValueOnce(existingData);

    await townService.updateTown(12, cityData, loggedUser);

    expect(townRepository.updateCommune).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputTownUpsertData).toHaveBeenCalledTimes(1);
    expect(townRepository.updateCommune).toHaveBeenLastCalledWith(12, reshapedInputData);
  });

  test("should not be allowed when requested by an user that is nor owner nor admin", async () => {
    const existingData = townFactory.build({
      ownerId: "notAdmin",
    });

    const cityData = upsertTownInputFactory.build();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    townRepository.findCommuneById.mockResolvedValueOnce(existingData);

    await expect(townService.updateTown(12, cityData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

    expect(townRepository.updateCommune).not.toHaveBeenCalled();
  });

  test("should not be allowed when trying to update to a city that exists", async () => {
    const cityData = upsertTownInputFactory.build();

    const reshapedInputData = mock<CommuneCreateInput>();
    mockedReshapeInputTownUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    townRepository.updateCommune.mockImplementation(uniqueConstraintFailed);

    await expect(() => townService.updateTown(12, cityData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(townRepository.updateCommune).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputTownUpsertData).toHaveBeenCalledTimes(1);
    expect(townRepository.updateCommune).toHaveBeenLastCalledWith(12, reshapedInputData);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const cityData = upsertTownInputFactory.build();

    await expect(townService.updateTown(12, cityData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(townRepository.updateCommune).not.toHaveBeenCalled();
  });
});

describe("Creation of a city", () => {
  test("should create new city", async () => {
    const cityData = upsertTownInputFactory.build();

    const reshapedInputData = mock<CommuneCreateInput>();
    mockedReshapeInputTownUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = loggedUserFactory.build({ id: "a" });

    await townService.createTown(cityData, loggedUser);

    expect(townRepository.createCommune).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputTownUpsertData).toHaveBeenCalledTimes(1);
    expect(townRepository.createCommune).toHaveBeenLastCalledWith({
      ...reshapedInputData,
      owner_id: loggedUser.id,
    });
  });

  test("should not be allowed when trying to create a city that already exists", async () => {
    const cityData = upsertTownInputFactory.build();

    const reshapedInputData = mock<CommuneCreateInput>();
    mockedReshapeInputTownUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = loggedUserFactory.build({ id: "a" });

    townRepository.createCommune.mockImplementation(uniqueConstraintFailed);

    await expect(() => townService.createTown(cityData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(townRepository.createCommune).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputTownUpsertData).toHaveBeenCalledTimes(1);
    expect(townRepository.createCommune).toHaveBeenLastCalledWith({
      ...reshapedInputData,
      owner_id: loggedUser.id,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    const cityData = upsertTownInputFactory.build();

    await expect(townService.createTown(cityData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(townRepository.createCommune).not.toHaveBeenCalled();
  });
});

describe("Deletion of a city", () => {
  test("should handle the deletion of an owned city", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const city = townFactory.build({
      ownerId: loggedUser.id,
    });

    townRepository.findCommuneById.mockResolvedValueOnce(city);

    await townService.deleteTown(11, loggedUser);

    expect(townRepository.deleteCommuneById).toHaveBeenCalledTimes(1);
    expect(townRepository.deleteCommuneById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any city if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    townRepository.findCommuneById.mockResolvedValueOnce(townFactory.build());

    await townService.deleteTown(11, loggedUser);

    expect(townRepository.deleteCommuneById).toHaveBeenCalledTimes(1);
    expect(townRepository.deleteCommuneById).toHaveBeenLastCalledWith(11);
  });

  test("should not be allowed when deleting a non-owned city as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "contributor",
    });

    townRepository.findCommuneById.mockResolvedValueOnce(townFactory.build());

    await expect(townService.deleteTown(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(townRepository.deleteCommuneById).not.toHaveBeenCalled();
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(townService.deleteTown(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(townRepository.deleteCommuneById).not.toHaveBeenCalled();
  });
});

test("Create multiple cities", async () => {
  const townsData = [
    mock<Omit<CommuneCreateInput, "owner_id">>(),
    mock<Omit<CommuneCreateInput, "owner_id">>(),
    mock<Omit<CommuneCreateInput, "owner_id">>(),
  ];

  const loggedUser = loggedUserFactory.build();

  townRepository.createCommunes.mockResolvedValueOnce([]);

  await townService.createTowns(townsData, loggedUser);

  expect(townRepository.createCommunes).toHaveBeenCalledTimes(1);
  expect(townRepository.createCommunes).toHaveBeenLastCalledWith(
    townsData.map((town) => {
      return {
        ...town,
        owner_id: loggedUser.id,
      };
    })
  );
});
