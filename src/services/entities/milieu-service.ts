import { Milieu, Prisma } from "@prisma/client";
import {
  FindParams,
  MilieuWithCounts,
  MilieuxPaginatedResult,
  MutationUpsertMilieuArgs,
  QueryPaginatedMilieuxArgs
} from "../../model/graphql";
import prisma from "../../sql/prisma";
import { COLUMN_CODE } from "../../utils/constants";
import numberAsCodeSqlMatcher from "../../utils/number-as-code-sql-matcher";
import { getPrismaPagination, queryParametersToFindAllEntities } from "./entities-utils";

export const findMilieu = async (id: number): Promise<Milieu | null> => {
  return prisma.milieu.findUnique({
    where: {
      id
    }
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
    }
  });
};

export const findMilieux = async (params?: FindParams | null): Promise<Milieu[]> => {
  const { q, max } = params ?? {};

  const matchingCodesAsNumber = numberAsCodeSqlMatcher(q);
  const matchingCodesAsNumberClause = matchingCodesAsNumber.map((matchingCode) => {
    return {
      code: {
        startsWith: matchingCode
      }
    };
  });

  const matchingWithCode = await prisma.milieu.findMany({
    orderBy: {
      code: "asc"
    },
    where: q
      ? {
          OR: [
            ...matchingCodesAsNumberClause,
            {
              code: {
                startsWith: q // It can happen that codes are a mix of numbers+letters (e.g. 22A0)
              }
            }
          ]
        }
      : undefined,
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
    .filter((element, index, self) => index === self.findIndex((eltArray) => eltArray.id === element.id));

  return max ? matchingEntries.slice(0, max) : matchingEntries;
};

const getFilterClause = (q: string | null | undefined): Prisma.MilieuWhereInput => {
  return q != null && q.length
    ? {
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
      }
    : {};
};

export const findAllMilieux = async (): Promise<MilieuWithCounts[]> => {
  const [milieux, donneesByMilieu] = await Promise.all([
    prisma.milieu.findMany(queryParametersToFindAllEntities(COLUMN_CODE)),
    prisma.donnee_milieu.groupBy({
      by: ["milieu_id"],
      _count: true
    })
  ]);

  return milieux.map((milieu) => {
    return {
      ...milieu,
      nbDonnees: donneesByMilieu.find((donneeByMilieu) => donneeByMilieu.milieu_id === milieu.id)?._count ?? 0
    };
  });
};

export const findPaginatedMilieux = async (
  options: Partial<QueryPaginatedMilieuxArgs> = {}
): Promise<MilieuxPaginatedResult> => {
  const { searchParams, orderBy: orderByField, sortOrder, includeCounts } = options;

  let orderBy: Prisma.Enumerable<Prisma.MilieuOrderByWithRelationInput> | undefined = undefined;
  if (sortOrder) {
    switch (orderByField) {
      case "id":
      case "code":
      case "libelle":
        orderBy = {
          [orderByField]: sortOrder
        };
        break;
      case "nbDonnees":
        orderBy = {
          donnee_milieu: {
            _count: sortOrder
          }
        };
        break;
      default:
        orderBy = {};
    }
  }

  const milieux = await prisma.milieu.findMany({
    ...getPrismaPagination(searchParams),
    orderBy,
    where: getFilterClause(searchParams?.q)
  });

  const donneesByMilieu = includeCounts
    ? await prisma.donnee_milieu.groupBy({
        by: ["milieu_id"],
        where: {
          milieu_id: {
            in: milieux?.map((milieu) => milieu.id)
          }
        },
        _count: true
      })
    : null;

  const count = await prisma.milieu.count({
    where: getFilterClause(searchParams?.q)
  });

  return {
    result: milieux.map((milieu) => {
      return {
        ...milieu,
        ...(includeCounts
          ? {
              nbDonnees: donneesByMilieu?.find((donneeByMilieu) => donneeByMilieu.milieu_id === milieu.id)?._count ?? 0
            }
          : {})
      };
    }),
    count
  };
};

export const upsertMilieu = async (args: MutationUpsertMilieuArgs): Promise<Milieu> => {
  const { id, data } = args;
  if (id) {
    return prisma.milieu.update({
      where: { id },
      data
    });
  } else {
    return prisma.milieu.create({ data });
  }
};

export const deleteMilieu = async (id: number): Promise<Milieu> => {
  return prisma.milieu.delete({
    where: {
      id
    }
  });
};

export const createMilieux = async (milieux: Omit<Milieu, "id">[]): Promise<Prisma.BatchPayload> => {
  return prisma.milieu.createMany({
    data: milieux
  });
};
