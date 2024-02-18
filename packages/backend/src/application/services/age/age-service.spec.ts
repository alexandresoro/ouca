import { ageCreateInputFactory, ageFactory } from "@fixtures/domain/age/age.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertAgeInputFactory } from "@fixtures/services/age/age-service.fixtures.js";
import { type AgeRepository } from "@interfaces/age-repository-interface.js";
import { type AgesSearchParams } from "@ou-ca/common/api/age";
import { err, ok } from "neverthrow";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { mockVi } from "../../../utils/mock.js";
import { buildAgeService } from "./age-service.js";

const ageRepository = mockVi<AgeRepository>();
const entryRepository = mockVi<DonneeRepository>();

const ageService = buildAgeService({
  ageRepository,
  entryRepository,
});

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

    await expect(ageService.findAge(10, loggedUser)).resolves.toEqual(ok(null));

    expect(ageRepository.findAgeById).toHaveBeenCalledTimes(1);
    expect(ageRepository.findAgeById).toHaveBeenLastCalledWith(10);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await ageService.findAge(11, null);

    expect(findResult).toEqual(err("notAllowed"));
    expect(ageRepository.findAgeById).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await ageService.getEntriesCountByAge("12", loggedUser);

    expect(entryRepository.getCountByAgeId).toHaveBeenCalledTimes(1);
    expect(entryRepository.getCountByAgeId).toHaveBeenLastCalledWith(12);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await ageService.getEntriesCountByAge("12", null);

    expect(entitiesCountResult).toEqual(err("notAllowed"));
  });
});

describe("Find age by data ID", () => {
  test("should handle age found", async () => {
    const ageData = ageFactory.build();
    const loggedUser = loggedUserFactory.build();

    ageRepository.findAgeByDonneeId.mockResolvedValueOnce(ageData);

    const ageResult = await ageService.findAgeOfDonneeId("43", loggedUser);

    expect(ageRepository.findAgeByDonneeId).toHaveBeenCalledTimes(1);
    expect(ageRepository.findAgeByDonneeId).toHaveBeenLastCalledWith(43);
    expect(ageResult.isOk()).toBeTruthy();
    expect(ageResult._unsafeUnwrap()?.id).toEqual(ageData.id);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const findResult = await ageService.findAgeOfDonneeId("12", null);

    expect(findResult).toEqual(err("notAllowed"));
  });
});

test("Find all ages", async () => {
  const agesData = ageFactory.buildList(3);

  ageRepository.findAges.mockResolvedValueOnce(agesData);

  await ageService.findAllAges();

  expect(ageRepository.findAges).toHaveBeenCalledTimes(1);
  expect(ageRepository.findAges).toHaveBeenLastCalledWith({
    orderBy: "libelle",
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

  test("should handle params when retrieving paginated ages", async () => {
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
      orderBy: "libelle",
      sortOrder: "desc",
      offset: 0,
      limit: searchParams.pageSize,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesPaginatedResult = await ageService.findPaginatedAges(null, {});

    expect(entitiesPaginatedResult).toEqual(err("notAllowed"));
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

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await ageService.getAgesCount(null);

    expect(entitiesCountResult).toEqual(err("notAllowed"));
  });
});

describe("Update of an age", () => {
  test("should be allowed when requested by an admin", async () => {
    const ageData = upsertAgeInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    ageRepository.updateAge.mockResolvedValueOnce(ok(ageFactory.build()));

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
    ageRepository.updateAge.mockResolvedValueOnce(ok(ageFactory.build()));

    await ageService.updateAge(12, ageData, loggedUser);

    expect(ageRepository.updateAge).toHaveBeenCalledTimes(1);
    expect(ageRepository.updateAge).toHaveBeenLastCalledWith(12, ageData);
  });

  test("should not be allowed when requested by an user that is nor owner nor admin", async () => {
    const existingData = ageFactory.build({
      ownerId: "notAdmin",
    });

    const ageData = upsertAgeInputFactory.build();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    ageRepository.findAgeById.mockResolvedValueOnce(existingData);

    const updateResult = await ageService.updateAge(12, ageData, user);

    expect(updateResult).toEqual(err("notAllowed"));
    expect(ageRepository.updateAge).not.toHaveBeenCalled();
  });

  test("should not be allowed when trying to update to an age that exists", async () => {
    const ageData = upsertAgeInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    ageRepository.updateAge.mockResolvedValueOnce(err("alreadyExists"));

    const updateResult = await ageService.updateAge(12, ageData, loggedUser);

    expect(updateResult).toEqual(err("alreadyExists"));
    expect(ageRepository.updateAge).toHaveBeenCalledTimes(1);
    expect(ageRepository.updateAge).toHaveBeenLastCalledWith(12, ageData);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const ageData = upsertAgeInputFactory.build();

    const updateResult = await ageService.updateAge(12, ageData, null);

    expect(updateResult).toEqual(err("notAllowed"));
    expect(ageRepository.updateAge).not.toHaveBeenCalled();
  });
});

describe("Creation of an age", () => {
  test("should create new age", async () => {
    const ageData = upsertAgeInputFactory.build();

    const loggedUser = loggedUserFactory.build();

    ageRepository.createAge.mockResolvedValueOnce(ok(ageFactory.build()));

    await ageService.createAge(ageData, loggedUser);

    expect(ageRepository.createAge).toHaveBeenCalledTimes(1);
    expect(ageRepository.createAge).toHaveBeenLastCalledWith({
      ...ageData,
      ownerId: loggedUser.id,
    });
  });

  test("should not be allowed when trying to create an age that already exists", async () => {
    const ageData = upsertAgeInputFactory.build();

    const loggedUser = loggedUserFactory.build();

    ageRepository.createAge.mockResolvedValueOnce(err("alreadyExists"));

    const createResult = await ageService.createAge(ageData, loggedUser);

    expect(createResult).toEqual(err("alreadyExists"));
    expect(ageRepository.createAge).toHaveBeenCalledTimes(1);
    expect(ageRepository.createAge).toHaveBeenLastCalledWith({
      ...ageData,
      ownerId: loggedUser.id,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    const ageData = upsertAgeInputFactory.build();

    const createResult = await ageService.createAge(ageData, null);

    expect(createResult).toEqual(err("notAllowed"));
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

  test("should not be allowed when deleting a non-owned age as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
    });

    const deleteResult = await ageService.deleteAge(11, loggedUser);

    expect(deleteResult).toEqual(err("notAllowed"));
    expect(ageRepository.deleteAgeById).not.toHaveBeenCalled();
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await ageService.deleteAge(11, null);

    expect(deleteResult).toEqual(err("notAllowed"));
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
        ownerId: loggedUser.id,
      };
    })
  );
});
