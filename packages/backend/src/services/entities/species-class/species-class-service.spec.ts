import { type LoggedUser } from "@domain/user/logged-user.js";
import { speciesClassFactory } from "@fixtures/domain/species-class/species-class.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertSpeciesClassInputFactory } from "@fixtures/services/species-class/species-class-service.fixtures.js";
import { type ClassesSearchParams } from "@ou-ca/common/api/species-class";
import { err, ok } from "neverthrow";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { mock } from "vitest-mock-extended";
import { type ClasseCreateInput } from "../../../repositories/classe/classe-repository-types.js";
import { type ClasseRepository } from "../../../repositories/classe/classe-repository.js";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { type EspeceRepository } from "../../../repositories/espece/espece-repository.js";
import { mockVi } from "../../../utils/mock.js";
import { buildSpeciesClassService } from "./species-class-service.js";

const classRepository = mockVi<ClasseRepository>();
const speciesRepository = mockVi<EspeceRepository>();
const entryRepository = mockVi<DonneeRepository>();

const speciesClassService = buildSpeciesClassService({
  classRepository,
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

describe("Find class", () => {
  test("should handle a matching class", async () => {
    const classData = speciesClassFactory.build();
    const loggedUser = loggedUserFactory.build();

    classRepository.findClasseById.mockResolvedValueOnce(classData);

    await speciesClassService.findSpeciesClass(12, loggedUser);

    expect(classRepository.findClasseById).toHaveBeenCalledTimes(1);
    expect(classRepository.findClasseById).toHaveBeenLastCalledWith(12);
  });

  test("should handle class not found", async () => {
    classRepository.findClasseById.mockResolvedValueOnce(null);
    const loggedUser = loggedUserFactory.build();

    await expect(speciesClassService.findSpeciesClass(10, loggedUser)).resolves.toEqual(ok(null));

    expect(classRepository.findClasseById).toHaveBeenCalledTimes(1);
    expect(classRepository.findClasseById).toHaveBeenLastCalledWith(10);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await speciesClassService.findSpeciesClass(11, null);

    expect(findResult).toEqual(err("notAllowed"));
    expect(classRepository.findClasseById).not.toHaveBeenCalled();
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

    classRepository.findClasseByEspeceId.mockResolvedValueOnce(classData);

    const speciesClassResult = await speciesClassService.findSpeciesClassOfSpecies("43", loggedUser);

    expect(classRepository.findClasseByEspeceId).toHaveBeenCalledTimes(1);
    expect(classRepository.findClasseByEspeceId).toHaveBeenLastCalledWith(43);
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

  classRepository.findClasses.mockResolvedValueOnce(classesData);

  await speciesClassService.findAllSpeciesClasses();

  expect(classRepository.findClasses).toHaveBeenCalledTimes(1);
  expect(classRepository.findClasses).toHaveBeenLastCalledWith({
    orderBy: "libelle",
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const classesData = speciesClassFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    classRepository.findClasses.mockResolvedValueOnce(classesData);

    await speciesClassService.findPaginatedSpeciesClasses(loggedUser, {});

    expect(classRepository.findClasses).toHaveBeenCalledTimes(1);
    expect(classRepository.findClasses).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated classes", async () => {
    const classesData = speciesClassFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams = mock<ClassesSearchParams>({
      orderBy: "libelle",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    });

    classRepository.findClasses.mockResolvedValueOnce(classesData);

    await speciesClassService.findPaginatedSpeciesClasses(loggedUser, searchParams);

    expect(classRepository.findClasses).toHaveBeenCalledTimes(1);
    expect(classRepository.findClasses).toHaveBeenLastCalledWith({
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

    await speciesClassService.updateSpeciesClass(12, classData, loggedUser);

    expect(classRepository.updateClasse).toHaveBeenCalledTimes(1);
    expect(classRepository.updateClasse).toHaveBeenLastCalledWith(12, classData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = speciesClassFactory.build({
      ownerId: "notAdmin",
    });

    const classData = upsertSpeciesClassInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    classRepository.findClasseById.mockResolvedValueOnce(existingData);

    await speciesClassService.updateSpeciesClass(12, classData, loggedUser);

    expect(classRepository.updateClasse).toHaveBeenCalledTimes(1);
    expect(classRepository.updateClasse).toHaveBeenLastCalledWith(12, classData);
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

    classRepository.findClasseById.mockResolvedValueOnce(existingData);

    const updateResult = await speciesClassService.updateSpeciesClass(12, classData, loggedUser);

    expect(updateResult).toEqual(err("notAllowed"));
    expect(classRepository.updateClasse).not.toHaveBeenCalled();
  });

  test("should not be allowed when trying to update to a class that exists", async () => {
    const classData = upsertSpeciesClassInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    classRepository.updateClasse.mockImplementation(uniqueConstraintFailed);

    const updateResult = await speciesClassService.updateSpeciesClass(12, classData, loggedUser);

    expect(updateResult).toEqual(err("alreadyExists"));
    expect(classRepository.updateClasse).toHaveBeenCalledTimes(1);
    expect(classRepository.updateClasse).toHaveBeenLastCalledWith(12, classData);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const classData = upsertSpeciesClassInputFactory.build();

    const updateResult = await speciesClassService.updateSpeciesClass(12, classData, null);

    expect(updateResult).toEqual(err("notAllowed"));
    expect(classRepository.updateClasse).not.toHaveBeenCalled();
  });
});

describe("Creation of a class", () => {
  test("should create new class", async () => {
    const classData = upsertSpeciesClassInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "a" });

    await speciesClassService.createSpeciesClass(classData, loggedUser);

    expect(classRepository.createClasse).toHaveBeenCalledTimes(1);
    expect(classRepository.createClasse).toHaveBeenLastCalledWith({
      ...classData,
      owner_id: loggedUser.id,
    });
  });

  test("should not be allowed when trying to create a class that already exists", async () => {
    const classData = upsertSpeciesClassInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "a" });

    classRepository.createClasse.mockImplementation(uniqueConstraintFailed);

    const createResult = await speciesClassService.createSpeciesClass(classData, loggedUser);

    expect(createResult).toEqual(err("alreadyExists"));
    expect(classRepository.createClasse).toHaveBeenCalledTimes(1);
    expect(classRepository.createClasse).toHaveBeenLastCalledWith({
      ...classData,
      owner_id: loggedUser.id,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    const classData = upsertSpeciesClassInputFactory.build();

    const createResult = await speciesClassService.createSpeciesClass(classData, null);

    expect(createResult).toEqual(err("notAllowed"));
    expect(classRepository.createClasse).not.toHaveBeenCalled();
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

    classRepository.findClasseById.mockResolvedValueOnce(speciesClass);

    await speciesClassService.deleteSpeciesClass(11, loggedUser);

    expect(classRepository.deleteClasseById).toHaveBeenCalledTimes(1);
    expect(classRepository.deleteClasseById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any class if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    classRepository.findClasseById.mockResolvedValueOnce(speciesClassFactory.build());

    await speciesClassService.deleteSpeciesClass(11, loggedUser);

    expect(classRepository.deleteClasseById).toHaveBeenCalledTimes(1);
    expect(classRepository.deleteClasseById).toHaveBeenLastCalledWith(11);
  });

  test("should not be allowed when deleting a non-owned class as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "contributor",
    });

    classRepository.findClasseById.mockResolvedValueOnce(speciesClassFactory.build());

    const deleteResult = await speciesClassService.deleteSpeciesClass(11, loggedUser);

    expect(deleteResult).toEqual(err("notAllowed"));
    expect(classRepository.deleteClasseById).not.toHaveBeenCalled();
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await speciesClassService.deleteSpeciesClass(11, null);

    expect(deleteResult).toEqual(err("notAllowed"));
    expect(classRepository.deleteClasseById).not.toHaveBeenCalled();
  });
});

test("Create multiple classes", async () => {
  const classesData = [
    mock<Omit<ClasseCreateInput, "owner_id">>(),
    mock<Omit<ClasseCreateInput, "owner_id">>(),
    mock<Omit<ClasseCreateInput, "owner_id">>(),
  ];

  const loggedUser = loggedUserFactory.build();

  classRepository.createClasses.mockResolvedValueOnce([]);

  await speciesClassService.createMultipleSpeciesClasses(classesData, loggedUser);

  expect(classRepository.createClasses).toHaveBeenCalledTimes(1);
  expect(classRepository.createClasses).toHaveBeenLastCalledWith(
    classesData.map((speciesClass) => {
      return {
        ...speciesClass,
        owner_id: loggedUser.id,
      };
    })
  );
});
