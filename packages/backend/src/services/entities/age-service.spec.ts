import { type UpsertAgeInput } from "@ou-ca/common/api/age";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { mock } from "vitest-mock-extended";
import { EntitesAvecLibelleOrderBy, SortOrder, type QueryAgesArgs } from "../../graphql/generated/graphql-types.js";
import { type Age, type AgeCreateInput, type AgeWithNbSpecimens } from "../../repositories/age/age-repository-types.js";
import { type AgeRepository } from "../../repositories/age/age-repository.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { COLUMN_LIBELLE } from "../../utils/constants.js";
import { OucaError } from "../../utils/errors.js";
import { buildAgeService } from "./age-service.js";

const ageRepository = mock<AgeRepository>({});
const donneeRepository = mock<DonneeRepository>({});
const logger = mock<Logger>();

const ageService = buildAgeService({
  logger,
  ageRepository,
  donneeRepository,
});

const uniqueConstraintFailedError = new UniqueIntegrityConstraintViolationError(
  new Error("errorMessage"),
  "constraint"
);

const uniqueConstraintFailed = () => {
  throw uniqueConstraintFailedError;
};

describe("Find age", () => {
  test("should handle a matching age", async () => {
    const ageData = mock<Age>();
    const loggedUser = mock<LoggedUser>();

    ageRepository.findAgeById.mockResolvedValueOnce(ageData);

    await ageService.findAge(ageData.id, loggedUser);

    expect(ageRepository.findAgeById).toHaveBeenCalledTimes(1);
    expect(ageRepository.findAgeById).toHaveBeenLastCalledWith(ageData.id);
  });

  test("should handle age not found", async () => {
    ageRepository.findAgeById.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(ageService.findAge(10, loggedUser)).resolves.toBe(null);

    expect(ageRepository.findAgeById).toHaveBeenCalledTimes(1);
    expect(ageRepository.findAgeById).toHaveBeenLastCalledWith(10);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(ageService.findAge(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(ageRepository.findAgeById).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await ageService.getDonneesCountByAge(12, loggedUser);

    expect(donneeRepository.getCountByAgeId).toHaveBeenCalledTimes(1);
    expect(donneeRepository.getCountByAgeId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(ageService.getDonneesCountByAge(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Find age by data ID", () => {
  test("should handle age found", async () => {
    const ageData = mock<Age>({
      id: 256,
    });
    const loggedUser = mock<LoggedUser>();

    ageRepository.findAgeByDonneeId.mockResolvedValueOnce(ageData);

    const age = await ageService.findAgeOfDonneeId(43, loggedUser);

    expect(ageRepository.findAgeByDonneeId).toHaveBeenCalledTimes(1);
    expect(ageRepository.findAgeByDonneeId).toHaveBeenLastCalledWith(43);
    expect(age?.id).toEqual(256);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(ageService.findAgeOfDonneeId(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all ages", async () => {
  const agesData = [mock<Age>(), mock<Age>(), mock<Age>()];

  ageRepository.findAges.mockResolvedValueOnce(agesData);

  await ageService.findAllAges();

  expect(ageRepository.findAges).toHaveBeenCalledTimes(1);
  expect(ageRepository.findAges).toHaveBeenLastCalledWith({
    orderBy: COLUMN_LIBELLE,
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const agesData = [mock<Age>(), mock<Age>(), mock<Age>()];
    const loggedUser = mock<LoggedUser>();

    ageRepository.findAges.mockResolvedValueOnce(agesData);

    await ageService.findPaginatedAges(loggedUser);

    expect(ageRepository.findAges).toHaveBeenCalledTimes(1);
    expect(ageRepository.findAges).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated ages ", async () => {
    const agesData = [mock<Age>(), mock<Age>(), mock<Age>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: QueryAgesArgs = {
      orderBy: EntitesAvecLibelleOrderBy.Libelle,
      sortOrder: SortOrder.Desc,
      searchParams: {
        q: "Bob",
        pageNumber: 0,
        pageSize: 10,
      },
    };

    ageRepository.findAges.mockResolvedValueOnce([agesData[0]]);

    await ageService.findPaginatedAges(loggedUser, searchParams);

    expect(ageRepository.findAges).toHaveBeenCalledTimes(1);
    expect(ageRepository.findAges).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: COLUMN_LIBELLE,
      sortOrder: SortOrder.Desc,
      offset: searchParams.searchParams?.pageNumber,
      limit: searchParams.searchParams?.pageSize,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(ageService.findPaginatedAges(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await ageService.getAgesCount(loggedUser);

    expect(ageRepository.getCount).toHaveBeenCalledTimes(1);
    expect(ageRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await ageService.getAgesCount(loggedUser, "test");

    expect(ageRepository.getCount).toHaveBeenCalledTimes(1);
    expect(ageRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(ageService.getAgesCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Get number of specimens of age per species id", () => {
  test("should handle to be called properly", async () => {
    const loggedUser = mock<LoggedUser>();
    ageRepository.getAgesWithNbSpecimensForEspeceId.mockResolvedValueOnce([]);

    await ageService.getAgesWithNbSpecimensForEspeceId(10, loggedUser);

    expect(ageRepository.getAgesWithNbSpecimensForEspeceId).toHaveBeenCalledTimes(1);
    expect(ageRepository.getAgesWithNbSpecimensForEspeceId).toHaveBeenLastCalledWith(10);
  });

  test("should handle to return no defined number of species", async () => {
    const loggedUser = mock<LoggedUser>();
    ageRepository.getAgesWithNbSpecimensForEspeceId.mockResolvedValueOnce([
      mock<AgeWithNbSpecimens>({
        nbSpecimens: null,
      }),
    ]);

    const result = await ageService.getAgesWithNbSpecimensForEspeceId(10, loggedUser);

    expect(ageRepository.getAgesWithNbSpecimensForEspeceId).toHaveBeenCalledTimes(1);
    expect(ageRepository.getAgesWithNbSpecimensForEspeceId).toHaveBeenLastCalledWith(10);
    expect(result[0].nbSpecimens).toEqual(0);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(ageService.getAgesWithNbSpecimensForEspeceId(10, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of an age", () => {
  test("should be allowed when requested by an admin", async () => {
    const ageData = mock<UpsertAgeInput>();

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    await ageService.updateAge(12, ageData, loggedUser);

    expect(ageRepository.updateAge).toHaveBeenCalledTimes(1);
    expect(ageRepository.updateAge).toHaveBeenLastCalledWith(12, ageData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = mock<Age>({
      ownerId: "notAdmin",
    });

    const ageData = mock<UpsertAgeInput>();

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    ageRepository.findAgeById.mockResolvedValueOnce(existingData);

    await ageService.updateAge(12, ageData, loggedUser);

    expect(ageRepository.updateAge).toHaveBeenCalledTimes(1);
    expect(ageRepository.updateAge).toHaveBeenLastCalledWith(12, ageData);
  });

  test("should throw an error when requested by an user that is nor owner nor admin", async () => {
    const existingData = mock<Age>({
      ownerId: "notAdmin",
    });

    const ageData = mock<UpsertAgeInput>();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    ageRepository.findAgeById.mockResolvedValueOnce(existingData);

    await expect(ageService.updateAge(12, ageData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

    expect(ageRepository.updateAge).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to an age that exists", async () => {
    const ageData = mock<UpsertAgeInput>();

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    ageRepository.updateAge.mockImplementation(uniqueConstraintFailed);

    await expect(() => ageService.updateAge(12, ageData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(ageRepository.updateAge).toHaveBeenCalledTimes(1);
    expect(ageRepository.updateAge).toHaveBeenLastCalledWith(12, ageData);
  });

  test("should throw an error when the requester is not logged", async () => {
    const ageData = mock<UpsertAgeInput>();

    await expect(ageService.updateAge(12, ageData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(ageRepository.updateAge).not.toHaveBeenCalled();
  });
});

describe("Creation of an age", () => {
  test("should create new age", async () => {
    const ageData = mock<UpsertAgeInput>();

    const loggedUser = mock<LoggedUser>({ id: "a" });

    await ageService.createAge(ageData, loggedUser);

    expect(ageRepository.createAge).toHaveBeenCalledTimes(1);
    expect(ageRepository.createAge).toHaveBeenLastCalledWith({
      ...ageData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when trying to create an age that already exists", async () => {
    const ageData = mock<UpsertAgeInput>();

    const loggedUser = mock<LoggedUser>({ id: "a" });

    ageRepository.createAge.mockImplementation(uniqueConstraintFailed);

    await expect(() => ageService.createAge(ageData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(ageRepository.createAge).toHaveBeenCalledTimes(1);
    expect(ageRepository.createAge).toHaveBeenLastCalledWith({
      ...ageData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const ageData = mock<UpsertAgeInput>();

    await expect(ageService.createAge(ageData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(ageRepository.createAge).not.toHaveBeenCalled();
  });
});

describe("Deletion of an age", () => {
  test("should handle the deletion of an owned age", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const age = mock<Age>({
      ownerId: loggedUser.id,
    });

    ageRepository.findAgeById.mockResolvedValueOnce(age);

    await ageService.deleteAge(11, loggedUser);

    expect(ageRepository.deleteAgeById).toHaveBeenCalledTimes(1);
    expect(ageRepository.deleteAgeById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any age if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "admin",
    });

    ageRepository.findAgeById.mockResolvedValueOnce(mock<Age>());

    await ageService.deleteAge(11, loggedUser);

    expect(ageRepository.deleteAgeById).toHaveBeenCalledTimes(1);
    expect(ageRepository.deleteAgeById).toHaveBeenLastCalledWith(11);
  });

  test("should return an error when deleting a non-owned age as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "contributor",
    });

    ageRepository.findAgeById.mockResolvedValueOnce(mock<Age>());

    await expect(ageService.deleteAge(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(ageRepository.deleteAgeById).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(ageService.deleteAge(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(ageRepository.deleteAgeById).not.toHaveBeenCalled();
  });
});

test("Create multiple ages", async () => {
  const agesData = [
    mock<Omit<AgeCreateInput, "ownerId">>(),
    mock<Omit<AgeCreateInput, "ownerId">>(),
    mock<Omit<AgeCreateInput, "ownerId">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  await ageService.createAges(agesData, loggedUser);

  expect(ageRepository.createAges).toHaveBeenCalledTimes(1);
  expect(ageRepository.createAges).toHaveBeenLastCalledWith(
    agesData.map((age) => {
      return {
        ...age,
        owner_id: loggedUser.id,
      };
    })
  );
});
