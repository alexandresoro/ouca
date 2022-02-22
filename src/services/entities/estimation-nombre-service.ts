import { EstimationNombre, Prisma } from "@prisma/client";
import {
  EstimationNombreWithCounts,
  EstimationsNombrePaginatedResult,
  FindParams,
  MutationUpsertEstimationNombreArgs,
  QueryPaginatedEstimationsNombreArgs
} from "../../model/graphql";
import prisma from "../../sql/prisma";
import { COLUMN_LIBELLE } from "../../utils/constants";
import {
  getEntiteAvecLibelleFilterClause,
  getPrismaPagination,
  queryParametersToFindAllEntities
} from "./entities-utils";

export const findEstimationNombre = async (id: number): Promise<EstimationNombre | null> => {
  return prisma.estimationNombre.findUnique({
    where: {
      id
    }
  });
};

export const findEstimationsNombre = async (params?: FindParams | null): Promise<EstimationNombre[]> => {
  const { q, max } = params ?? {};

  return prisma.estimationNombre.findMany({
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

export const findAllEstimationsNombre = async (
  options: {
    includeCounts?: boolean;
  } = {}
): Promise<EstimationNombreWithCounts[]> => {
  const includeCounts = options.includeCounts ?? true;

  if (includeCounts) {
    const estimationsDb = await prisma.estimationNombre.findMany({
      ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
      include: {
        _count: {
          select: {
            donnee: true
          }
        }
      }
    });

    return estimationsDb.map((estimation) => {
      return {
        ...estimation,
        nbDonnees: estimation._count.donnee
      };
    });
  } else {
    return prisma.estimationNombre.findMany({
      ...queryParametersToFindAllEntities(COLUMN_LIBELLE)
    });
  }
};

export const findPaginatedEstimationsNombre = async (
  options: QueryPaginatedEstimationsNombreArgs = {},
  includeCounts = true
): Promise<EstimationsNombrePaginatedResult> => {
  const { searchParams, orderBy: orderByField, sortOrder } = options;

  let orderBy: Prisma.Enumerable<Prisma.EstimationNombreOrderByWithRelationInput> | undefined = undefined;
  if (sortOrder) {
    switch (orderByField) {
      case "id":
      case "libelle":
      case "nonCompte":
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

  const count = await prisma.estimationNombre.count({
    where: getEntiteAvecLibelleFilterClause(searchParams?.q)
  });

  if (includeCounts) {
    const estimationsNombre = await prisma.estimationNombre.findMany({
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
      result: estimationsNombre.map((estimation) => {
        return {
          ...estimation,
          nbDonnees: estimation._count.donnee
        };
      }),
      count
    };
  } else {
    const estimationsNombre = await prisma.estimationNombre.findMany({
      ...getPrismaPagination(searchParams),
      orderBy,
      where: getEntiteAvecLibelleFilterClause(searchParams?.q)
    });

    return {
      result: estimationsNombre,
      count
    };
  }
};

export const upsertEstimationNombre = async (args: MutationUpsertEstimationNombreArgs): Promise<EstimationNombre> => {
  const { id, data } = args;
  if (id) {
    return prisma.estimationNombre.update({
      where: { id },
      data
    });
  } else {
    return prisma.estimationNombre.create({ data });
  }
};

export const deleteEstimationNombre = async (id: number): Promise<EstimationNombre> => {
  return prisma.estimationNombre.delete({
    where: {
      id
    }
  });
};

export const createEstimationsNombre = async (
  estimationsNombre: Omit<EstimationNombre, "id">[]
): Promise<Prisma.BatchPayload> => {
  return prisma.estimationNombre.createMany({
    data: estimationsNombre
  });
};
