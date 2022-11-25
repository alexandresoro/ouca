import { DatabaseRole, type EstimationNombre, Prisma } from "@prisma/client";
import { mock } from "jest-mock-extended";
import {
  EstimationNombreOrderBy,
  type MutationUpsertEstimationNombreArgs,
  type QueryEstimationsNombreArgs,
  SortOrder,
} from "../../graphql/generated/graphql-types";
import { prismaMock } from "../../sql/prisma-mock";
import { type LoggedUser } from "../../types/LoggedUser";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { queryParametersToFindAllEntities } from "./entities-utils";
import {
  createEstimationsNombre,
  deleteEstimationNombre,
  findEstimationNombre,
  findEstimationsNombre,
  findPaginatedEstimationsNombre,
  getDonneesCountByEstimationNombre,
  getEstimationsNombreCount,
  upsertEstimationNombre,
} from "./estimation-nombre-service";

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

describe("Find number estimate", () => {
  test("should handle a matching number estimate", async () => {
    const numberEstimateData = mock<EstimationNombre>();
    const loggedUser = mock<LoggedUser>();

    prismaMock.estimationNombre.findUnique.mockResolvedValueOnce(numberEstimateData);

    await findEstimationNombre(numberEstimateData.id, loggedUser);

    expect(prismaMock.estimationNombre.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.estimationNombre.findUnique).toHaveBeenLastCalledWith({
      where: {
        id: numberEstimateData.id,
      },
    });
  });

  test("should handle number estimate not found", async () => {
    prismaMock.estimationNombre.findUnique.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(findEstimationNombre(10, loggedUser)).resolves.toBe(null);

    expect(prismaMock.estimationNombre.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.estimationNombre.findUnique).toHaveBeenLastCalledWith({
      where: {
        id: 10,
      },
    });
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(findEstimationNombre(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.estimationNombre.findUnique).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await getDonneesCountByEstimationNombre(12, loggedUser);

    expect(prismaMock.donnee.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.donnee.count).toHaveBeenLastCalledWith<[Prisma.DonneeCountArgs]>({
      where: {
        estimationNombreId: 12,
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(getDonneesCountByEstimationNombre(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all number estimates", async () => {
  const numberEstimatesData = [mock<EstimationNombre>(), mock<EstimationNombre>(), mock<EstimationNombre>()];
  const loggedUser = mock<LoggedUser>();

  prismaMock.estimationNombre.findMany.mockResolvedValueOnce(numberEstimatesData);

  await findEstimationsNombre(loggedUser);

  expect(prismaMock.estimationNombre.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.estimationNombre.findMany).toHaveBeenLastCalledWith({
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
    const numberEstimatesData = [mock<EstimationNombre>(), mock<EstimationNombre>(), mock<EstimationNombre>()];
    const loggedUser = mock<LoggedUser>();

    prismaMock.estimationNombre.findMany.mockResolvedValueOnce(numberEstimatesData);

    await findPaginatedEstimationsNombre(loggedUser);

    expect(prismaMock.estimationNombre.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.estimationNombre.findMany).toHaveBeenLastCalledWith({
      ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
      orderBy: undefined,
      where: {},
    });
  });

  test("should handle params when retrieving paginated number estimates ", async () => {
    const numberEstimatesData = [mock<EstimationNombre>(), mock<EstimationNombre>(), mock<EstimationNombre>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: QueryEstimationsNombreArgs = {
      orderBy: EstimationNombreOrderBy.Libelle,
      sortOrder: SortOrder.Desc,
      searchParams: {
        q: "Bob",
        pageNumber: 0,
        pageSize: 10,
      },
    };

    prismaMock.estimationNombre.findMany.mockResolvedValueOnce([numberEstimatesData[0]]);

    await findPaginatedEstimationsNombre(loggedUser, searchParams);

    expect(prismaMock.estimationNombre.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.estimationNombre.findMany).toHaveBeenLastCalledWith({
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
    await expect(findPaginatedEstimationsNombre(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await getEstimationsNombreCount(loggedUser);

    expect(prismaMock.estimationNombre.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.estimationNombre.count).toHaveBeenLastCalledWith({
      where: {},
    });
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await getEstimationsNombreCount(loggedUser, "test");

    expect(prismaMock.estimationNombre.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.estimationNombre.count).toHaveBeenLastCalledWith({
      where: {
        libelle: {
          contains: "test",
        },
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(getEstimationsNombreCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of a number estimate", () => {
  test("should be allowed when requested by an admin", async () => {
    const numberEstimateData = mock<MutationUpsertEstimationNombreArgs>();

    const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });

    await upsertEstimationNombre(numberEstimateData, loggedUser);

    expect(prismaMock.estimationNombre.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.estimationNombre.update).toHaveBeenLastCalledWith({
      data: numberEstimateData.data,
      where: {
        id: numberEstimateData.id,
      },
    });
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = mock<EstimationNombre>({
      ownerId: "notAdmin",
    });

    const numberEstimateData = mock<MutationUpsertEstimationNombreArgs>();

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    prismaMock.estimationNombre.findFirst.mockResolvedValueOnce(existingData);

    await upsertEstimationNombre(numberEstimateData, loggedUser);

    expect(prismaMock.estimationNombre.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.estimationNombre.update).toHaveBeenLastCalledWith({
      data: numberEstimateData.data,
      where: {
        id: numberEstimateData.id,
      },
    });
  });

  test("should throw an error when requested by an user that is nor owner nor admin", async () => {
    const existingData = mock<EstimationNombre>({
      ownerId: "notAdmin",
    });

    const numberEstimateData = mock<MutationUpsertEstimationNombreArgs>();

    const user = {
      id: "Bob",
      role: DatabaseRole.contributor,
    };

    prismaMock.estimationNombre.findFirst.mockResolvedValueOnce(existingData);

    await expect(upsertEstimationNombre(numberEstimateData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

    expect(prismaMock.estimationNombre.update).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to a number estimate that exists", async () => {
    const numberEstimateData = mock<MutationUpsertEstimationNombreArgs>({
      id: 12,
    });

    const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });

    prismaMock.estimationNombre.update.mockImplementation(prismaConstraintFailed);

    await expect(() => upsertEstimationNombre(numberEstimateData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", prismaConstraintFailedError)
    );

    expect(prismaMock.estimationNombre.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.estimationNombre.update).toHaveBeenLastCalledWith({
      data: numberEstimateData.data,
      where: {
        id: numberEstimateData.id,
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const numberEstimateData = mock<MutationUpsertEstimationNombreArgs>({
      id: 12,
    });

    await expect(upsertEstimationNombre(numberEstimateData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.estimationNombre.update).not.toHaveBeenCalled();
  });
});

describe("Creation of a number estimate", () => {
  test("should create new number estimate", async () => {
    const numberEstimateData = mock<MutationUpsertEstimationNombreArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    await upsertEstimationNombre(numberEstimateData, loggedUser);

    expect(prismaMock.estimationNombre.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.estimationNombre.create).toHaveBeenLastCalledWith({
      data: {
        ...numberEstimateData.data,
        ownerId: loggedUser.id,
      },
    });
  });

  test("should throw an error when trying to create a number estimate that already exists", async () => {
    const numberEstimateData = mock<MutationUpsertEstimationNombreArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    prismaMock.estimationNombre.create.mockImplementation(prismaConstraintFailed);

    await expect(() => upsertEstimationNombre(numberEstimateData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", prismaConstraintFailedError)
    );

    expect(prismaMock.estimationNombre.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.estimationNombre.create).toHaveBeenLastCalledWith({
      data: {
        ...numberEstimateData.data,
        ownerId: loggedUser.id,
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const numberEstimateData = mock<MutationUpsertEstimationNombreArgs>({
      id: undefined,
    });

    await expect(upsertEstimationNombre(numberEstimateData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.estimationNombre.create).not.toHaveBeenCalled();
  });
});

describe("Deletion of a number estimate", () => {
  test("should handle the deletion of an owned number estimate", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: DatabaseRole.contributor,
    };

    const numberEstimate = mock<EstimationNombre>({
      ownerId: loggedUser.id,
    });

    prismaMock.estimationNombre.findFirst.mockResolvedValueOnce(numberEstimate);

    await deleteEstimationNombre(11, loggedUser);

    expect(prismaMock.estimationNombre.delete).toHaveBeenCalledTimes(1);
    expect(prismaMock.estimationNombre.delete).toHaveBeenLastCalledWith({
      where: {
        id: 11,
      },
    });
  });

  test("should handle the deletion of any number estimate if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: DatabaseRole.admin,
    });

    prismaMock.estimationNombre.findFirst.mockResolvedValueOnce(mock<EstimationNombre>());

    await deleteEstimationNombre(11, loggedUser);

    expect(prismaMock.estimationNombre.delete).toHaveBeenCalledTimes(1);
    expect(prismaMock.estimationNombre.delete).toHaveBeenLastCalledWith({
      where: {
        id: 11,
      },
    });
  });

  test("should return an error when deleting a non-owned number estimate as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: DatabaseRole.contributor,
    });

    prismaMock.estimationNombre.findFirst.mockResolvedValueOnce(mock<EstimationNombre>());

    await expect(deleteEstimationNombre(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(prismaMock.estimationNombre.delete).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(deleteEstimationNombre(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.estimationNombre.delete).not.toHaveBeenCalled();
  });
});

test("Create multiple number estimates", async () => {
  const numberEstimatesData = [
    mock<Omit<Prisma.EstimationNombreCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.EstimationNombreCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.EstimationNombreCreateManyInput, "ownerId">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  await createEstimationsNombre(numberEstimatesData, loggedUser);

  expect(prismaMock.estimationNombre.createMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.estimationNombre.createMany).toHaveBeenLastCalledWith({
    data: numberEstimatesData.map((numberEstimate) => {
      return {
        ...numberEstimate,
        ownerId: loggedUser.id,
      };
    }),
  });
});
