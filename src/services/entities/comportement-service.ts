import { Comportement, Nicheur, Prisma } from "@prisma/client";
import {
  ComportementsPaginatedResult,
  FindParams,
  MutationUpsertComportementArgs,
  QueryPaginatedComportementsArgs
} from "../../model/graphql";
import prisma from "../../sql/prisma";
import { COLUMN_CODE } from "../../utils/constants";
import numberAsCodeSqlMatcher from "../../utils/number-as-code-sql-matcher";
import { getPrismaPagination, queryParametersToFindAllEntities } from "./entities-utils";

export const findComportement = async (id: number): Promise<Comportement | null> => {
  return prisma.comportement.findUnique({
    where: {
      id
    }
  });
};

export const findComportementsByIds = async (ids: number[]): Promise<Comportement[]> => {
  return prisma.comportement.findMany({
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

export const findComportements = async (params?: FindParams | null): Promise<Comportement[]> => {
  const { q, max } = params ?? {};

  const matchingCodesAsNumber = numberAsCodeSqlMatcher(q);
  const matchingCodesAsNumberClause = matchingCodesAsNumber.map((matchingCode) => {
    return {
      code: {
        startsWith: matchingCode
      }
    };
  });

  const matchingWithCode = await prisma.comportement.findMany({
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

  const matchingWithLibelle = await prisma.comportement.findMany({
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

const getFilterClause = (q: string | null | undefined): Prisma.ComportementWhereInput => {
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
          },
          {
            nicheur: {
              in: (Object.keys(Nicheur) as Nicheur[]).filter((nicheur) => nicheur.includes(q))
            }
          }
        ]
      }
    : {};
};

export const findAllComportements = async (): Promise<Comportement[]> => {
  return prisma.comportement.findMany(queryParametersToFindAllEntities(COLUMN_CODE));
};

export const findPaginatedComportements = async (
  options: Partial<QueryPaginatedComportementsArgs> = {}
): Promise<ComportementsPaginatedResult> => {
  const { searchParams, orderBy: orderByField, sortOrder, includeCounts } = options;

  let orderBy: Prisma.Enumerable<Prisma.ComportementOrderByWithRelationInput> | undefined = undefined;
  if (sortOrder) {
    switch (orderByField) {
      case "id":
      case "code":
      case "libelle":
      case "nicheur":
        orderBy = {
          [orderByField]: sortOrder
        };
        break;
      case "nbDonnees":
        orderBy = {
          donnee_comportement: {
            _count: sortOrder
          }
        };
        break;
      default:
        orderBy = {};
    }
  }

  const comportements = await prisma.comportement.findMany({
    ...getPrismaPagination(searchParams),
    orderBy,
    where: getFilterClause(searchParams?.q)
  });

  const donneesByComportement = includeCounts
    ? await prisma.donnee_comportement.groupBy({
        by: ["comportement_id"],
        where: {
          comportement_id: {
            in: comportements?.map((comportement) => comportement.id)
          }
        },
        _count: true
      })
    : null;

  const count = await prisma.comportement.count({
    where: getFilterClause(searchParams?.q)
  });

  return {
    result: comportements.map((comportement) => {
      return {
        ...comportement,
        ...(includeCounts
          ? {
              nbDonnees:
                donneesByComportement?.find(
                  (donneeByComportement) => donneeByComportement.comportement_id === comportement.id
                )?._count ?? 0
            }
          : {})
      };
    }),
    count
  };
};

export const upsertComportement = async (args: MutationUpsertComportementArgs): Promise<Comportement> => {
  const { id, data } = args;
  if (id) {
    return prisma.comportement.update({
      where: { id },
      data
    });
  } else {
    return prisma.comportement.create({ data });
  }
};

export const deleteComportement = async (id: number): Promise<Comportement> => {
  return prisma.comportement.delete({
    where: {
      id
    }
  });
};

export const createComportements = async (comportements: Omit<Comportement, "id">[]): Promise<Prisma.BatchPayload> => {
  return prisma.comportement.createMany({
    data: comportements
  });
};
