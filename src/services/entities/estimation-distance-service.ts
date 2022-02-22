import { EstimationDistance, Prisma } from "@prisma/client";
import {
  EstimationDistanceWithCounts,
  EstimationsDistancePaginatedResult,
  FindParams,
  MutationUpsertEstimationDistanceArgs,
  QueryPaginatedEstimationsDistanceArgs
} from "../../model/graphql";
import prisma from "../../sql/prisma";
import { COLUMN_LIBELLE } from "../../utils/constants";
import {
  getEntiteAvecLibelleFilterClause,
  getPrismaPagination,
  queryParametersToFindAllEntities
} from "./entities-utils";

export const findEstimationDistance = async (id: number): Promise<EstimationDistance | null> => {
  return prisma.estimationDistance.findUnique({
    where: {
      id
    }
  });
};

export const findEstimationsDistance = async (params?: FindParams | null): Promise<EstimationDistance[]> => {
  const { q, max } = params ?? {};

  return prisma.estimationDistance.findMany({
    orderBy: {
      libelle: "asc"
    },
    where: {
      libelle: {
        startsWith: q || undefined
      }
    },
    take: max || undefined
  });
};

export const findAllEstimationsDistance = async (): Promise<EstimationDistanceWithCounts[]> => {
  const estimations = await prisma.estimationDistance.findMany({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    include: {
      _count: {
        select: {
          donnee: true
        }
      }
    }
  });

  return estimations.map((estimation) => {
    return {
      ...estimation,
      nbDonnees: estimation._count.donnee
    };
  });
};

export const findPaginatedEstimationsDistance = async (
  options: QueryPaginatedEstimationsDistanceArgs = {},
  includeCounts = true
): Promise<EstimationsDistancePaginatedResult> => {
  const { searchParams, orderBy: orderByField, sortOrder } = options;

  let orderBy: Prisma.Enumerable<Prisma.EstimationDistanceOrderByWithRelationInput> | undefined = undefined;
  if (sortOrder) {
    switch (orderByField) {
      case "id":
      case "libelle":
        orderBy = {
          [orderByField]: sortOrder
        };
        break;
      case "nbDonnees":
        {
          orderBy = {
            donnee: {
              _count: sortOrder
            }
          };
        }
        break;
      default:
        orderBy = {};
    }
  }

  const count = await prisma.estimationDistance.count({
    where: getEntiteAvecLibelleFilterClause(searchParams?.q)
  });

  if (includeCounts) {
    const estimationsDistance = await prisma.estimationDistance.findMany({
      ...getPrismaPagination(searchParams),
      orderBy,
      include: {
        _count: {
          select: {
            donnee: true
          }
        }
      },
      where: getEntiteAvecLibelleFilterClause(searchParams?.q)
    });

    return {
      result: estimationsDistance.map((estimation) => {
        return {
          ...estimation,
          nbDonnees: estimation._count.donnee
        };
      }),
      count
    };
  } else {
    const estimationsDistance = await prisma.estimationDistance.findMany({
      ...getPrismaPagination(searchParams),
      orderBy,
      where: getEntiteAvecLibelleFilterClause(searchParams?.q)
    });

    return {
      result: estimationsDistance,
      count
    };
  }
};

export const upsertEstimationDistance = async (
  args: MutationUpsertEstimationDistanceArgs
): Promise<EstimationDistance> => {
  const { id, data } = args;
  if (id) {
    return prisma.estimationDistance.update({
      where: { id },
      data
    });
  } else {
    return prisma.estimationDistance.create({ data });
  }
};

export const deleteEstimationDistance = async (id: number): Promise<EstimationDistance> => {
  return prisma.estimationDistance.delete({
    where: {
      id
    }
  });
};

export const createEstimationsDistance = async (
  estimationsDistance: Omit<EstimationDistance, "id">[]
): Promise<Prisma.BatchPayload> => {
  return prisma.estimationDistance.createMany({
    data: estimationsDistance
  });
};
