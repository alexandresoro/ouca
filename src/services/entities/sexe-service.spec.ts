import { DatabaseRole, Prisma, Sexe } from "@prisma/client";
import { mock } from "jest-mock-extended";
import { MutationUpsertSexeArgs, QueryPaginatedSexesArgs } from "../../graphql/generated/graphql-types";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { isEntityReadOnly, queryParametersToFindAllEntities } from "./entities-utils";
import { createSexes, deleteSexe, findPaginatedSexes, findSexe, findSexes, upsertSexe } from "./sexe-service";

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

test("should call readonly status when retrieving one sex ", async () => {
  const sexData = mock<Sexe>();

  prismaMock.sexe.findUnique.mockResolvedValueOnce(sexData);

  await findSexe(sexData.id);

  expect(prismaMock.sexe.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.sexe.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: sexData.id,
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
});

test("should handle sex not found ", async () => {
  prismaMock.sexe.findUnique.mockResolvedValueOnce(null);

  await expect(findSexe(10)).resolves.toBe(null);

  expect(prismaMock.sexe.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.sexe.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: 10,
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(0);
});

test("should call readonly status when retrieving sexes by params ", async () => {
  const sexesData = [mock<Sexe>(), mock<Sexe>(), mock<Sexe>()];

  prismaMock.sexe.findMany.mockResolvedValueOnce(sexesData);

  await findSexes();

  expect(prismaMock.sexe.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.sexe.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      libelle: {
        contains: undefined,
      },
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(sexesData.length);
});

test("should call readonly status when retrieving paginated sexes", async () => {
  const sexesData = [mock<Sexe>(), mock<Sexe>(), mock<Sexe>()];

  prismaMock.sexe.findMany.mockResolvedValueOnce(sexesData);

  await findPaginatedSexes();

  expect(prismaMock.sexe.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.sexe.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    orderBy: undefined,
    where: {},
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(sexesData.length);
});

test("should handle params when retrieving paginated sexes ", async () => {
  const sexesData = [mock<Sexe>(), mock<Sexe>(), mock<Sexe>()];

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

  await findPaginatedSexes(searchParams);

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
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
});

test("should update an existing sex as an admin ", async () => {
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

test("should update an existing sex if owner ", async () => {
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

test("should throw an error when updating an existing sex and nor owner nor admin ", async () => {
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

  expect(prismaMock.sexe.update).toHaveBeenCalledTimes(0);
});

test("should throw an error when trying to update a sex that exists", async () => {
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

test("should create new sex ", async () => {
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

test("should throw an error when trying to create a sex that exists", async () => {
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

test("should be able to delete an owned sex", async () => {
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

test("should be able to delete any sex if admin", async () => {
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

  expect(prismaMock.sexe.delete).toHaveBeenCalledTimes(0);
});

test("should create new sexes", async () => {
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
