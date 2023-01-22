import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { mock } from "vitest-mock-extended";
import {
  ClassesOrderBy,
  SortOrder,
  type MutationUpsertClasseArgs,
  type QueryClassesArgs,
} from "../../graphql/generated/graphql-types.js";
import { type Classe, type ClasseCreateInput } from "../../repositories/classe/classe-repository-types.js";
import { type ClasseRepository } from "../../repositories/classe/classe-repository.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type EspeceRepository } from "../../repositories/espece/espece-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { COLUMN_LIBELLE } from "../../utils/constants.js";
import { OucaError } from "../../utils/errors.js";
import { buildClasseService } from "./classe-service.js";

const classeRepository = mock<ClasseRepository>({});
const especeRepository = mock<EspeceRepository>({});
const donneeRepository = mock<DonneeRepository>({});
const logger = mock<Logger>();

const classeService = buildClasseService({
  logger,
  classeRepository,
  especeRepository,
  donneeRepository,
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
    const classData: Classe = mock<Classe>();
    const loggedUser = mock<LoggedUser>();

    classeRepository.findClasseById.mockResolvedValueOnce(classData);

    await classeService.findClasse(classData.id, loggedUser);

    expect(classeRepository.findClasseById).toHaveBeenCalledTimes(1);
    expect(classeRepository.findClasseById).toHaveBeenLastCalledWith(classData.id);
  });

  test("should handle class not found", async () => {
    classeRepository.findClasseById.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(classeService.findClasse(10, loggedUser)).resolves.toBe(null);

    expect(classeRepository.findClasseById).toHaveBeenCalledTimes(1);
    expect(classeRepository.findClasseById).toHaveBeenLastCalledWith(10);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(classeService.findClasse(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(classeRepository.findClasseById).not.toHaveBeenCalled();
  });
});

