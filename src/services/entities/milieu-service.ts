import { Milieu, Prisma } from "@prisma/client";
import { MilieuxPaginatedResult, QueryPaginatedMilieuxArgs } from "../../model/graphql";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import prisma from "../../sql/prisma";
import { createKeyValueMapWithSameName, queryParametersToFindAllEntities } from "../../sql/sql-queries-utils";
import { COLUMN_CODE, TABLE_MILIEU } from "../../utils/constants";
import { getPrismaPagination } from "./entities-utils";
import { insertMultipleEntities, persistEntity } from "./entity-service";

const DB_SAVE_MAPPING_MILIEU = createKeyValueMapWithSameName(["code", "libelle"]);

const getFilterClause = (q: string | null | undefined): Prisma.MilieuWhereInput => {
  return (q != null && q.length) ? {
    OR: [
      {
        code: {
          contains: q
        }
      },
      {
        libelle: {
          contains: q
        }
      }
    ]
  } : {};
}

export const findAllMilieux = async (): Promise<Milieu[]> => {
  const [milieux, donneesByMilieu] = await Promise.all([
    prisma.milieu.findMany(queryParametersToFindAllEntities(COLUMN_CODE)),
    prisma.donnee_milieu.groupBy({
      by: ['milieu_id'],
      _count: true,
    })
  ]);

  return milieux.map(milieu => {
    return {
      ...milieu,
      nbDonnees: donneesByMilieu.find(donneeByMilieu => donneeByMilieu.milieu_id === milieu.id)?._count ?? 0
    }
  });
};

export const findPaginatedMilieux = async (
  options: QueryPaginatedMilieuxArgs = {},
  includeCounts = true
): Promise<MilieuxPaginatedResult> => {

  const { searchParams, orderBy: orderByField, sortOrder } = options;

  let orderBy: Prisma.Enumerable<Prisma.MilieuOrderByWithRelationInput>;
  switch (orderByField) {
    case "id":
    case "code":
    case "libelle":
      orderBy = {
        [orderByField]: sortOrder
      }
      break;
    case "nbDonnees":
      orderBy = sortOrder && {
        donnee_milieu: {
          _count: sortOrder
        }
      }
      break;
    default:
      orderBy = {}

  }

  const milieux = await prisma.milieu.findMany({
    ...getPrismaPagination(searchParams),
    orderBy,
    where: getFilterClause(searchParams?.q)
  });

  const donneesByMilieu = includeCounts ? await prisma.donnee_milieu.groupBy({
    by: ['milieu_id'],
    where: {
      milieu_id: {
        in: milieux?.map(milieu => milieu.id)
      }
    },
    _count: true
  }) : null;


  const count = await prisma.milieu.count({
    where: getFilterClause(searchParams?.q)
  });

  return {
    result: milieux.map(milieu => {
      return {
        ...milieu,
        ...(includeCounts ? { nbDonnees: donneesByMilieu.find(donneeByMilieu => donneeByMilieu.milieu_id === milieu.id)?._count ?? 0 } : {})
      }
    }),
    count
  }

};

export const persistMilieu = async (
  milieu: Milieu
): Promise<SqlSaveResponse> => {
  return persistEntity(TABLE_MILIEU, milieu, DB_SAVE_MAPPING_MILIEU);
};

export const insertMilieux = (
  milieux: Milieu[]
): Promise<SqlSaveResponse> => {
  return insertMultipleEntities(TABLE_MILIEU, milieux, DB_SAVE_MAPPING_MILIEU);
};
