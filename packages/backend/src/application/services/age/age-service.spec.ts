import { OucaError } from "@domain/errors/ouca-error.js";
import { ageCreateInputFactory, ageFactory } from "@fixtures/domain/age/age.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertAgeInputFactory } from "@fixtures/services/age/age-service.fixtures.js";
import { type AgeRepository } from "@interfaces/age-repository-interface.js";
import { type AgesSearchParams } from "@ou-ca/common/api/age";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { COLUMN_LIBELLE } from "../../../utils/constants.js";
import { mockVi } from "../../../utils/mock.js";
import { buildAgeService } from "./age-service.js";

const ageRepository = mockVi<AgeRepository>();
const donneeRepository = mockVi<DonneeRepository>();

const ageService = buildAgeService({
  ageRepository,
  donneeRepository,
});

const uniqueConstraintFailedError = new UniqueIntegrityConstraintViolationError(new Error("errorMessage"));

const uniqueConstraintFailed = () => {
  throw uniqueConstraintFailedError;
};

describe("Find age", () => {
  test("should handle a matching age", async () => {
    const ageData = ageFactory.build();
    const loggedUser = loggedUserFactory.build();

    ageRepository.findAgeById.mockResolvedValueOnce(ageData);

    await ageService.findAge(12, loggedUser);

    expect(ageRepository.findAgeById).toHaveBeenCalledTimes(1);
    expect(ageRepository.findAgeById).toHaveBeenLastCalledWith(12);
  });

  test("should handle age not found", async () => {
    ageRepository.findAgeById.mockResolvedValueOnce(null);
    const loggedUser = loggedUserFactory.build();

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
    const loggedUser = loggedUserFactory.build();

    await ageService.getDonneesCountByAge("12", loggedUser);

    expect(donneeRepository.getCountByAgeId).toHaveBeenCalledTimes(1);
    expect(donneeRepository.getCountByAgeId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(ageService.getDonneesCountByAge("12", null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Find age by data ID", () => {
  test("should handle age found", async () => {
    const ageData = ageFactory.build();
    const loggedUser = loggedUserFactory.build();

    ageRepository.findAgeByDonneeId.mockResolvedValueOnce(ageData);

    const age = await ageService.findAgeOfDonneeId("43", loggedUser);

    expect(ageRepository.findAgeByDonneeId).toHaveBeenCalledTimes(1);
    expect(ageRepository.findAgeByDonneeId).toHaveBeenLastCalledWith(43);
    expect(age?.id).toEqual(ageData.id);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(ageService.findAgeOfDonneeId("12", null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all ages", async () => {
  const agesData = ageFactory.buildList(3);

  ageRepository.findAges.mockResolvedValueOnce(agesData);

  await ageService.findAllAges();

  expect(ageRepository.findAges).toHaveBeenCalledTimes(1);
  expect(ageRepository.findAges).toHaveBeenLastCalledWith({
    orderBy: COLUMN_LIBELLE,
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const agesData = ageFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    ageRepository.findAges.mockResolvedValueOnce(agesData);

    await ageService.findPaginatedAges(loggedUser, {});

    expect(ageRepository.findAges).toHaveBeenCalledTimes(1);
    expect(ageRepository.findAges).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated ages ", async () => {
    const agesData = ageFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: AgesSearchParams = {
      orderBy: "libelle",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    ageRepository.findAges.mockResolvedValueOnce([agesData[0]]);

    await ageService.findPaginatedAges(loggedUser, searchParams);

    expect(ageRepository.findAges).toHaveBeenCalledTimes(1);
    expect(ageRepository.findAges).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: COLUMN_LIBELLE,
      sortOrder: "desc",
      offset: 0,
      limit: searchParams.pageSize,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(ageService.findPaginatedAges(null, {})).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await ageService.getAgesCount(loggedUser);

    expect(ageRepository.getCount).toHaveBeenCalledTimes(1);
    expect(ageRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await ageService.getAgesCount(loggedUser, "test");

    expect(ageRepository.getCount).toHaveBeenCalledTimes(1);
    expect(ageRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(ageService.getAgesCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of an age", () => {
  test("should be allowed when requested by an admin", async () => {
    const ageData = upsertAgeInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    await ageService.updateAge(12, ageData, loggedUser);

    expect(ageRepository.updateAge).toHaveBeenCalledTimes(1);
    expect(ageRepository.updateAge).toHaveBeenLastCalledWith(12, ageData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = ageFactory.build({
      ownerId: "notAdmin",
    });

    const ageData = upsertAgeInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    ageRepository.findAgeById.mockResolvedValueOnce(existingData);

    await ageService.updateAge(12, ageData, loggedUser);

    expect(ageRepository.updateAge).toHaveBeenCalledTimes(1);
    expect(ageRepository.updateAge).toHaveBeenLastCalledWith(12, ageData);
  });

  test("should throw an error when requested by an user that is nor owner nor admin", async () => {
    const existingData = ageFactory.build({
      ownerId: "notAdmin",
    });

    const ageData = upsertAgeInputFactory.build();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    ageRepository.findAgeById.mockResolvedValueOnce(existingData);

    await expect(ageService.updateAge(12, ageData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

    expect(ageRepository.updateAge).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to an age that exists", async () => {
    const ageData = upsertAgeInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    ageRepository.updateAge.mockImplementation(uniqueConstraintFailed);

    await expect(() => ageService.updateAge(12, ageData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(ageRepository.updateAge).toHaveBeenCalledTimes(1);
    expect(ageRepository.updateAge).toHaveBeenLastCalledWith(12, ageData);
  });

  test("should throw an error when the requester is not logged", async () => {
    const ageData = upsertAgeInputFactory.build();

    await expect(ageService.updateAge(12, ageData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(ageRepository.updateAge).not.toHaveBeenCalled();
  });
});

describe("Creation of an age", () => {
  test("should create new age", async () => {
    const ageData = upsertAgeInputFactory.build();

    const loggedUser = loggedUserFactory.build();

    await ageService.createAge(ageData, loggedUser);

    expect(ageRepository.createAge).toHaveBeenCalledTimes(1);
    expect(ageRepository.createAge).toHaveBeenLastCalledWith({
      ...ageData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when trying to create an age that already exists", async () => {
    const ageData = upsertAgeInputFactory.build();

    const loggedUser = loggedUserFactory.build();

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
    const ageData = upsertAgeInputFactory.build();

    await expect(ageService.createAge(ageData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(ageRepository.createAge).not.toHaveBeenCalled();
  });
});

describe("Deletion of an age", () => {
  test("should handle the deletion of an owned age", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
      role: "contributor",
    });

    const age = ageFactory.build({ ownerId: loggedUser.id });

    ageRepository.findAgeById.mockResolvedValueOnce(age);

    await ageService.deleteAge(11, loggedUser);

    expect(ageRepository.deleteAgeById).toHaveBeenCalledTimes(1);
    expect(ageRepository.deleteAgeById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any age if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    ageRepository.findAgeById.mockResolvedValueOnce(ageFactory.build());

    await ageService.deleteAge(11, loggedUser);

    expect(ageRepository.deleteAgeById).toHaveBeenCalledTimes(1);
    expect(ageRepository.deleteAgeById).toHaveBeenLastCalledWith(11);
  });

  test("should return an error when deleting a non-owned age as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
    });

    await expect(ageService.deleteAge(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(ageRepository.deleteAgeById).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(ageService.deleteAge(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(ageRepository.deleteAgeById).not.toHaveBeenCalled();
  });
});

test("Create multiple ages", async () => {
  const agesData = ageCreateInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  ageRepository.createAges.mockResolvedValueOnce([]);

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
