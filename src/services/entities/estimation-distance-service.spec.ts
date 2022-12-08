import { Prisma } from "@prisma/client";
import { mock } from "jest-mock-extended";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import {
  EntitesAvecLibelleOrderBy,
  SortOrder,
  type MutationUpsertEstimationDistanceArgs,
  type QueryEstimationsDistanceArgs,
} from "../../graphql/generated/graphql-types";
import { type EstimationDistanceRepository } from "../../repositories/estimation-distance/estimation-distance-repository";
import { type EstimationDistance } from "../../repositories/estimation-distance/estimation-distance-repository-types";
import { prismaMock } from "../../sql/prisma-mock";
import { type LoggedUser } from "../../types/User";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { queryParametersToFindAllEntities } from "./entities-utils";
import {
  buildEstimationDistanceService,
  createEstimationsDistance,
  deleteEstimationDistance,
  findEstimationDistance,
  findEstimationsDistance,
  findPaginatedEstimationsDistance,
  getDonneesCountByEstimationDistance,
  getEstimationsDistanceCount,
  upsertEstimationDistance,
} from "./estimation-distance-service";

const estimationDistanceRepository = mock<EstimationDistanceRepository>({});
const logger = mock<Logger>();

const estimationDistanceService = buildEstimationDistanceService({
  logger,
  estimationDistanceRepository,
});

const uniqueConstraintFailedError = new UniqueIntegrityConstraintViolationError(
  new Error("errorMessage"),
  "constraint"
);

const uniqueConstraintFailed = () => {
  throw uniqueConstraintFailedError;
};

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

