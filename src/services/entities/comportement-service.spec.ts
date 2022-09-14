import { Comportement, DatabaseRole, Prisma } from "@prisma/client";
import { mock } from "jest-mock-extended";
import { MutationUpsertComportementArgs, QueryPaginatedComportementsArgs } from "../../graphql/generated/graphql-types";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_CODE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import {
  createComportements,
  deleteComportement,
  findComportement,
  findComportements,
  findComportementsByIds,
  findPaginatedComportements,
  getComportementsCount,
  upsertComportement,
} from "./comportement-service";
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

test("should call readonly status when retrieving one behavior ", async () => {
  const behaviorData = mock<Comportement>();

  prismaMock.comportement.findUnique.mockResolvedValueOnce(behaviorData);

  await findComportement(behaviorData.id);

  expect(prismaMock.comportement.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.comportement.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: behaviorData.id,
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
});

test("should handle behavior not found ", async () => {
  prismaMock.comportement.findUnique.mockResolvedValueOnce(null);

  await expect(findComportement(10)).resolves.toBe(null);

  expect(prismaMock.comportement.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.comportement.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: 10,
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(0);
});

test("should call readonly status when retrieving behaviors by ID ", async () => {
  const behaviorsData = [mock<Comportement>(), mock<Comportement>(), mock<Comportement>()];

  prismaMock.comportement.findMany.mockResolvedValueOnce(behaviorsData);

  await findComportementsByIds(behaviorsData.map((behavior) => behavior.id));

  expect(prismaMock.comportement.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.comportement.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    where: {
      id: {
        in: behaviorsData.map((behavior) => behavior.id),
      },
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(behaviorsData.length);
});

test("should call readonly status when retrieving behaviors by params ", async () => {
  const behaviorsCodeData = [
    mock<Comportement>({ id: 1, code: "0017" }),
    mock<Comportement>({ id: 7, code: "0357" }),
    mock<Comportement>({ id: 2, code: "22A0" }),
  ];
  const behaviorsLibelleData = [
    mock<Comportement>({ id: 5, code: "7654" }),
    mock<Comportement>({ id: 2, code: "22A0" }),
    mock<Comportement>({ id: 6, code: "1177" }),
  ];

  prismaMock.comportement.findMany.mockResolvedValueOnce(behaviorsCodeData);
  prismaMock.comportement.findMany.mockResolvedValueOnce(behaviorsLibelleData);

  const behaviors = await findComportements();

  expect(behaviors.length).toBe(5);
  expect(behaviors[0].code).toBe("0017");
  expect(behaviors[1].code).toBe("0357");
  expect(behaviors[2].code).toBe("1177");
  expect(behaviors[3].code).toBe("22A0");
  expect(behaviors[4].code).toBe("7654");

  expect(prismaMock.comportement.findMany).toHaveBeenCalledTimes(2);
  expect(prismaMock.comportement.findMany).toHaveBeenNthCalledWith(1, {
    ...queryParametersToFindAllEntities(COLUMN_CODE),
  });
  expect(prismaMock.comportement.findMany).toHaveBeenNthCalledWith(2, {
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    where: {
      libelle: {
        contains: undefined,
      },
    },
  });
  expect(prismaMock.comportement.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    where: {
      libelle: {
        contains: undefined,
      },
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(behaviors.length);
});

test("should call readonly status when retrieving paginated behaviors", async () => {
  const behaviorsData = [mock<Comportement>(), mock<Comportement>(), mock<Comportement>()];

  prismaMock.comportement.findMany.mockResolvedValueOnce(behaviorsData);

  await findPaginatedComportements();

  expect(prismaMock.comportement.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.comportement.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    orderBy: undefined,
    where: {},
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(behaviorsData.length);
});

test("should handle params when retrieving paginated behaviors ", async () => {
  const behaviorsData = [mock<Comportement>(), mock<Comportement>(), mock<Comportement>()];

  const searchParams: QueryPaginatedComportementsArgs = {
    orderBy: "libelle",
    sortOrder: "desc",
    searchParams: {
      q: "Bob",
      pageNumber: 0,
      pageSize: 10,
    },
    includeCounts: false,
  };

  prismaMock.comportement.findMany.mockResolvedValueOnce([behaviorsData[0]]);

  await findPaginatedComportements(searchParams);

  expect(prismaMock.comportement.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.comportement.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    orderBy: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      [searchParams.orderBy!]: searchParams.sortOrder,
    },
    skip: searchParams.searchParams?.pageNumber,
    take: searchParams.searchParams?.pageSize,
    where: {
      OR: [
        {
          code: {
            contains: searchParams.searchParams?.q,
          },
        },
        {
          libelle: {
            contains: searchParams.searchParams?.q,
          },
        },
        {
          nicheur: {
            in: [],
          },
        },
      ],
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await getComportementsCount(loggedUser);

    expect(prismaMock.comportement.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.comportement.count).toHaveBeenLastCalledWith({
      where: {},
    });
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await getComportementsCount(loggedUser, "test");

    expect(prismaMock.comportement.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.comportement.count).toHaveBeenLastCalledWith({
      where: {
        OR: [
          {
            code: {
              contains: "test",
            },
          },
          {
            libelle: {
              contains: "test",
            },
          },
          {
            nicheur: {
              in: [],
            },
          },
        ],
      },
    });
  });

  test("should handle to be called with criteria matching a nicheur status provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await getComportementsCount(loggedUser, "certain");

    expect(prismaMock.comportement.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.comportement.count).toHaveBeenLastCalledWith({
      where: {
        OR: [
          {
            code: {
              contains: "certain",
            },
          },
          {
            libelle: {
              contains: "certain",
            },
          },
          {
            nicheur: {
              in: ["certain"],
            },
          },
        ],
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(getComportementsCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("should update an existing behavior as an admin ", async () => {
  const behaviorData = mock<MutationUpsertComportementArgs>();

  const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });

  await upsertComportement(behaviorData, loggedUser);

  expect(prismaMock.comportement.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.comportement.update).toHaveBeenLastCalledWith({
    data: behaviorData.data,
    where: {
      id: behaviorData.id,
    },
  });
});

test("should update an existing behavior if owner ", async () => {
  const existingData = mock<Comportement>({
    ownerId: "notAdmin",
  });

  const behaviorData = mock<MutationUpsertComportementArgs>();

  const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

  prismaMock.comportement.findFirst.mockResolvedValueOnce(existingData);

  await upsertComportement(behaviorData, loggedUser);

  expect(prismaMock.comportement.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.comportement.update).toHaveBeenLastCalledWith({
    data: behaviorData.data,
    where: {
      id: behaviorData.id,
    },
  });
});

test("should throw an error when updating an existing behavior and nor owner nor admin ", async () => {
  const existingData = mock<Comportement>({
    ownerId: "notAdmin",
  });

  const behaviorData = mock<MutationUpsertComportementArgs>();

  const user = {
    id: "Bob",
    role: DatabaseRole.contributor,
  };

  prismaMock.comportement.findFirst.mockResolvedValueOnce(existingData);

  await expect(upsertComportement(behaviorData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

  expect(prismaMock.comportement.update).toHaveBeenCalledTimes(0);
});

test("should throw an error when trying to update a behavior that exists", async () => {
  const behaviorData = mock<MutationUpsertComportementArgs>({
    id: 12,
  });

  const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });

  prismaMock.comportement.update.mockImplementation(prismaConstraintFailed);

  await expect(() => upsertComportement(behaviorData, loggedUser)).rejects.toThrowError(
    new OucaError("OUCA0004", prismaConstraintFailedError)
  );

  expect(prismaMock.comportement.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.comportement.update).toHaveBeenLastCalledWith({
    data: behaviorData.data,
    where: {
      id: behaviorData.id,
    },
  });
});

test("should create new behavior ", async () => {
  const behaviorData = mock<MutationUpsertComportementArgs>({
    id: undefined,
  });

  const loggedUser = mock<LoggedUser>({ id: "a" });

  await upsertComportement(behaviorData, loggedUser);

  expect(prismaMock.comportement.create).toHaveBeenCalledTimes(1);
  expect(prismaMock.comportement.create).toHaveBeenLastCalledWith({
    data: {
      ...behaviorData.data,
      ownerId: loggedUser.id,
    },
  });
});

test("should throw an error when trying to create a behavior that exists", async () => {
  const behaviorData = mock<MutationUpsertComportementArgs>({
    id: undefined,
  });

  const loggedUser = mock<LoggedUser>({ id: "a" });

  prismaMock.comportement.create.mockImplementation(prismaConstraintFailed);

  await expect(() => upsertComportement(behaviorData, loggedUser)).rejects.toThrowError(
    new OucaError("OUCA0004", prismaConstraintFailedError)
  );

  expect(prismaMock.comportement.create).toHaveBeenCalledTimes(1);
  expect(prismaMock.comportement.create).toHaveBeenLastCalledWith({
    data: {
      ...behaviorData.data,
      ownerId: loggedUser.id,
    },
  });
});

test("should be able to delete an owned behavior", async () => {
  const loggedUser: LoggedUser = {
    id: "12",
    role: DatabaseRole.contributor,
  };

  const behavior = mock<Comportement>({
    ownerId: loggedUser.id,
  });

  prismaMock.comportement.findFirst.mockResolvedValueOnce(behavior);

  await deleteComportement(11, loggedUser);

  expect(prismaMock.comportement.delete).toHaveBeenCalledTimes(1);
  expect(prismaMock.comportement.delete).toHaveBeenLastCalledWith({
    where: {
      id: 11,
    },
  });
});

test("should be able to delete any behavior if admin", async () => {
  const loggedUser = mock<LoggedUser>({
    role: DatabaseRole.admin,
  });

  prismaMock.comportement.findFirst.mockResolvedValueOnce(mock<Comportement>());

  await deleteComportement(11, loggedUser);

  expect(prismaMock.comportement.delete).toHaveBeenCalledTimes(1);
  expect(prismaMock.comportement.delete).toHaveBeenLastCalledWith({
    where: {
      id: 11,
    },
  });
});

test("should return an error when deleting a non-owned behavior as non-admin", async () => {
  const loggedUser = mock<LoggedUser>({
    role: DatabaseRole.contributor,
  });

  prismaMock.comportement.findFirst.mockResolvedValueOnce(mock<Comportement>());

  await expect(deleteComportement(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

  expect(prismaMock.comportement.delete).toHaveBeenCalledTimes(0);
});

test("should throw an error when the requester is not logged", async () => {
  await expect(deleteComportement(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
  expect(prismaMock.comportement.delete).toHaveBeenCalledTimes(0);
});

test("Create multiple comportements", async () => {
  const comportementsData = [
    mock<Omit<Prisma.ComportementCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.ComportementCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.ComportementCreateManyInput, "ownerId">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  await createComportements(comportementsData, loggedUser);

  expect(prismaMock.comportement.createMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.comportement.createMany).toHaveBeenLastCalledWith({
    data: comportementsData.map((comportement) => {
      return {
        ...comportement,
        ownerId: loggedUser.id,
      };
    }),
  });
});
