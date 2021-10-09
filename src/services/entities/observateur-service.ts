import { Observateur as ObservateurEntity, Prisma } from ".prisma/client";
import { FindParams, Observateur, ObservateursPaginatedResult, ObservateurWithCounts, QueryPaginatedObservateursArgs } from "../../model/graphql";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import prisma from "../../sql/prisma";
import { createKeyValueMapWithSameName, queryParametersToFindAllEntities, queryToCheckIfTableExists } from "../../sql/sql-queries-utils";
import { COLUMN_LIBELLE, TABLE_OBSERVATEUR } from "../../utils/constants";
import counterReducer from "../../utils/counterReducer";
import { getEntiteAvecLibelleFilterClause, getPrismaPagination, getSqlPagination, getSqlSorting } from "./entities-utils";
import { deleteEntityById, insertMultipleEntities, persistEntity } from "./entity-service";


const DB_SAVE_MAPPING_OBSERVATEUR = createKeyValueMapWithSameName("libelle");

export const checkIfTableObservateurExists = async (): Promise<boolean> => {
  return queryToCheckIfTableExists(TABLE_OBSERVATEUR);
}

export const findObservateur = async (id: number): Promise<Observateur | null> => {
  return prisma.observateur.findUnique({
    where: {
      id
    },
  });
};

export const findObservateursByIds = async (ids: number[]): Promise<Observateur[]> => {

  return prisma.observateur.findMany({
    orderBy: {
      libelle: "asc"
    },
    where: {
      id: {
        in: ids
      }
    },
  });
};

export const findObservateurs = async (params?: FindParams): Promise<Observateur[]> => {

  const { q, max } = params ?? {};

  return prisma.observateur.findMany({
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

export const findAllObservateurs = async (
  includeCounts = true
): Promise<ObservateurWithCounts[]> => {

  const observateurs = await prisma.observateur.findMany({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    include: includeCounts && {
      inventaire: {
        select: {
          _count: {
            select: {
              donnee: true
            }
          }
        }
      },
    }
  });

  return observateurs.map((observateur) => {
    const nbDonnees = observateur?.inventaire?.map(espece => espece._count?.donnee).reduce(counterReducer, 0) ?? 0;
    return {
      ...observateur,
      ... (includeCounts ? { nbDonnees } : {})
    }
  });
};

export const findPaginatedObservateurs = async (
  options: QueryPaginatedObservateursArgs = {},
  includeCounts = true
): Promise<ObservateursPaginatedResult> => {

  const { searchParams, orderBy: orderByField, sortOrder } = options;

  const isNbDonneesNeeded = includeCounts || (orderByField === "nbDonnees");

  let observateurs: ObservateurWithCounts[];

  if (isNbDonneesNeeded) {

    const queryExpression = searchParams?.q ? `%${searchParams.q}%` : null;
    const filterRequest = queryExpression ? Prisma.sql`
    WHERE
      libelle LIKE ${queryExpression}
    ` : Prisma.empty;

    const donneesPerObservateurIdRequest = Prisma.sql`
    SELECT 
      o.*, count(d.id) as nbDonnees
    FROM 
      donnee d 
    RIGHT JOIN 
      inventaire i
    ON 
      d.inventaire_id = i.id 
    RIGHT JOIN
      observateur o
    ON
      i.observateur_id = o.id
    ${filterRequest}
    GROUP BY 
      o.id
    `

    observateurs = await prisma.$queryRaw<(ObservateurEntity & { nbDonnees: number })[]>`${donneesPerObservateurIdRequest} ${getSqlSorting(options)} ${getSqlPagination(searchParams)}`;

  } else {

    const orderBy = orderByField ? { [orderByField]: sortOrder } : {};

    observateurs = await prisma.observateur.findMany({
      ...getPrismaPagination(searchParams),
      orderBy,
      where: getEntiteAvecLibelleFilterClause(searchParams?.q)
    });

  }

  const count = await prisma.observateur.count({
    where: getEntiteAvecLibelleFilterClause(searchParams?.q)
  });

  return {
    result: observateurs,
    count
  }
};

export const persistObservateur = async (
  observateur: Observateur
): Promise<SqlSaveResponse> => {
  return persistEntity(
    TABLE_OBSERVATEUR,
    observateur,
    DB_SAVE_MAPPING_OBSERVATEUR
  );
};

export const deleteObservateur = async (
  id: number
): Promise<SqlSaveResponse> => {
  return deleteEntityById(TABLE_OBSERVATEUR, id);
};

export const insertObservateurs = async (
  observateurs: Observateur[]
): Promise<SqlSaveResponse> => {
  return insertMultipleEntities(TABLE_OBSERVATEUR, observateurs, DB_SAVE_MAPPING_OBSERVATEUR);
};
