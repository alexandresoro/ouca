import { type Commune, DatabaseRole, type Lieudit, Prisma } from "@prisma/client";
import { mock, mockDeep } from "jest-mock-extended";
import {
  CommunesOrderBy,
  type MutationUpsertCommuneArgs,
  type QueryCommunesArgs,
  SortOrder,
} from "../../graphql/generated/graphql-types";
import { prismaMock } from "../../sql/prisma-mock";
import { type LoggedUser } from "../../types/LoggedUser";
import { COLUMN_NOM } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import {
  createCommunes,
  deleteCommune,
  findCommune,
  findCommuneOfLieuDitId,
  findCommunes,
  findPaginatedCommunes,
  getCommunesCount,
  getDonneesCountByCommune,
  getLieuxDitsCountByCommune,
  upsertCommune,
} from "./commune-service";
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

describe("Find city", () => {
  test("should handle a matching city", async () => {
    const cityData = mock<Commune>();
    const loggedUser = mock<LoggedUser>();

    prismaMock.commune.findUnique.mockResolvedValueOnce(cityData);

    await findCommune(cityData.id, loggedUser);

    expect(prismaMock.commune.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.commune.findUnique).toHaveBeenLastCalledWith({
      where: {
        id: cityData.id,
      },
    });
  });

  test("should handle city not found", async () => {
    prismaMock.commune.findUnique.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(findCommune(10, loggedUser)).resolves.toBe(null);

    expect(prismaMock.commune.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.commune.findUnique).toHaveBeenLastCalledWith({
      where: {
        id: 10,
      },
    });
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(findCommune(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.commune.findUnique).not.toHaveBeenCalled();
  });
});

describe("Localities count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await getLieuxDitsCountByCommune(12, loggedUser);

    expect(prismaMock.lieudit.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.lieudit.count).toHaveBeenLastCalledWith<[Prisma.LieuditCountArgs]>({
      where: {
        communeId: 12,
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(getLieuxDitsCountByCommune(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await getDonneesCountByCommune(12, loggedUser);

    expect(prismaMock.donnee.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.donnee.count).toHaveBeenLastCalledWith<[Prisma.DonneeCountArgs]>({
      where: {
        inventaire: {
          lieuDit: {
            communeId: 12,
          },
        },
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(getDonneesCountByCommune(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Find city by locality ID", () => {
  test("should handle a found city", async () => {
    const cityData = mock<Commune>({
      id: 256,
    });
    const loggedUser = mock<LoggedUser>();

    const zone = mockDeep<Prisma.Prisma__LieuditClient<Lieudit>>();
    zone.commune.mockResolvedValueOnce(cityData);

    prismaMock.lieudit.findUnique.mockReturnValueOnce(zone);

    const city = await findCommuneOfLieuDitId(43, loggedUser);

    expect(prismaMock.lieudit.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.lieudit.findUnique).toHaveBeenLastCalledWith({
      where: {
        id: 43,
      },
    });
    expect(city?.id).toEqual(256);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(findCommuneOfLieuDitId(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all cities", async () => {
  const citiesData = [mock<Commune>(), mock<Commune>(), mock<Commune>()];
  const loggedUser = mock<LoggedUser>();

  prismaMock.commune.findMany.mockResolvedValueOnce(citiesData);

  await findCommunes(loggedUser);

  expect(prismaMock.commune.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.commune.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_NOM),
    where: {
      AND: [
        {
          OR: [
            {},
            {
              nom: {
                startsWith: undefined,
              },
            },
          ],
        },
        {},
      ],
    },
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const citiesData = [mock<Commune>(), mock<Commune>(), mock<Commune>()];
    const loggedUser = mock<LoggedUser>();

    prismaMock.commune.findMany.mockResolvedValueOnce(citiesData);

    await findPaginatedCommunes(loggedUser);

    expect(prismaMock.commune.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.commune.findMany).toHaveBeenLastCalledWith({
      ...queryParametersToFindAllEntities(COLUMN_NOM),
      orderBy: undefined,
      where: {},
    });
  });

  test("should handle params when retrieving paginated cities ", async () => {
    const citiesData = [mock<Commune>(), mock<Commune>(), mock<Commune>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: QueryCommunesArgs = {
      orderBy: CommunesOrderBy.Nom,
      sortOrder: SortOrder.Desc,
      searchParams: {
        q: "Bob",
        pageNumber: 0,
        pageSize: 10,
      },
    };

    prismaMock.commune.findMany.mockResolvedValueOnce([citiesData[0]]);

    await findPaginatedCommunes(loggedUser, searchParams);

    expect(prismaMock.commune.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.commune.findMany).toHaveBeenLastCalledWith({
      ...queryParametersToFindAllEntities(COLUMN_NOM),
      orderBy: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        [searchParams.orderBy!]: searchParams.sortOrder,
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
            departement: {
              code: {
                contains: searchParams.searchParams?.q,
              },
            },
          },
        ],
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(findPaginatedCommunes(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await getCommunesCount(loggedUser);

    expect(prismaMock.commune.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.commune.count).toHaveBeenLastCalledWith({
      where: {},
    });
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await getCommunesCount(loggedUser, "test");

    expect(prismaMock.commune.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.commune.count).toHaveBeenLastCalledWith({
      where: {
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
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(getCommunesCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of a city", () => {
  test("should be allowed when requested by an admin", async () => {
    const cityData = mock<MutationUpsertCommuneArgs>();

    const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });

    await upsertCommune(cityData, loggedUser);

    expect(prismaMock.commune.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.commune.update).toHaveBeenLastCalledWith({
      data: cityData.data,
      where: {
        id: cityData.id,
      },
    });
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = mock<Commune>({
      ownerId: "notAdmin",
    });

    const cityData = mock<MutationUpsertCommuneArgs>();

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    prismaMock.commune.findFirst.mockResolvedValueOnce(existingData);

    await upsertCommune(cityData, loggedUser);

    expect(prismaMock.commune.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.commune.update).toHaveBeenLastCalledWith({
      data: cityData.data,
      where: {
        id: cityData.id,
      },
    });
  });

  test("should throw an error when requested by an user that is nor owner nor admin", async () => {
    const existingData = mock<Commune>({
      ownerId: "notAdmin",
    });

    const cityData = mock<MutationUpsertCommuneArgs>();

    const user = {
      id: "Bob",
      role: DatabaseRole.contributor,
    };

    prismaMock.commune.findFirst.mockResolvedValueOnce(existingData);

    await expect(upsertCommune(cityData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

    expect(prismaMock.commune.update).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to a city that exists", async () => {
    const cityData = mock<MutationUpsertCommuneArgs>({
      id: 12,
    });

    const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });

    prismaMock.commune.update.mockImplementation(prismaConstraintFailed);

    await expect(() => upsertCommune(cityData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", prismaConstraintFailedError)
    );

    expect(prismaMock.commune.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.commune.update).toHaveBeenLastCalledWith({
      data: cityData.data,
      where: {
        id: cityData.id,
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const cityData = mock<MutationUpsertCommuneArgs>({
      id: 12,
    });

    await expect(upsertCommune(cityData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.commune.update).not.toHaveBeenCalled();
  });
});

describe("Creation of a city", () => {
  test("should create new city", async () => {
    const cityData = mock<MutationUpsertCommuneArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    await upsertCommune(cityData, loggedUser);

    expect(prismaMock.commune.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.commune.create).toHaveBeenLastCalledWith({
      data: {
        ...cityData.data,
        ownerId: loggedUser.id,
      },
    });
  });

  test("should throw an error when trying to create a city that already exists", async () => {
    const cityData = mock<MutationUpsertCommuneArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    prismaMock.commune.create.mockImplementation(prismaConstraintFailed);

    await expect(() => upsertCommune(cityData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", prismaConstraintFailedError)
    );

    expect(prismaMock.commune.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.commune.create).toHaveBeenLastCalledWith({
      data: {
        ...cityData.data,
        ownerId: loggedUser.id,
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const cityData = mock<MutationUpsertCommuneArgs>({
      id: undefined,
    });

    await expect(upsertCommune(cityData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.commune.create).not.toHaveBeenCalled();
  });
});

describe("Deletion of a city", () => {
  test("should handle the deletion of an owned city", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: DatabaseRole.contributor,
    };

    const city = mock<Commune>({
      ownerId: loggedUser.id,
    });

    prismaMock.commune.findFirst.mockResolvedValueOnce(city);

    await deleteCommune(11, loggedUser);

    expect(prismaMock.commune.delete).toHaveBeenCalledTimes(1);
    expect(prismaMock.commune.delete).toHaveBeenLastCalledWith({
      where: {
        id: 11,
      },
    });
  });

  test("should handle the deletion of any city if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: DatabaseRole.admin,
    });

    prismaMock.commune.findFirst.mockResolvedValueOnce(mock<Commune>());

    await deleteCommune(11, loggedUser);

    expect(prismaMock.commune.delete).toHaveBeenCalledTimes(1);
    expect(prismaMock.commune.delete).toHaveBeenLastCalledWith({
      where: {
        id: 11,
      },
    });
  });

  test("should return an error when deleting a non-owned city as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: DatabaseRole.contributor,
    });

    prismaMock.commune.findFirst.mockResolvedValueOnce(mock<Commune>());

    await expect(deleteCommune(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(prismaMock.commune.delete).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(deleteCommune(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.commune.delete).not.toHaveBeenCalled();
  });
});

test("Create multiple cities", async () => {
  const communesData = [
    mock<Omit<Prisma.CommuneCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.CommuneCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.CommuneCreateManyInput, "ownerId">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  await createCommunes(communesData, loggedUser);

  expect(prismaMock.commune.createMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.commune.createMany).toHaveBeenLastCalledWith({
    data: communesData.map((commune) => {
      return {
        ...commune,
        ownerId: loggedUser.id,
      };
    }),
  });
});