describe("Find distance estimate", () => {
  test("should handle a matching distance estimate", async () => {
    const distanceEstimateData = mock<EstimationDistance>();
    const loggedUser = mock<LoggedUser>();

    prismaMock.estimationDistance.findUnique.mockResolvedValueOnce(distanceEstimateData);

    await findEstimationDistance(distanceEstimateData.id, loggedUser);

    expect(prismaMock.estimationDistance.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.estimationDistance.findUnique).toHaveBeenLastCalledWith({
      where: {
        id: distanceEstimateData.id,
      },
    });
  });

  test("should handle distance estimate not found", async () => {
    prismaMock.estimationDistance.findUnique.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(findEstimationDistance(10, loggedUser)).resolves.toBe(null);

    expect(prismaMock.estimationDistance.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.estimationDistance.findUnique).toHaveBeenLastCalledWith({
      where: {
        id: 10,
      },
    });
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(findEstimationDistance(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.estimationDistance.findUnique).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await getDonneesCountByEstimationDistance(12, loggedUser);

    expect(prismaMock.donnee.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.donnee.count).toHaveBeenLastCalledWith<[Prisma.DonneeCountArgs]>({
      where: {
        estimationDistanceId: 12,
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(getDonneesCountByEstimationDistance(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all distance estimates", async () => {
  const distanceEstimatesData = [mock<EstimationDistance>(), mock<EstimationDistance>(), mock<EstimationDistance>()];
  const loggedUser = mock<LoggedUser>();

  prismaMock.estimationDistance.findMany.mockResolvedValueOnce(distanceEstimatesData);

  await findEstimationsDistance(loggedUser);

  expect(prismaMock.estimationDistance.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.estimationDistance.findMany).toHaveBeenLastCalledWith({
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
    const distanceEstimatesData = [mock<EstimationDistance>(), mock<EstimationDistance>(), mock<EstimationDistance>()];
    const loggedUser = mock<LoggedUser>();

    prismaMock.estimationDistance.findMany.mockResolvedValueOnce(distanceEstimatesData);

    await findPaginatedEstimationsDistance(loggedUser);

    expect(prismaMock.estimationDistance.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.estimationDistance.findMany).toHaveBeenLastCalledWith({
      ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
      orderBy: undefined,
      where: {},
    });
  });

  test("should handle params when retrieving paginated distance estimates ", async () => {
    const distanceEstimatesData = [mock<EstimationDistance>(), mock<EstimationDistance>(), mock<EstimationDistance>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: QueryEstimationsDistanceArgs = {
      orderBy: EntitesAvecLibelleOrderBy.Libelle,
      sortOrder: SortOrder.Desc,
      searchParams: {
        q: "Bob",
        pageNumber: 0,
        pageSize: 10,
      },
    };

    prismaMock.estimationDistance.findMany.mockResolvedValueOnce([distanceEstimatesData[0]]);

    await findPaginatedEstimationsDistance(loggedUser, searchParams);

    expect(prismaMock.estimationDistance.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.estimationDistance.findMany).toHaveBeenLastCalledWith({
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
    await expect(findPaginatedEstimationsDistance(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await getEstimationsDistanceCount(loggedUser);

    expect(prismaMock.estimationDistance.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.estimationDistance.count).toHaveBeenLastCalledWith({
      where: {},
    });
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await getEstimationsDistanceCount(loggedUser, "test");

    expect(prismaMock.estimationDistance.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.estimationDistance.count).toHaveBeenLastCalledWith({
      where: {
        libelle: {
          contains: "test",
        },
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(getEstimationsDistanceCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of a distance estimate", () => {
  test("should be allowed when requested by an admin", async () => {
    const distanceEstimateData = mock<MutationUpsertEstimationDistanceArgs>();

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    await upsertEstimationDistance(distanceEstimateData, loggedUser);

    expect(prismaMock.estimationDistance.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.estimationDistance.update).toHaveBeenLastCalledWith({
      data: distanceEstimateData.data,
      where: {
        id: distanceEstimateData.id,
      },
    });
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = mock<EstimationDistance>({
      ownerId: "notAdmin",
    });

    const distanceEstimateData = mock<MutationUpsertEstimationDistanceArgs>();

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    prismaMock.estimationDistance.findFirst.mockResolvedValueOnce(existingData);

    await upsertEstimationDistance(distanceEstimateData, loggedUser);

    expect(prismaMock.estimationDistance.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.estimationDistance.update).toHaveBeenLastCalledWith({
      data: distanceEstimateData.data,
      where: {
        id: distanceEstimateData.id,
      },
    });
  });

  test("should throw an error when requested by an user that is nor owner nor admin", async () => {
    const existingData = mock<EstimationDistance>({
      ownerId: "notAdmin",
    });

    const distanceEstimateData = mock<MutationUpsertEstimationDistanceArgs>();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    prismaMock.estimationDistance.findFirst.mockResolvedValueOnce(existingData);

    await expect(upsertEstimationDistance(distanceEstimateData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

    expect(prismaMock.estimationDistance.update).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to a distance estimate that exists", async () => {
    const distanceEstimateData = mock<MutationUpsertEstimationDistanceArgs>({
      id: 12,
    });

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    prismaMock.estimationDistance.update.mockImplementation(prismaConstraintFailed);

    await expect(() => upsertEstimationDistance(distanceEstimateData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", prismaConstraintFailedError)
    );

    expect(prismaMock.estimationDistance.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.estimationDistance.update).toHaveBeenLastCalledWith({
      data: distanceEstimateData.data,
      where: {
        id: distanceEstimateData.id,
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const distanceEstimateData = mock<MutationUpsertEstimationDistanceArgs>({
      id: 12,
    });

    await expect(upsertEstimationDistance(distanceEstimateData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.estimationDistance.update).not.toHaveBeenCalled();
  });
});

describe("Creation of a distance estimate", () => {
  test("should create new distance estimate", async () => {
    const distanceEstimateData = mock<MutationUpsertEstimationDistanceArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    await upsertEstimationDistance(distanceEstimateData, loggedUser);

    expect(prismaMock.estimationDistance.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.estimationDistance.create).toHaveBeenLastCalledWith({
      data: {
        ...distanceEstimateData.data,
        ownerId: loggedUser.id,
      },
    });
  });

  test("should throw an error when trying to create a distance estimate that already exists", async () => {
    const distanceEstimateData = mock<MutationUpsertEstimationDistanceArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    prismaMock.estimationDistance.create.mockImplementation(prismaConstraintFailed);

    await expect(() => upsertEstimationDistance(distanceEstimateData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", prismaConstraintFailedError)
    );

    expect(prismaMock.estimationDistance.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.estimationDistance.create).toHaveBeenLastCalledWith({
      data: {
        ...distanceEstimateData.data,
        ownerId: loggedUser.id,
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const distanceEstimateData = mock<MutationUpsertEstimationDistanceArgs>({
      id: undefined,
    });

    await expect(upsertEstimationDistance(distanceEstimateData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.estimationDistance.create).not.toHaveBeenCalled();
  });
});

describe("Deletion of a distance exstimate", () => {
  test("should handle the deletion of an owned distance estimate", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const distanceEstimate = mock<EstimationDistance>({
      ownerId: loggedUser.id,
    });

    prismaMock.estimationDistance.findFirst.mockResolvedValueOnce(distanceEstimate);

    await deleteEstimationDistance(11, loggedUser);

    expect(prismaMock.estimationDistance.delete).toHaveBeenCalledTimes(1);
    expect(prismaMock.estimationDistance.delete).toHaveBeenLastCalledWith({
      where: {
        id: 11,
      },
    });
  });

  test("should handle the deletion of any distance estimate if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "admin",
    });

    prismaMock.estimationDistance.findFirst.mockResolvedValueOnce(mock<EstimationDistance>());

    await deleteEstimationDistance(11, loggedUser);

    expect(prismaMock.estimationDistance.delete).toHaveBeenCalledTimes(1);
    expect(prismaMock.estimationDistance.delete).toHaveBeenLastCalledWith({
      where: {
        id: 11,
      },
    });
  });

  test("should return an error when deleting a non-owned distance estimate as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "contributor",
    });

    prismaMock.estimationDistance.findFirst.mockResolvedValueOnce(mock<EstimationDistance>());

    await expect(deleteEstimationDistance(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(prismaMock.estimationDistance.delete).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(deleteEstimationDistance(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.estimationDistance.delete).not.toHaveBeenCalled();
  });
});

test("Create multiple distance estimates", async () => {
  const distanceEstimatesData = [
    mock<Omit<Prisma.EstimationDistanceCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.EstimationDistanceCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.EstimationDistanceCreateManyInput, "ownerId">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  await createEstimationsDistance(distanceEstimatesData, loggedUser);

  expect(prismaMock.estimationDistance.createMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.estimationDistance.createMany).toHaveBeenLastCalledWith({
    data: distanceEstimatesData.map((distanceEstimate) => {
      return {
        ...distanceEstimate,
        ownerId: loggedUser.id,
      };
    }),
  });
});
