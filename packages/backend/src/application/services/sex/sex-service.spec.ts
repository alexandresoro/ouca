import { sexCreateInputFactory, sexFactory } from "@fixtures/domain/sex/sex.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertSexInputFactory } from "@fixtures/services/sex/sex-service.fixtures.js";
import type { SexRepository } from "@interfaces/sex-repository-interface.js";
import type { SexesSearchParams } from "@ou-ca/common/api/sex";
import { err, ok } from "neverthrow";
import type { DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { mockVi } from "../../../utils/mock.js";
import { buildSexService } from "./sex-service.js";

const sexRepository = mockVi<SexRepository>();
const entryRepository = mockVi<DonneeRepository>();

const sexService = buildSexService({
  sexRepository,
  entryRepository,
});

describe("Find sex", () => {
  test("should handle a matching sex", async () => {
    const sexData = sexFactory.build();
    const loggedUser = loggedUserFactory.build();

    sexRepository.findSexById.mockResolvedValueOnce(sexData);

    await sexService.findSex(12, loggedUser);

    expect(sexRepository.findSexById).toHaveBeenCalledTimes(1);
    expect(sexRepository.findSexById).toHaveBeenLastCalledWith(12);
  });

  test("should handle sex not found", async () => {
    sexRepository.findSexById.mockResolvedValueOnce(null);
    const loggedUser = loggedUserFactory.build();

    await expect(sexService.findSex(10, loggedUser)).resolves.toEqual(ok(null));

    expect(sexRepository.findSexById).toHaveBeenCalledTimes(1);
    expect(sexRepository.findSexById).toHaveBeenLastCalledWith(10);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await sexService.findSex(11, null);

    expect(findResult).toEqual(err("notAllowed"));
    expect(sexRepository.findSexById).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await sexService.getEntriesCountBySex("12", loggedUser);

    expect(entryRepository.getCountBySexeId).toHaveBeenCalledTimes(1);
    expect(entryRepository.getCountBySexeId).toHaveBeenLastCalledWith(12);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await sexService.getEntriesCountBySex("12", null);

    expect(entitiesCountResult).toEqual(err("notAllowed"));
  });
});

describe("Find sex by data ID", () => {
  test("should handle sex found", async () => {
    const sexData = sexFactory.build();
    const loggedUser = loggedUserFactory.build();

    sexRepository.findSexByEntryId.mockResolvedValueOnce(sexData);

    const sexResult = await sexService.findSexOfEntryId("43", loggedUser);

    expect(sexRepository.findSexByEntryId).toHaveBeenCalledTimes(1);
    expect(sexRepository.findSexByEntryId).toHaveBeenLastCalledWith(43);
    expect(sexResult.isOk()).toBeTruthy();
    expect(sexResult._unsafeUnwrap()?.id).toEqual(sexData.id);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const findResult = await sexService.findSexOfEntryId("12", null);

    expect(findResult).toEqual(err("notAllowed"));
  });
});

test("Find all sexes", async () => {
  const sexesData = sexFactory.buildList(3);

  sexRepository.findSexes.mockResolvedValueOnce(sexesData);

  await sexService.findAllSexes();

  expect(sexRepository.findSexes).toHaveBeenCalledTimes(1);
  expect(sexRepository.findSexes).toHaveBeenLastCalledWith({
    orderBy: "libelle",
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const sexesData = sexFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    sexRepository.findSexes.mockResolvedValueOnce(sexesData);

    await sexService.findPaginatedSexes(loggedUser, {});

    expect(sexRepository.findSexes).toHaveBeenCalledTimes(1);
    expect(sexRepository.findSexes).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated sexes", async () => {
    const sexesData = sexFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: SexesSearchParams = {
      orderBy: "libelle",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    sexRepository.findSexes.mockResolvedValueOnce([sexesData[0]]);

    await sexService.findPaginatedSexes(loggedUser, searchParams);

    expect(sexRepository.findSexes).toHaveBeenCalledTimes(1);
    expect(sexRepository.findSexes).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: "libelle",
      sortOrder: "desc",
      offset: 0,
      limit: searchParams.pageSize,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesPaginatedResult = await sexService.findPaginatedSexes(null, {});

    expect(entitiesPaginatedResult).toEqual(err("notAllowed"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await sexService.getSexesCount(loggedUser);

    expect(sexRepository.getCount).toHaveBeenCalledTimes(1);
    expect(sexRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await sexService.getSexesCount(loggedUser, "test");

    expect(sexRepository.getCount).toHaveBeenCalledTimes(1);
    expect(sexRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await sexService.getSexesCount(null);

    expect(entitiesCountResult).toEqual(err("notAllowed"));
  });
});

describe("Update of a sex", () => {
  test("should be allowed when requested by an admin", async () => {
    const sexData = upsertSexInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    sexRepository.updateSex.mockResolvedValueOnce(ok(sexFactory.build()));

    await sexService.updateSex(12, sexData, loggedUser);

    expect(sexRepository.updateSex).toHaveBeenCalledTimes(1);
    expect(sexRepository.updateSex).toHaveBeenLastCalledWith(12, sexData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = sexFactory.build({
      ownerId: "notAdmin",
    });

    const sexData = upsertSexInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    sexRepository.findSexById.mockResolvedValueOnce(existingData);
    sexRepository.updateSex.mockResolvedValueOnce(ok(sexFactory.build()));

    await sexService.updateSex(12, sexData, loggedUser);

    expect(sexRepository.updateSex).toHaveBeenCalledTimes(1);
    expect(sexRepository.updateSex).toHaveBeenLastCalledWith(12, sexData);
  });

  test("should not be allowed when requested by an user that is nor owner nor admin", async () => {
    const existingData = sexFactory.build({
      ownerId: "notAdmin",
    });

    const sexData = upsertSexInputFactory.build();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    sexRepository.findSexById.mockResolvedValueOnce(existingData);

    const updateResult = await sexService.updateSex(12, sexData, user);

    expect(updateResult).toEqual(err("notAllowed"));
    expect(sexRepository.updateSex).not.toHaveBeenCalled();
  });

  test("should not be allowed when trying to update to a sex that exists", async () => {
    const sexData = upsertSexInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    sexRepository.updateSex.mockResolvedValueOnce(err("alreadyExists"));

    const updateResult = await sexService.updateSex(12, sexData, loggedUser);

    expect(updateResult).toEqual(err("alreadyExists"));
    expect(sexRepository.updateSex).toHaveBeenCalledTimes(1);
    expect(sexRepository.updateSex).toHaveBeenLastCalledWith(12, sexData);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const sexData = upsertSexInputFactory.build();

    const updateResult = await sexService.updateSex(12, sexData, null);

    expect(updateResult).toEqual(err("notAllowed"));
    expect(sexRepository.updateSex).not.toHaveBeenCalled();
  });
});

describe("Creation of a sex", () => {
  test("should create new sex", async () => {
    const sexData = upsertSexInputFactory.build();

    const loggedUser = loggedUserFactory.build();

    sexRepository.createSex.mockResolvedValueOnce(ok(sexFactory.build()));

    await sexService.createSex(sexData, loggedUser);

    expect(sexRepository.createSex).toHaveBeenCalledTimes(1);
    expect(sexRepository.createSex).toHaveBeenLastCalledWith({
      ...sexData,
      ownerId: loggedUser.id,
    });
  });

  test("should not be allowed when trying to create a sex that already exists", async () => {
    const sexData = upsertSexInputFactory.build();

    const loggedUser = loggedUserFactory.build();

    sexRepository.createSex.mockResolvedValueOnce(err("alreadyExists"));

    const createResult = await sexService.createSex(sexData, loggedUser);

    expect(createResult).toEqual(err("alreadyExists"));
    expect(sexRepository.createSex).toHaveBeenCalledTimes(1);
    expect(sexRepository.createSex).toHaveBeenLastCalledWith({
      ...sexData,
      ownerId: loggedUser.id,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    const sexData = upsertSexInputFactory.build();

    const createResult = await sexService.createSex(sexData, null);

    expect(createResult).toEqual(err("notAllowed"));
    expect(sexRepository.createSex).not.toHaveBeenCalled();
  });
});

describe("Deletion of a sex", () => {
  test("should handle the deletion of an owned sex", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
      role: "contributor",
    });

    const sex = sexFactory.build({
      ownerId: loggedUser.id,
    });

    sexRepository.findSexById.mockResolvedValueOnce(sex);

    await sexService.deleteSex(11, loggedUser);

    expect(sexRepository.deleteSexById).toHaveBeenCalledTimes(1);
    expect(sexRepository.deleteSexById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any sex if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    sexRepository.findSexById.mockResolvedValueOnce(sexFactory.build());

    await sexService.deleteSex(11, loggedUser);

    expect(sexRepository.deleteSexById).toHaveBeenCalledTimes(1);
    expect(sexRepository.deleteSexById).toHaveBeenLastCalledWith(11);
  });

  test("should not be allowed when deleting a non-owned sex as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
    });

    const deleteResult = await sexService.deleteSex(11, loggedUser);

    expect(deleteResult).toEqual(err("notAllowed"));
    expect(sexRepository.deleteSexById).not.toHaveBeenCalled();
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await sexService.deleteSex(11, null);

    expect(deleteResult).toEqual(err("notAllowed"));
    expect(sexRepository.deleteSexById).not.toHaveBeenCalled();
  });
});

test("Create multiple sexes", async () => {
  const sexesData = sexCreateInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  sexRepository.createSexes.mockResolvedValueOnce([]);

  await sexService.createSexes(sexesData, loggedUser);

  expect(sexRepository.createSexes).toHaveBeenCalledTimes(1);
  expect(sexRepository.createSexes).toHaveBeenLastCalledWith(
    sexesData.map((sex) => {
      return {
        ...sex,
        ownerId: loggedUser.id,
      };
    }),
  );
});
