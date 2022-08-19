import { Age, DatabaseRole, Prisma } from "@prisma/client";
import { mock } from "jest-mock-extended";
import { MutationUpsertAgeArgs, QueryPaginatedAgesArgs } from "../../graphql/generated/graphql-types";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { createAges, deleteAge, findAge, findAges, findPaginatedAges, upsertAge } from "./age-service";
import { isEntityReadOnly, queryParametersToFindAllEntities } from "./entities-utils";

jest.mock("./entities-utils", () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const actualModule = jest.requireActual("./entities-utils");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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

test("should call readonly status when retrieving one age ", async () => {
  const ageData = mock<Age>();

  prismaMock.age.findUnique.mockResolvedValueOnce(ageData);

  await findAge(ageData.id);

  expect(prismaMock.age.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.age.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: ageData.id,
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
});

test("should handle age not found ", async () => {
  prismaMock.age.findUnique.mockResolvedValueOnce(null);

  await expect(findAge(10)).resolves.toBe(null);

  expect(prismaMock.age.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.age.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: 10,
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(0);
});

test("should call readonly status when retrieving ages by params ", async () => {
  const agesData = [mock<Age>(), mock<Age>(), mock<Age>()];

  prismaMock.age.findMany.mockResolvedValueOnce(agesData);

  await findAges();

  expect(prismaMock.age.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.age.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      libelle: {
        contains: undefined,
      },
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(agesData.length);
});

test("should call readonly status when retrieving paginated ages", async () => {
  const agesData = [mock<Age>(), mock<Age>(), mock<Age>()];

  prismaMock.age.findMany.mockResolvedValueOnce(agesData);

  await findPaginatedAges();

  expect(prismaMock.age.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.age.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    orderBy: undefined,
    where: {},
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(agesData.length);
});

test("should handle params when retrieving paginated ages ", async () => {
  const agesData = [mock<Age>(), mock<Age>(), mock<Age>()];

  const searchParams: QueryPaginatedAgesArgs = {
    orderBy: "libelle",
    sortOrder: "desc",
    searchParams: {
      q: "Bob",
      pageNumber: 0,
      pageSize: 10,
    },
    includeCounts: false,
  };

  prismaMock.age.findMany.mockResolvedValueOnce([agesData[0]]);

  await findPaginatedAges(searchParams);

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
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
});

test("should update an existing age as an admin ", async () => {
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

test("should update an existing age if owner ", async () => {
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

test("should throw an error when updating an existing age and nor owner nor admin ", async () => {
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

test("should throw an error when trying to update an age that exists", async () => {
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

test("should create new age ", async () => {
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

test("should throw an error when trying to create an age that exists", async () => {
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

test("should be able to delete an owned age", async () => {
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

test("should be able to delete any age if admin", async () => {
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

test("should create new ages", async () => {
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
