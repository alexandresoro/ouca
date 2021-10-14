import { Prisma } from "@prisma/client";
import { EstimationNombre, EstimationNombreWithCounts, EstimationsNombrePaginatedResult, FindParams, QueryPaginatedEstimationsNombreArgs } from "../../model/graphql";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import prisma from "../../sql/prisma";
import { createKeyValueMapWithSameName, queryParametersToFindAllEntities } from "../../sql/sql-queries-utils";
import { COLUMN_LIBELLE, TABLE_ESTIMATION_NOMBRE } from "../../utils/constants";
import { getEntiteAvecLibelleFilterClause, getPrismaPagination } from "./entities-utils";
import { insertMultipleEntities, persistEntity } from "./entity-service";

const DB_SAVE_MAPPING_ESTIMATION_NOMBRE = {
  ...createKeyValueMapWithSameName("libelle"),
  non_compte: "nonCompte"
}

export const findEstimationNombre = async (id: number): Promise<EstimationNombre | null> => {
  return prisma.estimationNombre.findUnique({
    where: {
      id
    },
  });
};

export const findEstimationsNombre = async (params?: FindParams): Promise<EstimationNombre[]> => {

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

export const findAllEstimationsNombre = async (options: {
  includeCounts?: boolean
} = {}): Promise<
  EstimationNombreWithCounts[]
> => {

  const includeCounts = options.includeCounts ?? true;

  const estimationsDb = await prisma.estimationNombre.findMany({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    include: includeCounts && {
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
      ...(includeCounts ? { nbDonnees: estimation._count.donnee } : {})
    }
  });
};

export const findPaginatedEstimationsNombre = async (
  options: QueryPaginatedEstimationsNombreArgs = {},
  includeCounts = true
): Promise<EstimationsNombrePaginatedResult> => {

  const { searchParams, orderBy: orderByField, sortOrder } = options;

  let orderBy: Prisma.Enumerable<Prisma.EstimationNombreOrderByWithRelationInput>;
  switch (orderByField) {
    case "id":
    case "libelle":
    case "nonCompte":
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

  const estimationsNombre = await prisma.estimationNombre.findMany({
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

  const count = await prisma.estimationNombre.count({
    where: getEntiteAvecLibelleFilterClause(searchParams?.q)
  });

  return {
    result: estimationsNombre.map((estimation) => {
      return {
        ...estimation,
        ...(includeCounts ? { nbDonnees: estimation._count.donnee } : {})
      }
    }),
    count
  }
};

export const persistEstimationNombre = async (
  estimation: EstimationNombre
): Promise<SqlSaveResponse> => {
  return persistEntity(
    TABLE_ESTIMATION_NOMBRE,
    estimation,
    DB_SAVE_MAPPING_ESTIMATION_NOMBRE
  );
};

export const insertEstimationsNombre = async (
  estimationsNombre: EstimationNombre[]
): Promise<SqlSaveResponse> => {
  return insertMultipleEntities(TABLE_ESTIMATION_NOMBRE, estimationsNombre, DB_SAVE_MAPPING_ESTIMATION_NOMBRE);
};
