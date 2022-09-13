import { DatabaseRole, EstimationDistance, Prisma } from "@prisma/client";
import { mock } from "jest-mock-extended";
import {
  MutationUpsertEstimationDistanceArgs,
  QueryPaginatedEstimationsDistanceArgs,
} from "../../graphql/generated/graphql-types";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { isEntityReadOnly, queryParametersToFindAllEntities } from "./entities-utils";
import {
  createEstimationsDistance,
  deleteEstimationDistance,
  findEstimationDistance,
  findEstimationsDistance,
  findPaginatedEstimationsDistance,
  getEstimationsDistanceCount,
  upsertEstimationDistance,
} from "./estimation-distance-service";

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

test("should call readonly status when retrieving one distance estimate ", async () => {
  const distanceEstimateData = mock<EstimationDistance>();

  prismaMock.estimationDistance.findUnique.mockResolvedValueOnce(distanceEstimateData);

  await findEstimationDistance(distanceEstimateData.id);

  expect(prismaMock.estimationDistance.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.estimationDistance.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: distanceEstimateData.id,
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
});

test("should handle distance estimate not found ", async () => {
  prismaMock.estimationDistance.findUnique.mockResolvedValueOnce(null);

  await expect(findEstimationDistance(10)).resolves.toBe(null);

  expect(prismaMock.estimationDistance.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.estimationDistance.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: 10,
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(0);
});

test("should call readonly status when retrieving distance estimates by params ", async () => {
  const distanceEstimatesData = [mock<EstimationDistance>(), mock<EstimationDistance>(), mock<EstimationDistance>()];

  prismaMock.estimationDistance.findMany.mockResolvedValueOnce(distanceEstimatesData);

  await findEstimationsDistance();

  expect(prismaMock.estimationDistance.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.estimationDistance.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      libelle: {
        contains: undefined,
      },
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(distanceEstimatesData.length);
});

test("should call readonly status when retrieving paginated distance estimates", async () => {
  const distanceEstimatesData = [mock<EstimationDistance>(), mock<EstimationDistance>(), mock<EstimationDistance>()];

  prismaMock.estimationDistance.findMany.mockResolvedValueOnce(distanceEstimatesData);

  await findPaginatedEstimationsDistance();

  expect(prismaMock.estimationDistance.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.estimationDistance.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    orderBy: undefined,
    where: {},
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(distanceEstimatesData.length);
});

test("should handle params when retrieving paginated distance estimates ", async () => {
  const distanceEstimatesData = [mock<EstimationDistance>(), mock<EstimationDistance>(), mock<EstimationDistance>()];

  const searchParams: QueryPaginatedEstimationsDistanceArgs = {
    orderBy: "libelle",
    sortOrder: "desc",
    searchParams: {
      q: "Bob",
      pageNumber: 0,
      pageSize: 10,
    },
    includeCounts: false,
  };

  prismaMock.estimationDistance.findMany.mockResolvedValueOnce([distanceEstimatesData[0]]);

  await findPaginatedEstimationsDistance(searchParams);

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
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
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

test("should update an existing distance estimate as an admin ", async () => {
  const distanceEstimateData = mock<MutationUpsertEstimationDistanceArgs>();

  const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });

  await upsertEstimationDistance(distanceEstimateData, loggedUser);

  expect(prismaMock.estimationDistance.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.estimationDistance.update).toHaveBeenLastCalledWith({
    data: distanceEstimateData.data,
    where: {
      id: distanceEstimateData.id,
    },
  });
});

test("should update an existing distance estimate if owner ", async () => {
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

test("should throw an error when updating an existing distance estimate and nor owner nor admin ", async () => {
  const existingData = mock<EstimationDistance>({
    ownerId: "notAdmin",
  });

  const distanceEstimateData = mock<MutationUpsertEstimationDistanceArgs>();

  const user = {
    id: "Bob",
    role: DatabaseRole.contributor,
  };

  prismaMock.estimationDistance.findFirst.mockResolvedValueOnce(existingData);

  await expect(upsertEstimationDistance(distanceEstimateData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

  expect(prismaMock.estimationDistance.update).toHaveBeenCalledTimes(0);
});

test("should throw an error when trying to update a distance estimate that exists", async () => {
  const distanceEstimateData = mock<MutationUpsertEstimationDistanceArgs>({
    id: 12,
  });

  const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });

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

test("should create new distance estimate ", async () => {
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

test("should throw an error when trying to create a distance estimate that exists", async () => {
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

test("should be able to delete an owned distance estimate", async () => {
  const loggedUser: LoggedUser = {
    id: "12",
    role: DatabaseRole.contributor,
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

test("should be able to delete any distance estimate if admin", async () => {
  const loggedUser = mock<LoggedUser>({
    role: DatabaseRole.admin,
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
    role: DatabaseRole.contributor,
  });

  prismaMock.estimationDistance.findFirst.mockResolvedValueOnce(mock<EstimationDistance>());

  await expect(deleteEstimationDistance(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

  expect(prismaMock.estimationDistance.delete).toHaveBeenCalledTimes(0);
});

test("should create new distance estimates", async () => {
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
