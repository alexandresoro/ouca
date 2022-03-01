import { Age, DatabaseRole, Prisma } from "@prisma/client";
import { QueryPaginatedAgesArgs } from "../../model/graphql";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { deleteAge, findAge, findAges, findPaginatedAges, upsertAge } from "./age-service";
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

test("should call readonly status when retrieving one age ", async () => {
  const ageData: Age = {
    id: 11,
    libelle: "+2A",
    ownerId: "abc"
  };

  prismaMock.age.findUnique.mockResolvedValueOnce(ageData);

  await findAge(ageData.id);

  expect(prismaMock.age.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.age.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: ageData.id
    }
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
});

test("should handle age not found ", async () => {
  prismaMock.age.findUnique.mockResolvedValueOnce(null);

  await expect(findAge(10)).resolves.toBe(null);

  expect(prismaMock.age.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.age.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: 10
    }
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(0);
});

test("should call readonly status when retrieving ages by params ", async () => {
  const agesData: Age[] = [
    {
      id: 11,
      libelle: "+2A",
      ownerId: "abc"
    },
    {
      id: 12,
      libelle: "+1A",
      ownerId: "abc"
    },
    {
      id: 13,
      libelle: "+3A",
      ownerId: "abc"
    }
  ];

  prismaMock.age.findMany.mockResolvedValueOnce(agesData);

  await findAges();

  expect(prismaMock.age.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.age.findMany).toHaveBeenLastCalledWith({
    ...entitiesUtils.queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      libelle: {
        contains: undefined
      }
    }
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(agesData.length);
});

test("should call readonly status when retrieving paginated ages", async () => {
  const agesData: Age[] = [
    {
      id: 11,
      libelle: "+2A",
      ownerId: "abc"
    },
    {
      id: 12,
      libelle: "+1A",
      ownerId: "abc"
    },
    {
      id: 13,
      libelle: "+3A",
      ownerId: "abc"
    }
  ];

  prismaMock.age.findMany.mockResolvedValueOnce(agesData);

  await findPaginatedAges();

  expect(prismaMock.age.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.age.findMany).toHaveBeenLastCalledWith({
    ...entitiesUtils.queryParametersToFindAllEntities(COLUMN_LIBELLE),
    orderBy: undefined,
    where: {}
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(agesData.length);
});

test("should handle params when retrieving paginated ages ", async () => {
  const agesData: Age[] = [
    {
      id: 11,
      libelle: "+2A",
      ownerId: "abc"
    },
    {
      id: 12,
      libelle: "+1A",
      ownerId: "abc"
    },
    {
      id: 13,
      libelle: "+3A",
      ownerId: "abc"
    }
  ];

  const searchParams: QueryPaginatedAgesArgs = {
    orderBy: "libelle",
    sortOrder: "desc",
    searchParams: {
      q: "Bob",
      pageNumber: 0,
      pageSize: 10
    },
    includeCounts: false
  };

  prismaMock.age.findMany.mockResolvedValueOnce([agesData[0]]);

  await findPaginatedAges(searchParams);

  expect(prismaMock.age.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.age.findMany).toHaveBeenLastCalledWith({
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

test("should update an existing age as an admin ", async () => {
  const ageData = {
    id: 12,
    data: {
      libelle: "+2A"
    }
  };

  const user = {
    id: "a",
    role: DatabaseRole.admin
  };

  await upsertAge(ageData, user);

  expect(prismaMock.age.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.age.update).toHaveBeenLastCalledWith({
    data: ageData.data,
    where: {
      id: ageData.id
    }
  });
});

test("should update an existing age if owner ", async () => {
  const existingData = {
    id: 12,
    libelle: "+1A",
    ownerId: "notAdmin"
  };

  const ageData = {
    id: 12,
    data: {
      libelle: "+2A"
    }
  };

  const user = {
    id: "notAdmin",
    role: DatabaseRole.contributor
  };

  prismaMock.age.findFirst.mockResolvedValueOnce(existingData);

  await upsertAge(ageData, user);

  expect(prismaMock.age.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.age.update).toHaveBeenLastCalledWith({
    data: ageData.data,
    where: {
      id: ageData.id
    }
  });
});

test("should throw an error when updating an existing age and nor owner nor admin ", async () => {
  const existingData = {
    id: 12,
    libelle: "+1A",
    ownerId: "notAdmin"
  };

  const ageData = {
    id: 12,
    data: {
      libelle: "+2A"
    }
  };

  const user = {
    id: "Bob",
    role: DatabaseRole.contributor
  };

  prismaMock.age.findFirst.mockResolvedValueOnce(existingData);

  await expect(upsertAge(ageData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

  expect(prismaMock.age.update).toHaveBeenCalledTimes(0);
});

test("should throw an error when trying to update an age that exists", async () => {
  const ageData = {
    id: 12,
    data: {
      libelle: "+2A"
    }
  };

  const user = {
    id: "a",
    role: DatabaseRole.admin
  };

  prismaMock.age.update.mockImplementation(prismaConstraintFailed);

  await expect(() => upsertAge(ageData, user)).rejects.toThrowError(
    new OucaError("OUCA0004", prismaConstraintFailedError)
  );

  expect(prismaMock.age.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.age.update).toHaveBeenLastCalledWith({
    data: ageData.data,
    where: {
      id: ageData.id
    }
  });
});

test("should create new age ", async () => {
  const ageData = {
    data: {
      libelle: "+2A"
    }
  };

  const user = {
    id: "a",
    role: DatabaseRole.contributor
  };

  await upsertAge(ageData, user);

  expect(prismaMock.age.create).toHaveBeenCalledTimes(1);
  expect(prismaMock.age.create).toHaveBeenLastCalledWith({
    data: {
      ...ageData.data,
      ownerId: user.id
    }
  });
});

test("should throw an error when trying to create an age that exists", async () => {
  const ageData = {
    data: {
      libelle: "+2A"
    }
  };

  const user = {
    id: "a",
    role: DatabaseRole.contributor
  };

  prismaMock.age.create.mockImplementation(prismaConstraintFailed);

  await expect(() => upsertAge(ageData, user)).rejects.toThrowError(
    new OucaError("OUCA0004", prismaConstraintFailedError)
  );

  expect(prismaMock.age.create).toHaveBeenCalledTimes(1);
  expect(prismaMock.age.create).toHaveBeenLastCalledWith({
    data: {
      ...ageData.data,
      ownerId: user.id
    }
  });
});

test("should be able to delete an owned age", async () => {
  const loggedUser: LoggedUser = {
    id: "12",
    role: DatabaseRole.contributor
  };

  prismaMock.age.findFirst.mockResolvedValueOnce({
    id: 11,
    libelle: "+2A",
    ownerId: "12"
  });

  await deleteAge(11, loggedUser);

  expect(prismaMock.age.delete).toHaveBeenCalledTimes(1);
  expect(prismaMock.age.delete).toHaveBeenLastCalledWith({
    where: {
      id: 11
    }
  });
});

test("should be able to delete any age if admin", async () => {
  const loggedUser: LoggedUser = {
    id: "12",
    role: DatabaseRole.admin
  };

  prismaMock.age.findFirst.mockResolvedValueOnce({
    id: 11,
    libelle: "+2A",
    ownerId: "54"
  });

  await deleteAge(11, loggedUser);

  expect(prismaMock.age.delete).toHaveBeenCalledTimes(1);
  expect(prismaMock.age.delete).toHaveBeenLastCalledWith({
    where: {
      id: 11
    }
  });
});

test("should return an error when deleting a non-owned age as non-admin", async () => {
  const loggedUser: LoggedUser = {
    id: "12",
    role: DatabaseRole.contributor
  };

  prismaMock.age.findFirst.mockResolvedValueOnce({
    id: 11,
    libelle: "+2A",
    ownerId: "54"
  });

  await expect(deleteAge(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

  expect(prismaMock.age.delete).toHaveBeenCalledTimes(0);
});
