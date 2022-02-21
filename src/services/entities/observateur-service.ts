import { DatabaseRole, Observateur, Prisma } from "@prisma/client";
import {
  FindParams,
  MutationUpsertObservateurArgs,
  ObservateursPaginatedResult,
  ObservateurWithCounts,
  QueryPaginatedObservateursArgs
} from "../../model/graphql";
import prisma from "../../sql/prisma";
import { COLUMN_LIBELLE } from "../../utils/constants";
import counterReducer from "../../utils/counterReducer";
import { OucaError } from "../../utils/errors";
import { User } from "../../utils/user";
import {
  getEntiteAvecLibelleFilterClause,
  getPrismaPagination,
  getSqlPagination,
  getSqlSorting,
  queryParametersToFindAllEntities
} from "./entities-utils";

export const findObservateur = async (id: number): Promise<Observateur | null> => {
  return prisma.observateur.findUnique({
    where: {
      id
    }
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
    }
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

export const findAllObservateurs = async (includeCounts = true): Promise<ObservateurWithCounts[]> => {
  if (includeCounts) {
    const observateurs = await prisma.observateur.findMany({
      ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
      include: {
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
    });

    return observateurs.map((observateur) => {
      const nbDonnees = observateur?.inventaire?.map((espece) => espece._count?.donnee).reduce(counterReducer, 0) ?? 0;
      return {
        ...observateur,
        ...(includeCounts ? { nbDonnees } : {})
      };
    });
  } else {
    return prisma.observateur.findMany({
      ...queryParametersToFindAllEntities(COLUMN_LIBELLE)
    });
  }
};

export const findPaginatedObservateurs = async (
  options: QueryPaginatedObservateursArgs = {},
  includeCounts = true
): Promise<ObservateursPaginatedResult> => {
  const { searchParams, orderBy: orderByField, sortOrder } = options;

  const isNbDonneesNeeded = includeCounts || orderByField === "nbDonnees";

  let observateurs: ObservateurWithCounts[];

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
      o.*, o.owner_id as ownerId, count(d.id) as nbDonnees
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
    `;

    observateurs = await prisma.$queryRaw<
      (Observateur & { nbDonnees: number })[]
    >`${donneesPerObservateurIdRequest} ${getSqlSorting(options)} ${getSqlPagination(searchParams)}`;
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
  };
};

export const upsertObservateur = async (args: MutationUpsertObservateurArgs, user: User): Promise<Observateur> => {
  const { id, data } = args;
  if (id) {
    // Check that the user is allowed to modify the existing data
    if (user?.role !== DatabaseRole.admin) {
      const existingData = await prisma.observateur.findFirst({
        where: { id }
      });

      if (existingData?.ownerId !== user.id) {
        throw new OucaError("OUCA0001");
      }
    }

    // Update an existing observer
    return prisma.observateur.update({
      where: { id },
      data
    });
  } else {
    // Create a new observer
    return prisma.observateur.create({
      data: {
        ...data,
        ownerId: user.id
      }
    });
  }
};

export const deleteObservateur = async (id: number, user: User): Promise<Observateur> => {
  // Check that the user is allowed to modify the existing data
  if (user?.role !== DatabaseRole.admin) {
    const existingData = await prisma.observateur.findFirst({
      where: { id }
    });

    if (existingData?.ownerId !== user.id) {
      throw new OucaError("OUCA0001");
    }
  }

  return prisma.observateur.delete({
    where: {
      id
    }
  });
};

export const createObservateurs = async (observateurs: Omit<Observateur, "id">[]): Promise<Prisma.BatchPayload> => {
  // TODO add user ownership
  return prisma.observateur.createMany({
    data: observateurs
  });
};
