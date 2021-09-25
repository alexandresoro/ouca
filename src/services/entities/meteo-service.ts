import { Meteo as MeteoEntity, Prisma } from "@prisma/client";
import { Meteo, MeteosPaginatedResult, MeteoWithCounts, QueryPaginatedMeteosArgs } from "../../model/graphql";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import prisma from "../../sql/prisma";
import { createKeyValueMapWithSameName, queryParametersToFindAllEntities } from "../../sql/sql-queries-utils";
import { COLUMN_LIBELLE, TABLE_METEO } from "../../utils/constants";
import counterReducer from "../../utils/counterReducer";
import { getEntiteAvecLibelleFilterClause, getPrismaPagination, getSqlPagination, getSqlSorting } from "./entities-utils";
import { insertMultipleEntities, persistEntity } from "./entity-service";

const DB_SAVE_MAPPING_METEO = createKeyValueMapWithSameName("libelle");

export const findMeteos = async (): Promise<Meteo[]> => {
  return prisma.meteo.findMany({
    orderBy: {
      libelle: "asc"
    }
  });
};

export const findAllMeteos = async (): Promise<MeteoWithCounts[]> => {
  const meteos = await prisma.meteo.findMany({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    include: {
      inventaire_meteo: {
        select: {
          inventaire: {
            select: {
              _count: {
                select: {
                  donnee: true
                }
              }
            }
          }
        }
      }
    }
  });

  return meteos.map((meteo) => {
    const nbDonnees = meteo.inventaire_meteo.map(invMet => invMet?.inventaire._count?.donnee ?? 0).reduce(counterReducer, 0);
    return {
      ...meteo,
      nbDonnees
    }
  });
};

export const findPaginatedMeteos = async (
  options: QueryPaginatedMeteosArgs = {},
  includeCounts = true
): Promise<MeteosPaginatedResult> => {

  const { searchParams, orderBy: orderByField, sortOrder } = options;

  const isNbDonneesNeeded = includeCounts || (orderByField === "nbDonnees");

  let meteos: MeteoWithCounts[];

  if (isNbDonneesNeeded) {

    const queryExpression = searchParams?.q ? `%${searchParams.q}%` : null;
    const filterRequest = queryExpression ? Prisma.sql`
    WHERE
      libelle LIKE ${queryExpression}
    ` : Prisma.empty;

    const donneesPerObservateurIdRequest = Prisma.sql`
    SELECT 
      m.*, count(d.id) as nbDonnees
    FROM 
      donnee d 
    RIGHT JOIN 
      inventaire i
    ON 
      d.inventaire_id = i.id 
    RIGHT JOIN
      inventaire_meteo im
    ON
      im.inventaire_id = i.id
    RIGHT JOIN
      meteo m
    ON
      m.id = im.meteo_id
    ${filterRequest}
    GROUP BY 
      m.id
    `

    meteos = await prisma.$queryRaw<(MeteoEntity & { nbDonnees: number })[]>`${donneesPerObservateurIdRequest} ${getSqlSorting(options)} ${getSqlPagination(searchParams)}`;

  } else {

    const orderBy = orderByField ? { [orderByField]: sortOrder } : {};

    meteos = await prisma.meteo.findMany({
      ...getPrismaPagination(searchParams),
      orderBy,
      where: getEntiteAvecLibelleFilterClause(searchParams?.q)
    });

  }

  const count = await prisma.meteo.count({
    where: getEntiteAvecLibelleFilterClause(searchParams?.q)
  });

  return {
    result: meteos,
    count
  }
};

export const persistMeteo = async (meteo: Meteo): Promise<SqlSaveResponse> => {
  return persistEntity(TABLE_METEO, meteo, DB_SAVE_MAPPING_METEO);
};

export const insertMeteos = async (
  meteos: Meteo[]
): Promise<SqlSaveResponse> => {
  return insertMultipleEntities(TABLE_METEO, meteos, DB_SAVE_MAPPING_METEO);
};
