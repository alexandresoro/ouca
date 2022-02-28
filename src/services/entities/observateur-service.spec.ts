import { DatabaseRole, Observateur, Prisma } from "@prisma/client";
import { QueryPaginatedObservateursArgs } from "../../model/graphql";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import * as entitiesUtils from "./entities-utils";
import {
  deleteObservateur,
  findObservateur,
  findObservateurs,
  findObservateursByIds,
  findPaginatedObservateurs,
  upsertObservateur
} from "./observateur-service";

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

test("should call readonly status when retrieving one observer ", async () => {
  const observerData: Observateur = {
    id: 11,
    libelle: "Bob",
    ownerId: "abc"
  };

  prismaMock.observateur.findUnique.mockResolvedValueOnce(observerData);

  await findObservateur(observerData.id);

  expect(prismaMock.observateur.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.observateur.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: observerData.id
    }
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
});

test("should handle observer not found ", async () => {
  prismaMock.observateur.findUnique.mockResolvedValueOnce(null);

  await expect(findObservateur(10)).resolves.toBe(null);

  expect(prismaMock.observateur.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.observateur.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: 10
    }
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(0);
});

test("should call readonly status when retrieving observers by ID ", async () => {
  const observersData: Observateur[] = [
    {
      id: 11,
      libelle: "Bob",
      ownerId: "abc"
    },
    {
      id: 12,
      libelle: "Alice",
      ownerId: "abc"
    },
    {
      id: 13,
      libelle: "John",
      ownerId: "abc"
    }
  ];

  prismaMock.observateur.findMany.mockResolvedValueOnce(observersData);

  await findObservateursByIds(observersData.map((obs) => obs.id));

  expect(prismaMock.observateur.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.observateur.findMany).toHaveBeenLastCalledWith({
    ...entitiesUtils.queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      id: {
        in: observersData.map((obs) => obs.id)
      }
    }
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(observersData.length);
});

test("should call readonly status when retrieving observers by params ", async () => {
  const observersData: Observateur[] = [
    {
      id: 11,
      libelle: "Bob",
      ownerId: "abc"
    },
    {
      id: 12,
      libelle: "Alice",
      ownerId: "abc"
    },
    {
      id: 13,
      libelle: "John",
      ownerId: "abc"
    }
  ];

  prismaMock.observateur.findMany.mockResolvedValueOnce(observersData);

  await findObservateurs();

  expect(prismaMock.observateur.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.observateur.findMany).toHaveBeenLastCalledWith({
    ...entitiesUtils.queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      libelle: {
        contains: undefined
      }
    }
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(observersData.length);
});

test("should call readonly status when retrieving paginated observers ", async () => {
  const observersData: Observateur[] = [
    {
      id: 11,
      libelle: "Bob",
      ownerId: "abc"
    },
    {
      id: 12,
      libelle: "Alice",
      ownerId: "abc"
    },
    {
      id: 13,
      libelle: "John",
      ownerId: "abc"
    }
  ];

  prismaMock.observateur.findMany.mockResolvedValueOnce(observersData);

  await findPaginatedObservateurs();

  expect(prismaMock.observateur.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.observateur.findMany).toHaveBeenLastCalledWith({
    ...entitiesUtils.queryParametersToFindAllEntities(COLUMN_LIBELLE),
    orderBy: {},
    where: {}
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(observersData.length);
});

test("should handle params when retrieving paginated observers ", async () => {
  const observersData: Observateur[] = [
    {
      id: 11,
      libelle: "Bob",
      ownerId: "abc"
    },
    {
      id: 12,
      libelle: "Alice",
      ownerId: "abc"
    },
    {
      id: 13,
      libelle: "John",
      ownerId: "abc"
    }
  ];

  const searchParams: QueryPaginatedObservateursArgs = {
    orderBy: "libelle",
    sortOrder: "desc",
    searchParams: {
      q: "Bob",
      pageNumber: 0,
      pageSize: 10
    },
    includeCounts: false
  };

  prismaMock.observateur.findMany.mockResolvedValueOnce([observersData[0]]);

  await findPaginatedObservateurs(searchParams);

  expect(prismaMock.observateur.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.observateur.findMany).toHaveBeenLastCalledWith({
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

test("should update an existing observer as an admin ", async () => {
  const observerData = {
    id: 12,
    data: {
      libelle: "Bob"
    }
  };

  const user = {
    id: "a",
    role: DatabaseRole.admin
  };

  await upsertObservateur(observerData, user);

  expect(prismaMock.observateur.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.observateur.update).toHaveBeenLastCalledWith({
    data: observerData.data,
    where: {
      id: observerData.id
    }
  });
});

test("should update an existing observer if owner ", async () => {
  const existingData = {
    id: 12,
    libelle: "Alice",
    ownerId: "notAdmin"
  };

  const observerData = {
    id: 12,
    data: {
      libelle: "Bob"
    }
  };

  const user = {
    id: "notAdmin",
    role: DatabaseRole.contributor
  };

  prismaMock.observateur.findFirst.mockResolvedValueOnce(existingData);

  await upsertObservateur(observerData, user);

  expect(prismaMock.observateur.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.observateur.update).toHaveBeenLastCalledWith({
    data: observerData.data,
    where: {
      id: observerData.id
    }
  });
});

test("should throw an error when updating an existing observer and nor owner nor admin ", async () => {
  const existingData = {
    id: 12,
    libelle: "Alice",
    ownerId: "notAdmin"
  };

  const observerData = {
    id: 12,
    data: {
      libelle: "Bob"
    }
  };

  const user = {
    id: "Bob",
    role: DatabaseRole.contributor
  };

  prismaMock.observateur.findFirst.mockResolvedValueOnce(existingData);

  await expect(upsertObservateur(observerData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

  expect(prismaMock.observateur.update).toHaveBeenCalledTimes(0);
});

test("should throw an error when trying to update an observer that exists", async () => {
  const observerData = {
    id: 12,
    data: {
      libelle: "Bob"
    }
  };

  const user = {
    id: "a",
    role: DatabaseRole.admin
  };

  prismaMock.observateur.update.mockImplementation(prismaConstraintFailed);

  await expect(() => upsertObservateur(observerData, user)).rejects.toThrowError(
    new OucaError("OUCA0004", prismaConstraintFailedError)
  );

  expect(prismaMock.observateur.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.observateur.update).toHaveBeenLastCalledWith({
    data: observerData.data,
    where: {
      id: observerData.id
    }
  });
});

test("should create new observer ", async () => {
  const observerData = {
    data: {
      libelle: "Bob"
    }
  };

  const user = {
    id: "a",
    role: DatabaseRole.contributor
  };

  await upsertObservateur(observerData, user);

  expect(prismaMock.observateur.create).toHaveBeenCalledTimes(1);
  expect(prismaMock.observateur.create).toHaveBeenLastCalledWith({
    data: {
      ...observerData.data,
      ownerId: user.id
    }
  });
});

test("should throw an error when trying to create an observer that exists", async () => {
  const observerData = {
    data: {
      libelle: "Bob"
    }
  };

  const user = {
    id: "a",
    role: DatabaseRole.contributor
  };

  prismaMock.observateur.create.mockImplementation(prismaConstraintFailed);

  await expect(() => upsertObservateur(observerData, user)).rejects.toThrowError(
    new OucaError("OUCA0004", prismaConstraintFailedError)
  );

  expect(prismaMock.observateur.create).toHaveBeenCalledTimes(1);
  expect(prismaMock.observateur.create).toHaveBeenLastCalledWith({
    data: {
      ...observerData.data,
      ownerId: user.id
    }
  });
});

test("should be able to delete an owned observer", async () => {
  const loggedUser: LoggedUser = {
    id: "12",
    role: DatabaseRole.contributor
  };

  prismaMock.observateur.findFirst.mockResolvedValueOnce({
    id: 11,
    libelle: "Bob",
    ownerId: "12"
  });

  await deleteObservateur(11, loggedUser);

  expect(prismaMock.observateur.delete).toHaveBeenCalledTimes(1);
  expect(prismaMock.observateur.delete).toHaveBeenLastCalledWith({
    where: {
      id: 11
    }
  });
});

test("should be able to delete any observer if admin", async () => {
  const loggedUser: LoggedUser = {
    id: "12",
    role: DatabaseRole.admin
  };

  prismaMock.observateur.findFirst.mockResolvedValueOnce({
    id: 11,
    libelle: "Bob",
    ownerId: "54"
  });

  await deleteObservateur(11, loggedUser);

  expect(prismaMock.observateur.delete).toHaveBeenCalledTimes(1);
  expect(prismaMock.observateur.delete).toHaveBeenLastCalledWith({
    where: {
      id: 11
    }
  });
});

test("should return an error when deleting a non-owned observer as non-admin", async () => {
  const loggedUser: LoggedUser = {
    id: "12",
    role: DatabaseRole.contributor
  };

  prismaMock.observateur.findFirst.mockResolvedValueOnce({
    id: 11,
    libelle: "Bob",
    ownerId: "54"
  });

  await expect(deleteObservateur(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

  expect(prismaMock.observateur.delete).toHaveBeenCalledTimes(0);
});
