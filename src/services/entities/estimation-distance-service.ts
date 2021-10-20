import { EstimationDistance as EstimationDistanceEntity, Prisma } from "@prisma/client";
import { EstimationDistance, EstimationDistanceWithCounts, EstimationsDistancePaginatedResult, FindParams, MutationUpsertEstimationDistanceArgs, QueryPaginatedEstimationsDistanceArgs } from "../../model/graphql";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import prisma from "../../sql/prisma";
import { createKeyValueMapWithSameName, queryParametersToFindAllEntities } from "../../sql/sql-queries-utils";
import { COLUMN_LIBELLE, TABLE_ESTIMATION_DISTANCE } from "../../utils/constants";
import { getEntiteAvecLibelleFilterClause, getPrismaPagination } from "./entities-utils";
import { insertMultipleEntities } from "./entity-service";

const DB_SAVE_MAPPING_ESTIMATION_DISTANCE = createKeyValueMapWithSameName("libelle");

export const findEstimationDistance = async (id: number): Promise<EstimationDistanceEntity | null> => {
  return prisma.estimationDistance.findUnique({
    where: {
      id
    },
  });
};

export const findEstimationsDistance = async (params?: FindParams): Promise<EstimationDistanceEntity[]> => {

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

export const findAllEstimationsDistance = async (): Promise<
  EstimationDistanceWithCounts[]
> => {
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
    }
  });
};

export const findPaginatedEstimationsDistance = async (
  options: QueryPaginatedEstimationsDistanceArgs = {},
  includeCounts = true
): Promise<EstimationsDistancePaginatedResult> => {

  const { searchParams, orderBy: orderByField, sortOrder } = options;

  let orderBy: Prisma.Enumerable<Prisma.EstimationDistanceOrderByWithRelationInput>;
  switch (orderByField) {
    case "id":
    case "libelle":
      orderBy = {
        [orderByField]: sortOrder
      }
      break;
    case "nbDonnees": {
      orderBy = sortOrder && {
        donnee: {
          _count: sortOrder
        }
      }
    }
      break;
    default:
      orderBy = {}
  }

  const estimationsDistance = await prisma.estimationDistance.findMany({
    ...getPrismaPagination(searchParams),
    orderBy,
    include: includeCounts && {
      _count: {
        select: {
          donnee: true
        }
      }
    },
    where: getEntiteAvecLibelleFilterClause(searchParams?.q),
  });

  const count = await prisma.estimationDistance.count({
    where: getEntiteAvecLibelleFilterClause(searchParams?.q)
  });

  return {
    result: estimationsDistance.map((estimation) => {
      return {
        ...estimation,
        ...(includeCounts ? { nbDonnees: estimation._count.donnee } : {})
      }
    }),
    count
  }
};

export const upsertEstimationDistance = async (
  args: MutationUpsertEstimationDistanceArgs
): Promise<EstimationDistanceEntity> => {
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

export const deleteEstimationDistance = async (id: number): Promise<EstimationDistanceEntity> => {
  return prisma.estimationDistance.delete({
    where: {
      id
    }
  });
}

export const insertEstimationsDistance = async (
  estimationsDistance: EstimationDistance[]
): Promise<SqlSaveResponse> => {
  return insertMultipleEntities(TABLE_ESTIMATION_DISTANCE, estimationsDistance, DB_SAVE_MAPPING_ESTIMATION_DISTANCE);
};
