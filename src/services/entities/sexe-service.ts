import { Prisma, Sexe } from "@prisma/client";
import {
  FindParams,
  MutationUpsertSexeArgs,
  QueryPaginatedSexesArgs,
  SexesPaginatedResult,
  SexeWithCounts
} from "../../model/graphql";
import prisma from "../../sql/prisma";
import { COLUMN_LIBELLE } from "../../utils/constants";
import {
  getEntiteAvecLibelleFilterClause,
  getPrismaPagination,
  queryParametersToFindAllEntities
} from "./entities-utils";

export const findSexe = async (id: number): Promise<Sexe | null> => {
  return prisma.sexe.findUnique({
    where: {
      id
    }
  });
};

export const findSexes = async (params?: FindParams | null): Promise<Sexe[]> => {
  const { q, max } = params ?? {};

  return prisma.sexe.findMany({
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

export const findAllSexes = async (
  options: {
    includeCounts?: boolean;
  } = {}
): Promise<SexeWithCounts[]> => {
  const includeCounts = options.includeCounts ?? true;

  const sexes = await prisma.sexe.findMany({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    include: includeCounts && {
      _count: {
        select: {
          donnee: true // Add number of donnees that contains it
        }
      }
    }
  });

  return sexes.map((sexe) => {
    return {
      ...sexe,
      ...(includeCounts ? { nbDonnees: sexe._count.donnee } : {})
    };
  });
};

export const findPaginatedSexes = async (
  options: QueryPaginatedSexesArgs = {},
  includeCounts = true
): Promise<SexesPaginatedResult> => {
  const { searchParams, orderBy: orderByField, sortOrder } = options;

  let orderBy: Prisma.Enumerable<Prisma.SexeOrderByWithRelationInput>;
  switch (orderByField) {
    case "id":
    case "libelle":
      orderBy = {
        [orderByField]: sortOrder
      };
      break;
    case "nbDonnees":
      {
        orderBy = sortOrder && {
          donnee: {
            _count: sortOrder
          }
        };
      }
      break;
    default:
      orderBy = {};
  }

  const sexes = await prisma.sexe.findMany({
    ...getPrismaPagination(searchParams),
    orderBy,
    include: includeCounts && {
      _count: {
        select: {
          donnee: true
        }
      }
    },
    where: getEntiteAvecLibelleFilterClause(searchParams?.q)
  });

  const count = await prisma.sexe.count({
    where: getEntiteAvecLibelleFilterClause(searchParams?.q)
  });

  return {
    result: sexes.map((sexe) => {
      return {
        ...sexe,
        ...(includeCounts ? { nbDonnees: sexe._count.donnee } : {})
      };
    }),
    count
  };
};

export const upsertSexe = async (args: MutationUpsertSexeArgs): Promise<Sexe> => {
  const { id, data } = args;
  if (id) {
    return prisma.sexe.update({
      where: { id },
      data
    });
  } else {
    return prisma.sexe.create({ data });
  }
};

export const deleteSexe = async (id: number): Promise<Sexe> => {
  return prisma.sexe.delete({
    where: {
      id
    }
  });
};

export const createSexes = async (sexes: Omit<Sexe, "id">[]): Promise<Prisma.BatchPayload> => {
  return prisma.sexe.createMany({
    data: sexes
  });
};
