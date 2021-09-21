
import { Prisma } from "@prisma/client";
import { AgesPaginatedResult, QueryAgesArgs } from "../../model/graphql";
import { Age } from "../../model/types/age.object";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import prisma from "../../sql/prisma";
import { createKeyValueMapWithSameName, queryParametersToFindAllEntities } from "../../sql/sql-queries-utils";
import { COLUMN_LIBELLE, TABLE_AGE } from "../../utils/constants";
import { getEntiteAvecLibelleFilterClause, getPrismaPagination } from "./entities-utils";
import { insertMultipleEntities, persistEntity } from "./entity-service";

const DB_SAVE_MAPPING_AGE = createKeyValueMapWithSameName("libelle")

export const findAllAges = async (options: {
  includeCounts?: boolean
} = {}): Promise<Age[]> => {

  const includeCounts = options.includeCounts ?? true;

  const ages = await prisma.age.findMany({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE), include: includeCounts && {
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
      ...(includeCounts ? { nbDonnees: age._count.donnee } : {})
    }
  });
};

export const findAges = async (
  options: QueryAgesArgs = {},
  includeCounts = true
): Promise<AgesPaginatedResult> => {

  const { searchParams, orderBy: orderByField, sortOrder } = options;

  let orderBy: Prisma.Enumerable<Prisma.AgeOrderByWithRelationInput>;
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

  const ages = await prisma.age.findMany({
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

  const count = await prisma.age.count({
    where: getEntiteAvecLibelleFilterClause(searchParams?.q)
  });

  return {
    result: ages.map((age) => {
      return {
        ...age,
        ...(includeCounts ? { nbDonnees: age._count.donnee } : {})
      }
    }),
    count
  }
};

export const persistAge = async (age: Age): Promise<SqlSaveResponse> => {
  return persistEntity(TABLE_AGE, age, DB_SAVE_MAPPING_AGE);
};

export const insertAges = async (
  ages: Age[]
): Promise<SqlSaveResponse> => {
  return insertMultipleEntities(TABLE_AGE, ages, DB_SAVE_MAPPING_AGE);
};
