import { DatabaseRole, Meteo, Prisma } from "@prisma/client";
import { mock } from "jest-mock-extended";
import { MutationUpsertMeteoArgs, QueryPaginatedMeteosArgs } from "../../graphql/generated/graphql-types";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { isEntityReadOnly, queryParametersToFindAllEntities } from "./entities-utils";
import {
  createMeteos,
  deleteMeteo,
  findMeteo,
  findMeteos,
  findMeteosByIds,
  findPaginatedMeteos,
  getDonneesCountByMeteo,
  getMeteosCount,
  upsertMeteo,
} from "./meteo-service";

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

describe("Find weather", () => {
  test("should handle a matching weather", async () => {
    const weatherData = mock<Meteo>();
    const loggedUser = mock<LoggedUser>();

    prismaMock.meteo.findUnique.mockResolvedValueOnce(weatherData);

    await findMeteo(weatherData.id, loggedUser);

    expect(prismaMock.meteo.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.meteo.findUnique).toHaveBeenLastCalledWith({
      where: {
        id: weatherData.id,
      },
    });
    expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
  });

  test("should handle weather not found", async () => {
    prismaMock.meteo.findUnique.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(findMeteo(10, loggedUser)).resolves.toBe(null);

    expect(prismaMock.meteo.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.meteo.findUnique).toHaveBeenLastCalledWith({
      where: {
        id: 10,
      },
    });
    expect(isEntityReadOnly).not.toHaveBeenCalled();
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(findMeteo(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.meteo.findUnique).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await getDonneesCountByMeteo(12, loggedUser);

    expect(prismaMock.donnee.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.donnee.count).toHaveBeenLastCalledWith<[Prisma.DonneeCountArgs]>({
      where: {
        inventaire: {
          inventaire_meteo: {
            some: {
              meteo_id: 12,
            },
          },
        },
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(getDonneesCountByMeteo(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("should call readonly status when retrieving weathers by ID ", async () => {
  const weathersData = [mock<Meteo>(), mock<Meteo>(), mock<Meteo>()];

  prismaMock.meteo.findMany.mockResolvedValueOnce(weathersData);

  await findMeteosByIds(weathersData.map((weather) => weather.id));

  expect(prismaMock.meteo.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.meteo.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      id: {
        in: weathersData.map((weather) => weather.id),
      },
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(weathersData.length);
});

test("should call readonly status when retrieving weathers by params", async () => {
  const weathersData = [mock<Meteo>(), mock<Meteo>(), mock<Meteo>()];

  prismaMock.meteo.findMany.mockResolvedValueOnce(weathersData);

  await findMeteos();

  expect(prismaMock.meteo.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.meteo.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      libelle: {
        contains: undefined,
      },
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(weathersData.length);
});

test("should call readonly status when retrieving paginated weathers", async () => {
  const weathersData = [mock<Meteo>(), mock<Meteo>(), mock<Meteo>()];

  prismaMock.meteo.findMany.mockResolvedValueOnce(weathersData);

  await findPaginatedMeteos();

  expect(prismaMock.meteo.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.meteo.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    orderBy: {},
    where: {},
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(weathersData.length);
});

test("should handle params when retrieving paginated weathers", async () => {
  const weathersData = [mock<Meteo>(), mock<Meteo>(), mock<Meteo>()];

  const searchParams: QueryPaginatedMeteosArgs = {
    orderBy: "libelle",
    sortOrder: "desc",
    searchParams: {
      q: "Bob",
      pageNumber: 0,
      pageSize: 10,
    },
    includeCounts: false,
  };

  prismaMock.meteo.findMany.mockResolvedValueOnce([weathersData[0]]);

  await findPaginatedMeteos(searchParams);

  expect(prismaMock.meteo.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.meteo.findMany).toHaveBeenLastCalledWith({
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
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await getMeteosCount(loggedUser);

    expect(prismaMock.meteo.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.meteo.count).toHaveBeenLastCalledWith({
      where: {},
    });
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await getMeteosCount(loggedUser, "test");

    expect(prismaMock.meteo.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.meteo.count).toHaveBeenLastCalledWith({
      where: {
        libelle: {
          contains: "test",
        },
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(getMeteosCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("should update an existing weather as an admin ", async () => {
  const weatherData = mock<MutationUpsertMeteoArgs>();

  const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });

  await upsertMeteo(weatherData, loggedUser);

  expect(prismaMock.meteo.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.meteo.update).toHaveBeenLastCalledWith({
    data: weatherData.data,
    where: {
      id: weatherData.id,
    },
  });
});

test("should update an existing weather if owner ", async () => {
  const existingData = mock<Meteo>({
    ownerId: "notAdmin",
  });

  const weatherData = mock<MutationUpsertMeteoArgs>();

  const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

  prismaMock.meteo.findFirst.mockResolvedValueOnce(existingData);

  await upsertMeteo(weatherData, loggedUser);

  expect(prismaMock.meteo.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.meteo.update).toHaveBeenLastCalledWith({
    data: weatherData.data,
    where: {
      id: weatherData.id,
    },
  });
});

test("should throw an error when updating an existing weather and nor owner nor admin ", async () => {
  const existingData = mock<Meteo>({
    ownerId: "notAdmin",
  });

  const weatherData = mock<MutationUpsertMeteoArgs>();

  const user = {
    id: "Bob",
    role: DatabaseRole.contributor,
  };

  prismaMock.meteo.findFirst.mockResolvedValueOnce(existingData);

  await expect(upsertMeteo(weatherData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

  expect(prismaMock.meteo.update).not.toHaveBeenCalled();
});

test("should throw an error when trying to update a weather that exists", async () => {
  const weatherData = mock<MutationUpsertMeteoArgs>({
    id: 12,
  });

  const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });

  prismaMock.meteo.update.mockImplementation(prismaConstraintFailed);

  await expect(() => upsertMeteo(weatherData, loggedUser)).rejects.toThrowError(
    new OucaError("OUCA0004", prismaConstraintFailedError)
  );

  expect(prismaMock.meteo.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.meteo.update).toHaveBeenLastCalledWith({
    data: weatherData.data,
    where: {
      id: weatherData.id,
    },
  });
});

test("should throw an error when the requester is not logged", async () => {
  const weatherData = mock<MutationUpsertMeteoArgs>({
    id: 12,
  });

  await expect(upsertMeteo(weatherData, null)).rejects.toEqual(new OucaError("OUCA0001"));
  expect(prismaMock.meteo.update).not.toHaveBeenCalled();
});

describe("Creation of a weather", () => {
  test("should create new weather", async () => {
    const weatherData = mock<MutationUpsertMeteoArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    await upsertMeteo(weatherData, loggedUser);

    expect(prismaMock.meteo.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.meteo.create).toHaveBeenLastCalledWith({
      data: {
        ...weatherData.data,
        ownerId: loggedUser.id,
      },
    });
  });

  test("should throw an error when trying to create a weather that already exists", async () => {
    const weatherData = mock<MutationUpsertMeteoArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    prismaMock.meteo.create.mockImplementation(prismaConstraintFailed);

    await expect(() => upsertMeteo(weatherData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", prismaConstraintFailedError)
    );

    expect(prismaMock.meteo.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.meteo.create).toHaveBeenLastCalledWith({
      data: {
        ...weatherData.data,
        ownerId: loggedUser.id,
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const weatherData = mock<MutationUpsertMeteoArgs>({
      id: undefined,
    });

    await expect(upsertMeteo(weatherData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.meteo.create).not.toHaveBeenCalled();
  });
});

describe("Deletion of a weather", () => {
  test("should handle the deletion of an owned weather", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: DatabaseRole.contributor,
    };

    const meteo = mock<Meteo>({
      ownerId: loggedUser.id,
    });

    prismaMock.meteo.findFirst.mockResolvedValueOnce(meteo);

    await deleteMeteo(11, loggedUser);

    expect(prismaMock.meteo.delete).toHaveBeenCalledTimes(1);
    expect(prismaMock.meteo.delete).toHaveBeenLastCalledWith({
      where: {
        id: 11,
      },
    });
  });

  test("should handle the deletion of any weather if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: DatabaseRole.admin,
    });

    prismaMock.classe.findFirst.mockResolvedValueOnce(mock<Meteo>());

    await deleteMeteo(11, loggedUser);

    expect(prismaMock.meteo.delete).toHaveBeenCalledTimes(1);
    expect(prismaMock.meteo.delete).toHaveBeenLastCalledWith({
      where: {
        id: 11,
      },
    });
  });

  test("should return an error when deleting a non-owned weather as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: DatabaseRole.contributor,
    });

    prismaMock.classe.findFirst.mockResolvedValueOnce(mock<Meteo>());

    await expect(deleteMeteo(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(prismaMock.meteo.delete).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(deleteMeteo(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.meteo.delete).not.toHaveBeenCalled();
  });
});

test("Create multiple weathers", async () => {
  const weathersData = [
    mock<Omit<Prisma.MeteoCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.MeteoCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.MeteoCreateManyInput, "ownerId">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  await createMeteos(weathersData, loggedUser);

  expect(prismaMock.meteo.createMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.meteo.createMany).toHaveBeenLastCalledWith({
    data: weathersData.map((weather) => {
      return {
        ...weather,
        ownerId: loggedUser.id,
      };
    }),
  });
});
