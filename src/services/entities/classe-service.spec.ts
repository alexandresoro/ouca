import { Classe, DatabaseRole, Espece, Prisma } from "@prisma/client";
import { QueryPaginatedClassesArgs } from "../../model/graphql";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import {
  deleteClasse,
  findClasse,
  findClasseOfEspeceId,
  findClasses,
  findPaginatedClasses,
  upsertClasse
} from "./classe-service";
import * as entitiesUtils from "./entities-utils";

const isEntityReadOnly = jest.spyOn(entitiesUtils, "isEntityReadOnly");

const prismaConstraintFailedError = {
  code: "P2002",
  message: "Prisma error message"
};

const prismaConstraintFailed = () => {
  throw new Prisma.PrismaClientKnownRequestError(
    prismaConstraintFailedError.message,
    prismaConstraintFailedError.code,
    ""
  );
};

test("should call readonly status when retrieving one class ", async () => {
  const classData: Classe = {
    id: 11,
    libelle: "Batraciens",
    ownerId: "abc"
  };

  prismaMock.classe.findUnique.mockResolvedValueOnce(classData);

  await findClasse(classData.id);

  expect(prismaMock.classe.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.classe.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: classData.id
    }
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
});

test("should handle class not found ", async () => {
  prismaMock.classe.findUnique.mockResolvedValueOnce(null);

  await expect(findClasse(10)).resolves.toBe(null);

  expect(prismaMock.classe.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.classe.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: 10
    }
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(0);
});

test("should call readonly status when retrieving class by species ID ", async () => {
  const classeData: Partial<Classe> = {
    id: 43
  };

  const species: Espece & { classe: () => Partial<Classe> } = {
    id: 43,
    classeId: 11,
    code: "TROTRO",
    nomFrancais: "Troglodyte mignon",
    nomLatin: "Troglodytus mignonus",
    classe: () => {
      return classeData;
    }
  };

  prismaMock.espece.findUnique.mockImplementationOnce(() => species as unknown as Prisma.Prisma__EspeceClient<Espece>);

  const classe = await findClasseOfEspeceId(43);

  expect(prismaMock.espece.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: 43
    }
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
  expect(classe).toMatchObject(classeData);
});

test("should handle class not found when retrieving class by species ID ", async () => {
  const species: Espece & { classe: () => null } = {
    id: 43,
    classeId: 11,
    code: "TROTRO",
    nomFrancais: "Troglodyte mignon",
    nomLatin: "Troglodytus mignonus",
    classe: () => {
      return null;
    }
  };

  prismaMock.espece.findUnique.mockImplementationOnce(() => species as unknown as Prisma.Prisma__EspeceClient<Espece>);

  const classe = await findClasseOfEspeceId(43);

  expect(prismaMock.espece.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: 43
    }
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(0);
  expect(classe).toBeNull();
});

