import { Meteo, Prisma } from "@prisma/client";
import {
  MeteosPaginatedResult,
  MeteoWithCounts,
  MutationUpsertMeteoArgs,
  QueryPaginatedMeteosArgs
} from "../../model/graphql";
import prisma from "../../sql/prisma";
import { COLUMN_LIBELLE } from "../../utils/constants";
import counterReducer from "../../utils/counterReducer";
import {
  getEntiteAvecLibelleFilterClause,
  getPrismaPagination,
  getSqlPagination,
  getSqlSorting,
  queryParametersToFindAllEntities
} from "./entities-utils";

export const findMeteo = async (id: number): Promise<Meteo | null> => {
  return prisma.meteo.findUnique({
    where: {
      id
    }
  });
};

export const findMeteosByIds = async (ids: number[]): Promise<Meteo[]> => {
  return prisma.meteo.findMany({
    orderBy: {
      libelle: "asc"
    },
    where: {
      id: {
        in: ids
      }
    }
  });
};

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
    const nbDonnees = meteo.inventaire_meteo
      .map((invMet) => invMet?.inventaire._count?.donnee ?? 0)
      .reduce(counterReducer, 0);
    return {
      ...meteo,
      nbDonnees
    };
  });
};

export const findPaginatedMeteos = async (
  options: Partial<QueryPaginatedMeteosArgs> = {}
): Promise<MeteosPaginatedResult> => {
  const { searchParams, orderBy: orderByField, sortOrder, includeCounts } = options;

  const isNbDonneesNeeded = includeCounts || orderByField === "nbDonnees";

  let meteos: MeteoWithCounts[];

  if (isNbDonneesNeeded) {
    const queryExpression = searchParams?.q ? `%${searchParams.q}%` : null;
    const filterRequest = queryExpression
      ? Prisma.sql`
    WHERE
      libelle LIKE ${queryExpression}
    `
      : Prisma.empty;

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
    `;

    meteos = await prisma.$queryRaw<
      (Meteo & { nbDonnees: number })[]
    >`${donneesPerObservateurIdRequest} ${getSqlSorting(options)} ${getSqlPagination(searchParams)}`;
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
  };
};

export const upsertMeteo = async (args: MutationUpsertMeteoArgs): Promise<Meteo> => {
  const { id, data } = args;
  if (id) {
    return prisma.meteo.update({
      where: { id },
      data
    });
  } else {
    return prisma.meteo.create({ data });
  }
};

export const deleteMeteo = async (id: number): Promise<Meteo> => {
  return prisma.meteo.delete({
    where: {
      id
    }
  });
};

export const createMeteos = async (meteos: Omit<Meteo, "id">[]): Promise<Prisma.BatchPayload> => {
  return prisma.meteo.createMany({
    data: meteos
  });
};
