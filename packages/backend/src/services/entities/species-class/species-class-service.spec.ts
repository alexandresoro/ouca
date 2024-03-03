import { type LoggedUser } from "@domain/user/logged-user.js";
import { speciesClassFactory } from "@fixtures/domain/species-class/species-class.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertSpeciesClassInputFactory } from "@fixtures/services/species-class/species-class-service.fixtures.js";
import { type SpeciesClassRepository } from "@interfaces/species-class-repository-interface.js";
import { type ClassesSearchParams } from "@ou-ca/common/api/species-class";
import { err, ok } from "neverthrow";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { type EspeceRepository } from "../../../repositories/espece/espece-repository.js";
import { mockVi } from "../../../utils/mock.js";
import { buildSpeciesClassService } from "./species-class-service.js";

const classRepository = mockVi<SpeciesClassRepository>();
const speciesRepository = mockVi<EspeceRepository>();
const entryRepository = mockVi<DonneeRepository>();

const speciesClassService = buildSpeciesClassService({
  classRepository,
  speciesRepository,
  entryRepository,
});

describe("Find class", () => {
  test("should handle a matching class", async () => {
    const classData = speciesClassFactory.build();
    const loggedUser = loggedUserFactory.build();

    classRepository.findSpeciesClassById.mockResolvedValueOnce(classData);

    await speciesClassService.findSpeciesClass(12, loggedUser);

    expect(classRepository.findSpeciesClassById).toHaveBeenCalledTimes(1);
    expect(classRepository.findSpeciesClassById).toHaveBeenLastCalledWith(12);
  });

  test("should handle class not found", async () => {
    classRepository.findSpeciesClassById.mockResolvedValueOnce(null);
    const loggedUser = loggedUserFactory.build();

    await expect(speciesClassService.findSpeciesClass(10, loggedUser)).resolves.toEqual(ok(null));

    expect(classRepository.findSpeciesClassById).toHaveBeenCalledTimes(1);
    expect(classRepository.findSpeciesClassById).toHaveBeenLastCalledWith(10);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await speciesClassService.findSpeciesClass(11, null);

    expect(findResult).toEqual(err("notAllowed"));
    expect(classRepository.findSpeciesClassById).not.toHaveBeenCalled();
  });
});

describe("Species count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesClassService.getSpeciesCountBySpeciesClass("12", loggedUser);

    expect(speciesRepository.getCountByClasseId).toHaveBeenCalledTimes(1);
    expect(speciesRepository.getCountByClasseId).toHaveBeenLastCalledWith(12);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const speciesCountResult = await speciesClassService.getSpeciesCountBySpeciesClass("12", null);

    expect(speciesCountResult).toEqual(err("notAllowed"));
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesClassService.getEntriesCountBySpeciesClass("12", loggedUser);

    expect(entryRepository.getCountByClasseId).toHaveBeenCalledTimes(1);
    expect(entryRepository.getCountByClasseId).toHaveBeenLastCalledWith(12);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await speciesClassService.getEntriesCountBySpeciesClass("12", null);

    expect(entitiesCountResult).toEqual(err("notAllowed"));
  });
});

describe("Find class by species ID", () => {
  test("should handle a found class", async () => {
    const classData = speciesClassFactory.build();
    const loggedUser = loggedUserFactory.build();

    classRepository.findSpeciesClassBySpeciesId.mockResolvedValueOnce(classData);

    const speciesClassResult = await speciesClassService.findSpeciesClassOfSpecies("43", loggedUser);

    expect(classRepository.findSpeciesClassBySpeciesId).toHaveBeenCalledTimes(1);
    expect(classRepository.findSpeciesClassBySpeciesId).toHaveBeenLastCalledWith(43);
    expect(speciesClassResult.isOk()).toBeTruthy();
    expect(speciesClassResult._unsafeUnwrap()?.id).toEqual(classData.id);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const findResult = await speciesClassService.findSpeciesClassOfSpecies("12", null);

    expect(findResult).toEqual(err("notAllowed"));
  });
});

