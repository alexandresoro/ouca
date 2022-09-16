import { DatabaseRole, Prisma, Sexe } from "@prisma/client";
import { mock } from "jest-mock-extended";
import { MutationUpsertSexeArgs, QueryPaginatedSexesArgs } from "../../graphql/generated/graphql-types";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { queryParametersToFindAllEntities } from "./entities-utils";
import {
  createSexes,
  deleteSexe,
  findPaginatedSexes,
  findSexe,
  findSexes,
  getDonneesCountBySexe,
  getSexesCount,
  upsertSexe,
} from "./sexe-service";

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

describe("Find sex", () => {
  test("should handle a matching sex", async () => {
    const sexData = mock<Sexe>();
    const loggedUser = mock<LoggedUser>();

    prismaMock.sexe.findUnique.mockResolvedValueOnce(sexData);

    await findSexe(sexData.id, loggedUser);

    expect(prismaMock.sexe.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.sexe.findUnique).toHaveBeenLastCalledWith({
      where: {
        id: sexData.id,
      },
    });
  });

  test("should handle sex not found", async () => {
    prismaMock.sexe.findUnique.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(findSexe(10, loggedUser)).resolves.toBe(null);

    expect(prismaMock.sexe.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.sexe.findUnique).toHaveBeenLastCalledWith({
      where: {
        id: 10,
      },
    });
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(findSexe(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.sexe.findUnique).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await getDonneesCountBySexe(12, loggedUser);

    expect(prismaMock.donnee.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.donnee.count).toHaveBeenLastCalledWith<[Prisma.DonneeCountArgs]>({
      where: {
        sexeId: 12,
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(getDonneesCountBySexe(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all sexes", async () => {
  const sexesData = [mock<Sexe>(), mock<Sexe>(), mock<Sexe>()];
  const loggedUser = mock<LoggedUser>();

  prismaMock.sexe.findMany.mockResolvedValueOnce(sexesData);

  await findSexes(loggedUser);

  expect(prismaMock.sexe.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.sexe.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      libelle: {
        contains: undefined,
      },
    },
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const sexesData = [mock<Sexe>(), mock<Sexe>(), mock<Sexe>()];
    const loggedUser = mock<LoggedUser>();

    prismaMock.sexe.findMany.mockResolvedValueOnce(sexesData);

    await findPaginatedSexes(loggedUser);

    expect(prismaMock.sexe.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.sexe.findMany).toHaveBeenLastCalledWith({
      ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
      orderBy: undefined,
      where: {},
    });
  });

  test("should handle params when retrieving paginated sexes ", async () => {
    const sexesData = [mock<Sexe>(), mock<Sexe>(), mock<Sexe>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: QueryPaginatedSexesArgs = {
      orderBy: "libelle",
      sortOrder: "desc",
      searchParams: {
        q: "Bob",
        pageNumber: 0,
        pageSize: 10,
      },
      includeCounts: false,
    };

    prismaMock.sexe.findMany.mockResolvedValueOnce([sexesData[0]]);

    await findPaginatedSexes(loggedUser, searchParams);

    expect(prismaMock.sexe.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.sexe.findMany).toHaveBeenLastCalledWith({
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
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(findPaginatedSexes(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await getSexesCount(loggedUser);

    expect(prismaMock.sexe.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.sexe.count).toHaveBeenLastCalledWith({
      where: {},
    });
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await getSexesCount(loggedUser, "test");

    expect(prismaMock.sexe.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.sexe.count).toHaveBeenLastCalledWith({
      where: {
        libelle: {
          contains: "test",
        },
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(getSexesCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of a sex", () => {
  test("should be allowed when requested by an admin ", async () => {
    const sexData = mock<MutationUpsertSexeArgs>();

    const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });

    await upsertSexe(sexData, loggedUser);

    expect(prismaMock.sexe.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.sexe.update).toHaveBeenLastCalledWith({
      data: sexData.data,
      where: {
        id: sexData.id,
      },
    });
  });

  test("should be allowed when requested by the owner ", async () => {
    const existingData = mock<Sexe>({
      ownerId: "notAdmin",
    });

    const sexData = mock<MutationUpsertSexeArgs>();

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    prismaMock.sexe.findFirst.mockResolvedValueOnce(existingData);

    await upsertSexe(sexData, loggedUser);

    expect(prismaMock.sexe.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.sexe.update).toHaveBeenLastCalledWith({
      data: sexData.data,
      where: {
        id: sexData.id,
      },
    });
  });

  test("should throw an error when requested by an user that is nor owner nor admin", async () => {
    const existingData = mock<Sexe>({
      ownerId: "notAdmin",
    });

    const sexData = mock<MutationUpsertSexeArgs>();

    const user = {
      id: "Bob",
      role: DatabaseRole.contributor,
    };

    prismaMock.sexe.findFirst.mockResolvedValueOnce(existingData);

    await expect(upsertSexe(sexData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

    expect(prismaMock.sexe.update).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to a sex that exists", async () => {
    const sexData = mock<MutationUpsertSexeArgs>({
      id: 12,
    });

    const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });

    prismaMock.sexe.update.mockImplementation(prismaConstraintFailed);

    await expect(() => upsertSexe(sexData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", prismaConstraintFailedError)
    );

    expect(prismaMock.sexe.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.sexe.update).toHaveBeenLastCalledWith({
      data: sexData.data,
      where: {
        id: sexData.id,
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const sexData = mock<MutationUpsertSexeArgs>({
      id: 12,
    });

    await expect(upsertSexe(sexData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.sexe.update).not.toHaveBeenCalled();
  });
});

describe("Creation of a sex", () => {
  test("should create new sex", async () => {
    const sexData = mock<MutationUpsertSexeArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    await upsertSexe(sexData, loggedUser);

    expect(prismaMock.sexe.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.sexe.create).toHaveBeenLastCalledWith({
      data: {
        ...sexData.data,
        ownerId: loggedUser.id,
      },
    });
  });

  test("should throw an error when trying to create a sex that already exists", async () => {
    const sexData = mock<MutationUpsertSexeArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    prismaMock.sexe.create.mockImplementation(prismaConstraintFailed);

    await expect(() => upsertSexe(sexData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", prismaConstraintFailedError)
    );

    expect(prismaMock.sexe.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.sexe.create).toHaveBeenLastCalledWith({
      data: {
        ...sexData.data,
        ownerId: loggedUser.id,
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const sexData = mock<MutationUpsertSexeArgs>({
      id: undefined,
    });

    await expect(upsertSexe(sexData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.sexe.create).not.toHaveBeenCalled();
  });
});

describe("Deletion of a sex", () => {
  test("should handle the deletion of an owned sex", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: DatabaseRole.contributor,
    };

    const sex = mock<Sexe>({
      ownerId: loggedUser.id,
    });

    prismaMock.sexe.findFirst.mockResolvedValueOnce(sex);

    await deleteSexe(11, loggedUser);

    expect(prismaMock.sexe.delete).toHaveBeenCalledTimes(1);
    expect(prismaMock.sexe.delete).toHaveBeenLastCalledWith({
      where: {
        id: 11,
      },
    });
  });

  test("should handle the deletion of any sex if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: DatabaseRole.admin,
    });

    prismaMock.sexe.findFirst.mockResolvedValueOnce(mock<Sexe>());

    await deleteSexe(11, loggedUser);

    expect(prismaMock.sexe.delete).toHaveBeenCalledTimes(1);
    expect(prismaMock.sexe.delete).toHaveBeenLastCalledWith({
      where: {
        id: 11,
      },
    });
  });

  test("should return an error when deleting a non-owned sex as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: DatabaseRole.contributor,
    });

    prismaMock.sexe.findFirst.mockResolvedValueOnce(mock<Sexe>());

    await expect(deleteSexe(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(prismaMock.sexe.delete).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(deleteSexe(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.sexe.delete).not.toHaveBeenCalled();
  });
});

test("Create multiple sexes", async () => {
  const sexesData = [
    mock<Omit<Prisma.SexeCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.SexeCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.SexeCreateManyInput, "ownerId">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  await createSexes(sexesData, loggedUser);

  expect(prismaMock.sexe.createMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.sexe.createMany).toHaveBeenLastCalledWith({
    data: sexesData.map((sex) => {
      return {
        ...sex,
        ownerId: loggedUser.id,
      };
    }),
  });
});
