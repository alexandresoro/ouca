import { DatabaseRole, Milieu, Prisma } from "@prisma/client";
import { mock } from "jest-mock-extended";
import { MutationUpsertMilieuArgs, QueryPaginatedMilieuxArgs } from "../../graphql/generated/graphql-types";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_CODE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { isEntityReadOnly, queryParametersToFindAllEntities } from "./entities-utils";
import {
  createMilieux,
  deleteMilieu,
  findMilieu,
  findMilieux,
  findMilieuxByIds,
  findPaginatedMilieux,
  getDonneesCountByMilieu,
  getMilieuxCount,
  upsertMilieu,
} from "./milieu-service";

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

describe("Find environment", () => {
  test("should handle a matching environment", async () => {
    const environmentData = mock<Milieu>();
    const loggedUser = mock<LoggedUser>();

    prismaMock.milieu.findUnique.mockResolvedValueOnce(environmentData);

    await findMilieu(environmentData.id, loggedUser);

    expect(prismaMock.milieu.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.milieu.findUnique).toHaveBeenLastCalledWith({
      where: {
        id: environmentData.id,
      },
    });
  });

  test("should handle environment not found", async () => {
    prismaMock.milieu.findUnique.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(findMilieu(10, loggedUser)).resolves.toBe(null);

    expect(prismaMock.milieu.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.milieu.findUnique).toHaveBeenLastCalledWith({
      where: {
        id: 10,
      },
    });
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(findMilieu(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.milieu.findUnique).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await getDonneesCountByMilieu(12, loggedUser);

    expect(prismaMock.donnee.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.donnee.count).toHaveBeenLastCalledWith<[Prisma.DonneeCountArgs]>({
      where: {
        donnee_milieu: {
          some: {
            milieu_id: 12,
          },
        },
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(getDonneesCountByMilieu(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find list of environments by IDs", async () => {
  const environmentsData = [mock<Milieu>(), mock<Milieu>(), mock<Milieu>()];

  prismaMock.milieu.findMany.mockResolvedValueOnce(environmentsData);

  await findMilieuxByIds(environmentsData.map((environment) => environment.id));

  expect(prismaMock.milieu.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.milieu.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    where: {
      id: {
        in: environmentsData.map((environment) => environment.id),
      },
    },
  });
});

test("Find all environments", async () => {
  const environmentsCodeData = [
    mock<Milieu>({ id: 1, code: "0017" }),
    mock<Milieu>({ id: 7, code: "0357" }),
    mock<Milieu>({ id: 2, code: "22A0" }),
  ];
  const environmentsLibelleData = [
    mock<Milieu>({ id: 5, code: "7654" }),
    mock<Milieu>({ id: 2, code: "22A0" }),
    mock<Milieu>({ id: 6, code: "1177" }),
  ];
  const loggedUser = mock<LoggedUser>();

  prismaMock.milieu.findMany.mockResolvedValueOnce(environmentsCodeData);
  prismaMock.milieu.findMany.mockResolvedValueOnce(environmentsLibelleData);

  const milieux = await findMilieux(loggedUser);

  expect(milieux.length).toBe(5);
  expect(milieux[0].code).toBe("0017");
  expect(milieux[1].code).toBe("0357");
  expect(milieux[2].code).toBe("1177");
  expect(milieux[3].code).toBe("22A0");
  expect(milieux[4].code).toBe("7654");

  expect(prismaMock.milieu.findMany).toHaveBeenCalledTimes(2);
  expect(prismaMock.milieu.findMany).toHaveBeenNthCalledWith(1, {
    ...queryParametersToFindAllEntities(COLUMN_CODE),
  });
  expect(prismaMock.milieu.findMany).toHaveBeenNthCalledWith(2, {
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    where: {
      libelle: {
        contains: undefined,
      },
    },
  });
  expect(prismaMock.milieu.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    where: {
      libelle: {
        contains: undefined,
      },
    },
  });
});

test("should call readonly status when retrieving paginated environments", async () => {
  const environmentsData = [mock<Milieu>(), mock<Milieu>(), mock<Milieu>()];

  prismaMock.milieu.findMany.mockResolvedValueOnce(environmentsData);

  await findPaginatedMilieux();

  expect(prismaMock.milieu.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.milieu.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    orderBy: undefined,
    where: {},
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(environmentsData.length);
});

test("should handle params when retrieving paginated environments ", async () => {
  const environmentsData = [mock<Milieu>(), mock<Milieu>(), mock<Milieu>()];

  const searchParams: QueryPaginatedMilieuxArgs = {
    orderBy: "libelle",
    sortOrder: "desc",
    searchParams: {
      q: "Bob",
      pageNumber: 0,
      pageSize: 10,
    },
    includeCounts: false,
  };

  prismaMock.milieu.findMany.mockResolvedValueOnce([environmentsData[0]]);

  await findPaginatedMilieux(searchParams);

  expect(prismaMock.milieu.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.milieu.findMany).toHaveBeenLastCalledWith({
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
      ],
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await getMilieuxCount(loggedUser);

    expect(prismaMock.milieu.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.milieu.count).toHaveBeenLastCalledWith({
      where: {},
    });
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await getMilieuxCount(loggedUser, "test");

    expect(prismaMock.milieu.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.milieu.count).toHaveBeenLastCalledWith({
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
        ],
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(getMilieuxCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of an environment", () => {
  test("should be allowed when requested by an admin", async () => {
    const environmentData = mock<MutationUpsertMilieuArgs>();

    const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });

    await upsertMilieu(environmentData, loggedUser);

    expect(prismaMock.milieu.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.milieu.update).toHaveBeenLastCalledWith({
      data: environmentData.data,
      where: {
        id: environmentData.id,
      },
    });
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = mock<Milieu>({
      ownerId: "notAdmin",
    });

    const environmentData = mock<MutationUpsertMilieuArgs>();

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    prismaMock.milieu.findFirst.mockResolvedValueOnce(existingData);

    await upsertMilieu(environmentData, loggedUser);

    expect(prismaMock.milieu.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.milieu.update).toHaveBeenLastCalledWith({
      data: environmentData.data,
      where: {
        id: environmentData.id,
      },
    });
  });

  test("should throw an error when requested by an user that is nor owner nor admin", async () => {
    const existingData = mock<Milieu>({
      ownerId: "notAdmin",
    });

    const environmentData = mock<MutationUpsertMilieuArgs>();

    const user = {
      id: "Bob",
      role: DatabaseRole.contributor,
    };

    prismaMock.milieu.findFirst.mockResolvedValueOnce(existingData);

    await expect(upsertMilieu(environmentData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

    expect(prismaMock.milieu.update).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to an environment that exists", async () => {
    const environmentData = mock<MutationUpsertMilieuArgs>({
      id: 12,
    });

    const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });

    prismaMock.milieu.update.mockImplementation(prismaConstraintFailed);

    await expect(() => upsertMilieu(environmentData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", prismaConstraintFailedError)
    );

    expect(prismaMock.milieu.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.milieu.update).toHaveBeenLastCalledWith({
      data: environmentData.data,
      where: {
        id: environmentData.id,
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const environmentData = mock<MutationUpsertMilieuArgs>({
      id: 12,
    });

    await expect(upsertMilieu(environmentData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.milieu.update).not.toHaveBeenCalled();
  });
});

describe("Creation of an environment", () => {
  test("should create new environment", async () => {
    const environmentData = mock<MutationUpsertMilieuArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    await upsertMilieu(environmentData, loggedUser);

    expect(prismaMock.milieu.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.milieu.create).toHaveBeenLastCalledWith({
      data: {
        ...environmentData.data,
        ownerId: loggedUser.id,
      },
    });
  });

  test("should throw an error when trying to create an environment that already exists", async () => {
    const environmentData = mock<MutationUpsertMilieuArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    prismaMock.milieu.create.mockImplementation(prismaConstraintFailed);

    await expect(() => upsertMilieu(environmentData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", prismaConstraintFailedError)
    );

    expect(prismaMock.milieu.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.milieu.create).toHaveBeenLastCalledWith({
      data: {
        ...environmentData.data,
        ownerId: loggedUser.id,
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const environmentData = mock<MutationUpsertMilieuArgs>({
      id: undefined,
    });

    await expect(upsertMilieu(environmentData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.milieu.create).not.toHaveBeenCalled();
  });
});

describe("Deletion of an environment", () => {
  test("should handle the deletion of an owned environment", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: DatabaseRole.contributor,
    };

    const environment = mock<Milieu>({
      ownerId: loggedUser.id,
    });

    prismaMock.milieu.findFirst.mockResolvedValueOnce(environment);

    await deleteMilieu(11, loggedUser);

    expect(prismaMock.milieu.delete).toHaveBeenCalledTimes(1);
    expect(prismaMock.milieu.delete).toHaveBeenLastCalledWith({
      where: {
        id: 11,
      },
    });
  });

  test("hould handle the deletion of any environment if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: DatabaseRole.admin,
    });

    prismaMock.milieu.findFirst.mockResolvedValueOnce(mock<Milieu>());

    await deleteMilieu(11, loggedUser);

    expect(prismaMock.milieu.delete).toHaveBeenCalledTimes(1);
    expect(prismaMock.milieu.delete).toHaveBeenLastCalledWith({
      where: {
        id: 11,
      },
    });
  });

  test("should return an error when deleting a non-owned environment as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: DatabaseRole.contributor,
    });

    prismaMock.milieu.findFirst.mockResolvedValueOnce(mock<Milieu>());

    await expect(deleteMilieu(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(prismaMock.milieu.delete).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(deleteMilieu(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.milieu.delete).not.toHaveBeenCalled();
  });
});

test("Create multiple environments", async () => {
  const environmentsData = [
    mock<Omit<Prisma.MilieuCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.MilieuCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.MilieuCreateManyInput, "ownerId">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  await createMilieux(environmentsData, loggedUser);

  expect(prismaMock.milieu.createMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.milieu.createMany).toHaveBeenLastCalledWith({
    data: environmentsData.map((environment) => {
      return {
        ...environment,
        ownerId: loggedUser.id,
      };
    }),
  });
});
