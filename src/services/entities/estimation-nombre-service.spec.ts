import { DatabaseRole, EstimationNombre, Prisma } from "@prisma/client";
import { mock } from "jest-mock-extended";
import {
  MutationUpsertEstimationNombreArgs,
  QueryPaginatedEstimationsNombreArgs
} from "../../graphql/generated/graphql-types";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import * as entitiesUtils from "./entities-utils";
import {
  createEstimationsNombre,
  deleteEstimationNombre,
  findEstimationNombre,
  findEstimationsNombre,
  findPaginatedEstimationsNombre,
  upsertEstimationNombre
} from "./estimation-nombre-service";

const isEntityReadOnly = jest.spyOn(entitiesUtils, "isEntityReadOnly");

const prismaConstraintFailedError = {
  code: "P2002",
  message: "Prisma error message"
};

const prismaConstraintFailed = () => {
  throw new Prisma.PrismaClientKnownRequestError(
    prismaConstraintFailedError.message,
    prismaConstraintFailedError.code,
    ""
  );
};

test("should call readonly status when retrieving one number estimate ", async () => {
  const numberEstimateData = mock<EstimationNombre>();

  prismaMock.estimationNombre.findUnique.mockResolvedValueOnce(numberEstimateData);

  await findEstimationNombre(numberEstimateData.id);

  expect(prismaMock.estimationNombre.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.estimationNombre.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: numberEstimateData.id
    }
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
});

test("should handle number estimate not found ", async () => {
  prismaMock.estimationNombre.findUnique.mockResolvedValueOnce(null);

  await expect(findEstimationNombre(10)).resolves.toBe(null);

  expect(prismaMock.estimationNombre.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.estimationNombre.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: 10
    }
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(0);
});

