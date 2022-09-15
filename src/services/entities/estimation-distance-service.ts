import { DatabaseRole, EstimationDistance, Prisma } from "@prisma/client";
import {
  FindParams,
  MutationUpsertEstimationDistanceArgs,
  QueryPaginatedEstimationsDistanceArgs,
} from "../../graphql/generated/graphql-types";
import prisma from "../../sql/prisma";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { validateAuthorization } from "./authorization-utils";
import {
  getEntiteAvecLibelleFilterClause,
  getPrismaPagination,
  isEntityReadOnly,
  queryParametersToFindAllEntities,
  ReadonlyStatus,
} from "./entities-utils";

export const findEstimationDistance = async (
  id: number,
  loggedUser: LoggedUser | null
): Promise<(EstimationDistance & ReadonlyStatus) | null> => {
  validateAuthorization(loggedUser);

  const distanceEstimateEntity = await prisma.estimationDistance.findUnique({
    where: {
      id,
    },
  });

  if (!distanceEstimateEntity) {
    return null;
  }

  return {
    ...distanceEstimateEntity,
    readonly: isEntityReadOnly(distanceEstimateEntity, loggedUser),
  };
};

export const getDonneesCountByEstimationDistance = async (
  id: number,
  loggedUser: LoggedUser | null
): Promise<number> => {
  validateAuthorization(loggedUser);

  return prisma.donnee.count({
    where: {
      estimationDistanceId: id,
    },
  });
};

export const findEstimationsDistance = async (
  loggedUser: LoggedUser | null,
  params?: FindParams | null
): Promise<EstimationDistance[]> => {
  validateAuthorization(loggedUser);

  const { q, max } = params ?? {};

  return prisma.estimationDistance.findMany({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      libelle: {
        startsWith: q || undefined,
      },
    },
    take: max || undefined,
  });
};

export const findPaginatedEstimationsDistance = async (
  options: Partial<QueryPaginatedEstimationsDistanceArgs> = {},
  loggedUser: LoggedUser | null = null
): Promise<EstimationDistance[]> => {
  const { searchParams, orderBy: orderByField, sortOrder, includeCounts } = options;

  let orderBy: Prisma.Enumerable<Prisma.EstimationDistanceOrderByWithRelationInput> | undefined = undefined;
  if (sortOrder) {
    switch (orderByField) {
      case "id":
      case "libelle":
        orderBy = {
          [orderByField]: sortOrder,
        };
        break;
      case "nbDonnees":
        {
          orderBy = {
            donnee: {
              _count: sortOrder,
            },
          };
        }
        break;
      default:
        orderBy = {};
    }
  }

  let distanceEstimateEntities: (EstimationDistance & { nbDonnees?: number })[];

  if (includeCounts) {
    const estimationsDistance = await prisma.estimationDistance.findMany({
      ...getPrismaPagination(searchParams),
      orderBy,
      include: {
        _count: {
          select: {
            donnee: true,
          },
        },
      },
      where: getEntiteAvecLibelleFilterClause(searchParams?.q),
    });

    distanceEstimateEntities = estimationsDistance.map((estimation) => {
      return {
        ...estimation,
        nbDonnees: estimation._count.donnee,
      };
    });
  } else {
    distanceEstimateEntities = await prisma.estimationDistance.findMany({
      ...getPrismaPagination(searchParams),
      orderBy,
      where: getEntiteAvecLibelleFilterClause(searchParams?.q),
    });
  }

  return distanceEstimateEntities?.map((distanceEstimate) => {
    return {
      ...distanceEstimate,
      readonly: isEntityReadOnly(distanceEstimate, loggedUser),
    };
  });
};

export const getEstimationsDistanceCount = async (
  loggedUser: LoggedUser | null,
  q?: string | null
): Promise<number> => {
  validateAuthorization(loggedUser);

  return prisma.estimationDistance.count({
    where: getEntiteAvecLibelleFilterClause(q),
  });
};

export const upsertEstimationDistance = async (
  args: MutationUpsertEstimationDistanceArgs,
  loggedUser: LoggedUser | null
): Promise<EstimationDistance & ReadonlyStatus> => {
  validateAuthorization(loggedUser);

  const { id, data } = args;

  let upsertedEstimationDistance: EstimationDistance;

  if (id) {
    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== DatabaseRole.admin) {
      const existingData = await prisma.estimationDistance.findFirst({
        where: { id },
      });

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      upsertedEstimationDistance = await prisma.estimationDistance.update({
        where: { id },
        data,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  } else {
    try {
      upsertedEstimationDistance = await prisma.estimationDistance.create({
        data: { ...data, ownerId: loggedUser?.id },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  }

  return {
    ...upsertedEstimationDistance,
    readonly: false,
  };
};

export const deleteEstimationDistance = async (
  id: number,
  loggedUser: LoggedUser | null
): Promise<EstimationDistance> => {
  validateAuthorization(loggedUser);

  // Check that the user is allowed to modify the existing data
  if (loggedUser?.role !== DatabaseRole.admin) {
    const existingData = await prisma.estimationDistance.findFirst({
      where: { id },
    });

    if (existingData?.ownerId !== loggedUser?.id) {
      throw new OucaError("OUCA0001");
    }
  }

  return prisma.estimationDistance.delete({
    where: {
      id,
    },
  });
};

export const createEstimationsDistance = async (
  estimationsDistance: Omit<Prisma.EstimationDistanceCreateManyInput, "ownerId">[],
  loggedUser: LoggedUser
): Promise<Prisma.BatchPayload> => {
  return prisma.estimationDistance.createMany({
    data: estimationsDistance.map((estimationDistance) => {
      return { ...estimationDistance, ownerId: loggedUser.id };
    }),
  });
};
