import { Milieu, Prisma } from "@prisma/client";
import { FindParams, MilieuWithCounts, MilieuxPaginatedResult, QueryPaginatedMilieuxArgs } from "../../model/graphql";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import prisma from "../../sql/prisma";
import { createKeyValueMapWithSameName, queryParametersToFindAllEntities } from "../../sql/sql-queries-utils";
import { COLUMN_CODE, TABLE_MILIEU } from "../../utils/constants";
import numberAsCodeSqlMatcher from "../../utils/number-as-code-sql-matcher";
import { getPrismaPagination } from "./entities-utils";
import { insertMultipleEntities, persistEntity } from "./entity-service";

const DB_SAVE_MAPPING_MILIEU = createKeyValueMapWithSameName(["code", "libelle"]);

export const findMilieu = async (id: number): Promise<Milieu | null> => {
  return prisma.milieu.findUnique({
    where: {
      id
    },
  });
};

export const findMilieuxByIds = async (ids: number[]): Promise<Milieu[]> => {

  return prisma.milieu.findMany({
    orderBy: {
      code: "asc"
    },
    where: {
      id: {
        in: ids
      }
    },
  });
};

export const findMilieux = async (params?: FindParams): Promise<Milieu[]> => {

  const { q, max } = params ?? {};

  const matchingCodesAsNumber = numberAsCodeSqlMatcher(q);
  const matchingCodesAsNumberClause = matchingCodesAsNumber.map((matchingCode) => {
    return {
      code: {
        startsWith: matchingCode
      }
    }
  })

  const matchingWithCode = await prisma.milieu.findMany({
    orderBy: {
      code: "asc"
    },
    where: q ? {
      OR: [
        ...matchingCodesAsNumberClause,
        {
          code: {
            startsWith: q // It can happen that codes are a mix of numbers+letters (e.g. 22A0)
          }
        }
      ]
    } : undefined,
    take: max || undefined
  });

  const matchingWithLibelle = await prisma.milieu.findMany({
    orderBy: {
      code: "asc"
    },
    where: {
      libelle: {
        contains: q || undefined
      }
    },
    take: max || undefined
  });

  // Concatenate arrays and remove elements that could be present in several indexes, to keep a unique reference
  // This is done like this to be consistent with what was done previously on UI side:
  // code had a weight of 1, and libelle had no weight, so we don't "return first" the elements that appear multiple time
  // However, to be consistent, we still need to sort them by code as it can still be mixed up
  const matchingEntries = [...matchingWithCode, ...matchingWithLibelle]
    .sort((a, b) => a.code.localeCompare(b.code))
    .filter((element, index, self) =>
      index === self.findIndex((eltArray) => (
        eltArray.id === element.id
      ))
    )

  return max ? matchingEntries.slice(0, max) : matchingEntries;
};

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

export const findAllMilieux = async (): Promise<MilieuWithCounts[]> => {
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
