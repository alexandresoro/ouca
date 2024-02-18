import { OucaError } from "@domain/errors/ouca-error.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { speciesClassFactory } from "@fixtures/domain/species-class/species-class.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { type ClassesSearchParams, type UpsertClassInput } from "@ou-ca/common/api/species-class";
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

    await speciesClassService.findClasse(12, loggedUser);

    expect(classRepository.findClasseById).toHaveBeenCalledTimes(1);
    expect(classRepository.findClasseById).toHaveBeenLastCalledWith(12);
  });

  test("should handle class not found", async () => {
    classRepository.findClasseById.mockResolvedValueOnce(null);
    const loggedUser = loggedUserFactory.build();

    await expect(speciesClassService.findClasse(10, loggedUser)).resolves.toBe(null);

    expect(classRepository.findClasseById).toHaveBeenCalledTimes(1);
    expect(classRepository.findClasseById).toHaveBeenLastCalledWith(10);
  });

  test("should not be allowed when the no login details are provided", async () => {
    await expect(speciesClassService.findClasse(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(classRepository.findClasseById).not.toHaveBeenCalled();
  });
});

describe("Species count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesClassService.getEspecesCountByClasse("12", loggedUser);

    expect(speciesRepository.getCountByClasseId).toHaveBeenCalledTimes(1);
    expect(speciesRepository.getCountByClasseId).toHaveBeenLastCalledWith(12);
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(speciesClassService.getEspecesCountByClasse("12", null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesClassService.getDonneesCountByClasse("12", loggedUser);

    expect(entryRepository.getCountByClasseId).toHaveBeenCalledTimes(1);
    expect(entryRepository.getCountByClasseId).toHaveBeenLastCalledWith(12);
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(speciesClassService.getDonneesCountByClasse("12", null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Find class by species ID", () => {
  test("should handle a found class", async () => {
    const classData = speciesClassFactory.build({
      id: "256",
    });
    const loggedUser = loggedUserFactory.build();

    classRepository.findClasseByEspeceId.mockResolvedValueOnce(classData);

    const classe = await speciesClassService.findClasseOfEspeceId("43", loggedUser);

    expect(classRepository.findClasseByEspeceId).toHaveBeenCalledTimes(1);
    expect(classRepository.findClasseByEspeceId).toHaveBeenLastCalledWith(43);
    expect(classe?.id).toEqual("256");
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(speciesClassService.findClasseOfEspeceId("12", null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all classes", async () => {
  const classesData = speciesClassFactory.buildList(3);

  classRepository.findClasses.mockResolvedValueOnce(classesData);

  await speciesClassService.findAllClasses();

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

    await speciesClassService.findPaginatedClasses(loggedUser, {});

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

    await speciesClassService.findPaginatedClasses(loggedUser, searchParams);

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
    await expect(speciesClassService.findPaginatedClasses(null, {})).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesClassService.getClassesCount(loggedUser);

    expect(classRepository.getCount).toHaveBeenCalledTimes(1);
    expect(classRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesClassService.getClassesCount(loggedUser, "test");

    expect(classRepository.getCount).toHaveBeenCalledTimes(1);
    expect(classRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(speciesClassService.getClassesCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of a class", () => {
  test("should be allowed when requested by an admin", async () => {
    const classData = mock<UpsertClassInput>();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    await speciesClassService.updateClasse(12, classData, loggedUser);

    expect(classRepository.updateClasse).toHaveBeenCalledTimes(1);
    expect(classRepository.updateClasse).toHaveBeenLastCalledWith(12, classData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = speciesClassFactory.build({
      ownerId: "notAdmin",
    });

    const classData = mock<UpsertClassInput>();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    classRepository.findClasseById.mockResolvedValueOnce(existingData);

    await speciesClassService.updateClasse(12, classData, loggedUser);

    expect(classRepository.updateClasse).toHaveBeenCalledTimes(1);
    expect(classRepository.updateClasse).toHaveBeenLastCalledWith(12, classData);
  });

  test("should not be allowed when requested by an user that is nor owner nor admin", async () => {
    const existingData = speciesClassFactory.build({
      ownerId: "notAdmin",
    });

    const classData = mock<UpsertClassInput>();

    const loggedUser = {
      id: "Bob",
      role: "contributor",
    } as const;

    classRepository.findClasseById.mockResolvedValueOnce(existingData);

    await expect(speciesClassService.updateClasse(12, classData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0001")
    );

    expect(classRepository.updateClasse).not.toHaveBeenCalled();
  });

  test("should not be allowed when trying to update to a class that exists", async () => {
    const classData = mock<UpsertClassInput>();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    classRepository.updateClasse.mockImplementation(uniqueConstraintFailed);

    await expect(() => speciesClassService.updateClasse(12, classData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(classRepository.updateClasse).toHaveBeenCalledTimes(1);
    expect(classRepository.updateClasse).toHaveBeenLastCalledWith(12, classData);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const classData = mock<UpsertClassInput>();

    await expect(speciesClassService.updateClasse(12, classData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(classRepository.updateClasse).not.toHaveBeenCalled();
  });
});

describe("Creation of a class", () => {
  test("should create new class", async () => {
    const classData = mock<UpsertClassInput>();

    const loggedUser = loggedUserFactory.build({ id: "a" });

    await speciesClassService.createClasse(classData, loggedUser);

    expect(classRepository.createClasse).toHaveBeenCalledTimes(1);
    expect(classRepository.createClasse).toHaveBeenLastCalledWith({
      ...classData,
      owner_id: loggedUser.id,
    });
  });

  test("should not be allowed when trying to create a class that already exists", async () => {
    const classData = mock<UpsertClassInput>();

    const loggedUser = loggedUserFactory.build({ id: "a" });

    classRepository.createClasse.mockImplementation(uniqueConstraintFailed);

    await expect(() => speciesClassService.createClasse(classData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(classRepository.createClasse).toHaveBeenCalledTimes(1);
    expect(classRepository.createClasse).toHaveBeenLastCalledWith({
      ...classData,
      owner_id: loggedUser.id,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    const classData = mock<UpsertClassInput>();

    await expect(speciesClassService.createClasse(classData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(classRepository.createClasse).not.toHaveBeenCalled();
  });
});

describe("Deletion of a class", () => {
  test("should handle the deletion of an owned class", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const classe = speciesClassFactory.build({
      ownerId: loggedUser.id,
    });

    classRepository.findClasseById.mockResolvedValueOnce(classe);

    await speciesClassService.deleteClasse(11, loggedUser);

    expect(classRepository.deleteClasseById).toHaveBeenCalledTimes(1);
    expect(classRepository.deleteClasseById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any class if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    classRepository.findClasseById.mockResolvedValueOnce(speciesClassFactory.build());

    await speciesClassService.deleteClasse(11, loggedUser);

    expect(classRepository.deleteClasseById).toHaveBeenCalledTimes(1);
    expect(classRepository.deleteClasseById).toHaveBeenLastCalledWith(11);
  });

  test("should return an error when deleting a non-owned class as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "contributor",
    });

    classRepository.findClasseById.mockResolvedValueOnce(speciesClassFactory.build());

    await expect(speciesClassService.deleteClasse(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(classRepository.deleteClasseById).not.toHaveBeenCalled();
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(speciesClassService.deleteClasse(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
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

  await speciesClassService.createClasses(classesData, loggedUser);

  expect(classRepository.createClasses).toHaveBeenCalledTimes(1);
  expect(classRepository.createClasses).toHaveBeenLastCalledWith(
    classesData.map((classe) => {
      return {
        ...classe,
        owner_id: loggedUser.id,
      };
    })
  );
});
