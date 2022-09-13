import { Commune, DatabaseRole, Departement, Prisma } from "@prisma/client";
import { mock, mockDeep } from "jest-mock-extended";
import { MutationUpsertDepartementArgs, QueryPaginatedDepartementsArgs } from "../../graphql/generated/graphql-types";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_CODE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import {
  createDepartements,
  deleteDepartement,
  findDepartement,
  findDepartementOfCommuneId,
  findDepartements,
  findPaginatedDepartements,
  getDepartementsCount,
  upsertDepartement,
} from "./departement-service";
import { isEntityReadOnly, queryParametersToFindAllEntities } from "./entities-utils";

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

test("should call readonly status when retrieving one department ", async () => {
  const departmentData = mock<Departement>();

  prismaMock.departement.findUnique.mockResolvedValueOnce(departmentData);

  await findDepartement(departmentData.id);

  expect(prismaMock.departement.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.departement.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: departmentData.id,
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
});

test("should handle department not found ", async () => {
  prismaMock.departement.findUnique.mockResolvedValueOnce(null);

  await expect(findDepartement(10)).resolves.toBe(null);

  expect(prismaMock.departement.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.departement.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: 10,
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(0);
});

test("should call readonly status when retrieving department by city ID ", async () => {
  const departmentData = mock<Departement>({
    id: 256,
  });

  const city = mockDeep<Prisma.Prisma__CommuneClient<Commune>>();
  city.departement.mockResolvedValueOnce(departmentData);

  prismaMock.commune.findUnique.mockReturnValueOnce(city);

  const department = await findDepartementOfCommuneId(43);

  expect(prismaMock.commune.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.commune.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: 43,
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
  expect(department?.id).toEqual(256);
});

test("should handle class not found when retrieving department by city ID ", async () => {
  const city = mockDeep<Prisma.Prisma__CommuneClient<Commune>>();
  city.departement.mockResolvedValueOnce(null);

  prismaMock.commune.findUnique.mockReturnValueOnce(city);

  const department = await findDepartementOfCommuneId(43);

  expect(prismaMock.commune.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.commune.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: 43,
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(0);
  expect(department).toBeNull();
});

test("should call readonly status when retrieving departments by params ", async () => {
  const departementsData = [mock<Departement>(), mock<Departement>(), mock<Departement>()];

  prismaMock.departement.findMany.mockResolvedValueOnce(departementsData);

  await findDepartements();

  expect(prismaMock.departement.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.departement.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    where: {
      code: {
        contains: undefined,
      },
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(departementsData.length);
});

test("should call readonly status when retrieving paginated departments", async () => {
  const departementsData = [mock<Departement>(), mock<Departement>(), mock<Departement>()];

  prismaMock.departement.findMany.mockResolvedValueOnce(departementsData);

  await findPaginatedDepartements();

  expect(prismaMock.departement.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.departement.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    orderBy: undefined,
    where: {},
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(departementsData.length);
});

test("should handle params when retrieving paginated departments ", async () => {
  const departementsData = [mock<Departement>(), mock<Departement>(), mock<Departement>()];

  const searchParams: QueryPaginatedDepartementsArgs = {
    orderBy: "code",
    sortOrder: "desc",
    searchParams: {
      q: "Bob",
      pageNumber: 0,
      pageSize: 10,
    },
    includeCounts: false,
  };

  prismaMock.departement.findMany.mockResolvedValueOnce([departementsData[0]]);

  await findPaginatedDepartements(searchParams);

  expect(prismaMock.departement.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.departement.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    orderBy: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      [searchParams.orderBy!]: searchParams.sortOrder,
    },
    skip: searchParams.searchParams?.pageNumber,
    take: searchParams.searchParams?.pageSize,
    where: {
      code: {
        contains: searchParams.searchParams?.q,
      },
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await getDepartementsCount(loggedUser);

    expect(prismaMock.departement.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.departement.count).toHaveBeenLastCalledWith({
      where: {},
    });
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await getDepartementsCount(loggedUser, "test");

    expect(prismaMock.departement.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.departement.count).toHaveBeenLastCalledWith({
      where: {
        code: {
          contains: "test",
        },
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(getDepartementsCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("should update an existing department as an admin ", async () => {
  const departmentData = mock<MutationUpsertDepartementArgs>();

  const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });

  await upsertDepartement(departmentData, loggedUser);

  expect(prismaMock.departement.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.departement.update).toHaveBeenLastCalledWith({
    data: departmentData.data,
    where: {
      id: departmentData.id,
    },
  });
});

test("should update an existing department if owner ", async () => {
  const existingData = mock<Departement>({
    ownerId: "notAdmin",
  });

  const departmentData = mock<MutationUpsertDepartementArgs>();

  const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

  prismaMock.departement.findFirst.mockResolvedValueOnce(existingData);

  await upsertDepartement(departmentData, loggedUser);

  expect(prismaMock.departement.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.departement.update).toHaveBeenLastCalledWith({
    data: departmentData.data,
    where: {
      id: departmentData.id,
    },
  });
});

test("should throw an error when updating an existing department and nor owner nor admin ", async () => {
  const existingData = mock<Departement>({
    ownerId: "notAdmin",
  });

  const departmentData = mock<MutationUpsertDepartementArgs>();

  const user = {
    id: "Bob",
    role: DatabaseRole.contributor,
  };

  prismaMock.departement.findFirst.mockResolvedValueOnce(existingData);

  await expect(upsertDepartement(departmentData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

  expect(prismaMock.departement.update).toHaveBeenCalledTimes(0);
});

test("should throw an error when trying to update a department that exists", async () => {
  const departmentData = mock<MutationUpsertDepartementArgs>({
    id: 12,
  });

  const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });

  prismaMock.departement.update.mockImplementation(prismaConstraintFailed);

  await expect(() => upsertDepartement(departmentData, loggedUser)).rejects.toThrowError(
    new OucaError("OUCA0004", prismaConstraintFailedError)
  );

  expect(prismaMock.departement.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.departement.update).toHaveBeenLastCalledWith({
    data: departmentData.data,
    where: {
      id: departmentData.id,
    },
  });
});

test("should create new department ", async () => {
  const departmentData = mock<MutationUpsertDepartementArgs>({
    id: undefined,
  });

  const loggedUser = mock<LoggedUser>({ id: "a" });

  await upsertDepartement(departmentData, loggedUser);

  expect(prismaMock.departement.create).toHaveBeenCalledTimes(1);
  expect(prismaMock.departement.create).toHaveBeenLastCalledWith({
    data: {
      ...departmentData.data,
      ownerId: loggedUser.id,
    },
  });
});

test("should throw an error when trying to create a department that exists", async () => {
  const departmentData = mock<MutationUpsertDepartementArgs>({
    id: undefined,
  });

  const loggedUser = mock<LoggedUser>({ id: "a" });

  prismaMock.departement.create.mockImplementation(prismaConstraintFailed);

  await expect(() => upsertDepartement(departmentData, loggedUser)).rejects.toThrowError(
    new OucaError("OUCA0004", prismaConstraintFailedError)
  );

  expect(prismaMock.departement.create).toHaveBeenCalledTimes(1);
  expect(prismaMock.departement.create).toHaveBeenLastCalledWith({
    data: {
      ...departmentData.data,
      ownerId: loggedUser.id,
    },
  });
});

test("should be able to delete an owned department", async () => {
  const loggedUser: LoggedUser = {
    id: "12",
    role: DatabaseRole.contributor,
  };

  const department = mock<Departement>({
    ownerId: loggedUser.id,
  });

  prismaMock.departement.findFirst.mockResolvedValueOnce(department);

  await deleteDepartement(11, loggedUser);

  expect(prismaMock.departement.delete).toHaveBeenCalledTimes(1);
  expect(prismaMock.departement.delete).toHaveBeenLastCalledWith({
    where: {
      id: 11,
    },
  });
});

test("should be able to delete any department if admin", async () => {
  const loggedUser = mock<LoggedUser>({
    role: DatabaseRole.admin,
  });

  prismaMock.departement.findFirst.mockResolvedValueOnce(mock<Departement>());

  await deleteDepartement(11, loggedUser);

  expect(prismaMock.departement.delete).toHaveBeenCalledTimes(1);
  expect(prismaMock.departement.delete).toHaveBeenLastCalledWith({
    where: {
      id: 11,
    },
  });
});

test("should return an error when deleting a non-owned department as non-admin", async () => {
  const loggedUser = mock<LoggedUser>({
    role: DatabaseRole.contributor,
  });

  prismaMock.departement.findFirst.mockResolvedValueOnce(mock<Departement>());

  await expect(deleteDepartement(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

  expect(prismaMock.departement.delete).toHaveBeenCalledTimes(0);
});

test("should create new departments", async () => {
  const departmentsData = [
    mock<Omit<Prisma.DepartementCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.DepartementCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.DepartementCreateManyInput, "ownerId">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  await createDepartements(departmentsData, loggedUser);

  expect(prismaMock.departement.createMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.departement.createMany).toHaveBeenLastCalledWith({
    data: departmentsData.map((department) => {
      return {
        ...department,
        ownerId: loggedUser.id,
      };
    }),
  });
});
