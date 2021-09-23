
import { Nicheur, Prisma } from "@prisma/client";
import { Comportement, ComportementsPaginatedResult, ComportementWithCounts, QueryPaginatedComportementsArgs } from "../../model/graphql";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { buildComportementDbFromComportement } from "../../sql/entities-mapping/comportement-mapping";
import prisma from "../../sql/prisma";
import { queryParametersToFindAllEntities } from "../../sql/sql-queries-utils";
import { COLUMN_CODE, TABLE_COMPORTEMENT } from "../../utils/constants";
import { getPrismaPagination } from "./entities-utils";
import { insertMultipleEntitiesNoCheck, persistEntityNoCheck } from "./entity-service";

export const findComportements = async (): Promise<Comportement[]> => {
  return prisma.comportement.findMany({
    orderBy: {
      code: "asc"
    }
  });
};

const getFilterClause = (q: string | null | undefined): Prisma.ComportementWhereInput => {
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
      },
      {
        nicheur: {
          in: (Object.keys(Nicheur) as Nicheur[]).filter(nicheur => nicheur.includes(q))
        }
      }
    ]
  } : {};
}

export const findAllComportements = async (): Promise<ComportementWithCounts[]> => {
  const [comportementsDb, donneesByComportement] = await Promise.all([
    prisma.comportement.findMany(queryParametersToFindAllEntities(COLUMN_CODE)),
    prisma.donnee_comportement.groupBy({
      by: ['comportement_id'],
      _count: true
    })]);

  return comportementsDb.map(comportement => {
    return {
      ...comportement,
      nbDonnees: donneesByComportement.find(donneeByComportement => donneeByComportement.comportement_id === comportement.id)?._count ?? 0
    }
  });
};

export const findPaginatedComportements = async (
  options: QueryPaginatedComportementsArgs = {},
  includeCounts = true
): Promise<ComportementsPaginatedResult> => {

  const { searchParams, orderBy: orderByField, sortOrder } = options;

  let orderBy: Prisma.Enumerable<Prisma.ComportementOrderByWithRelationInput>;
  switch (orderByField) {
    case "id":
    case "code":
    case "libelle":
    case "nicheur":
      orderBy = {
        [orderByField]: sortOrder
      }
      break;
    case "nbDonnees":
      orderBy = sortOrder && {
        donnee_comportement: {
          _count: sortOrder
        }
      }
      break;
    default:
      orderBy = {}

  }

  const comportements = await prisma.comportement.findMany({
    ...getPrismaPagination(searchParams),
    orderBy,
    where: getFilterClause(searchParams?.q)
  });

  const donneesByComportement = includeCounts ? await prisma.donnee_comportement.groupBy({
    by: ['comportement_id'],
    where: {
      comportement_id: {
        in: comportements?.map(comportement => comportement.id)
      }
    },
    _count: true
  }) : null;


  const count = await prisma.comportement.count({
    where: getFilterClause(searchParams?.q)
  });

  return {
    result: comportements.map(comportement => {
      return {
        ...comportement,
        ...(includeCounts ? { nbDonnees: donneesByComportement.find(donneeByComportement => donneeByComportement.comportement_id === comportement.id)?._count ?? 0 } : {})
      }
    }),
    count
  }
}


export const persistComportement = async (
  comportement: Comportement
): Promise<SqlSaveResponse> => {
  const comportementDb = buildComportementDbFromComportement(comportement);
  return persistEntityNoCheck(TABLE_COMPORTEMENT, comportementDb);
};

export const insertComportements = (
  comportements: Comportement[]
): Promise<SqlSaveResponse> => {
  const comportementsDb = comportements.map(buildComportementDbFromComportement);
  return insertMultipleEntitiesNoCheck(TABLE_COMPORTEMENT, comportementsDb);
};
