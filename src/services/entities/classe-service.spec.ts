import { Classe, DatabaseRole, Espece, Prisma } from "@prisma/client";
import { mock, mockDeep } from "jest-mock-extended";
import { MutationUpsertClasseArgs, QueryPaginatedClassesArgs } from "../../graphql/generated/graphql-types";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import {
  createClasses,
  deleteClasse,
  findClasse,
  findClasseOfEspeceId,
  findClasses,
  findPaginatedClasses,
  getClassesCount,
  getDonneesCountByClasse,
  upsertClasse,
} from "./classe-service";
import { isEntityReadOnly, queryParametersToFindAllEntities } from "./entities-utils";

jest.mock<typeof import("./entities-utils")>("./entities-utils", () => {
  const actualModule = jest.requireActual<typeof import("./entities-utils")>("./entities-utils");
  return {
    __esModule: true,
    ...actualModule,
    isEntityReadOnly: jest.fn(),
  };
});

const prismaConstraintFailedError = {
  code: "P2002",
  message: "Prisma error message",
};

const prismaConstraintFailed = () => {
  throw new Prisma.PrismaClientKnownRequestError(
    prismaConstraintFailedError.message,
    prismaConstraintFailedError.code,
    ""
  );
};

describe("Find class", () => {
  test("should handle a matching class", async () => {
    const classData: Classe = mock<Classe>();
    const loggedUser = mock<LoggedUser>();

    prismaMock.classe.findUnique.mockResolvedValueOnce(classData);

    await findClasse(classData.id, loggedUser);

    expect(prismaMock.classe.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.classe.findUnique).toHaveBeenLastCalledWith({
      where: {
        id: classData.id,
      },
    });
  });

  test("should handle class not found", async () => {
    prismaMock.classe.findUnique.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(findClasse(10, loggedUser)).resolves.toBe(null);

    expect(prismaMock.classe.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.classe.findUnique).toHaveBeenLastCalledWith({
      where: {
        id: 10,
      },
    });
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(findClasse(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.classe.findUnique).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await getDonneesCountByClasse(12, loggedUser);

    expect(prismaMock.donnee.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.donnee.count).toHaveBeenLastCalledWith<[Prisma.DonneeCountArgs]>({
      where: {
        espece: {
          classeId: 12,
        },
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(getDonneesCountByClasse(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("should call readonly status when retrieving class by species ID ", async () => {
  const classData = mock<Classe>({
    id: 256,
  });

  const species = mockDeep<Prisma.Prisma__EspeceClient<Espece>>();
  species.classe.mockResolvedValueOnce(classData);

  prismaMock.espece.findUnique.mockReturnValueOnce(species);

  const classe = await findClasseOfEspeceId(43);

  expect(prismaMock.espece.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: 43,
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
  expect(classe?.id).toEqual(256);
});

test("should handle class not found when retrieving class by species ID ", async () => {
  const species = mockDeep<Prisma.Prisma__EspeceClient<Espece>>();
  species.classe.mockResolvedValueOnce(null);

  prismaMock.espece.findUnique.mockReturnValueOnce(species);

  const classe = await findClasseOfEspeceId(43);

  expect(prismaMock.espece.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: 43,
    },
  });
  expect(isEntityReadOnly).not.toHaveBeenCalled();
  expect(classe).toBeNull();
});

test("Find all classes", async () => {
  const classesData = [mock<Classe>(), mock<Classe>(), mock<Classe>()];
  const loggedUser = mock<LoggedUser>();

  prismaMock.classe.findMany.mockResolvedValueOnce(classesData);

  await findClasses(loggedUser);

  expect(prismaMock.classe.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.classe.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      libelle: {
        contains: undefined,
      },
    },
  });
});

test("should call readonly status when retrieving paginated classes ", async () => {
  const classesData = [mock<Classe>(), mock<Classe>(), mock<Classe>()];

  prismaMock.classe.findMany.mockResolvedValueOnce(classesData);

  await findPaginatedClasses();

  expect(prismaMock.classe.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.classe.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    orderBy: undefined,
    where: {},
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(classesData.length);
});

test("should handle params when retrieving paginated classes ", async () => {
  const classesData = [mock<Classe>(), mock<Classe>(), mock<Classe>()];

  const searchParams = mock<QueryPaginatedClassesArgs>({
    orderBy: "libelle",
    sortOrder: "desc",
    searchParams: {
      q: "Bob",
      pageNumber: 0,
      pageSize: 10,
    },
    includeCounts: false,
  });

  prismaMock.classe.findMany.mockResolvedValueOnce(classesData);

  await findPaginatedClasses(searchParams);

  expect(prismaMock.classe.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.classe.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    orderBy: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      [searchParams.orderBy!]: searchParams.sortOrder,
    },
    skip: searchParams.searchParams?.pageNumber,
    take: searchParams.searchParams?.pageSize,
    where: {
      libelle: {
        contains: searchParams.searchParams?.q,
      },
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(classesData.length);
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await getClassesCount(loggedUser);

    expect(prismaMock.classe.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.classe.count).toHaveBeenLastCalledWith({
      where: {},
    });
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await getClassesCount(loggedUser, "test");

    expect(prismaMock.classe.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.classe.count).toHaveBeenLastCalledWith({
      where: {
        libelle: {
          contains: "test",
        },
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(getClassesCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of a class", () => {
  test("should be allowed when requested by an admin", async () => {
    const classData = mock<MutationUpsertClasseArgs>();

    const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });

    await upsertClasse(classData, loggedUser);

    expect(prismaMock.classe.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.classe.update).toHaveBeenLastCalledWith({
      data: classData.data,
      where: {
        id: classData.id,
      },
    });
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = mock<Classe>({
      ownerId: "notAdmin",
    });

    const classData = mock<MutationUpsertClasseArgs>();

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    prismaMock.classe.findFirst.mockResolvedValueOnce(existingData);

    await upsertClasse(classData, loggedUser);

    expect(prismaMock.classe.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.classe.update).toHaveBeenLastCalledWith({
      data: classData.data,
      where: {
        id: classData.id,
      },
    });
  });

  test("should throw an error when requested by an user that is nor owner nor admin", async () => {
    const existingData = mock<Classe>({
      ownerId: "notAdmin",
    });

    const classData = mock<MutationUpsertClasseArgs>();

    const loggedUser = {
      id: "Bob",
      role: DatabaseRole.contributor,
    };

    prismaMock.classe.findFirst.mockResolvedValueOnce(existingData);

    await expect(upsertClasse(classData, loggedUser)).rejects.toThrowError(new OucaError("OUCA0001"));

    expect(prismaMock.classe.update).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to a class that exists", async () => {
    const classData = mock<MutationUpsertClasseArgs>({
      id: 12,
    });

    const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });

    prismaMock.classe.update.mockImplementation(prismaConstraintFailed);

    await expect(() => upsertClasse(classData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", prismaConstraintFailedError)
    );

    expect(prismaMock.classe.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.classe.update).toHaveBeenLastCalledWith({
      data: classData.data,
      where: {
        id: classData.id,
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const classData = mock<MutationUpsertClasseArgs>({
      id: 12,
    });

    await expect(upsertClasse(classData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.classe.update).not.toHaveBeenCalled();
  });
});

describe("Creation of a class", () => {
  test("should create new class", async () => {
    const classData = mock<MutationUpsertClasseArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    await upsertClasse(classData, loggedUser);

    expect(prismaMock.classe.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.classe.create).toHaveBeenLastCalledWith({
      data: {
        ...classData.data,
        ownerId: loggedUser.id,
      },
    });
  });

  test("should throw an error when trying to create a class that already exists", async () => {
    const classData = mock<MutationUpsertClasseArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    prismaMock.classe.create.mockImplementation(prismaConstraintFailed);

    await expect(() => upsertClasse(classData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", prismaConstraintFailedError)
    );

    expect(prismaMock.classe.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.classe.create).toHaveBeenLastCalledWith({
      data: {
        ...classData.data,
        ownerId: loggedUser.id,
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const classData = mock<MutationUpsertClasseArgs>({
      id: undefined,
    });

    await expect(upsertClasse(classData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.classe.create).not.toHaveBeenCalled();
  });
});

describe("Deletion of a class", () => {
  test("should handle the deletion of an owned class", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: DatabaseRole.contributor,
    };

    const classe = mock<Classe>({
      ownerId: loggedUser.id,
    });

    prismaMock.classe.findFirst.mockResolvedValueOnce(classe);

    await deleteClasse(11, loggedUser);

    expect(prismaMock.classe.delete).toHaveBeenCalledTimes(1);
    expect(prismaMock.classe.delete).toHaveBeenLastCalledWith({
      where: {
        id: 11,
      },
    });
  });

  test("should handle the deletion of any class if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: DatabaseRole.admin,
    });

    prismaMock.classe.findFirst.mockResolvedValueOnce(mock<Classe>());

    await deleteClasse(11, loggedUser);

    expect(prismaMock.classe.delete).toHaveBeenCalledTimes(1);
    expect(prismaMock.classe.delete).toHaveBeenLastCalledWith({
      where: {
        id: 11,
      },
    });
  });

  test("should return an error when deleting a non-owned class as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: DatabaseRole.contributor,
    });

    prismaMock.classe.findFirst.mockResolvedValueOnce(mock<Classe>());

    await expect(deleteClasse(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(prismaMock.classe.delete).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(deleteClasse(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.classe.delete).not.toHaveBeenCalled();
  });
});

test("Create multiple classes", async () => {
  const classesData = [
    mock<Omit<Prisma.ClasseCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.ClasseCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.ClasseCreateManyInput, "ownerId">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  await createClasses(classesData, loggedUser);

  expect(prismaMock.classe.createMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.classe.createMany).toHaveBeenLastCalledWith({
    data: classesData.map((classe) => {
      return {
        ...classe,
        ownerId: loggedUser.id,
      };
    }),
  });
});
