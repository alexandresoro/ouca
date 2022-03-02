import { DatabaseRole, Prisma, Sexe } from "@prisma/client";
import { QueryPaginatedSexesArgs } from "../../model/graphql";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import * as entitiesUtils from "./entities-utils";
import { deleteSexe, findPaginatedSexes, findSexe, findSexes, upsertSexe } from "./sexe-service";

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

test("should call readonly status when retrieving one sex ", async () => {
  const sexData: Sexe = {
    id: 11,
    libelle: "F",
    ownerId: "abc"
  };

  prismaMock.sexe.findUnique.mockResolvedValueOnce(sexData);

  await findSexe(sexData.id);

  expect(prismaMock.sexe.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.sexe.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: sexData.id
    }
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
});

test("should handle sex not found ", async () => {
  prismaMock.sexe.findUnique.mockResolvedValueOnce(null);

  await expect(findSexe(10)).resolves.toBe(null);

  expect(prismaMock.sexe.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.sexe.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: 10
    }
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(0);
});

test("should call readonly status when retrieving sexes by params ", async () => {
  const sexesData: Sexe[] = [
    {
      id: 11,
      libelle: "F",
      ownerId: "abc"
    },
    {
      id: 12,
      libelle: "M",
      ownerId: "abc"
    },
    {
      id: 13,
      libelle: "M?",
      ownerId: "abc"
    }
  ];

  prismaMock.sexe.findMany.mockResolvedValueOnce(sexesData);

  await findSexes();

  expect(prismaMock.sexe.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.sexe.findMany).toHaveBeenLastCalledWith({
    ...entitiesUtils.queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      libelle: {
        contains: undefined
      }
    }
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(sexesData.length);
});

test("should call readonly status when retrieving paginated sexes", async () => {
  const sexesData: Sexe[] = [
    {
      id: 11,
      libelle: "F",
      ownerId: "abc"
    },
    {
      id: 12,
      libelle: "M",
      ownerId: "abc"
    },
    {
      id: 13,
      libelle: "M?",
      ownerId: "abc"
    }
  ];

  prismaMock.sexe.findMany.mockResolvedValueOnce(sexesData);

  await findPaginatedSexes();

  expect(prismaMock.sexe.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.sexe.findMany).toHaveBeenLastCalledWith({
    ...entitiesUtils.queryParametersToFindAllEntities(COLUMN_LIBELLE),
    orderBy: undefined,
    where: {}
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(sexesData.length);
});

test("should handle params when retrieving paginated sexes ", async () => {
  const sexesData: Sexe[] = [
    {
      id: 11,
      libelle: "F",
      ownerId: "abc"
    },
    {
      id: 12,
      libelle: "M",
      ownerId: "abc"
    },
    {
      id: 13,
      libelle: "M?",
      ownerId: "abc"
    }
  ];

  const searchParams: QueryPaginatedSexesArgs = {
    orderBy: "libelle",
    sortOrder: "desc",
    searchParams: {
      q: "Bob",
      pageNumber: 0,
      pageSize: 10
    },
    includeCounts: false
  };

  prismaMock.sexe.findMany.mockResolvedValueOnce([sexesData[0]]);

  await findPaginatedSexes(searchParams);

  expect(prismaMock.sexe.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.sexe.findMany).toHaveBeenLastCalledWith({
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

test("should update an existing sex as an admin ", async () => {
  const sexData = {
    id: 12,
    data: {
      libelle: "F"
    }
  };

  const user = {
    id: "a",
    role: DatabaseRole.admin
  };

  await upsertSexe(sexData, user);

  expect(prismaMock.sexe.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.sexe.update).toHaveBeenLastCalledWith({
    data: sexData.data,
    where: {
      id: sexData.id
    }
  });
});

test("should update an existing sex if owner ", async () => {
  const existingData = {
    id: 12,
    libelle: "M",
    ownerId: "notAdmin"
  };

  const sexData = {
    id: 12,
    data: {
      libelle: "F"
    }
  };

  const user = {
    id: "notAdmin",
    role: DatabaseRole.contributor
  };

  prismaMock.sexe.findFirst.mockResolvedValueOnce(existingData);

  await upsertSexe(sexData, user);

  expect(prismaMock.sexe.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.sexe.update).toHaveBeenLastCalledWith({
    data: sexData.data,
    where: {
      id: sexData.id
    }
  });
});

test("should throw an error when updating an existing sex and nor owner nor admin ", async () => {
  const existingData = {
    id: 12,
    libelle: "M",
    ownerId: "notAdmin"
  };

  const sexData = {
    id: 12,
    data: {
      libelle: "F"
    }
  };

  const user = {
    id: "Bob",
    role: DatabaseRole.contributor
  };

  prismaMock.sexe.findFirst.mockResolvedValueOnce(existingData);

  await expect(upsertSexe(sexData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

  expect(prismaMock.sexe.update).toHaveBeenCalledTimes(0);
});

test("should throw an error when trying to update a sex that exists", async () => {
  const sexData = {
    id: 12,
    data: {
      libelle: "F"
    }
  };

  const user = {
    id: "a",
    role: DatabaseRole.admin
  };

  prismaMock.sexe.update.mockImplementation(prismaConstraintFailed);

  await expect(() => upsertSexe(sexData, user)).rejects.toThrowError(
    new OucaError("OUCA0004", prismaConstraintFailedError)
  );

  expect(prismaMock.sexe.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.sexe.update).toHaveBeenLastCalledWith({
    data: sexData.data,
    where: {
      id: sexData.id
    }
  });
});

test("should create new sex ", async () => {
  const sexData = {
    data: {
      libelle: "F"
    }
  };

  const user = {
    id: "a",
    role: DatabaseRole.contributor
  };

  await upsertSexe(sexData, user);

  expect(prismaMock.sexe.create).toHaveBeenCalledTimes(1);
  expect(prismaMock.sexe.create).toHaveBeenLastCalledWith({
    data: {
      ...sexData.data,
      ownerId: user.id
    }
  });
});

test("should throw an error when trying to create a sex that exists", async () => {
  const sexData = {
    data: {
      libelle: "F"
    }
  };

  const user = {
    id: "a",
    role: DatabaseRole.contributor
  };

  prismaMock.sexe.create.mockImplementation(prismaConstraintFailed);

  await expect(() => upsertSexe(sexData, user)).rejects.toThrowError(
    new OucaError("OUCA0004", prismaConstraintFailedError)
  );

  expect(prismaMock.sexe.create).toHaveBeenCalledTimes(1);
  expect(prismaMock.sexe.create).toHaveBeenLastCalledWith({
    data: {
      ...sexData.data,
      ownerId: user.id
    }
  });
});

test("should be able to delete an owned sex", async () => {
  const loggedUser: LoggedUser = {
    id: "12",
    role: DatabaseRole.contributor
  };

  prismaMock.sexe.findFirst.mockResolvedValueOnce({
    id: 11,
    libelle: "F",
    ownerId: "12"
  });

  await deleteSexe(11, loggedUser);

  expect(prismaMock.sexe.delete).toHaveBeenCalledTimes(1);
  expect(prismaMock.sexe.delete).toHaveBeenLastCalledWith({
    where: {
      id: 11
    }
  });
});

test("should be able to delete any sex if admin", async () => {
  const loggedUser: LoggedUser = {
    id: "12",
    role: DatabaseRole.admin
  };

  prismaMock.sexe.findFirst.mockResolvedValueOnce({
    id: 11,
    libelle: "F",
    ownerId: "54"
  });

  await deleteSexe(11, loggedUser);

  expect(prismaMock.sexe.delete).toHaveBeenCalledTimes(1);
  expect(prismaMock.sexe.delete).toHaveBeenLastCalledWith({
    where: {
      id: 11
    }
  });
});

test("should return an error when deleting a non-owned sex as non-admin", async () => {
  const loggedUser: LoggedUser = {
    id: "12",
    role: DatabaseRole.contributor
  };

  prismaMock.sexe.findFirst.mockResolvedValueOnce({
    id: 11,
    libelle: "F",
    ownerId: "54"
  });

  await expect(deleteSexe(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

  expect(prismaMock.sexe.delete).toHaveBeenCalledTimes(0);
});
