
import { Prisma, Sexe as SexeEntity } from "@prisma/client";
import { FindParams, QueryPaginatedSexesArgs, Sexe, SexesPaginatedResult, SexeWithCounts } from "../../model/graphql";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import prisma from "../../sql/prisma";
import { createKeyValueMapWithSameName, queryParametersToFindAllEntities } from "../../sql/sql-queries-utils";
import { COLUMN_LIBELLE, TABLE_SEXE } from "../../utils/constants";
import { getEntiteAvecLibelleFilterClause, getPrismaPagination } from "./entities-utils";
import { insertMultipleEntities, persistEntity } from "./entity-service";

const DB_SAVE_MAPPING_SEXE = createKeyValueMapWithSameName("libelle");

export const findSexe = async (id: number): Promise<SexeEntity | null> => {
  return prisma.sexe.findUnique({
    where: {
      id
    },
  });
};

export const findSexes = async (params?: FindParams): Promise<SexeEntity[]> => {

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


export const findAllSexes = async (options: {
  includeCounts?: boolean
} = {}): Promise<SexeWithCounts[]> => {

  const includeCounts = options.includeCounts ?? true;

  const sexes = await prisma.sexe.findMany({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE), include: includeCounts && {
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
    }
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
    where: getEntiteAvecLibelleFilterClause(searchParams?.q),
  });

  const count = await prisma.sexe.count({
    where: getEntiteAvecLibelleFilterClause(searchParams?.q)
  });

  return {
    result: sexes.map((sexe) => {
      return {
        ...sexe,
        ...(includeCounts ? { nbDonnees: sexe._count.donnee } : {})
      }
    }),
    count
  }
};

export const persistSexe = async (sexe: Sexe): Promise<SqlSaveResponse> => {
  return persistEntity(TABLE_SEXE, sexe, DB_SAVE_MAPPING_SEXE);
};

export const insertSexes = async (
  sexes: Sexe[]
): Promise<SqlSaveResponse> => {
  return insertMultipleEntities(TABLE_SEXE, sexes, DB_SAVE_MAPPING_SEXE);
};