test("should call readonly status when retrieving classes by params ", async () => {
  const classesData: Classe[] = [
    {
      id: 11,
      libelle: "Batraciens",
      ownerId: "abc"
    },
    {
      id: 12,
      libelle: "Oiseaux",
      ownerId: "abc"
    },
    {
      id: 13,
      libelle: "Reptiles",
      ownerId: "abc"
    }
  ];

  prismaMock.classe.findMany.mockResolvedValueOnce(classesData);

  await findClasses();

  expect(prismaMock.classe.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.classe.findMany).toHaveBeenLastCalledWith({
    ...entitiesUtils.queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      libelle: {
        contains: undefined
      }
    }
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(classesData.length);
});

test("should call readonly status when retrieving paginated classes ", async () => {
  const classesData: Classe[] = [
    {
      id: 11,
      libelle: "Batraciens",
      ownerId: "abc"
    },
    {
      id: 12,
      libelle: "Oiseaux",
      ownerId: "abc"
    },
    {
      id: 13,
      libelle: "Reptiles",
      ownerId: "abc"
    }
  ];

  prismaMock.classe.findMany.mockResolvedValueOnce(classesData);

  await findPaginatedClasses();

  expect(prismaMock.classe.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.classe.findMany).toHaveBeenLastCalledWith({
    ...entitiesUtils.queryParametersToFindAllEntities(COLUMN_LIBELLE),
    orderBy: undefined,
    where: {}
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(classesData.length);
});

test("should handle params when retrieving paginated classes ", async () => {
  const classesData: Classe[] = [
    {
      id: 11,
      libelle: "Batraciens",
      ownerId: "abc"
    },
    {
      id: 12,
      libelle: "Oiseaux",
      ownerId: "abc"
    },
    {
      id: 13,
      libelle: "Reptiles",
      ownerId: "abc"
    }
  ];

  const searchParams: QueryPaginatedClassesArgs = {
    orderBy: "libelle",
    sortOrder: "desc",
    searchParams: {
      q: "Bob",
      pageNumber: 0,
      pageSize: 10
    },
    includeCounts: false
  };

  prismaMock.classe.findMany.mockResolvedValueOnce([classesData[0]]);

  await findPaginatedClasses(searchParams);

  expect(prismaMock.classe.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.classe.findMany).toHaveBeenLastCalledWith({
    ...entitiesUtils.queryParametersToFindAllEntities(COLUMN_LIBELLE),
    orderBy: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      [searchParams.orderBy!]: searchParams.sortOrder
    },
    skip: searchParams.searchParams?.pageNumber,
    take: searchParams.searchParams?.pageSize,
    where: {
      libelle: {
        contains: searchParams.searchParams?.q
      }
    }
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
});

test("should update an existing class as an admin ", async () => {
  const classData = {
    id: 12,
    data: {
      libelle: "Batraciens"
    }
  };

  const user = {
    id: "a",
    role: DatabaseRole.admin
  };

  await upsertClasse(classData, user);

  expect(prismaMock.classe.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.classe.update).toHaveBeenLastCalledWith({
    data: classData.data,
    where: {
      id: classData.id
    }
  });
});

test("should update an existing class if owner ", async () => {
  const existingData = {
    id: 12,
    libelle: "Oiseaux",
    ownerId: "notAdmin"
  };

  const classData = {
    id: 12,
    data: {
      libelle: "Batraciens"
    }
  };

  const user = {
    id: "notAdmin",
    role: DatabaseRole.contributor
  };

  prismaMock.classe.findFirst.mockResolvedValueOnce(existingData);

  await upsertClasse(classData, user);

  expect(prismaMock.classe.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.classe.update).toHaveBeenLastCalledWith({
    data: classData.data,
    where: {
      id: classData.id
    }
  });
});

test("should throw an error when updating an existing class and nor owner nor admin ", async () => {
  const existingData = {
    id: 12,
    libelle: "Oiseaux",
    ownerId: "notAdmin"
  };

  const classData = {
    id: 12,
    data: {
      libelle: "Batraciens"
    }
  };

  const user = {
    id: "Bob",
    role: DatabaseRole.contributor
  };

  prismaMock.classe.findFirst.mockResolvedValueOnce(existingData);

  await expect(upsertClasse(classData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

  expect(prismaMock.classe.update).toHaveBeenCalledTimes(0);
});

test("should throw an error when trying to update a class that exists", async () => {
  const classData = {
    id: 12,
    data: {
      libelle: "Batraciens"
    }
  };

  const user = {
    id: "a",
    role: DatabaseRole.admin
  };

  prismaMock.classe.update.mockImplementation(prismaConstraintFailed);

  await expect(() => upsertClasse(classData, user)).rejects.toThrowError(
    new OucaError("OUCA0004", prismaConstraintFailedError)
  );

  expect(prismaMock.classe.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.classe.update).toHaveBeenLastCalledWith({
    data: classData.data,
    where: {
      id: classData.id
    }
  });
});

test("should create new class ", async () => {
  const classData = {
    data: {
      libelle: "Batraciens"
    }
  };

  const user = {
    id: "a",
    role: DatabaseRole.contributor
  };

  await upsertClasse(classData, user);

  expect(prismaMock.classe.create).toHaveBeenCalledTimes(1);
  expect(prismaMock.classe.create).toHaveBeenLastCalledWith({
    data: {
      ...classData.data,
      ownerId: user.id
    }
  });
});

test("should throw an error when trying to create a class that exists", async () => {
  const classData = {
    data: {
      libelle: "Batraciens"
    }
  };

  const user = {
    id: "a",
    role: DatabaseRole.contributor
  };

  prismaMock.classe.create.mockImplementation(prismaConstraintFailed);

  await expect(() => upsertClasse(classData, user)).rejects.toThrowError(
    new OucaError("OUCA0004", prismaConstraintFailedError)
  );

  expect(prismaMock.classe.create).toHaveBeenCalledTimes(1);
  expect(prismaMock.classe.create).toHaveBeenLastCalledWith({
    data: {
      ...classData.data,
      ownerId: user.id
    }
  });
});

test("should be able to delete an owned class", async () => {
  const loggedUser: LoggedUser = {
    id: "12",
    role: DatabaseRole.contributor
  };

  prismaMock.classe.findFirst.mockResolvedValueOnce({
    id: 11,
    libelle: "Batraciens",
    ownerId: "12"
  });

  await deleteClasse(11, loggedUser);

  expect(prismaMock.classe.delete).toHaveBeenCalledTimes(1);
  expect(prismaMock.classe.delete).toHaveBeenLastCalledWith({
    where: {
      id: 11
    }
  });
});

test("should be able to delete any class if admin", async () => {
  const loggedUser: LoggedUser = {
    id: "12",
    role: DatabaseRole.admin
  };

  prismaMock.classe.findFirst.mockResolvedValueOnce({
    id: 11,
    libelle: "Batraciens",
    ownerId: "54"
  });

  await deleteClasse(11, loggedUser);

  expect(prismaMock.classe.delete).toHaveBeenCalledTimes(1);
  expect(prismaMock.classe.delete).toHaveBeenLastCalledWith({
    where: {
      id: 11
    }
  });
});

test("should return an error when deleting a non-owned class as non-admin", async () => {
  const loggedUser: LoggedUser = {
    id: "12",
    role: DatabaseRole.contributor
  };

  prismaMock.classe.findFirst.mockResolvedValueOnce({
    id: 11,
    libelle: "Batraciens",
    ownerId: "54"
  });

  await expect(deleteClasse(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

  expect(prismaMock.classe.delete).toHaveBeenCalledTimes(0);
});
