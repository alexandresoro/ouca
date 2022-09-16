import { Comportement, DatabaseRole, Prisma } from "@prisma/client";
import { mock } from "jest-mock-extended";
import { MutationUpsertComportementArgs, QueryComportementsArgs } from "../../graphql/generated/graphql-types";
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
  getDonneesCountByComportement,
  upsertComportement,
} from "./comportement-service";
import { queryParametersToFindAllEntities } from "./entities-utils";

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

describe("Find behavior", () => {
  test("should handle a matching behavior ", async () => {
    const behaviorData = mock<Comportement>();
    const loggedUser = mock<LoggedUser>();

    prismaMock.comportement.findUnique.mockResolvedValueOnce(behaviorData);

    await findComportement(behaviorData.id, loggedUser);

    expect(prismaMock.comportement.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.comportement.findUnique).toHaveBeenLastCalledWith({
      where: {
        id: behaviorData.id,
      },
    });
  });

  test("should handle behavior not found", async () => {
    prismaMock.comportement.findUnique.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(findComportement(10, loggedUser)).resolves.toBe(null);

    expect(prismaMock.comportement.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.comportement.findUnique).toHaveBeenLastCalledWith({
      where: {
        id: 10,
      },
    });
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(findComportement(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.comportement.findUnique).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await getDonneesCountByComportement(12, loggedUser);

    expect(prismaMock.donnee.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.donnee.count).toHaveBeenLastCalledWith<[Prisma.DonneeCountArgs]>({
      where: {
        donnee_comportement: {
          some: {
            comportement_id: 12,
          },
        },
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(getDonneesCountByComportement(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find behaviors by IDs", async () => {
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
});

test("Find all behaviors", async () => {
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
  const loggedUser = mock<LoggedUser>();

  prismaMock.comportement.findMany.mockResolvedValueOnce(behaviorsCodeData);
  prismaMock.comportement.findMany.mockResolvedValueOnce(behaviorsLibelleData);

  const behaviors = await findComportements(loggedUser);

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
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const behaviorsData = [mock<Comportement>(), mock<Comportement>(), mock<Comportement>()];
    const loggedUser = mock<LoggedUser>();

    prismaMock.comportement.findMany.mockResolvedValueOnce(behaviorsData);

    await findPaginatedComportements(loggedUser);

    expect(prismaMock.comportement.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.comportement.findMany).toHaveBeenLastCalledWith({
      ...queryParametersToFindAllEntities(COLUMN_CODE),
      orderBy: undefined,
      where: {},
    });
  });

  test("should handle params when retrieving paginated behaviors ", async () => {
    const behaviorsData = [mock<Comportement>(), mock<Comportement>(), mock<Comportement>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: QueryComportementsArgs = {
      orderBy: "libelle",
      sortOrder: "desc",
      searchParams: {
        q: "Bob",
        pageNumber: 0,
        pageSize: 10,
      },
    };

    prismaMock.comportement.findMany.mockResolvedValueOnce([behaviorsData[0]]);

    await findPaginatedComportements(loggedUser, searchParams);

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
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(findPaginatedComportements(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
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

describe("Update of a behavior", () => {
  test("should be allowed when requested by an admin", async () => {
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

  test("should be allowed when requested by the owner", async () => {
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

  test("should throw an error when requested by an user that is nor owner nor admin", async () => {
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

    expect(prismaMock.comportement.update).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to a behavior that exists", async () => {
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

  test("should throw an error when the requester is not logged", async () => {
    const behaviorData = mock<MutationUpsertComportementArgs>({
      id: 12,
    });

    await expect(upsertComportement(behaviorData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.comportement.update).not.toHaveBeenCalled();
  });
});

describe("Creation of a behavior", () => {
  test("should create new behavior", async () => {
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

  test("should throw an error when trying to create a behavior that already exists", async () => {
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

  test("should throw an error when the requester is not logged", async () => {
    const behaviorData = mock<MutationUpsertComportementArgs>({
      id: undefined,
    });

    await expect(upsertComportement(behaviorData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.comportement.create).not.toHaveBeenCalled();
  });
});

describe("Deletion of a behavior", () => {
  test("should handle the deletion of an owned behavior", async () => {
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

  test("should handle the deletion of any behavior if admin", async () => {
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

    expect(prismaMock.comportement.delete).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(deleteComportement(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.comportement.delete).not.toHaveBeenCalled();
  });
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
