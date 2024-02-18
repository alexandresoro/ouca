import { OucaError } from "@domain/errors/ouca-error.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { speciesFactory } from "@fixtures/domain/species/species.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { type SpeciesSearchParams, type UpsertSpeciesInput } from "@ou-ca/common/api/species";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { type EspeceCreateInput } from "../../../repositories/espece/espece-repository-types.js";
import { type EspeceRepository } from "../../../repositories/espece/espece-repository.js";
import { mockVi } from "../../../utils/mock.js";
import { type SpeciesClassService } from "../species-class/species-class-service.js";
import { reshapeInputEspeceUpsertData } from "./species-service-reshape.js";
import { buildSpeciesService } from "./species-service.js";

const classService = mockVi<SpeciesClassService>();
const speciesRepository = mockVi<EspeceRepository>();
const entryRepository = mockVi<DonneeRepository>();

const speciesService = buildSpeciesService({
  classService,
  speciesRepository,
  entryRepository,
});

const uniqueConstraintFailedError = new UniqueIntegrityConstraintViolationError(
  new Error("errorMessage"),
  "constraint"
);

const uniqueConstraintFailed = () => {
  throw uniqueConstraintFailedError;
};

vi.mock("./species-service-reshape.js", () => {
  return {
    __esModule: true,
    reshapeInputEspeceUpsertData: vi.fn(),
  };
});

const mockedReshapeInputEspeceUpsertData = vi.mocked(reshapeInputEspeceUpsertData);

