import { Commune, DatabaseRole, Departement, Prisma } from "@prisma/client";
import { mock, mockDeep } from "jest-mock-extended";
import {
  DepartementsOrderBy,
  MutationUpsertDepartementArgs,
  QueryDepartementsArgs,
  SortOrder,
} from "../../graphql/generated/graphql-types";
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
  getCommunesCountByDepartement,
  getDepartementsCount,
  getDonneesCountByDepartement,
  getLieuxDitsCountByDepartement,
  upsertDepartement,
} from "./departement-service";
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

describe("Find department", () => {
  test("should handle a matching department", async () => {
    const departmentData = mock<Departement>();
    const loggedUser = mock<LoggedUser>();

    prismaMock.departement.findUnique.mockResolvedValueOnce(departmentData);

    await findDepartement(departmentData.id, loggedUser);

    expect(prismaMock.departement.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.departement.findUnique).toHaveBeenLastCalledWith({
      where: {
        id: departmentData.id,
      },
    });
  });

  test("should handle department not found", async () => {
    prismaMock.departement.findUnique.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(findDepartement(10, loggedUser)).resolves.toBe(null);

    expect(prismaMock.departement.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.departement.findUnique).toHaveBeenLastCalledWith({
      where: {
        id: 10,
      },
    });
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(findDepartement(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.departement.findUnique).not.toHaveBeenCalled();
  });
});

describe("Cities count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await getCommunesCountByDepartement(12, loggedUser);

    expect(prismaMock.commune.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.commune.count).toHaveBeenLastCalledWith<[Prisma.CommuneCountArgs]>({
      where: {
        departementId: 12,
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(getCommunesCountByDepartement(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Localities count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await getLieuxDitsCountByDepartement(12, loggedUser);

    expect(prismaMock.lieudit.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.lieudit.count).toHaveBeenLastCalledWith<[Prisma.LieuditCountArgs]>({
      where: {
        commune: {
          departementId: 12,
        },
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(getLieuxDitsCountByDepartement(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await getDonneesCountByDepartement(12, loggedUser);

    expect(prismaMock.donnee.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.donnee.count).toHaveBeenLastCalledWith<[Prisma.DonneeCountArgs]>({
      where: {
        inventaire: {
          lieuDit: {
            commune: {
              departementId: 12,
            },
          },
        },
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(getDonneesCountByDepartement(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Find department by city ID", () => {
  test("should handle a found department", async () => {
    const departmentData = mock<Departement>({
      id: 256,
    });
    const loggedUser = mock<LoggedUser>();

    const city = mockDeep<Prisma.Prisma__CommuneClient<Commune>>();
    city.departement.mockResolvedValueOnce(departmentData);

    prismaMock.commune.findUnique.mockReturnValueOnce(city);

    const department = await findDepartementOfCommuneId(43, loggedUser);

    expect(prismaMock.commune.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.commune.findUnique).toHaveBeenLastCalledWith({
      where: {
        id: 43,
      },
    });
    expect(department?.id).toEqual(256);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(findDepartementOfCommuneId(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all departments", async () => {
  const departementsData = [mock<Departement>(), mock<Departement>(), mock<Departement>()];
  const loggedUser = mock<LoggedUser>();

  prismaMock.departement.findMany.mockResolvedValueOnce(departementsData);

  await findDepartements(loggedUser);

  expect(prismaMock.departement.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.departement.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    where: {
      code: {
        contains: undefined,
      },
    },
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const departementsData = [mock<Departement>(), mock<Departement>(), mock<Departement>()];
    const loggedUser = mock<LoggedUser>();

    prismaMock.departement.findMany.mockResolvedValueOnce(departementsData);

    await findPaginatedDepartements(loggedUser);

    expect(prismaMock.departement.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.departement.findMany).toHaveBeenLastCalledWith({
      ...queryParametersToFindAllEntities(COLUMN_CODE),
      orderBy: undefined,
      where: {},
    });
  });

  test("should handle params when retrieving paginated departments ", async () => {
    const departementsData = [mock<Departement>(), mock<Departement>(), mock<Departement>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: QueryDepartementsArgs = {
      orderBy: DepartementsOrderBy.Code,
      sortOrder: SortOrder.Desc,
      searchParams: {
        q: "Bob",
        pageNumber: 0,
        pageSize: 10,
      },
    };

    prismaMock.departement.findMany.mockResolvedValueOnce([departementsData[0]]);

    await findPaginatedDepartements(loggedUser, searchParams);

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
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(findPaginatedDepartements(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
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

describe("Update of a department", () => {
  test("should be allowed when requested by an admin", async () => {
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

  test("should be allowed when requested by the owner", async () => {
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

  test("should throw an error when requested by an user that is nor owner nor admin", async () => {
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

    expect(prismaMock.departement.update).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to a department that exists", async () => {
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

  test("should throw an error when the requester is not logged", async () => {
    const departmentData = mock<MutationUpsertDepartementArgs>({
      id: 12,
    });

    await expect(upsertDepartement(departmentData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.departement.update).not.toHaveBeenCalled();
  });
});

describe("Creation of a department", () => {
  test("should create new department", async () => {
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

  test("should throw an error when trying to create a department that already exists", async () => {
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

  test("should throw an error when the requester is not logged", async () => {
    const departmentData = mock<MutationUpsertDepartementArgs>({
      id: undefined,
    });

    await expect(upsertDepartement(departmentData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.departement.create).not.toHaveBeenCalled();
  });
});

describe("Deletion of a department", () => {
  test("hould handle the deletion of an owned department", async () => {
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

  test("should handle the deletion of any department if admin", async () => {
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

    expect(prismaMock.departement.delete).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(deleteDepartement(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.departement.delete).not.toHaveBeenCalled();
  });
});

test("Create multiple departments", async () => {
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
