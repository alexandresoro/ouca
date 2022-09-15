import { DatabaseRole, Inventaire, Lieudit, Prisma } from "@prisma/client";
import { mock, mockDeep } from "jest-mock-extended";
import { MutationUpsertLieuDitArgs, QueryPaginatedLieuxditsArgs } from "../../graphql/generated/graphql-types";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_NOM } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { isEntityReadOnly, queryParametersToFindAllEntities } from "./entities-utils";
import {
  createLieuxDits,
  deleteLieuDit,
  findLieuDit,
  findLieuDitOfInventaireId,
  findLieuxDits,
  findPaginatedLieuxDits,
  getDonneesCountByLieuDit,
  getLieuxDitsCount,
  upsertLieuDit,
} from "./lieu-dit-service";

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

describe("Find locality", () => {
  test("should handle a matching locality", async () => {
    const localityData = mockDeep<Lieudit>();
    const loggedUser = mock<LoggedUser>();

    prismaMock.lieudit.findUnique.mockResolvedValueOnce(localityData);

    await findLieuDit(localityData.id, loggedUser);

    expect(prismaMock.lieudit.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.lieudit.findUnique).toHaveBeenLastCalledWith({
      where: {
        id: localityData.id,
      },
    });
  });

  test("should handle locality not found", async () => {
    prismaMock.lieudit.findUnique.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(findLieuDit(10, loggedUser)).resolves.toBe(null);

    expect(prismaMock.lieudit.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.lieudit.findUnique).toHaveBeenLastCalledWith({
      where: {
        id: 10,
      },
    });
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(findLieuDit(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.lieudit.findUnique).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await getDonneesCountByLieuDit(12, loggedUser);

    expect(prismaMock.donnee.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.donnee.count).toHaveBeenLastCalledWith<[Prisma.DonneeCountArgs]>({
      where: {
        inventaire: {
          lieuDitId: 12,
        },
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(getDonneesCountByLieuDit(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("should call readonly status when retrieving locality by inventary ID ", async () => {
  const localityData = mock<Lieudit>({
    id: 256,
  });

  const inventary = mockDeep<Prisma.Prisma__InventaireClient<Inventaire>>();
  inventary.lieuDit.mockResolvedValueOnce(localityData);

  prismaMock.inventaire.findUnique.mockReturnValueOnce(inventary);

  const locality = await findLieuDitOfInventaireId(43);

  expect(prismaMock.inventaire.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.inventaire.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: 43,
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
  expect(locality?.id).toEqual(256);
});

test("should handle class not found when retrieving locality by inventary ID ", async () => {
  const inventary = mockDeep<Prisma.Prisma__InventaireClient<Inventaire>>();
  inventary.lieuDit.mockResolvedValueOnce(null);

  prismaMock.inventaire.findUnique.mockReturnValueOnce(inventary);

  const locality = await findLieuDitOfInventaireId(43);

  expect(prismaMock.inventaire.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.inventaire.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: 43,
    },
  });
  expect(isEntityReadOnly).not.toHaveBeenCalled();
  expect(locality).toBeNull();
});

test("Find all localities", async () => {
  const localitiesData = [mockDeep<Lieudit>(), mockDeep<Lieudit>(), mockDeep<Lieudit>()];
  const loggedUser = mock<LoggedUser>();

  prismaMock.lieudit.findMany.mockResolvedValueOnce(localitiesData);

  await findLieuxDits(loggedUser);

  expect(prismaMock.lieudit.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.lieudit.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_NOM),
    where: {
      AND: [
        {
          nom: {
            contains: undefined,
          },
        },
        {},
        {},
      ],
    },
    take: undefined,
  });
});

test("should call readonly status when retrieving paginated localities", async () => {
  const localitiesData = [mockDeep<Lieudit>(), mockDeep<Lieudit>(), mockDeep<Lieudit>()];

  prismaMock.lieudit.findMany.mockResolvedValueOnce(localitiesData);

  await findPaginatedLieuxDits();

  expect(prismaMock.lieudit.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.lieudit.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_NOM),
    orderBy: undefined,
    include: {
      commune: {
        include: {
          departement: {
            select: {
              id: true,
              code: true,
              ownerId: true,
            },
          },
        },
      },
    },
    where: {},
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(localitiesData.length);
});

test("should handle params when retrieving paginated localities ", async () => {
  const localitiesData = [mockDeep<Lieudit>(), mockDeep<Lieudit>(), mockDeep<Lieudit>()];

  const searchParams: QueryPaginatedLieuxditsArgs = {
    orderBy: "nom",
    sortOrder: "desc",
    searchParams: {
      q: "Bob",
      pageNumber: 0,
      pageSize: 10,
    },
    includeCounts: false,
  };

  prismaMock.lieudit.findMany.mockResolvedValueOnce([localitiesData[0]]);

  await findPaginatedLieuxDits(searchParams);

  expect(prismaMock.lieudit.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.lieudit.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_NOM),
    orderBy: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      [searchParams.orderBy!]: searchParams.sortOrder,
    },
    include: {
      commune: {
        include: {
          departement: {
            select: {
              id: true,
              code: true,
              ownerId: true,
            },
          },
        },
      },
    },
    skip: searchParams.searchParams?.pageNumber,
    take: searchParams.searchParams?.pageSize,
    where: {
      OR: [
        {
          nom: {
            contains: searchParams.searchParams?.q,
          },
        },
        {
          commune: {
            OR: [
              {
                nom: {
                  contains: searchParams.searchParams?.q,
                },
              },
              {
                departement: {
                  code: {
                    contains: searchParams.searchParams?.q,
                  },
                },
              },
            ],
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

    await getLieuxDitsCount(loggedUser);

    expect(prismaMock.lieudit.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.lieudit.count).toHaveBeenLastCalledWith({
      where: {},
    });
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await getLieuxDitsCount(loggedUser, "test");

    expect(prismaMock.lieudit.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.lieudit.count).toHaveBeenLastCalledWith({
      where: {
        OR: [
          {
            nom: {
              contains: "test",
            },
          },
          {
            commune: {
              OR: [
                {
                  nom: {
                    contains: "test",
                  },
                },
                {
                  departement: {
                    code: {
                      contains: "test",
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(getLieuxDitsCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of a locality", () => {
  test("should be allowed when requested by an admin", async () => {
    const localityData = mock<MutationUpsertLieuDitArgs>();

    const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });
    prismaMock.lieudit.update.mockResolvedValueOnce(mockDeep<Lieudit>());

    await upsertLieuDit(localityData, loggedUser);

    expect(prismaMock.lieudit.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.lieudit.update).toHaveBeenLastCalledWith({
      data: localityData.data,
      where: {
        id: localityData.id,
      },
    });
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = mock<Lieudit>({
      ownerId: "notAdmin",
    });

    const localityData = mock<MutationUpsertLieuDitArgs>();

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    prismaMock.lieudit.findFirst.mockResolvedValueOnce(existingData);
    prismaMock.lieudit.update.mockResolvedValueOnce(mockDeep<Lieudit>());

    await upsertLieuDit(localityData, loggedUser);

    expect(prismaMock.lieudit.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.lieudit.update).toHaveBeenLastCalledWith({
      data: localityData.data,
      where: {
        id: localityData.id,
      },
    });
  });

  test("should throw an error when requested by an user that is nor owner nor admin", async () => {
    const existingData = mock<Lieudit>({
      ownerId: "notAdmin",
    });

    const localityData = mock<MutationUpsertLieuDitArgs>();

    const user = {
      id: "Bob",
      role: DatabaseRole.contributor,
    };

    prismaMock.lieudit.findFirst.mockResolvedValueOnce(existingData);

    await expect(upsertLieuDit(localityData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

    expect(prismaMock.lieudit.update).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to a locality that exists", async () => {
    const localityData = mock<MutationUpsertLieuDitArgs>({
      id: 12,
    });

    const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });

    prismaMock.lieudit.update.mockImplementation(prismaConstraintFailed);

    await expect(() => upsertLieuDit(localityData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", prismaConstraintFailedError)
    );

    expect(prismaMock.lieudit.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.lieudit.update).toHaveBeenLastCalledWith({
      data: localityData.data,
      where: {
        id: localityData.id,
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const localityData = mock<MutationUpsertLieuDitArgs>({
      id: 12,
    });

    await expect(upsertLieuDit(localityData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.lieudit.update).not.toHaveBeenCalled();
  });
});

describe("Creation of a locality", () => {
  test("should create new locality", async () => {
    const localityData = mock<MutationUpsertLieuDitArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    prismaMock.lieudit.create.mockResolvedValueOnce(mockDeep<Lieudit>());

    await upsertLieuDit(localityData, loggedUser);

    expect(prismaMock.lieudit.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.lieudit.create).toHaveBeenLastCalledWith({
      data: {
        ...localityData.data,
        ownerId: loggedUser.id,
      },
    });
  });

  test("should throw an error when trying to create a locality that already exists", async () => {
    const localityData = mock<MutationUpsertLieuDitArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    prismaMock.lieudit.create.mockImplementation(prismaConstraintFailed);

    await expect(() => upsertLieuDit(localityData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", prismaConstraintFailedError)
    );

    expect(prismaMock.lieudit.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.lieudit.create).toHaveBeenLastCalledWith({
      data: {
        ...localityData.data,
        ownerId: loggedUser.id,
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const localityData = mock<MutationUpsertLieuDitArgs>({
      id: undefined,
    });

    await expect(upsertLieuDit(localityData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.lieudit.create).not.toHaveBeenCalled();
  });
});

describe("Deletion of a locality", () => {
  test("should handle the deletion of an owned locality", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: DatabaseRole.contributor,
    };

    const locality = mock<Lieudit>({
      ownerId: loggedUser.id,
    });

    prismaMock.lieudit.findFirst.mockResolvedValueOnce(locality);
    prismaMock.lieudit.delete.mockResolvedValueOnce(mockDeep<Lieudit>());

    await deleteLieuDit(11, loggedUser);

    expect(prismaMock.lieudit.delete).toHaveBeenCalledTimes(1);
    expect(prismaMock.lieudit.delete).toHaveBeenLastCalledWith({
      where: {
        id: 11,
      },
    });
  });

  test("should handle the deletion of any locality if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: DatabaseRole.admin,
    });

    prismaMock.lieudit.findFirst.mockResolvedValueOnce(mock<Lieudit>());
    prismaMock.lieudit.delete.mockResolvedValueOnce(mockDeep<Lieudit>());

    await deleteLieuDit(11, loggedUser);

    expect(prismaMock.lieudit.delete).toHaveBeenCalledTimes(1);
    expect(prismaMock.lieudit.delete).toHaveBeenLastCalledWith({
      where: {
        id: 11,
      },
    });
  });

  test("should return an error when deleting a non-owned locality as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: DatabaseRole.contributor,
    });

    prismaMock.lieudit.findFirst.mockResolvedValueOnce(mock<Lieudit>());

    await expect(deleteLieuDit(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(prismaMock.lieudit.delete).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(deleteLieuDit(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.lieudit.delete).not.toHaveBeenCalled();
  });
});

test("Create multiple localities", async () => {
  const lieuDitsData = [
    mock<Omit<Prisma.LieuditCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.LieuditCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.LieuditCreateManyInput, "ownerId">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  await createLieuxDits(lieuDitsData, loggedUser);

  expect(prismaMock.lieudit.createMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.lieudit.createMany).toHaveBeenLastCalledWith({
    data: lieuDitsData.map((lieuDit) => {
      return {
        ...lieuDit,
        ownerId: loggedUser.id,
      };
    }),
  });
});
