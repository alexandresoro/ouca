import { Age, Prisma } from "@prisma/client";
import {
  AgesPaginatedResult,
  AgeWithCounts,
  FindParams,
  MutationUpsertAgeArgs,
  QueryPaginatedAgesArgs
} from "../../model/graphql";
import prisma from "../../sql/prisma";
import { COLUMN_LIBELLE } from "../../utils/constants";
import {
  getEntiteAvecLibelleFilterClause,
  getPrismaPagination,
  queryParametersToFindAllEntities
} from "./entities-utils";

export const findAge = async (id: number): Promise<Age | null> => {
  return prisma.age.findUnique({
    where: {
      id
    }
  });
};

export const findAges = async (params?: FindParams | null): Promise<Age[]> => {
  const { q, max } = params ?? {};

  return prisma.age.findMany({
    orderBy: {
      libelle: "asc"
    },
    where: {
      libelle: {
        contains: q || undefined
      }
    },
    take: max || undefined
  });
};

export const findAllAges = async (
  options: {
    includeCounts?: boolean;
  } = {}
): Promise<AgeWithCounts[]> => {
  const includeCounts = options.includeCounts ?? true;

  if (includeCounts) {
    const ages = await prisma.age.findMany({
      ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
      include: {
        _count: {
          select: {
            donnee: true // Add number of donnees that contains it
          }
        }
      }
    });

    return ages.map((age) => {
      return {
        ...age,
        nbDonnees: age._count.donnee
      };
    });
  } else {
    return prisma.age.findMany({
      ...queryParametersToFindAllEntities(COLUMN_LIBELLE)
    });
  }
};

export const findPaginatedAges = async (
  options: QueryPaginatedAgesArgs = {},
  includeCounts = true
): Promise<AgesPaginatedResult> => {
  const { searchParams, orderBy: orderByField, sortOrder } = options;

  let orderBy: Prisma.Enumerable<Prisma.AgeOrderByWithRelationInput> | undefined = undefined;
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

  const count = await prisma.age.count({
    where: getEntiteAvecLibelleFilterClause(searchParams?.q)
  });

  if (includeCounts) {
    const ages = await prisma.age.findMany({
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
      result: ages.map((age) => {
        return {
          ...age,
          nbDonnees: age._count.donnee
        };
      }),
      count
    };
  } else {
    const ages = await prisma.age.findMany({
      ...getPrismaPagination(searchParams),
      orderBy,
      where: getEntiteAvecLibelleFilterClause(searchParams?.q)
    });

    return {
      result: ages,
      count
    };
  }
};

export const upsertAge = async (args: MutationUpsertAgeArgs): Promise<Age> => {
  const { id, data } = args;
  if (id) {
    return prisma.age.update({
      where: { id },
      data
    });
  } else {
    return prisma.age.create({ data });
  }
};

export const deleteAge = async (id: number): Promise<Age> => {
  return prisma.age.delete({
    where: {
      id
    }
  });
};

export const createAges = async (ages: Omit<Age, "id">[]): Promise<Prisma.BatchPayload> => {
  return prisma.age.createMany({
    data: ages
  });
};