test("should call readonly status when retrieving number estimates by params ", async () => {
  const numberEstimatesData = [mock<EstimationNombre>(), mock<EstimationNombre>(), mock<EstimationNombre>()];

  prismaMock.estimationNombre.findMany.mockResolvedValueOnce(numberEstimatesData);

  await findEstimationsNombre();

  expect(prismaMock.estimationNombre.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.estimationNombre.findMany).toHaveBeenLastCalledWith({
    ...entitiesUtils.queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      libelle: {
        contains: undefined
      }
    }
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(numberEstimatesData.length);
});

test("should call readonly status when retrieving paginated number estimates", async () => {
  const numberEstimatesData = [mock<EstimationNombre>(), mock<EstimationNombre>(), mock<EstimationNombre>()];

  prismaMock.estimationNombre.findMany.mockResolvedValueOnce(numberEstimatesData);

  await findPaginatedEstimationsNombre();

  expect(prismaMock.estimationNombre.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.estimationNombre.findMany).toHaveBeenLastCalledWith({
    ...entitiesUtils.queryParametersToFindAllEntities(COLUMN_LIBELLE),
    orderBy: undefined,
    where: {}
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(numberEstimatesData.length);
});

test("should handle params when retrieving paginated number estimates ", async () => {
  const numberEstimatesData = [mock<EstimationNombre>(), mock<EstimationNombre>(), mock<EstimationNombre>()];

  const searchParams: QueryPaginatedEstimationsNombreArgs = {
    orderBy: "libelle",
    sortOrder: "desc",
    searchParams: {
      q: "Bob",
      pageNumber: 0,
      pageSize: 10
    },
    includeCounts: false
  };

  prismaMock.estimationNombre.findMany.mockResolvedValueOnce([numberEstimatesData[0]]);

  await findPaginatedEstimationsNombre(searchParams);

  expect(prismaMock.estimationNombre.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.estimationNombre.findMany).toHaveBeenLastCalledWith({
    ...entitiesUtils.queryParametersToFindAllEntities(COLUMN_LIBELLE),
    orderBy: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      [searchParams.orderBy!]: searchParams.sortOrder
    },
    skip: searchParams.searchParams?.pageNumber,
    take: searchParams.searchParams?.pageSize,
    where: {
      libelle: {
        contains: searchParams.searchParams?.q
      }
    }
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
});

test("should update an existing number estimate as an admin ", async () => {
  const numberEstimateData = mock<MutationUpsertEstimationNombreArgs>();

  const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });

  await upsertEstimationNombre(numberEstimateData, loggedUser);

  expect(prismaMock.estimationNombre.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.estimationNombre.update).toHaveBeenLastCalledWith({
    data: numberEstimateData.data,
    where: {
      id: numberEstimateData.id
    }
  });
});

test("should update an existing number estimate if owner ", async () => {
  const existingData = mock<EstimationNombre>({
    ownerId: "notAdmin"
  });

  const numberEstimateData = mock<MutationUpsertEstimationNombreArgs>();

  const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

  prismaMock.estimationNombre.findFirst.mockResolvedValueOnce(existingData);

  await upsertEstimationNombre(numberEstimateData, loggedUser);

  expect(prismaMock.estimationNombre.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.estimationNombre.update).toHaveBeenLastCalledWith({
    data: numberEstimateData.data,
    where: {
      id: numberEstimateData.id
    }
  });
});

test("should throw an error when updating an existing number estimate and nor owner nor admin ", async () => {
  const existingData = mock<EstimationNombre>({
    ownerId: "notAdmin"
  });

  const numberEstimateData = mock<MutationUpsertEstimationNombreArgs>();

  const user = {
    id: "Bob",
    role: DatabaseRole.contributor
  };

  prismaMock.estimationNombre.findFirst.mockResolvedValueOnce(existingData);

  await expect(upsertEstimationNombre(numberEstimateData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

  expect(prismaMock.estimationNombre.update).toHaveBeenCalledTimes(0);
});

test("should throw an error when trying to update a number estimate that exists", async () => {
  const numberEstimateData = mock<MutationUpsertEstimationNombreArgs>({
    id: 12
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
      id: numberEstimateData.id
    }
  });
});

test("should create new number estimate ", async () => {
  const numberEstimateData = mock<MutationUpsertEstimationNombreArgs>({
    id: undefined
  });

  const loggedUser = mock<LoggedUser>({ id: "a" });

  await upsertEstimationNombre(numberEstimateData, loggedUser);

  expect(prismaMock.estimationNombre.create).toHaveBeenCalledTimes(1);
  expect(prismaMock.estimationNombre.create).toHaveBeenLastCalledWith({
    data: {
      ...numberEstimateData.data,
      ownerId: loggedUser.id
    }
  });
});

test("should throw an error when trying to create a number estimate that exists", async () => {
  const numberEstimateData = mock<MutationUpsertEstimationNombreArgs>({
    id: undefined
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
      ownerId: loggedUser.id
    }
  });
});

test("should be able to delete an owned number estimate", async () => {
  const loggedUser: LoggedUser = {
    id: "12",
    role: DatabaseRole.contributor
  };

  const numberEstimate = mock<EstimationNombre>({
    ownerId: loggedUser.id
  });

  prismaMock.estimationNombre.findFirst.mockResolvedValueOnce(numberEstimate);

  await deleteEstimationNombre(11, loggedUser);

  expect(prismaMock.estimationNombre.delete).toHaveBeenCalledTimes(1);
  expect(prismaMock.estimationNombre.delete).toHaveBeenLastCalledWith({
    where: {
      id: 11
    }
  });
});

test("should be able to delete any number estimate if admin", async () => {
  const loggedUser = mock<LoggedUser>({
    role: DatabaseRole.admin
  });

  prismaMock.estimationNombre.findFirst.mockResolvedValueOnce(mock<EstimationNombre>());

  await deleteEstimationNombre(11, loggedUser);

  expect(prismaMock.estimationNombre.delete).toHaveBeenCalledTimes(1);
  expect(prismaMock.estimationNombre.delete).toHaveBeenLastCalledWith({
    where: {
      id: 11
    }
  });
});

test("should return an error when deleting a non-owned number estimate as non-admin", async () => {
  const loggedUser = mock<LoggedUser>({
    role: DatabaseRole.contributor
  });

  prismaMock.estimationNombre.findFirst.mockResolvedValueOnce(mock<EstimationNombre>());

  await expect(deleteEstimationNombre(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

  expect(prismaMock.estimationNombre.delete).toHaveBeenCalledTimes(0);
});

test("should create new number estimates", async () => {
  const numberEstimatesData = [
    mock<Omit<Prisma.EstimationNombreCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.EstimationNombreCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.EstimationNombreCreateManyInput, "ownerId">>()
  ];

  const loggedUser = mock<LoggedUser>();

  await createEstimationsNombre(numberEstimatesData, loggedUser);

  expect(prismaMock.estimationNombre.createMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.estimationNombre.createMany).toHaveBeenLastCalledWith({
    data: numberEstimatesData.map((numberEstimate) => {
      return {
        ...numberEstimate,
        ownerId: loggedUser.id
      };
    })
  });
});