test("Find all classes", async () => {
  const classesData = speciesClassFactory.buildList(3);

  classRepository.findSpeciesClasses.mockResolvedValueOnce(classesData);

  await speciesClassService.findAllSpeciesClasses();

  expect(classRepository.findSpeciesClasses).toHaveBeenCalledTimes(1);
  expect(classRepository.findSpeciesClasses).toHaveBeenLastCalledWith({
    orderBy: "libelle",
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const classesData = speciesClassFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    classRepository.findSpeciesClasses.mockResolvedValueOnce(classesData);

    await speciesClassService.findPaginatedSpeciesClasses(loggedUser, {});

    expect(classRepository.findSpeciesClasses).toHaveBeenCalledTimes(1);
    expect(classRepository.findSpeciesClasses).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated classes", async () => {
    const classesData = speciesClassFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: ClassesSearchParams = {
      orderBy: "libelle",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    classRepository.findSpeciesClasses.mockResolvedValueOnce(classesData);

    await speciesClassService.findPaginatedSpeciesClasses(loggedUser, searchParams);

    expect(classRepository.findSpeciesClasses).toHaveBeenCalledTimes(1);
    expect(classRepository.findSpeciesClasses).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: "libelle",
      sortOrder: "desc",
      offset: 0,
      limit: searchParams.pageSize,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesPaginatedResult = await speciesClassService.findPaginatedSpeciesClasses(null, {});

    expect(entitiesPaginatedResult).toEqual(err("notAllowed"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesClassService.getSpeciesClassesCount(loggedUser);

    expect(classRepository.getCount).toHaveBeenCalledTimes(1);
    expect(classRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesClassService.getSpeciesClassesCount(loggedUser, "test");

    expect(classRepository.getCount).toHaveBeenCalledTimes(1);
    expect(classRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await speciesClassService.getSpeciesClassesCount(null);

    expect(entitiesCountResult).toEqual(err("notAllowed"));
  });
});

describe("Update of a class", () => {
  test("should be allowed when requested by an admin", async () => {
    const classData = upsertSpeciesClassInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    classRepository.updateSpeciesClass.mockResolvedValueOnce(ok(speciesClassFactory.build()));

    await speciesClassService.updateSpeciesClass(12, classData, loggedUser);

    expect(classRepository.updateSpeciesClass).toHaveBeenCalledTimes(1);
    expect(classRepository.updateSpeciesClass).toHaveBeenLastCalledWith(12, classData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = speciesClassFactory.build({
      ownerId: "notAdmin",
    });

    const classData = upsertSpeciesClassInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    classRepository.findSpeciesClassById.mockResolvedValueOnce(existingData);
    classRepository.updateSpeciesClass.mockResolvedValueOnce(ok(speciesClassFactory.build()));

    await speciesClassService.updateSpeciesClass(12, classData, loggedUser);

    expect(classRepository.updateSpeciesClass).toHaveBeenCalledTimes(1);
    expect(classRepository.updateSpeciesClass).toHaveBeenLastCalledWith(12, classData);
  });

  test("should not be allowed when requested by an user that is nor owner nor admin", async () => {
    const existingData = speciesClassFactory.build({
      ownerId: "notAdmin",
    });

    const classData = upsertSpeciesClassInputFactory.build();

    const loggedUser = {
      id: "Bob",
      role: "contributor",
    } as const;

    classRepository.findSpeciesClassById.mockResolvedValueOnce(existingData);

    const updateResult = await speciesClassService.updateSpeciesClass(12, classData, loggedUser);

    expect(updateResult).toEqual(err("notAllowed"));
    expect(classRepository.updateSpeciesClass).not.toHaveBeenCalled();
  });

  test("should not be allowed when trying to update to a class that exists", async () => {
    const classData = upsertSpeciesClassInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    classRepository.updateSpeciesClass.mockResolvedValueOnce(err("alreadyExists"));

    const updateResult = await speciesClassService.updateSpeciesClass(12, classData, loggedUser);

    expect(updateResult).toEqual(err("alreadyExists"));
    expect(classRepository.updateSpeciesClass).toHaveBeenCalledTimes(1);
    expect(classRepository.updateSpeciesClass).toHaveBeenLastCalledWith(12, classData);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const classData = upsertSpeciesClassInputFactory.build();

    const updateResult = await speciesClassService.updateSpeciesClass(12, classData, null);

    expect(updateResult).toEqual(err("notAllowed"));
    expect(classRepository.updateSpeciesClass).not.toHaveBeenCalled();
  });
});

describe("Creation of a class", () => {
  test("should create new class", async () => {
    const classData = upsertSpeciesClassInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "a" });

    classRepository.createSpeciesClass.mockResolvedValueOnce(ok(speciesClassFactory.build()));

    await speciesClassService.createSpeciesClass(classData, loggedUser);

    expect(classRepository.createSpeciesClass).toHaveBeenCalledTimes(1);
    expect(classRepository.createSpeciesClass).toHaveBeenLastCalledWith({
      ...classData,
      ownerId: loggedUser.id,
    });
  });

  test("should not be allowed when trying to create a class that already exists", async () => {
    const classData = upsertSpeciesClassInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "a" });

    classRepository.createSpeciesClass.mockResolvedValueOnce(err("alreadyExists"));

    const createResult = await speciesClassService.createSpeciesClass(classData, loggedUser);

    expect(createResult).toEqual(err("alreadyExists"));
    expect(classRepository.createSpeciesClass).toHaveBeenCalledTimes(1);
    expect(classRepository.createSpeciesClass).toHaveBeenLastCalledWith({
      ...classData,
      ownerId: loggedUser.id,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    const classData = upsertSpeciesClassInputFactory.build();

    const createResult = await speciesClassService.createSpeciesClass(classData, null);

    expect(createResult).toEqual(err("notAllowed"));
    expect(classRepository.createSpeciesClass).not.toHaveBeenCalled();
  });
});

describe("Deletion of a class", () => {
  test("should handle the deletion of an owned class", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const speciesClass = speciesClassFactory.build({
      ownerId: loggedUser.id,
    });

    classRepository.findSpeciesClassById.mockResolvedValueOnce(speciesClass);

    await speciesClassService.deleteSpeciesClass(11, loggedUser);

    expect(classRepository.deleteSpeciesClassById).toHaveBeenCalledTimes(1);
    expect(classRepository.deleteSpeciesClassById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any class if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    classRepository.findSpeciesClassById.mockResolvedValueOnce(speciesClassFactory.build());

    await speciesClassService.deleteSpeciesClass(11, loggedUser);

    expect(classRepository.deleteSpeciesClassById).toHaveBeenCalledTimes(1);
    expect(classRepository.deleteSpeciesClassById).toHaveBeenLastCalledWith(11);
  });

  test("should not be allowed when deleting a non-owned class as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "contributor",
    });

    classRepository.findSpeciesClassById.mockResolvedValueOnce(speciesClassFactory.build());

    const deleteResult = await speciesClassService.deleteSpeciesClass(11, loggedUser);

    expect(deleteResult).toEqual(err("notAllowed"));
    expect(classRepository.deleteSpeciesClassById).not.toHaveBeenCalled();
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await speciesClassService.deleteSpeciesClass(11, null);

    expect(deleteResult).toEqual(err("notAllowed"));
    expect(classRepository.deleteSpeciesClassById).not.toHaveBeenCalled();
  });
});

test("Create multiple classes", async () => {
  const classesData = upsertSpeciesClassInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  classRepository.createSpeciesClasses.mockResolvedValueOnce([]);

  await speciesClassService.createMultipleSpeciesClasses(classesData, loggedUser);

  expect(classRepository.createSpeciesClasses).toHaveBeenCalledTimes(1);
  expect(classRepository.createSpeciesClasses).toHaveBeenLastCalledWith(
    classesData.map((speciesClass) => {
      return {
        ...speciesClass,
        ownerId: loggedUser.id,
      };
    })
  );
});
