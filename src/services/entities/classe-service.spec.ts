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

test("should call readonly status when retrieving one class ", async () => {
  const classData: Classe = mock<Classe>();

  prismaMock.classe.findUnique.mockResolvedValueOnce(classData);

  await findClasse(classData.id);

  expect(prismaMock.classe.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.classe.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: classData.id,
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
});

test("should handle class not found ", async () => {
  prismaMock.classe.findUnique.mockResolvedValueOnce(null);

  await expect(findClasse(10)).resolves.toBe(null);

  expect(prismaMock.classe.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.classe.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: 10,
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(0);
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
  expect(isEntityReadOnly).toHaveBeenCalledTimes(0);
  expect(classe).toBeNull();
});

test("should call readonly status when retrieving classes by params ", async () => {
  const classesData = [mock<Classe>(), mock<Classe>(), mock<Classe>()];

  prismaMock.classe.findMany.mockResolvedValueOnce(classesData);

  await findClasses();

  expect(prismaMock.classe.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.classe.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      libelle: {
        contains: undefined,
      },
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(classesData.length);
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

test("should update an existing class as an admin ", async () => {
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

test("should update an existing class if owner ", async () => {
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

test("should throw an error when updating an existing class and nor owner nor admin ", async () => {
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

  expect(prismaMock.classe.update).toHaveBeenCalledTimes(0);
});

test("should throw an error when trying to update a class that exists", async () => {
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

test("should create new class ", async () => {
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

test("should throw an error when trying to create a class that exists", async () => {
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

test("should be able to delete an owned class", async () => {
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

test("should be able to delete any class if admin", async () => {
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

  expect(prismaMock.classe.delete).toHaveBeenCalledTimes(0);
});

test("should create new classes", async () => {
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