describe("Find species", () => {
  test("should handle a matching species", async () => {
    const speciesData = speciesFactory.build();
    const loggedUser = loggedUserFactory.build();

    speciesRepository.findEspeceById.mockResolvedValueOnce(speciesData);

    await speciesService.findEspece(12, loggedUser);

    expect(speciesRepository.findEspeceById).toHaveBeenCalledTimes(1);
    expect(speciesRepository.findEspeceById).toHaveBeenLastCalledWith(12);
  });

  test("should handle species not found", async () => {
    speciesRepository.findEspeceById.mockResolvedValueOnce(null);
    const loggedUser = loggedUserFactory.build();

    await expect(speciesService.findEspece(10, loggedUser)).resolves.toBe(null);

    expect(speciesRepository.findEspeceById).toHaveBeenCalledTimes(1);
    expect(speciesRepository.findEspeceById).toHaveBeenLastCalledWith(10);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(speciesService.findEspece(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(speciesRepository.findEspeceById).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesService.getDonneesCountByEspece("12", loggedUser);

    expect(entryRepository.getCountByEspeceId).toHaveBeenCalledTimes(1);
    expect(entryRepository.getCountByEspeceId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(speciesService.getDonneesCountByEspece("12", null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Find species by data ID", () => {
  test("should handle species found", async () => {
    const speciesData = speciesFactory.build({
      id: "256",
    });
    const loggedUser = loggedUserFactory.build();

    speciesRepository.findEspeceByDonneeId.mockResolvedValueOnce(speciesData);

    const species = await speciesService.findEspeceOfDonneeId("43", loggedUser);

    expect(speciesRepository.findEspeceByDonneeId).toHaveBeenCalledTimes(1);
    expect(speciesRepository.findEspeceByDonneeId).toHaveBeenLastCalledWith(43);
    expect(species?.id).toEqual("256");
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(speciesService.findEspeceOfDonneeId("12", null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all species", async () => {
  const speciesData = speciesFactory.buildList(3);

  speciesRepository.findEspeces.mockResolvedValueOnce(speciesData);

  await speciesService.findAllEspeces();

  expect(speciesRepository.findEspeces).toHaveBeenCalledTimes(1);
  expect(speciesRepository.findEspeces).toHaveBeenLastCalledWith({
    orderBy: "code",
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const speciesData = speciesFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    speciesRepository.findEspeces.mockResolvedValueOnce(speciesData);

    await speciesService.findPaginatedEspeces(loggedUser, {});

    expect(speciesRepository.findEspeces).toHaveBeenCalledTimes(1);
    expect(speciesRepository.findEspeces).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated species ", async () => {
    const speciesData = speciesFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: SpeciesSearchParams = {
      orderBy: "code",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    speciesRepository.findEspeces.mockResolvedValueOnce([speciesData[0]]);

    await speciesService.findPaginatedEspeces(loggedUser, searchParams);

    expect(speciesRepository.findEspeces).toHaveBeenCalledTimes(1);
    expect(speciesRepository.findEspeces).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: "code",
      sortOrder: "desc",
      offset: 0,
      limit: searchParams.pageSize,
    });
  });

  test("should handle params and search criteria when retrieving paginated species ", async () => {
    const speciesData = speciesFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: SpeciesSearchParams = {
      orderBy: "code",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
      ageIds: ["12", "23"],
      number: undefined,
      townIds: ["3", "6"],
      toDate: "2010-01-01",
    };

    speciesRepository.findEspeces.mockResolvedValueOnce([speciesData[0]]);

    await speciesService.findPaginatedEspeces(loggedUser, searchParams);

    expect(speciesRepository.findEspeces).toHaveBeenCalledTimes(1);
    expect(speciesRepository.findEspeces).toHaveBeenLastCalledWith({
      q: "Bob",
      searchCriteria: {
        ageIds: [12, 23],
        nombre: undefined,
        townIds: [3, 6],
        toDate: "2010-01-01",
      },
      orderBy: "code",
      sortOrder: "desc",
      offset: 0,
      limit: searchParams.pageSize,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(speciesService.findPaginatedEspeces(null, {})).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesService.getEspecesCount(loggedUser, {});

    expect(speciesRepository.getCount).toHaveBeenCalledTimes(1);
    expect(speciesRepository.getCount).toHaveBeenLastCalledWith({});
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesService.getEspecesCount(loggedUser, { q: "test" });

    expect(speciesRepository.getCount).toHaveBeenCalledTimes(1);
    expect(speciesRepository.getCount).toHaveBeenLastCalledWith({
      q: "test",
    });
  });

  test("should handle to be called with some donnee criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesService.getEspecesCount(loggedUser, {
      ageIds: ["12", "23"],
      number: undefined,
      townIds: ["3", "6"],
      toDate: "2010-01-01",
    });

    expect(speciesRepository.getCount).toHaveBeenCalledTimes(1);
    expect(speciesRepository.getCount).toHaveBeenLastCalledWith({
      searchCriteria: {
        ageIds: [12, 23],
        nombre: undefined,
        townIds: [3, 6],
        toDate: "2010-01-01",
      },
    });
  });

  test("should handle to be called with both espece and donnee criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesService.getEspecesCount(loggedUser, {
      q: "test",
      ageIds: ["12", "23"],
      number: undefined,
      townIds: ["3", "6"],
      toDate: "2010-01-01",
    });

    expect(speciesRepository.getCount).toHaveBeenCalledTimes(1);
    expect(speciesRepository.getCount).toHaveBeenLastCalledWith({
      q: "test",
      searchCriteria: {
        ageIds: [12, 23],
        nombre: undefined,
        townIds: [3, 6],
        toDate: "2010-01-01",
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(speciesService.getEspecesCount(null, {})).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of a species", () => {
  test("should be allowed when requested by an admin", async () => {
    const speciesData = mock<UpsertSpeciesInput>();

    const reshapedInputData = mock<EspeceCreateInput>();
    mockedReshapeInputEspeceUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    const species = speciesFactory.build({
      ownerId: loggedUser.id,
    });
    speciesRepository.updateEspece.mockResolvedValueOnce(species);

    await speciesService.updateEspece(12, speciesData, loggedUser);

    expect(speciesRepository.updateEspece).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputEspeceUpsertData).toHaveBeenCalledTimes(1);
    expect(speciesRepository.updateEspece).toHaveBeenLastCalledWith(12, reshapedInputData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = speciesFactory.build({
      ownerId: "notAdmin",
    });

    const speciesData = mock<UpsertSpeciesInput>();

    const reshapedInputData = mock<EspeceCreateInput>();
    mockedReshapeInputEspeceUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    speciesRepository.findEspeceById.mockResolvedValueOnce(existingData);

    const species = speciesFactory.build({
      ownerId: loggedUser.id,
    });
    speciesRepository.updateEspece.mockResolvedValueOnce(species);

    await speciesService.updateEspece(12, speciesData, loggedUser);

    expect(speciesRepository.updateEspece).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputEspeceUpsertData).toHaveBeenCalledTimes(1);
    expect(speciesRepository.updateEspece).toHaveBeenLastCalledWith(12, reshapedInputData);
  });

  test("should throw an error when requested by an user that is nor owner nor admin", async () => {
    const existingData = speciesFactory.build({
      ownerId: "notAdmin",
    });

    const speciesData = mock<UpsertSpeciesInput>();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    speciesRepository.findEspeceById.mockResolvedValueOnce(existingData);

    await expect(speciesService.updateEspece(12, speciesData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

    expect(speciesRepository.updateEspece).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to a species that exists", async () => {
    const speciesData = mock<UpsertSpeciesInput>();

    const reshapedInputData = mock<EspeceCreateInput>();
    mockedReshapeInputEspeceUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    speciesRepository.updateEspece.mockImplementation(uniqueConstraintFailed);

    await expect(() => speciesService.updateEspece(12, speciesData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(speciesRepository.updateEspece).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputEspeceUpsertData).toHaveBeenCalledTimes(1);
    expect(speciesRepository.updateEspece).toHaveBeenLastCalledWith(12, reshapedInputData);
  });

  test("should throw an error when the requester is not logged", async () => {
    const speciesData = mock<UpsertSpeciesInput>();

    await expect(speciesService.updateEspece(12, speciesData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(speciesRepository.updateEspece).not.toHaveBeenCalled();
  });
});

describe("Creation of a species", () => {
  test("should create new species", async () => {
    const speciesData = mock<UpsertSpeciesInput>();

    const reshapedInputData = mock<EspeceCreateInput>();
    mockedReshapeInputEspeceUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = loggedUserFactory.build({ id: "a" });

    const species = speciesFactory.build({
      ownerId: loggedUser.id,
    });
    speciesRepository.createEspece.mockResolvedValueOnce(species);

    await speciesService.createEspece(speciesData, loggedUser);

    expect(speciesRepository.createEspece).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputEspeceUpsertData).toHaveBeenCalledTimes(1);
    expect(speciesRepository.createEspece).toHaveBeenLastCalledWith({
      ...reshapedInputData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when trying to create a species that already exists", async () => {
    const speciesData = mock<UpsertSpeciesInput>();

    const reshapedInputData = mock<EspeceCreateInput>();
    mockedReshapeInputEspeceUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = loggedUserFactory.build({ id: "a" });

    speciesRepository.createEspece.mockImplementation(uniqueConstraintFailed);

    await expect(() => speciesService.createEspece(speciesData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(speciesRepository.createEspece).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputEspeceUpsertData).toHaveBeenCalledTimes(1);
    expect(speciesRepository.createEspece).toHaveBeenLastCalledWith({
      ...reshapedInputData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const speciesData = mock<UpsertSpeciesInput>();

    await expect(speciesService.createEspece(speciesData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(speciesRepository.createEspece).not.toHaveBeenCalled();
  });
});

describe("Deletion of a species", () => {
  test("should handle the deletion of an owned species", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const species = speciesFactory.build({
      ownerId: loggedUser.id,
    });

    speciesRepository.findEspeceById.mockResolvedValueOnce(species);

    await speciesService.deleteEspece(11, loggedUser);

    expect(speciesRepository.deleteEspeceById).toHaveBeenCalledTimes(1);
    expect(speciesRepository.deleteEspeceById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any species if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    speciesRepository.findEspeceById.mockResolvedValueOnce(speciesFactory.build());

    await speciesService.deleteEspece(11, loggedUser);

    expect(speciesRepository.deleteEspeceById).toHaveBeenCalledTimes(1);
    expect(speciesRepository.deleteEspeceById).toHaveBeenLastCalledWith(11);
  });

  test("should return an error when deleting a non-owned species as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "contributor",
    });

    speciesRepository.findEspeceById.mockResolvedValueOnce(speciesFactory.build());

    await expect(speciesService.deleteEspece(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(speciesRepository.deleteEspeceById).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(speciesService.deleteEspece(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(speciesRepository.deleteEspeceById).not.toHaveBeenCalled();
  });
});

test("Create multiple species", async () => {
  const speciesData = [
    mock<Omit<EspeceCreateInput, "owner_id">>(),
    mock<Omit<EspeceCreateInput, "owner_id">>(),
    mock<Omit<EspeceCreateInput, "owner_id">>(),
  ];

  const loggedUser = loggedUserFactory.build();

  speciesRepository.createEspeces.mockResolvedValueOnce([]);

  await speciesService.createEspeces(speciesData, loggedUser);

  expect(speciesRepository.createEspeces).toHaveBeenCalledTimes(1);
  expect(speciesRepository.createEspeces).toHaveBeenLastCalledWith(
    speciesData.map((species) => {
      return {
        ...species,
        owner_id: loggedUser.id,
      };
    })
  );
});
