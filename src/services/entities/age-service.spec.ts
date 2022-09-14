import { Age, DatabaseRole, Prisma } from "@prisma/client";
import { mock } from "jest-mock-extended";
import { MutationUpsertAgeArgs, QueryAgesArgs } from "../../graphql/generated/graphql-types";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import {
  createAges,
  deleteAge,
  findAge,
  findAges,
  findPaginatedAges,
  getAgesCount,
  getNbDonneesOfAge,
  upsertAge,
} from "./age-service";
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

describe("Find age", () => {
  test("should handle a matching age", async () => {
    const ageData = mock<Age>();
    const loggedUser = mock<LoggedUser>();

    prismaMock.age.findUnique.mockResolvedValueOnce(ageData);

    await findAge(ageData.id, loggedUser);

    expect(prismaMock.age.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.age.findUnique).toHaveBeenLastCalledWith({
      where: {
        id: ageData.id,
      },
    });
  });

  test("should handle age not found", async () => {
    prismaMock.age.findUnique.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(findAge(10, loggedUser)).resolves.toBe(null);

    expect(prismaMock.age.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.age.findUnique).toHaveBeenLastCalledWith({
      where: {
        id: 10,
      },
    });
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(findAge(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.age.findUnique).not.toHaveBeenCalled();
  });
});

describe("Number of associated data", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await getNbDonneesOfAge(12, loggedUser);

    expect(prismaMock.donnee.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.donnee.count).toHaveBeenLastCalledWith({
      where: {
        ageId: 12,
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(getNbDonneesOfAge(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all ages", async () => {
  const agesData = [mock<Age>(), mock<Age>(), mock<Age>()];
  const loggedUser = mock<LoggedUser>();

  prismaMock.age.findMany.mockResolvedValueOnce(agesData);

  await findAges(loggedUser);

  expect(prismaMock.age.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.age.findMany).toHaveBeenLastCalledWith({
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
    const agesData = [mock<Age>(), mock<Age>(), mock<Age>()];
    const loggedUser = mock<LoggedUser>();

    prismaMock.age.findMany.mockResolvedValueOnce(agesData);

    await findPaginatedAges(loggedUser);

    expect(prismaMock.age.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.age.findMany).toHaveBeenLastCalledWith({
      ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
      orderBy: undefined,
      where: {},
    });
  });

  test("should handle params when retrieving paginated ages ", async () => {
    const agesData = [mock<Age>(), mock<Age>(), mock<Age>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: QueryAgesArgs = {
      orderBy: "libelle",
      sortOrder: "desc",
      searchParams: {
        q: "Bob",
        pageNumber: 0,
        pageSize: 10,
      },
    };

    prismaMock.age.findMany.mockResolvedValueOnce([agesData[0]]);

    await findPaginatedAges(loggedUser, searchParams);

    expect(prismaMock.age.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.age.findMany).toHaveBeenLastCalledWith({
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
    await expect(findPaginatedAges(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await getAgesCount(loggedUser);

    expect(prismaMock.age.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.age.count).toHaveBeenLastCalledWith({
      where: {},
    });
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await getAgesCount(loggedUser, "test");

    expect(prismaMock.age.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.age.count).toHaveBeenLastCalledWith({
      where: {
        libelle: {
          contains: "test",
        },
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(getAgesCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of an age", () => {
  test("should be allowed when requested by an admin ", async () => {
    const ageData = mock<MutationUpsertAgeArgs>();

    const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });

    await upsertAge(ageData, loggedUser);

    expect(prismaMock.age.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.age.update).toHaveBeenLastCalledWith({
      data: ageData.data,
      where: {
        id: ageData.id,
      },
    });
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = mock<Age>({
      ownerId: "notAdmin",
    });

    const ageData = mock<MutationUpsertAgeArgs>();

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    prismaMock.age.findFirst.mockResolvedValueOnce(existingData);

    await upsertAge(ageData, loggedUser);

    expect(prismaMock.age.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.age.update).toHaveBeenLastCalledWith({
      data: ageData.data,
      where: {
        id: ageData.id,
      },
    });
  });

  test("should throw an error when requested by an user that is nor owner nor admin ", async () => {
    const existingData = mock<Age>({
      ownerId: "notAdmin",
    });

    const ageData = mock<MutationUpsertAgeArgs>();

    const user = {
      id: "Bob",
      role: DatabaseRole.contributor,
    };

    prismaMock.age.findFirst.mockResolvedValueOnce(existingData);

    await expect(upsertAge(ageData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

    expect(prismaMock.age.update).toHaveBeenCalledTimes(0);
  });

  test("should throw an error when trying to update to an age that exists", async () => {
    const ageData = mock<MutationUpsertAgeArgs>({
      id: 12,
    });

    const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });

    prismaMock.age.update.mockImplementation(prismaConstraintFailed);

    await expect(() => upsertAge(ageData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", prismaConstraintFailedError)
    );

    expect(prismaMock.age.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.age.update).toHaveBeenLastCalledWith({
      data: ageData.data,
      where: {
        id: ageData.id,
      },
    });
  });
});

describe("Creation of an age", () => {
  test("should create new age", async () => {
    const ageData = mock<MutationUpsertAgeArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    await upsertAge(ageData, loggedUser);

    expect(prismaMock.age.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.age.create).toHaveBeenLastCalledWith({
      data: {
        ...ageData.data,
        ownerId: loggedUser.id,
      },
    });
  });

  test("should throw an error when trying to create an age that already exists", async () => {
    const ageData = mock<MutationUpsertAgeArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    prismaMock.age.create.mockImplementation(prismaConstraintFailed);

    await expect(() => upsertAge(ageData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", prismaConstraintFailedError)
    );

    expect(prismaMock.age.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.age.create).toHaveBeenLastCalledWith({
      data: {
        ...ageData.data,
        ownerId: loggedUser.id,
      },
    });
  });
});

describe("Deletion of an age", () => {
  test("should handle the deletion of an owned age", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: DatabaseRole.contributor,
    };

    const age = mock<Age>({
      ownerId: loggedUser.id,
    });

    prismaMock.age.findFirst.mockResolvedValueOnce(age);

    await deleteAge(11, loggedUser);

    expect(prismaMock.age.delete).toHaveBeenCalledTimes(1);
    expect(prismaMock.age.delete).toHaveBeenLastCalledWith({
      where: {
        id: 11,
      },
    });
  });

  test("should handle the deletion of any age if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: DatabaseRole.admin,
    });

    prismaMock.age.findFirst.mockResolvedValueOnce(mock<Age>());

    await deleteAge(11, loggedUser);

    expect(prismaMock.age.delete).toHaveBeenCalledTimes(1);
    expect(prismaMock.age.delete).toHaveBeenLastCalledWith({
      where: {
        id: 11,
      },
    });
  });

  test("should return an error when deleting a non-owned age as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: DatabaseRole.contributor,
    });

    prismaMock.age.findFirst.mockResolvedValueOnce(mock<Age>());

    await expect(deleteAge(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(prismaMock.age.delete).toHaveBeenCalledTimes(0);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(deleteAge(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.age.delete).toHaveBeenCalledTimes(0);
  });
});

test("Create multiple ages", async () => {
  const agesData = [
    mock<Omit<Prisma.AgeCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.AgeCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.AgeCreateManyInput, "ownerId">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  await createAges(agesData, loggedUser);

  expect(prismaMock.age.createMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.age.createMany).toHaveBeenLastCalledWith({
    data: agesData.map((age) => {
      return {
        ...age,
        ownerId: loggedUser.id,
      };
    }),
  });
});
