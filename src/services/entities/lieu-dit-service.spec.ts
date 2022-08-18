import { DatabaseRole, Inventaire, Lieudit, Prisma } from "@prisma/client";
import { mock, mockDeep } from "jest-mock-extended";
import { MutationUpsertLieuDitArgs, QueryPaginatedLieuxditsArgs } from "../../graphql/generated/graphql-types";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_NOM } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import * as entitiesUtils from "./entities-utils";
import {
  createLieuxDits,
  deleteLieuDit,
  findLieuDit,
  findLieuDitOfInventaireId,
  findLieuxDits,
  findPaginatedLieuxDits,
  upsertLieuDit,
} from "./lieu-dit-service";

jest.mock("./entities-utils", () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const actualModule = jest.requireActual("./entities-utils");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    __esModule: true,
    ...actualModule,
  };
});

const isEntityReadOnly = jest.spyOn(entitiesUtils, "isEntityReadOnly");

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

test("should call readonly status when retrieving one locality ", async () => {
  const localityData = mockDeep<Lieudit>();

  prismaMock.lieudit.findUnique.mockResolvedValueOnce(localityData);

  await findLieuDit(localityData.id);

  expect(prismaMock.lieudit.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.lieudit.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: localityData.id,
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
});

test("should handle locality not found ", async () => {
  prismaMock.lieudit.findUnique.mockResolvedValueOnce(null);

  await expect(findLieuDit(10)).resolves.toBe(null);

  expect(prismaMock.lieudit.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.lieudit.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: 10,
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(0);
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
  expect(isEntityReadOnly).toHaveBeenCalledTimes(0);
  expect(locality).toBeNull();
});

test("should call readonly status when retrieving localities by params ", async () => {
  const localitiesData = [mockDeep<Lieudit>(), mockDeep<Lieudit>(), mockDeep<Lieudit>()];

  prismaMock.lieudit.findMany.mockResolvedValueOnce(localitiesData);

  await findLieuxDits();

  expect(prismaMock.lieudit.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.lieudit.findMany).toHaveBeenLastCalledWith({
    ...entitiesUtils.queryParametersToFindAllEntities(COLUMN_NOM),
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
  expect(isEntityReadOnly).toHaveBeenCalledTimes(localitiesData.length);
});

test("should call readonly status when retrieving paginated localities", async () => {
  const localitiesData = [mockDeep<Lieudit>(), mockDeep<Lieudit>(), mockDeep<Lieudit>()];

  prismaMock.lieudit.findMany.mockResolvedValueOnce(localitiesData);

  await findPaginatedLieuxDits();

  expect(prismaMock.lieudit.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.lieudit.findMany).toHaveBeenLastCalledWith({
    ...entitiesUtils.queryParametersToFindAllEntities(COLUMN_NOM),
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
    ...entitiesUtils.queryParametersToFindAllEntities(COLUMN_NOM),
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

test("should update an existing locality as an admin ", async () => {
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

test("should update an existing locality if owner ", async () => {
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

test("should throw an error when updating an existing locality and nor owner nor admin ", async () => {
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

  expect(prismaMock.lieudit.update).toHaveBeenCalledTimes(0);
});

test("should throw an error when trying to update a locality that exists", async () => {
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

test("should create new locality ", async () => {
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

test("should throw an error when trying to create a locality that exists", async () => {
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

test("should be able to delete an owned locality", async () => {
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

test("should be able to delete any locality if admin", async () => {
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

  expect(prismaMock.lieudit.delete).toHaveBeenCalledTimes(0);
});

test("should create new lieudits", async () => {
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