describe("Species count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await classeService.getEspecesCountByClasse(12, loggedUser);

    expect(especeRepository.getCountByClasseId).toHaveBeenCalledTimes(1);
    expect(especeRepository.getCountByClasseId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(classeService.getEspecesCountByClasse(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await classeService.getDonneesCountByClasse(12, loggedUser);

    expect(donneeRepository.getCountByClasseId).toHaveBeenCalledTimes(1);
    expect(donneeRepository.getCountByClasseId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(classeService.getDonneesCountByClasse(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Find class by species ID", () => {
  test("should handle a found class", async () => {
    const classData = mock<Classe>({
      id: 256,
    });
    const loggedUser = mock<LoggedUser>();

    classeRepository.findClasseByEspeceId.mockResolvedValueOnce(classData);

    const classe = await classeService.findClasseOfEspeceId(43, loggedUser);

    expect(classeRepository.findClasseByEspeceId).toHaveBeenCalledTimes(1);
    expect(classeRepository.findClasseByEspeceId).toHaveBeenLastCalledWith(43);
    expect(classe?.id).toEqual(256);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(classeService.findClasseOfEspeceId(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all classes", async () => {
  const classesData = [mock<Classe>(), mock<Classe>(), mock<Classe>()];

  classeRepository.findClasses.mockResolvedValueOnce(classesData);

  await classeService.findAllClasses();

  expect(classeRepository.findClasses).toHaveBeenCalledTimes(1);
  expect(classeRepository.findClasses).toHaveBeenLastCalledWith({
    orderBy: COLUMN_LIBELLE,
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const classesData = [mock<Classe>(), mock<Classe>(), mock<Classe>()];
    const loggedUser = mock<LoggedUser>();

    classeRepository.findClasses.mockResolvedValueOnce(classesData);

    await classeService.findPaginatedClasses(loggedUser);

    expect(classeRepository.findClasses).toHaveBeenCalledTimes(1);
    expect(classeRepository.findClasses).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated classes ", async () => {
    const classesData = [mock<Classe>(), mock<Classe>(), mock<Classe>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams = mock<QueryClassesArgs>({
      orderBy: ClassesOrderBy.Libelle,
      sortOrder: SortOrder.Desc,
      searchParams: {
        q: "Bob",
        pageNumber: 0,
        pageSize: 10,
      },
    });

    classeRepository.findClasses.mockResolvedValueOnce(classesData);

    await classeService.findPaginatedClasses(loggedUser, searchParams);

    expect(classeRepository.findClasses).toHaveBeenCalledTimes(1);
    expect(classeRepository.findClasses).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: COLUMN_LIBELLE,
      sortOrder: SortOrder.Desc,
      offset: searchParams.searchParams?.pageNumber,
      limit: searchParams.searchParams?.pageSize,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(classeService.findPaginatedClasses(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await classeService.getClassesCount(loggedUser);

    expect(classeRepository.getCount).toHaveBeenCalledTimes(1);
    expect(classeRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await classeService.getClassesCount(loggedUser, "test");

    expect(classeRepository.getCount).toHaveBeenCalledTimes(1);
    expect(classeRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(classeService.getClassesCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of a class", () => {
  test("should be allowed when requested by an admin", async () => {
    const classData = mock<MutationUpsertClasseArgs>();

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    await classeService.upsertClasse(classData, loggedUser);

    expect(classeRepository.updateClasse).toHaveBeenCalledTimes(1);
    expect(classeRepository.updateClasse).toHaveBeenLastCalledWith(classData.id, classData.data);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = mock<Classe>({
      ownerId: "notAdmin",
    });

    const classData = mock<MutationUpsertClasseArgs>();

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    classeRepository.findClasseById.mockResolvedValueOnce(existingData);

    await classeService.upsertClasse(classData, loggedUser);

    expect(classeRepository.updateClasse).toHaveBeenCalledTimes(1);
    expect(classeRepository.updateClasse).toHaveBeenLastCalledWith(classData.id, classData.data);
  });

  test("should throw an error when requested by an user that is nor owner nor admin", async () => {
    const existingData = mock<Classe>({
      ownerId: "notAdmin",
    });

    const classData = mock<MutationUpsertClasseArgs>();

    const loggedUser = {
      id: "Bob",
      role: "contributor",
    } as const;

    classeRepository.findClasseById.mockResolvedValueOnce(existingData);

    await expect(classeService.upsertClasse(classData, loggedUser)).rejects.toThrowError(new OucaError("OUCA0001"));

    expect(classeRepository.updateClasse).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to a class that exists", async () => {
    const classData = mock<MutationUpsertClasseArgs>({
      id: 12,
    });

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    classeRepository.updateClasse.mockImplementation(uniqueConstraintFailed);

    await expect(() => classeService.upsertClasse(classData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(classeRepository.updateClasse).toHaveBeenCalledTimes(1);
    expect(classeRepository.updateClasse).toHaveBeenLastCalledWith(classData.id, classData.data);
  });

  test("should throw an error when the requester is not logged", async () => {
    const classData = mock<MutationUpsertClasseArgs>({
      id: 12,
    });

    await expect(classeService.upsertClasse(classData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(classeRepository.updateClasse).not.toHaveBeenCalled();
  });
});

describe("Creation of a class", () => {
  test("should create new class", async () => {
    const classData = mock<MutationUpsertClasseArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    await classeService.upsertClasse(classData, loggedUser);

    expect(classeRepository.createClasse).toHaveBeenCalledTimes(1);
    expect(classeRepository.createClasse).toHaveBeenLastCalledWith({
      ...classData.data,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when trying to create a class that already exists", async () => {
    const classData = mock<MutationUpsertClasseArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    classeRepository.createClasse.mockImplementation(uniqueConstraintFailed);

    await expect(() => classeService.upsertClasse(classData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(classeRepository.createClasse).toHaveBeenCalledTimes(1);
    expect(classeRepository.createClasse).toHaveBeenLastCalledWith({
      ...classData.data,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const classData = mock<MutationUpsertClasseArgs>({
      id: undefined,
    });

    await expect(classeService.upsertClasse(classData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(classeRepository.createClasse).not.toHaveBeenCalled();
  });
});

describe("Deletion of a class", () => {
  test("should handle the deletion of an owned class", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const classe = mock<Classe>({
      ownerId: loggedUser.id,
    });

    classeRepository.findClasseById.mockResolvedValueOnce(classe);

    await classeService.deleteClasse(11, loggedUser);

    expect(classeRepository.deleteClasseById).toHaveBeenCalledTimes(1);
    expect(classeRepository.deleteClasseById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any class if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "admin",
    });

    classeRepository.findClasseById.mockResolvedValueOnce(mock<Classe>());

    await classeService.deleteClasse(11, loggedUser);

    expect(classeRepository.deleteClasseById).toHaveBeenCalledTimes(1);
    expect(classeRepository.deleteClasseById).toHaveBeenLastCalledWith(11);
  });

  test("should return an error when deleting a non-owned class as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "contributor",
    });

    classeRepository.findClasseById.mockResolvedValueOnce(mock<Classe>());

    await expect(classeService.deleteClasse(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(classeRepository.deleteClasseById).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(classeService.deleteClasse(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(classeRepository.deleteClasseById).not.toHaveBeenCalled();
  });
});

test("Create multiple classes", async () => {
  const classesData = [
    mock<Omit<ClasseCreateInput, "owner_id">>(),
    mock<Omit<ClasseCreateInput, "owner_id">>(),
    mock<Omit<ClasseCreateInput, "owner_id">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  await classeService.createClasses(classesData, loggedUser);

  expect(classeRepository.createClasses).toHaveBeenCalledTimes(1);
  expect(classeRepository.createClasses).toHaveBeenLastCalledWith(
    classesData.map((classe) => {
      return {
        ...classe,
        owner_id: loggedUser.id,
      };
    })
  );
});
